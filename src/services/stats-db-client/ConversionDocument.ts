import { Document as MongoDocument } from 'mongodb'
import { Money } from '../../common/types/Money'

export interface ConversionDocument extends MongoDocument {
    source: Money,
    target: Money
}
