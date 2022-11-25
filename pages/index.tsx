import React, { useId } from 'react'
import { GetStaticProps } from 'next'
import { Form, Formik, FormikHelpers } from 'formik'
import {
    Flex,
    NumberInput,
    SelectOption,
    SelectNative,
    Button
} from '@purple/phoenix-components'
import { ILayoutProps } from '../components/layout'

interface IConvertFormProps {
    sourceAmount: number,
    sourceCurrency: SelectOption,
    targetCurrency: SelectOption
}

const currencies: SelectOption[] = [{
    label: 'USD',
    value: 'USD'
}, {
    label: 'EUR',
    value: 'EUR'
}]

const initialValues: IConvertFormProps = {
    sourceAmount: 0,
    sourceCurrency: currencies[0],
    targetCurrency: currencies[0]
}

const doSubmit = async function (values: IConvertFormProps, formControls: FormikHelpers<IConvertFormProps>): Promise<any>{
    console.log(values)

    const resp = await fetch(`/api/convert/${values.sourceCurrency.value}/${values.targetCurrency.value}?amount=${(values.sourceAmount * 100).toFixed(0)}`)
    console.log(resp)
    const result = await resp.json()
    console.log(result)
}

export default function Inndex(): React.ReactNode {
    return (
        <Formik<IConvertFormProps> initialValues={initialValues} onSubmit={doSubmit}>
            {(props): React.ReactNode => {
                const { values, setFieldValue, handleSubmit } = props;

                return (
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
                                options={currencies}
                                onChange={(selectedCurrency) => setFieldValue('sourceCurrency', selectedCurrency)} />
                            <SelectNative
                                label='Target Currency'
                                name='targetCurrency'
                                value={values.targetCurrency}
                                options={currencies}
                                onChange={(selectedCurrency) => setFieldValue('targetCurrency', selectedCurrency)} />
                        </Flex>
                        <Button icon="play-circle" iconAlignment='right' type="submit">
                            Convert
                        </Button>
                    </Form>
                )
            }}
        </Formik>
    )
}

export const getStaticProps: GetStaticProps<ILayoutProps> = () => {
    return {
        props: {
            title: 'Converter'
        }
    }
}