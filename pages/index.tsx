import React from 'react'
import { GetStaticProps } from 'next'
import { Formik } from 'formik'
import {
    Flex,
    NumberInput,
    Select,
    SelectOption,
    Button
} from '@purple/phoenix-components'
import { ILayoutProps } from '../components/layout'

interface IConvertFormProps {
    sourceAmount: number,
    targetAmount: number,
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
    targetAmount: 0,
    sourceCurrency: currencies[0],
    targetCurrency: currencies[0]
}

export default function Inndex(): React.ReactNode {
    return (
        <Formik<IConvertFormProps> initialValues={initialValues} onSubmit={() => { }}>
            {(props): React.ReactNode => {
                const { values, setFieldValue, handleChange } = props;

                return (
                    <>
                        <Flex mt="2em" mb="1em">
                            <NumberInput
                                label='Source Amount'
                                name='sourceAmount'
                                value={values.sourceAmount}
                                onChange={(amount => setFieldValue('sourceAmount', amount))} />
                            <Select
                                label='Source Currency'
                                name='sourceCurrency'
                                value={values.sourceCurrency}
                                options={currencies}
                                onChange={(selectedCurrency) => setFieldValue('sourceCurrency', selectedCurrency)} />
                        </Flex>
                        <Flex mt="2em" mb="1em">
                            <NumberInput
                                label='Target Amount'
                                name='targetAmount'
                                disabled={true}
                                value={values.targetAmount}
                                onChange={() => { }} />
                            <Select
                                label='Target Currency'
                                name='targetCurrency'
                                value={values.targetCurrency}
                                options={currencies}
                                onChange={(selectedCurrency) => setFieldValue('targetCurrency', selectedCurrency)} />
                        </Flex>
                        <Button icon="play-circle" iconAlignment='right'>
                            Convert
                        </Button>
                    </>
                )
            }}
        </Formik>
    )
}

export const getStaticProps : GetStaticProps<ILayoutProps> = () => {
    return {
        props: {
            title: 'Converter'
        }
    }
}