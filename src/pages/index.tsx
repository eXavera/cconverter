import React from 'react'
import { GetServerSideProps } from 'next'
import { Link } from '@purple/phoenix-components'
import { LayoutProps } from '../common/components/Layout'
import { ConversionForm, ConversionFormProps } from '../features/conversion/Form'
import * as ExchangeRateApiClient from '../services/exchange-rate-api-client'

type PageProps = ConversionFormProps

const Page: React.FC<PageProps> = ({ supportedCurrencies }) => {
    return (
        <>
            <ConversionForm supportedCurrencies={supportedCurrencies} />
            <Link href="/stats" iconAlignment="left" icon="list">Show me some stats!</Link>
        </>
    )
}
export default Page

export const getServerSideProps: GetServerSideProps<LayoutProps & PageProps> = async () => {
    return {
        props: {
            title: 'Converter',
            supportedCurrencies: await ExchangeRateApiClient.getAvailableCurrencies()
        }
    }
}