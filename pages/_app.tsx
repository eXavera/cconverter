import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Layout, ILayoutProps } from '../components/layout'

export default function App({ Component, pageProps }: AppProps<ILayoutProps>) {
  return (
    <Layout title={pageProps.title}>
      <Component {...pageProps} />
    </Layout>
  )
}
