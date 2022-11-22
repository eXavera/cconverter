import Head from 'next/head'
import { ThemeProvider } from 'styled-components'
import {
  GlobalStyles,
  Theme as PhoenixTheme,
  Flex,
  Box,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanel
} from '@purple/phoenix-components'

export default function Home() {
  return (
    <>
      <ThemeProvider theme={PhoenixTheme}>
        <GlobalStyles />
        <Head>
          <title>CConverter</title>
        </Head>
        <main>
          <Flex alignItems="center" justifyContent="center" flexDirection="column">
            <Heading element='h1'>Hello</Heading>
            <Tabs>
              <TabList>
                <Tab>Converting</Tab>
                <Tab>Stats</Tab>
              </TabList>
              <Box mt="1em">
                <TabPanel>
                  Form
                </TabPanel>
                <TabPanel>
                  Statistics
                </TabPanel>
              </Box>
            </Tabs>
          </Flex>
        </main>
      </ThemeProvider>
    </>
  )
}
