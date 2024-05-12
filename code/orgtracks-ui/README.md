# Orgtracks UI

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Pre-requisite

- Node.js v20.9.0

## Set up


### Environment Variables

Copy `.env.sample` as `.env` and set the applicable value for each variable.

- `NEXT_PUBLIC_API_BASE_URL` - base URL of OrgTracks API. (e.g. `http://localhost:3001/api`)
- `NEXT_PUBLIC_SOCKET_URL` - URL of the socket server. (e.g. `http://localhost:3001`)

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
