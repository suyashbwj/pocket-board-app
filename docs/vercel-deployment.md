# Vercel + Neon deployment

Status: deployed to https://pocket-board-api.vercel.app on Vercel Hobby, with pocket-board-db on Neon Free (free_v3), region iad1. Schema initialized. Live health, POST, GET, empty-message validation, and CORS preflight passed. Physical iPhone posting against the hosted API was confirmed by Suyash and independent API readback of “Hello from mobile!!”.

1. Import `suyashbwj/pocket-board-app` into a personal Vercel Hobby account. Set **Root Directory** to `api`, framework preset to Other, and leave the build command unset. This deploys only the backend, not the Expo project.
2. Add a Neon database using its free plan. Connect the database to this Vercel project and confirm that `DATABASE_URL` is set for Production. Database credentials must remain server-only; never use an EXPO_PUBLIC prefix for them.
3. Run `api/schema.sql` in the Neon SQL editor once to initialize the messages table.
4. Deploy and verify `/health` reports Postgres, GET `/messages` returns JSON, and POST `/messages` saves a demo message that a subsequent GET retrieves.
5. Set the Expo project's `.env.local` to `EXPO_PUBLIC_API_URL=https://YOUR-PROJECT.vercel.app`, restart Expo, and test a post from the physical iPhone.

The SQLite API in `server` remains a standalone local learning/demo option. The hosted API in `api` uses Postgres. Local messages are not automatically migrated. The deployed demo will start empty.

Deployment is not complete until the public API responds and the phone test is verified. No paid plans are authorized.

References:
- https://vercel.com/docs/functions/runtimes/node-js
- https://vercel.com/docs/storage
- https://neon.com/docs/serverless/serverless-driver
