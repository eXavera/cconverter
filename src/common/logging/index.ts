import { colorConsole, Tracer } from 'tracer'
import { Logging as Config } from '../configuration'
import { LogLevel } from './LogLevel'

const logger: Tracer.Logger<string> = colorConsole({
    level: Config.minLevel,
    format: '{{timestamp}} | {{title}} {{message}}'
})

type WrappedLogFunc = (...args: any[]) => Tracer.LogOutput
type OutLogFunc = (format: string, ...args: any[]) => void

export type Logger = Record<LogLevel, OutLogFunc>

export const createLogger = (context: string) : Logger => {
    const wrapLogger = (logFunc: WrappedLogFunc) : OutLogFunc => {
        return ((format, ...args) => logFunc(context + ' |: ' + format, ...args))
    }

    return {
        trace: wrapLogger(logger.trace),
        info: wrapLogger(logger.info),
        warn: wrapLogger(logger.warn),
        error: wrapLogger(logger.error)
    }
}