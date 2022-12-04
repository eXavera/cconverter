import { useState } from 'react'
import { Currency } from '../../common/types/Currency'
import { Money } from '../../common/types/Money'
import { ConversionForm as Config } from '../../common/configuration'
import styled from 'styled-components'
import {
    Box,
    Button,
    Flex,
    LinkButton,
    Notice,
    NumberInput,
    Spinner
} from '@purple/phoenix-components'
import { Form, Formik } from 'formik'
import { SelectCurrency } from './subcomponents/SelectCurrency'
import { ConversionResponse } from './api/ConversionResponse'
import { ConversionResult } from './subcomponents/ConversionResult'

type ConversionStatus =
    { code: 'ready' } |
    { code: 'pending' } |
    { code: 'converted', resultAmount: Money } |
    { code: 'failed', reason: string }

type ConversionApi = {
    status: ConversionStatus;
    convertAmount: (sourceAmount: Money, target: Currency) => Promise<void>;
}

const useConvertApi = (): ConversionApi => {
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

            // letting the server api calc with integers to avoid precision issues with floating numbers
            const factor: number = Math.pow(10, Config.maxDecimals)

            const encode = encodeURIComponent;
            const httpResp = await fetch(`/api/convert/${encode(sourceAmount.currency)}/${encode(target)}?amount=${(sourceAmount.value * factor).toFixed(0)}`)
            if (httpResp.status === 200) {
                const convResp = await httpResp.json() as ConversionResponse
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

const getFirstIfNotExists = function <T>(array: T[], value: T): T {
    return array.includes(value) ? value : array[0]
}

const FormContentBox = styled(Flex)`
flex-direction: column;
gap: 1em;
margin-top: 2em;
@media (min-width: 700px) {
    flex-direction: row;
}
`

const FormLayoutBox = styled(Flex)`
flex-direction: column;
gap: 1em;
`

const CurrenciesBox = styled(Flex)`
flex-shrink: 0;
`

interface FormValues {
    sourceAmount: number
    sourceCurrency: Currency
    targetCurrency: Currency
}

export interface ConversionFormProps {
    supportedCurrencies: Currency[]
}
export const ConversionForm: React.FC<ConversionFormProps> = ({ supportedCurrencies }) => {
    const { status, convertAmount }: ConversionApi = useConvertApi()

    const initialValues: FormValues = {
        sourceAmount: 0,
        sourceCurrency: getFirstIfNotExists(supportedCurrencies, 'USD'),
        targetCurrency: getFirstIfNotExists(supportedCurrencies, 'EUR')
    }

    return (
        <Formik<FormValues>
            initialValues={initialValues}
            onSubmit={async (values) => await convertAmount({ value: values.sourceAmount, currency: values.sourceCurrency }, values.targetCurrency)}>
            {(props): React.ReactNode => {
                const { values, setFieldValue, handleSubmit} = props;

                return (
                    <FormLayoutBox>
                        <Form onSubmit={handleSubmit}>
                            <FormContentBox>
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
                                        title='Swap'
                                        type='button'
                                        icon='transfer'
                                        iconAlignment='right'
                                        colorTheme='info'
                                        size='tiny'
                                        minimal
                                        onClick={() => {
                                            const { sourceCurrency, targetCurrency } = values;
                                            setFieldValue('sourceCurrency', targetCurrency)
                                            setFieldValue('targetCurrency', sourceCurrency)
                                        }} />
                                    <SelectCurrency
                                        label='Target'
                                        name='targetCurrency'
                                        currency={values.targetCurrency}
                                        currencies={supportedCurrencies}
                                        onChange={(selectedCurrency) => setFieldValue('targetCurrency', selectedCurrency)} />
                                </CurrenciesBox>
                                <Button
                                    type='submit'
                                    icon='play-circle'
                                    iconAlignment='right'
                                    loading={status.code === 'pending'}
                                    disabled={status.code === 'pending'}>
                                    Convert
                                </Button>
                            </FormContentBox>
                        </Form>
                        <Box mb='s'>
                            {status.code === 'pending' && <Spinner size='large' />}
                            {status.code === 'converted' && <ConversionResult amount={status.resultAmount} />}
                        </Box>
                        {status.code === 'failed' && <Notice colorTheme='error'>{status.reason}</Notice>}
                    </FormLayoutBox>
                )
            }}
        </Formik>
    )
}