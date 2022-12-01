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
    Tooltip
} from '@purple/phoenix-components'
import { ILayoutProps } from '../components/layout'
import { ConversionResult, Currency, Money } from '../Common/types'
import * as ExchangeRateApi from '../ExchangeRateApi'
import { SelectCurrency } from '../components/SelectCurrency'
import delay from '../Common/Delay'
import { formatMoney } from '../Common/NumberFormatting'

const config = {
    maxDecimals: 2
}

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

            const factor: number = Math.pow(10, config.maxDecimals)

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
                <Button
                    title="Copy to clipboard"
                    size="small"
                    icon="copy"
                    colorTheme="info"
                    minimal
                    onClick={async () => {
                        await navigator.clipboard.writeText(amount.value.toFixed(config.maxDecimals))
                        setCopyTooltipVisible(true)
                        await delay(1000)
                        setCopyTooltipVisible(false)
                    }} />
            </Tooltip>
        </Flex>
    )
}

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
                        <Flex alignItems="stretch" flexDirection="column">
                            <Form onSubmit={handleSubmit}>
                                <Flex mt="2em" mb="1em">
                                    <NumberInput
                                        label='Source Amount'
                                        name='sourceAmount'
                                        value={values.sourceAmount}
                                        maxDecimalCount={config.maxDecimals}
                                        onChange={(amount => setFieldValue('sourceAmount', amount))} />
                                    <SelectCurrency
                                        label='Source Currency'
                                        name='sourceCurrency'
                                        currency={values.sourceCurrency}
                                        currencies={supportedCurrencies}
                                        onChange={(selectedCurrency) => setFieldValue('sourceCurrency', selectedCurrency)} />
                                    <Button
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
                                        }}>
                                    </Button>
                                    <SelectCurrency
                                        label='Target Currency'
                                        name='targetCurrency'
                                        disabled={status.code === 'pending'}
                                        currency={values.targetCurrency}
                                        currencies={supportedCurrencies}
                                        onChange={(selectedCurrency) => setFieldValue('targetCurrency', selectedCurrency)} />
                                    <Button
                                        icon="play-circle"
                                        iconAlignment='right'
                                        type="submit"
                                        loading={status.code === 'pending'}
                                        disabled={status.code === 'pending'}
                                        ml="1em">
                                        Convert
                                    </Button>
                                </Flex>
                            </Form>
                            <Box mt="1em" mb="1em">
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