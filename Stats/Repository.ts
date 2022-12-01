import { MongoClient, ServerApiVersion, Document as MongoDocument, Collection } from 'mongodb'
import { Currency, CurrencyPairStats, Money } from '../Common/types'
import { createLogger, Logger } from '../Common/Logging'

const log: Logger = createLogger('stats MongoDB client')

interface ConversionRecord extends MongoDocument {
    source: Money,
    target: Money
}

type MongoHandler<TResult> = (conversions: Collection<ConversionRecord>) => Promise<TResult>

const magic = async function <TResult>(handler: MongoHandler<TResult>): Promise<TResult> {
    const client = new MongoClient(process.env.MONGODB_CONN_STRING as string, {
        serverApi: ServerApiVersion.v1
    })
    log.trace('connecting')
    await client.connect()
    log.trace('connected')
    try {
        const db = client.db('cclient')
        return await handler(db.collection<ConversionRecord>('conversions'))
    }
    catch (error: any) {
        log.error(error)
        throw error
    }
    finally {
        log.trace('disconnecting')
        await client.close()
    }
}

interface AggregationResult {
    _id: {
        source: Currency,
        target: Currency
    },
    count: number,
    targetSum: number
}

export const queryStats = async (): Promise<CurrencyPairStats[]> => {
    const records = await magic<AggregationResult[]>(async conversions => {
        log.trace('running aggregation')
        const cursor = conversions.aggregate<AggregationResult>([
            {
                '$group': {
                    '_id': {
                        'source': '$source.currency',
                        'target': '$target.currency'
                    },
                    'count': {
                        '$count': {}
                    },
                    'targetSum': {
                        '$sum': '$target.amount'
                    }
                }
            }, {
                '$sort': {
                    'count': -1,
                    'targetSum': -1
                }
            }
        ])
        try {
            return await cursor.toArray()
        }
        finally {
            cursor.close()
        }
    })

    log.info('aggregation loaded')

    return records.map(r => ({
        source: r._id.source,
        target: r._id.target,
        count: r.count,
        totalTargetAmount: r.targetSum
    }))
}

export const recordConversion = async (source: Money, target: Money): Promise<void> => {
    await magic<void>(async conversions => {
        log.trace('inserting conversion %j to %j', source, target)
        await conversions.insertOne({ source, target })
        log.info('inserted conversion %j to %j', source, target)
    })
}