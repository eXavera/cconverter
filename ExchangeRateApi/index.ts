import { Currency } from '../Common/types'
import { createLogger, Logger } from '../Common/Logging'
import { ExchangeRateApi as Config } from '../Common/Config'
import NodeCache from 'node-cache'
import { wrap } from 'lodash'

const log: Logger = createLogger('ExchangeRateApi')

const USD: Currency = 'USD'

const throwIfNotOK = function (httpRespStatus: number): void | never {
    if (httpRespStatus !== 200) {
        throw new Error(`Open Exchange server responded with an HTTP error ${httpRespStatus}`)
    }
}

const getUsdBaseRates = async function (targetCurrencies: Currency[]): Promise<Record<Currency, number>> {
    const httpReqParams = new URLSearchParams([
        ['app_id', process.env.OPEN_EX_RATES_APPID as string],
        ['base', USD],
        ['symbols', targetCurrencies.join(',')]
    ])

    log.trace('requesting rates for %j', targetCurrencies)
    const httpResp: Response = await fetch('https://openexchangerates.org/api/latest.json?' + httpReqParams.toString())
    throwIfNotOK(httpResp.status)

     const respBody = await httpResp.json() as { rates: Record<Currency, number> }
    return respBody.rates
}

export async function convert(source: Currency, target: Currency, amount: number): Promise<number> {
    if (source == target || amount === 0) {
        return amount
    }
    else if (source === USD) {
        return amount * (await getUsdBaseRates([target]))[target]
    }
    else if (target === USD) {
        return amount / (await getUsdBaseRates([source]))[source]
    }
    else {
        const rates = await getUsdBaseRates([source, target])
        const usdAmount = amount / rates[source]
        return usdAmount * rates[target]
    }
}

const cache = new NodeCache()
const cacheCurrencies = async (loadFunc: () => Promise<Currency[]>) : Promise<Currency[]> => {
    const cacheKey = 'availableCurrencies'

    const cachedCurrencies = cache.get<Currency[]>(cacheKey)
    if (cachedCurrencies) {
        log.trace('currencies loaded from cache')
        return cachedCurrencies
    }

    const currencies = await loadFunc()
    cache.set(cacheKey, currencies, Config.availableCurrenciesCache.timeoutSeconds)

    return currencies
}

export const getAvailableCurrencies = wrap(async (): Promise<Currency[]> => {
    log.trace('requesting currencies')
    const httpResp: Response = await fetch(`https://openexchangerates.org/api/currencies.json`)
    throwIfNotOK(httpResp.status)
    
    type Label = string
    const currenciesWithLabel = await httpResp.json() as Record<Currency, Label>
    return Object.keys(currenciesWithLabel)
}, cacheCurrencies)