import React from 'react'
import Head from 'next/head'
import styled, { ThemeProvider } from 'styled-components'
import {
    Theme as PhoenixTheme,
    GlobalStyles,
    Heading
} from '@purple/phoenix-components'

const StyledMain = styled.main`
width: fit-content;
margin: 0 auto;
`

export interface LayoutProps extends React.PropsWithChildren {
    title: string
}

export const Layout: React.FunctionComponent<LayoutProps> = ({ title, children }) => {
    return (
        <ThemeProvider theme={PhoenixTheme}>
            <GlobalStyles />
            <Head>
                <title>CConverter</title>
            </Head>
            <StyledMain>
                <Heading textAlign="center">{title}</Heading>
                {children}
            </StyledMain>
        </ThemeProvider >
    )
}