import * as config from '../../config.json'
import { LogLevel } from '../logging/LogLevel'

const rawConfig: any = config

interface LoggingConfig {
    minLevel: LogLevel
}

interface ExchangeRateApiConfig {
    availableCurrenciesCache: {
        timeoutSeconds: number
    }
}

interface ConversionFormConfig {
    maxDecimals: number
}

export const Logging: Readonly<LoggingConfig> = {
    minLevel: rawConfig?.logging?.minLevel as LogLevel ?? 'info'
}

export const ExchangeRateApi: Readonly<ExchangeRateApiConfig> = {
    availableCurrenciesCache: {
        timeoutSeconds: rawConfig?.availableCurrenciesCache?.timeoutSeconds as number  ?? 0
    }
}

export const ConversionForm: Readonly<ConversionFormConfig> = {
    maxDecimals: rawConfig?.conversionForm?.maxDecimals ?? 2
}