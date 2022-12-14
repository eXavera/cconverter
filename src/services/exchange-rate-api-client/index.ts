import { Currency } from '../../common/types/Currency'
import { ExchangeRateApi as Config } from '../../common/configuration'
import NodeCache from 'node-cache'
import { wrap } from 'lodash'
import { createLogger, Logger } from '../../common/logging'
import * as FreeTierConstrainedConverter from './FreeTierConstrainedConverter'
import { Money } from '../../common/types/Money'

const log: Logger = createLogger('ExchangeRateApiClient')

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

const cache = new NodeCache()
const cacheAvailableCurrencies = async (loadFunc: () => Promise<Currency[]>) : Promise<Currency[]> => {
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

export function convert(amount: Money, target: Currency): Promise<number> {
    return FreeTierConstrainedConverter.convert(getUsdBaseRates, amount, target)
}

export const getAvailableCurrencies = wrap(async (): Promise<Currency[]> => {
    log.trace('requesting currencies')
    const httpResp: Response = await fetch(`https://openexchangerates.org/api/currencies.json`)
    throwIfNotOK(httpResp.status)
    
    type Label = string
    const currenciesWithLabel = await httpResp.json() as Record<Currency, Label>

    const currencies = Object.keys(currenciesWithLabel)
    currencies.sort()
    return currencies
}, cacheAvailableCurrencies)