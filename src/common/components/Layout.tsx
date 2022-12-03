import React from 'react'
import Head from 'next/head'
import { ThemeProvider } from 'styled-components'
import {
    Theme as PhoenixTheme,
    GlobalStyles,
    Heading
} from '@purple/phoenix-components'
import styled from 'styled-components'

const StyledMain = styled.main`
    width: fit-content;
    margin: 0 auto;
`

export interface LayoutProps extends React.PropsWithChildren {
    title: string
}

export const Layout: React.FunctionComponent<LayoutProps> = (props) => {
    return (
        <ThemeProvider theme={PhoenixTheme}>
            <GlobalStyles />
            <Head>
                <title>CConverter</title>
            </Head>
            <StyledMain>
                <Heading textAlign="center">{props.title}</Heading>
                {props.children}
            </StyledMain>
        </ThemeProvider >
    )
}