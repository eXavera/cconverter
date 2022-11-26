import React, { useState } from 'react'
import { GetServerSideProps, GetStaticProps } from 'next'
import { Form, Formik, FormikErrors, FormikHelpers } from 'formik'
import {
    Flex,
    NumberInput,
    SelectOption,
    SelectNative,
    Button,
    Box,
    Text,
    Spinner,
    Notice
} from '@purple/phoenix-components'
import { ILayoutProps } from '../components/layout'
import { ConversionResponse } from '../api-interface/convert'

interface IConverterPageProps {
    supportedCurrencies: string[]
}

interface IConvertFormProps {
    sourceAmount: number,
    sourceCurrency: SelectOption,
    targetCurrency: SelectOption,
    validationError?: string
}

const doSubmit = async function (values: IConvertFormProps, formControls: FormikHelpers<IConvertFormProps>): Promise<number> {
    console.log(values)

    const resp = await fetch(`/api/convert/${values.sourceCurrency.value}/${values.targetCurrency.value}?amount=${(values.sourceAmount * 100).toFixed(0)}`)
    const result = (await resp.json()) as ConversionResponse

    return result.result / 100
}

const ConversionResult: React.FC<{ amount: number, currency: string }> = (props) => {
    return (
        <Box>
            <Text size="large"> = {props.amount.toFixed(2)} {props.currency}</Text>
        </Box>
    )
}

const IndexPage: React.FC<IConverterPageProps> = ({ supportedCurrencies }) => {
    const [targetAmount, setTargetAmount] = useState(0)
    const [targeCurrency, setTargetCurrency] = useState('USD')
    const [isLoading, setIsLoading] = useState(false)

    const allCurrencyItems = supportedCurrencies.map<SelectOption>(name => ({
        label: name,
        value: name
    }))

    const usd = allCurrencyItems.find(curr => curr.value === 'USD') as SelectOption

    const initialValues: IConvertFormProps = {
        sourceAmount: 0,
        sourceCurrency: usd,
        targetCurrency: usd
    }

    const validateForm = (values: IConvertFormProps): FormikErrors<IConvertFormProps> => {
        if (values.sourceCurrency.value !== usd.value && values.targetCurrency.value != usd.value) {
            return {
                validationError: 'One of the currency has to be USD'
            }
        }

        return {}
    }

    return (
        <Formik<IConvertFormProps> initialValues={initialValues} validate={validateForm} onSubmit={async (values, controls) => {
            setIsLoading(true)
            const resultAmount = await doSubmit(values, controls)
            setTargetAmount(resultAmount)
            setTargetCurrency(values.targetCurrency.label)
            setIsLoading(false)
        }}>
            {(props): React.ReactNode => {
                const { values, setFieldValue, handleSubmit, errors } = props;

                console.log('errors', errors)

                return (
                    <Flex alignItems="stretch" flexDirection="column">
                        <Form onSubmit={handleSubmit}>
                            <Flex mt="2em" mb="1em">
                                <NumberInput
                                    label='Source Amount'
                                    name='sourceAmount'
                                    value={values.sourceAmount}
                                    onChange={(amount => setFieldValue('sourceAmount', amount))} />
                                <SelectNative
                                    label='Source Currency'
                                    name='sourceCurrency'
                                    value={values.sourceCurrency}
                                    options={allCurrencyItems}
                                    onChange={(selectedCurrency) => setFieldValue('sourceCurrency', selectedCurrency)} />
                                <SelectNative
                                    label='Target Currency'
                                    name='targetCurrency'
                                    disabled={isLoading}
                                    value={values.targetCurrency}
                                    options={allCurrencyItems}
                                    onChange={(selectedCurrency) => setFieldValue('targetCurrency', selectedCurrency)} />
                                <Button
                                    icon="play-circle"
                                    iconAlignment='right'
                                    type="submit"
                                    loading={isLoading}
                                    disabled={isLoading}
                                    ml="1em">
                                    Convert
                                </Button>
                            </Flex>
                        </Form>
                        {isLoading ? <Spinner size="large" /> : <ConversionResult amount={targetAmount} currency={targeCurrency} />}
                        {errors.validationError && <Notice colorTheme="warning" mt="1em">{errors.validationError}</Notice>}
                    </Flex>
                )
            }}
        </Formik>
    )
}

export default IndexPage

export const getServerSideProps: GetServerSideProps<ILayoutProps> = async () => {
    const res = await fetch(`https://openexchangerates.org/api/currencies.json`)
    const data = await res.json()
    return {
        props: {
            title: 'Converter',
            supportedCurrencies: Object.keys(data)
        }
    }
}