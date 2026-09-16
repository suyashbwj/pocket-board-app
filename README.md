# Pocket Board

A small React Native / Expo app for posting short messages to a shared board. A Node.js REST API stores the latest 100 messages in SQLite. Built for the Mobile Applications & Services first programming assignment.

## Run locally

Requirements: Node.js 22.13+ (Node 22 LTS recommended), npm, Git, Expo Go on a physical iPhone or Android phone.

```sh
npm ci
cd server
npm start
```

In a second terminal at the repository root, create `.env.local`:

```dotenv
EXPO_PUBLIC_API_URL=http://YOUR_MAC_LAN_IP:3001
```

Use `http://localhost:3001` for Mac browser-only testing. On a phone, localhost refers to the phone, so use the Mac's LAN IP or the deployed HTTPS API URL.

```sh
npx expo login --browser
npx expo start --go
```

Sign into the same Expo account in Expo Go, put both devices on the same network, and scan the Expo QR code with the iPhone Camera. Press `w` in the Expo terminal for the web version. Restart Expo after changing `.env.local`.

## API

- `GET /health`: service status.
- `GET /messages`: newest 100 messages.
- `POST /messages`: JSON `{ "name": "Suyash", "text": "Hello from my phone" }`; returns saved message with ID and timestamp.
- Name: 1–30 characters. Message: 1–280 characters. Leading/trailing whitespace is trimmed.

The board is a public classroom demo with no account authentication. Anyone with its API URL can read/post messages and choose any display name. Do not enter private content. Old messages are removed once the board exceeds 100 entries.

## Backend deployment

Deploy the `server` directory with its Dockerfile. Set `PORT` to the host's supplied port and set `DATA_DIR=/data` with a persistent volume mounted at `/data`. Without a persistent volume, hosting redeployments can erase the SQLite file. Set the mobile app's `EXPO_PUBLIC_API_URL` to the resulting HTTPS service URL and restart Expo.

**Hosted API URL: https://pocket-board-api.vercel.app** (Vercel Hobby + Neon Free). Health: https://pocket-board-api.vercel.app/health.

## Verification

```sh
node --test server/api.test.mjs
npx tsc --noEmit
```

The API integration test checks input validation, post/retrieve behavior, ordering, persistence after restart, CORS preflight, and unknown routes. Physical iPhone testing and partner exchange are documented separately.

## References

Based on the [Expo starter](https://docs.expo.dev/tutorial/create-your-first-app/). Backend references: [Node SQLite](https://nodejs.org/api/sqlite.html), [Vercel Functions](https://vercel.com/docs/functions/runtimes/node-js), and [Neon](https://neon.com/docs/serverless/serverless-driver).


## Vercel hosting option

The `api` directory contains a Vercel Functions backend using Neon Postgres. See [Vercel deployment](docs/vercel-deployment.md). The local `server` API remains available, but SQLite files are not used on Vercel. The hosted API is deployed and live GET/POST validation passed. Set `EXPO_PUBLIC_API_URL=https://pocket-board-api.vercel.app` to use it.
