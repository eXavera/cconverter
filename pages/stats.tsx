import React from 'react'
import { Card, Flex, Link, Tag, Text } from '@purple/phoenix-components'
import { GetServerSideProps } from 'next'
import { CurrencyPairStats } from '../Common/types'
import { ILayoutProps } from '../components/layout'
import { queryStats } from '../Stats/Repository'
import { formatMoney } from '../Common/NumberFormatting'

interface IPageProps {
    currencyPairs: CurrencyPairStats[]
}

const CurrencyPairBox: React.FC<{ pair: CurrencyPairStats }> = ({ pair }) => {
    const noDecimals = 0;

    return (
        <Card p="l" mb="s">
            <Flex>
                <Flex alignItems="center">
                    <Text size="large">{pair.source} &rarr; {pair.target}</Text>
                </Flex>
                <Tag ml="xxs">{pair.count}&#215;</Tag>
            </Flex>
            <Text size="small">{formatMoney({ value: pair.totalTargetAmount, currency: pair.target }, noDecimals)} in total</Text>
        </Card>
    )
}

const IndexPage: React.FC<IPageProps> = ({ currencyPairs }) => {
    return (
        <Flex alignItems="stretch" flexDirection="column">
            <Link href="/" iconAlignment="left" icon="arrow-left" mt="1em" mb="2em">Back to converter</Link>
            <Text size="large" mb="s">Top pairs</Text>
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