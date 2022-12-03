import { Box, Link, Text } from "@purple/phoenix-components"
import { CurrencyPairStats } from "./CurrencyPairStats"
import { CurrencyPairStatsBox } from './components/CurrencyPairStatsBox'
import { queryMostFrequentConversions } from '../../services/StatsDbClient'

export interface MostFrequestConversionsProps {
    currencyPairs: CurrencyPairStats[]
}

export const MostFrequestConversions: React.FC<MostFrequestConversionsProps> = ({ currencyPairs }) => {
    return (
        <Box mt="s">
            <Link href="/" iconAlignment="left" icon="arrow-left">Back to converter</Link>
            <Text size="large" mb="s" mt="s">Top pairs</Text>
            {currencyPairs.map(pair => <CurrencyPairStatsBox pair={pair} key={pair.source + pair.target} />)}
        </Box>
    )
}