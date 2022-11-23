import React from 'react'
import Head from 'next/head'
import { ThemeProvider } from 'styled-components'
import {
    Theme as PhoenixTheme,
    GlobalStyles,
    Flex,
    Heading
} from '@purple/phoenix-components'

export interface ILayoutProps extends React.PropsWithChildren{
    title: string
}

export const Layout: React.FunctionComponent<ILayoutProps> = (props) => {
    return (
        <ThemeProvider theme={PhoenixTheme}>
            <GlobalStyles />
            <Head>
                <title>CConverter</title>
            </Head>
            <main>
                <Flex alignItems="center" flexDirection="column">
                    <Heading>{ props.title }</Heading>
                    { props.children }
                </Flex>
            </main>
        </ThemeProvider >
    )
}