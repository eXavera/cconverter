import React from 'react'
import { Card, Flex, Link, Text } from '@purple/phoenix-components'
import { GetServerSideProps } from 'next'
import { CurrencyPairStats } from '../Common/types'
import { ILayoutProps } from '../components/layout'
import { queryStats } from '../Stats/Repository'

interface IPageProps {
    currencyPairs: CurrencyPairStats[]
}

const CurrencyPairBox: React.FC<{ pair: CurrencyPairStats }> = ({ pair }) => {
    return (
        <Card>
            <Text>{pair.source} - { pair.target }</Text>
        </Card>)
}

const IndexPage: React.FC<IPageProps> = ({ currencyPairs }) => {
    return (
        <Flex alignItems="stretch" flexDirection="column">
            <Link href="/" iconAlignment="left" icon="arrow-left" mt="1em" mb="2em">Back to converter</Link>
            <Text size="large">Top pairs</Text>
            {currencyPairs.map(pair => <CurrencyPairBox pair={pair} key={pair.source + pair.target} />)}
        </Flex>
    )
}

export default IndexPage

export const getServerSideProps: GetServerSideProps<ILayoutProps & IPageProps> = async () => {
    return {
        props: {
            title: 'Conversion Statistics',
            currencyPairs: await queryStats()
        }
    }
}