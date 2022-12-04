import Document, { DocumentContext } from 'next/document'
import { ServerStyleSheet } from 'styled-components'
import { wrap } from 'lodash'

// based on https://gist.github.com/straxico/77740ef488b6046f8f09c81de70e904e
export default class DocumentSupportingSSRStyledComponents extends Document {
    static async getInitialProps(docContext: DocumentContext) {
        const serverCss = new ServerStyleSheet()

        docContext.renderPage = wrap(docContext.renderPage, (wrappedFunc, options) => {
            return wrappedFunc({
                ...options,
                enhanceApp: (App) => {
                    return appProps => serverCss.collectStyles(<App {...appProps} />)
                }
            })
        })

        try {
            const initialProps = await Document.getInitialProps(docContext)
            return {
                ...initialProps,
                styles: [initialProps.styles, serverCss.getStyleElement()],
            }
        } finally {
            serverCss.seal()
        }
    }
}