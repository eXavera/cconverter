import { Currency } from "../../common/types/Currency";
import { Money } from "../../common/types/Money";

type UsdBaseRatesLoader = (targets: Currency[]) => Promise<Record<Currency, number>>
const USD: Currency = 'USD'

export const convert = async (loadUsdBaseRates: UsdBaseRatesLoader, sourceAmount: Money, targetCurrency: Currency) : Promise<number> => {
    if (sourceAmount.currency == targetCurrency || sourceAmount.value === 0) {
        return sourceAmount.value
    }
    else if (sourceAmount.currency === USD) {
        return sourceAmount.value * (await loadUsdBaseRates([targetCurrency]))[targetCurrency]
    }
    else if (targetCurrency === USD) {
        return sourceAmount.value / (await loadUsdBaseRates([sourceAmount.currency]))[sourceAmount.currency]
    }
    else {
        const rates = await loadUsdBaseRates([sourceAmount.currency, targetCurrency])
        const usdAmount = sourceAmount.value / rates[sourceAmount.currency]
        return usdAmount * rates[targetCurrency]
    }
}