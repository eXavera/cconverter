import { Box, LinkButton, Tooltip } from "@purple/phoenix-components"
import { useState } from "react"
import styled from "styled-components"
import { InlineText } from "../../../common/components/InlineText"
import { formatMoney } from "../../../common/formatting/formatMoney"
import { Money } from "../../../common/types/Money"
import delay from "../../../common/utils/Delay"
import { ConvertForm as Config } from "../../../common/configuration"

const ResultBox = styled(Box)`
vertical-align: middle;
 `

export const ConversionResult: React.FC<{ amount: Money }> = ({ amount }) => {
    const [copyTooltipVisible, setCopyTooltipVisible] = useState<boolean>(false)

    return (
        <ResultBox>
            <InlineText size="large"> &#61; {formatMoney(amount)}</InlineText>
            <Tooltip content="Copied!" visible={copyTooltipVisible}>
                <LinkButton
                    title="Copy to clipboard"
                    size="small"
                    icon="copy"
                    colorTheme="info"
                    minimal
                    onClick={async () => {
                        await navigator.clipboard.writeText(amount.value.toFixed(Config.maxDecimals))
                        setCopyTooltipVisible(true)
                        await delay(1000)
                        setCopyTooltipVisible(false)
                    }} />
            </Tooltip>
        </ResultBox>
    )
}