import { Currency } from '../../common/types/Currency'
import { Money } from '../../common/types/Money'
import * as FreeTierConstrainedConverter from './FreeTierConstrainedConverter'

describe('Free-tier constrained currency converter', () => {
    it('processes identical source and target currencies without conversion', async () => {
        const dummyLoader = jest.fn<Promise<Record<Currency, number>>, any[]>()

        const sourceAmount: Money = { value: 10, currency: 'EUR' }
        const result: number = await FreeTierConstrainedConverter.convert(
            dummyLoader,
            sourceAmount,
            sourceAmount.currency
        )

        expect(result).toEqual(sourceAmount.value)
    })

    describe('when processing USD to X', () => {
        it('returns correct amount using rate USD to X', async () => {
            const loader = jest.fn<Promise<Record<Currency, number>>, any[]>(async (targetCurrencies: Currency[]) => {
                expect(targetCurrencies).toContain('EUR')
                return {
                    'EUR': 2
                }
            })

            const sourceAmount: Money = { value: 10, currency: 'USD' }
            const target: Currency = 'EUR'
            const result: number = await FreeTierConstrainedConverter.convert(
                loader,
                sourceAmount,
                target
            )

            expect(result).toEqual(20)
        })
    })

    describe('when processing X to USD', () => {
        it('returns correct amount using rate USD to X', async () => {
            const loader = jest.fn<Promise<Record<Currency, number>>, any[]>(async (targetCurrencies: Currency[]) => {
                expect(targetCurrencies).toContain('EUR')
                return {
                    'EUR': 2
                }
            })

            const sourceAmount: Money = { value: 10, currency: 'EUR' }
            const target: Currency = 'USD'
            const result: number = await FreeTierConstrainedConverter.convert(
                loader,
                sourceAmount,
                target
            )

            expect(result).toEqual(5)
        })
    })

    describe('when processing non-USD to non-USD', () => {
        it('returns correct amount using rates from/to USD', async () => {
            const loader = jest.fn<Promise<Record<Currency, number>>, any[]>(async (targetCurrencies: Currency[]) => {
                expect(targetCurrencies).toEqual(expect.arrayContaining(['EUR', 'CZK']))
                return {
                    'EUR': 2,
                    'CZK': 10
                }
            })

            const sourceAmount: Money = { value: 10, currency: 'EUR' }
            const target: Currency = 'CZK'
            const result: number = await FreeTierConstrainedConverter.convert(
                loader,
                sourceAmount,
                target
            )

            expect(result).toEqual(50)
        })
    })
})