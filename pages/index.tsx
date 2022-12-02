import React, { useState } from 'react'
import { GetServerSideProps } from 'next'
import { Form, Formik } from 'formik'
import {
    Flex,
    NumberInput,
    Button,
    Box,
    Text,
    Spinner,
    Notice,
    Link,
    Tooltip,
    LinkButton
} from '@purple/phoenix-components'
import { ILayoutProps } from '../components/layout'
import { ConversionResult, Currency, Money } from '../Common/types'
import * as ExchangeRateApi from '../ExchangeRateApi'
import { SelectCurrency } from '../components/SelectCurrency'
import delay from '../Common/Delay'
import { formatMoney } from '../Common/NumberFormatting'
import { ConvertForm as Config } from '../Common/Config'
import styled from 'styled-components'

type ConversionStatus =
    { code: 'ready' } |
    { code: 'pending' } |
    { code: 'converted', resultAmount: Money } |
    { code: 'failed', reason: string }

type ConversionApi = {
    status: ConversionStatus,
    convertAmount: (sourceAmount: Money, target: Currency) => Promise<void>
}

const useConvertApi = function (): ConversionApi {
    const [status, setStatus] = useState<ConversionStatus>({ code: 'ready' })

    return {
        status,
        convertAmount: async (sourceAmount: Money, target: Currency) => {
            if (sourceAmount.value === 0) {
                setStatus({
                    code: 'converted',
                    resultAmount: sourceAmount
                })
                return
            }

            setStatus({ code: 'pending' })

            const factor: number = Math.pow(10, Config.maxDecimals)

            const encode = encodeURIComponent;
            const httpResp = await fetch(`/api/convert/${encode(sourceAmount.currency)}/${encode(target)}?amount=${(sourceAmount.value * factor).toFixed(0)}`)
            if (httpResp.status === 200) {
                const convResp = await httpResp.json() as ConversionResult
                setStatus({
                    code: 'converted',
                    resultAmount: {
                        value: Math.round(convResp.value) / factor,
                        currency: target
                    }
                })
            }
            else {
                setStatus({
                    code: 'failed',
                    reason: `server reported failure (HTTP status ${httpResp.status})`
                })
            }
        }
    }
}

interface IPageProps {
    supportedCurrencies: Currency[]
}

interface IConvertFormValues {
    sourceAmount: number,
    sourceCurrency: Currency,
    targetCurrency: Currency
}

const ResultAmount: React.FC<{ amount: Money }> = ({ amount }) => {
    const [copyTooltipVisible, setCopyTooltipVisible] = useState<boolean>(false)

    return (
        <Flex>
            <Flex alignItems="center">
                <Text size="large"> &#61; {formatMoney(amount)}</Text>
            </Flex>
            <Tooltip content="Copied!" visible={copyTooltipVisible}>
                <LinkButton
                    title="Copy to clipboard"
                    size="small"
                    icon="copy"
                    colorTheme="info"
                    minimal
                    onClick={async () => {
                        await navigator.clipboard.writeText(amount.value.toFixed(Config.maxDecimals))
                        setCopyTooltipVisible(true)
                        await delay(1000)
                        setCopyTooltipVisible(false)
                    }} />
            </Tooltip>
        </Flex>
    )
}

const FormLayoutBox = styled(Flex)`
    flex-direction: column;
    gap: 1em;
    margin-top: 2em;
    @media (min-width: 768px) {
        flex-direction: row;
    }
`

const CurrenciesBox = styled(Flex)`
    flex-shrink: 0;
`

const IndexPage: React.FC<IPageProps> = ({ supportedCurrencies }) => {
    const { status, convertAmount }: ConversionApi = useConvertApi()

    const initialValues: IConvertFormValues = {
        sourceAmount: 0,
        sourceCurrency: 'USD',
        targetCurrency: 'EUR'
    }

    return (
        <>
            <Formik<IConvertFormValues>
                initialValues={initialValues}
                onSubmit={async (values) => await convertAmount({ value: values.sourceAmount, currency: values.sourceCurrency }, values.targetCurrency)}>
                {(props): React.ReactNode => {
                    const { values, setFieldValue, handleSubmit, errors } = props;

                    return (
                        <Flex alignItems="stretch" flexDirection="column" gap="20px">
                            <Form onSubmit={handleSubmit}>
                                <FormLayoutBox>
                                    <NumberInput
                                        label='Source Amount'
                                        name='sourceAmount'
                                        value={values.sourceAmount}
                                        maxDecimalCount={Config.maxDecimals}
                                        onChange={(amount => setFieldValue('sourceAmount', amount))} />
                                    <CurrenciesBox>
                                        <SelectCurrency
                                            label='Source'
                                            name='sourceCurrency'
                                            currency={values.sourceCurrency}
                                            currencies={supportedCurrencies}
                                            onChange={(selectedCurrency) => setFieldValue('sourceCurrency', selectedCurrency)} />
                                        <LinkButton
                                            icon="transfer"
                                            colorTheme='info'
                                            size="tiny"
                                            title="Swap"
                                            minimal
                                            iconAlignment="right"
                                            type="button"
                                            disabled={status.code === 'pending'}
                                            onClick={() => {
                                                const { sourceCurrency, targetCurrency } = values;
                                                setFieldValue('sourceCurrency', targetCurrency)
                                                setFieldValue('targetCurrency', sourceCurrency)
                                            }} />
                                        <SelectCurrency
                                            label='Target'
                                            name='targetCurrency'
                                            disabled={status.code === 'pending'}
                                            currency={values.targetCurrency}
                                            currencies={supportedCurrencies}
                                            onChange={(selectedCurrency) => setFieldValue('targetCurrency', selectedCurrency)} />
                                    </CurrenciesBox>
                                    <Button
                                        icon="play-circle"
                                        iconAlignment='right'
                                        type="submit"
                                        loading={status.code === 'pending'}
                                        disabled={status.code === 'pending'}>
                                        Convert
                                    </Button>
                                </FormLayoutBox>
                            </Form>
                            <Box mb="1em">
                                {status.code === 'pending' && <Spinner size="large" />}
                                {status.code === 'converted' && <ResultAmount amount={status.resultAmount} />}
                            </Box>
                            {status.code === 'failed' && <Notice colorTheme="error">{status.reason}</Notice>}
                        </Flex>
                    )
                }}
            </Formik>
            <Link href="/stats" iconAlignment="left" icon="list">Show me some stats!</Link>
        </>
    )
}

export default IndexPage

export const getServerSideProps: GetServerSideProps<ILayoutProps & IPageProps> = async () => {
    return {
        props: {
            title: 'Converter',
            supportedCurrencies: await ExchangeRateApi.getAvailableCurrencies()
        }
    }
}