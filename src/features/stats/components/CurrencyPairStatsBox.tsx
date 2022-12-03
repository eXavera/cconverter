import { Box, Card, Tag, Text } from "@purple/phoenix-components";
import styled from 'styled-components'
import { InlineText } from "../../../common/components/InlineText";
import { formatMoney } from "../../../common/formatting/formatMoney";
import { CurrencyPairStats } from "../CurrencyPairStats";

const StyledCard = styled(Card)`
    width: fit-content;
`

const PairWithTagBox = styled(Box)`
vertical-align: middle;
`

export const CurrencyPairStatsBox: React.FC<{ pair: CurrencyPairStats }> = ({ pair }) => {
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

