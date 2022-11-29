import React, { useState } from 'react'
import { GetServerSideProps } from 'next'
import { Form, Formik, FormikErrors } from 'formik'
import {
    Flex,
    NumberInput,
    SelectOption,
    SelectNative,
    Button,
    Box,
    Text,
    Spinner,
    Notice,
    SelectNativeProps
} from '@purple/phoenix-components'
import { ILayoutProps } from '../components/layout'
import { ConversionResult, Currency } from '../Common/types'
import * as ExchangeRateApi from '../ExchangeRateApi'

const config = {
    maxDecimals: 2
}

const USD: Currency = 'USD'

type ConversionStatus =
    { code: 'ready' } |
    { code: 'pending' } |
    { code: 'converted', result: number, currency: Currency } |
    { code: 'failed', reason: string }

type ConversionApi = {
    status: ConversionStatus,
    convertAmount: (source: Currency, target: Currency, amount: number) => Promise<void>
}

const useConvertApi = function (): ConversionApi {
    const [status, setStatus] = useState<ConversionStatus>({ code: 'ready' })

    return {
        status,
        convertAmount: async (source: Currency, target: Currency, amount: number) => {
            if (amount === 0) {
                setStatus({
                    code: 'converted',
                    result: amount,
                    currency: target
                })
                return
            }

            setStatus({ code: 'pending' })

            const factor: number = Math.pow(10, config.maxDecimals)

            const encode = encodeURIComponent;
            const httpResp = await fetch(`/api/convert/${encode(source)}/${encode(target)}?amount=${(amount * factor).toFixed(0)}`)
            if (httpResp.status === 200) {
                const convResp = await httpResp.json() as ConversionResult
                setStatus({
                    code: 'converted',
                    result: Math.round(convResp.amount) / factor,
                    currency: target
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
    targetCurrency: Currency,
    validationError?: string
}

const ResultAmount: React.FC<{ amount: number, currency: Currency }> = (props) => {
    return <Text size="large"> = {props.amount.toFixed(config.maxDecimals)} {props.currency}</Text>
}

interface SelectCurrencyProps extends Omit<SelectNativeProps, "onChange"> {
    currency: Currency,
    currencies: Currency[]
    onChange: (value: Currency | null) => void
}

const SelectCurrency: React.FC<SelectCurrencyProps> = ({
    currency,
    currencies,
    onChange: onChange,
    ...props
}) => {
    const toSelectOption = (currency: Currency): SelectOption => {
        return {
            value: currency,
            label: currency
        }
    }

    return (
        <SelectNative
            value={toSelectOption(currency)}
            options={currencies.map(toSelectOption)}
            onChange={selectedValue => onChange(selectedValue?.value as Currency)}
            {...props}
        />
    )
}

const IndexPage: React.FC<IPageProps> = ({ supportedCurrencies }) => {
    const { status, convertAmount }: ConversionApi = useConvertApi()

    const initialValues: IConvertFormValues = {
        sourceAmount: 0,
        sourceCurrency: USD,
        targetCurrency: USD
    }

    const validateForm = (values: IConvertFormValues): FormikErrors<IConvertFormValues> => {
        return values.sourceCurrency !== USD && values.targetCurrency != USD ? { validationError: 'One of the currency has to be ' + USD } : {}
    }

    return (
        <Formik<IConvertFormValues>
            initialValues={initialValues}
            validate={validateForm}
            onSubmit={async (values) => await convertAmount(values.sourceCurrency, values.targetCurrency, values.sourceAmount)}>
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
                            {status.code === 'converted' && <ResultAmount amount={status.result} currency={status.currency} />}
                            {errors.validationError && <Notice colorTheme="warning">{errors.validationError}</Notice>}
                        </Box>
                        {status.code === 'failed' && <Notice colorTheme="error">{status.reason}</Notice>}
                    </Flex>
                )
            }}
        </Formik>
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