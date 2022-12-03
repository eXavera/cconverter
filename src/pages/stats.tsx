import { GetServerSideProps } from 'next'
import { MostFrequestConversions, MostFrequestConversionsProps } from '../features/stats/MostFrequentConversions'
import { LayoutProps } from '../common/components/Layout'
import { queryMostFrequentConversions } from '../services/StatsDbClient'

export default MostFrequestConversions

export const getServerSideProps: GetServerSideProps<LayoutProps & MostFrequestConversionsProps> = async () => {
    return {
        props: {
            title: 'Conversion Statistics',
            currencyPairs: await queryMostFrequentConversions()
        }
    }
}