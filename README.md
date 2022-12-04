# Currency Converter

A Next.js sample application providing:
- Conversion form
- Stats page with the most frequent conversions

Built and tested using `NodeJS 18.12.1`

Stack showcase :-)
- [Next.js](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [Phoenix components](https://github.com/purple-technology/phoenix-components)
- [Formik](https://formik.org)
- [Yup validation](https://github.com/jquense/yup)
- [MongoDB](https://www.mongodb.com/)
- [Tracer](https://github.com/baryon/tracer)
- [Jest](https://jestjs.io)

Designed for free tier of https://openexchangerates.org as the exchange rate provider.

## Setup
Go to `src` directory.

Set environment variables using `.env` file:

```
OPEN_EX_RATES_APPID=<open exchange rate app_id>
MONGODB_CONN_STRING=<mongo db connection_string>
```

Restore packages:
`npm i`

**Note**: Currently Phoenix components are not fully compatible with React 18, so you'll get warnings about React version mismatch. Fortunately most components works except of `children` prop setting of a few components. A few tweaks in `types.d.ts` solves this.

## Build & Run
```
npm run build
npm start
```

## Test
`npm run test`

