import React from 'react'
import { Box, Card, Flex, Link, Tag, Text } from '@purple/phoenix-components'
import { GetServerSideProps } from 'next'
import { CurrencyPairStats } from '../Common/types'
import { ILayoutProps } from '../components/layout'
import { queryStats } from '../Stats/Repository'
import { formatMoney } from '../Common/NumberFormatting'
import styled from 'styled-components'
import { InlineText } from '../components/InlineText'

interface IPageProps {
    currencyPairs: CurrencyPairStats[]
}

const StyledCard = styled(Card)`
    width: fit-content;
`

const PairWithTagBox = styled(Box)`
vertical-align: middle;
`

const CurrencyPairBox: React.FC<{ pair: CurrencyPairStats }> = ({ pair }) => {
    const noDecimals = 0;

    return (
        <StyledCard p="l" mb="s">
            <PairWithTagBox>
                <InlineText size="large">{pair.source} &rarr; {pair.target}</InlineText>
                <Tag ml="xxs">{pair.count}&#215;</Tag>
            </PairWithTagBox>
            <Text size="small">{formatMoney({ value: pair.totalTargetAmount, currency: pair.target }, noDecimals)} total</Text>
        </StyledCard>
    )
}

const IndexPage: React.FC<IPageProps> = ({ currencyPairs }) => {
    return (
        <Box mt="s">
            <Link href="/" iconAlignment="left" icon="arrow-left">Back to converter</Link>
            <Text size="large" mb="s" mt="s">Top pairs</Text>
            {currencyPairs.map(pair => <CurrencyPairBox pair={pair} key={pair.source + pair.target} />)}
        </Box>
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