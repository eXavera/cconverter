import type { AppProps } from 'next/app'
import { Layout, LayoutProps } from '../common/components/Layout'

export default function App({ Component, pageProps }: AppProps<LayoutProps>) {
  return (
    <Layout title={pageProps.title}>
      <Component {...pageProps} />
    </Layout>
  )
}
