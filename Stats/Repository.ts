import { MongoClient, ServerApiVersion, Document as MongoDocument, Collection } from 'mongodb'
import { Currency, CurrencyPairStats } from '../Common/types'

interface Money {
    amount: number,
    currency: Currency
}

interface ConversionRecord extends MongoDocument {
    source: Money,
    target: Money
}

type MongoHandler<TResult> = (conversions: Collection<ConversionRecord>) => Promise<TResult>

const magic = async function <TResult>(handler: MongoHandler<TResult>): Promise<TResult> {
    const client = new MongoClient(process.env.MONGODB_CONN_STRING as string, {
        serverApi: ServerApiVersion.v1
    })
    await client.connect()
    try {
        const db = client.db('cclient')
        return await handler(db.collection<ConversionRecord>('conversions'))
    }
    finally {
        await client.close()
    }
}

interface MyRecord {
    _id: {
        source: Currency,
        target: Currency
    },
    count: number,
    targetSum: number
}

export const queryStats = async (): Promise<CurrencyPairStats[]> => {
    const records = await magic<MyRecord[]>(async conversions => {
        const cursor = conversions.aggregate<MyRecord>([
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

    return records.map(r => ({
        source: r._id.source,
        target: r._id.target,
        count: r.count,
        totalTargetAmount: r.targetSum
    }))
}

export const recordConversion = async (source: Money, target: Money): Promise<void> => {
    await magic<void>(async conversions => {
        await conversions.insertOne({ source, target })
    })
}