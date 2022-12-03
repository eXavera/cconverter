import * as config from '../config.json'
import { LogLevel } from './types'

const rawConfig: any = config

export const Logging = {
    minLevel: rawConfig?.logging?.minLevel as LogLevel ?? 'info'
}

export const ExchangeRateApi = {
    availableCurrenciesCache: {
        timeoutSeconds: rawConfig?.availableCurrenciesCache?.timeoutSeconds as number  ?? 0
    }
}

export const ConvertForm = {
    maxDecimals: rawConfig?.convertForm?.maxDecimals ?? 2
}