import {
    ServerApiVersion,
    MongoClient,
    Collection,
    Db
} from 'mongodb'
import { createLogger, Logger } from '../../common/logging'
import { Money } from '../../common/types/Money'
import { AggregatedConversionsDocument } from './AggregatedConversionsDocument'
import { ConversionDocument } from './ConversionDocument'
import { CurrencyPairStats } from './CurrencyPairStats'

const log: Logger = createLogger('stats MongoDB client')

type ConversionsAccessor<TResult> = (conversions: Collection<ConversionDocument>) => Promise<TResult>
const accessConversions = async function <TResult>(accessor: ConversionsAccessor<TResult>): Promise<TResult> {
    const client = new MongoClient(process.env.MONGODB_CONN_STRING as string, {
        serverApi: ServerApiVersion.v1
    })

    log.trace('connecting')
    await client.connect()
    log.trace('connected')

    try {
        const db: Db = client.db('cconverter')
        return await accessor(db.collection<ConversionDocument>('conversions'))
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

export const queryMostFrequentConversions = async (): Promise<CurrencyPairStats[]> => {
    const resultDocuments = await accessConversions<AggregatedConversionsDocument[]>(async (conversions: Collection<ConversionDocument>) => {
        log.trace('running "most frequent conversions" aggregation')
        const resultCursor = conversions.aggregate<AggregatedConversionsDocument>([
            {
                '$group': {
                    '_id': {
                        'source': '$source.currency',
                        'target': '$target.currency'
                    },
                    'count': {
                        '$count': {}
                    },
                    'totalTargetAmount': {
                        '$sum': '$target.amount'
                    }
                }
            }, {
                '$sort': {
                    'count': -1,
                    'totalTargetAmount': -1
                }
            }
        ])
        try {
            return await resultCursor.toArray()
        }
        finally {
            await resultCursor.close()
        }
    })

    log.info('aggregation "most frequent conversions" loaded')

    return resultDocuments.map(r => ({
        source: r._id.source,
        target: r._id.target,
        count: r.count,
        totalTargetAmount: r.totalTargetAmount
    }))
}

export const recordConversion = async (source: Money, target: Money): Promise<void> => {
    await accessConversions(async (conversions: Collection<ConversionDocument>) => {
        log.trace('inserting conversion %j to %j', source, target)
        await conversions.insertOne({ source, target })
        log.info('inserted conversion %j to %j', source, target)
    })
}