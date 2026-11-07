# Run the frontend locally against a local backend

The whole stack (Postgres, Redis, Django with demo data, Celery, Hermes stub **and** this frontend)
starts with **one command from the backend repo**. Full guide, URLs, logins, stubs and
troubleshooting: `LOCAL_RUN.md` in [ageofgenz_backend](https://github.com/Imnasir-X/ageofgenz_backend).

Nothing here changes production: Vercel builds with `npm run build` and never runs `dev:local`.

## Prerequisites

- Docker Desktop (running), Node.js 20 or newer, git.
- Both repos cloned side by side:

```
projects/
  ageofgenz_backend/
  ageofgenz_frontend/    <- this repo
```

## One command (from the backend repo)

```bash
cd ../ageofgenz_backend
./run-local.sh            # Windows PowerShell: .\run-local.ps1
```

It starts the backend in Docker, waits until http://localhost:8000 answers, runs `npm ci` here on
the first run, then `npm run dev:local`.

## Two commands (if you prefer separate terminals)

```bash
# terminal 1: backend
cd ageofgenz_backend && ./run-local.sh backend

# terminal 2: frontend
cd ageofgenz_frontend && npm ci && npm run dev:local
```

`npm run dev:local` (`scripts/dev-local.mjs`) runs the Vite dev server on http://localhost:3000 with
`VITE_API_URL=http://localhost:8000` for both the browser and server-side rendering. Plain
`npm run dev` also works (it uses the production API unless `VITE_API_URL` is set): the dev-server
SSR fix for react-router's export conditions lives in `vite.config.ts` and applies to `vite serve`
only, so `npm run build` output is byte-for-byte unchanged. Override the API
with `VITE_API_URL=http://other-host:8000 npm run dev:local`. Extra Vite flags go after `--`,
for example `npm run dev:local -- --host` to open it from your phone on the same Wi-Fi
(the API URL must then also be reachable from the phone).

No Node? `./run-local.sh` falls back to the `frontend` service in the backend's
`docker-compose.yml` (`docker compose --profile frontend up -d frontend`).

## URLs and logins

| What | URL |
|---|---|
| Site | http://localhost:3000 |
| Studio | http://localhost:3000/studio |
| Django admin | http://localhost:8000/admin/ |
| API docs | http://localhost:8000/api/docs/ |

| Role | Email | Password |
|---|---|---|
| Staff (Studio + admin) | demo@example.com | demo-pass-123 |
| Reader (not staff) | reader@example.com | reader-pass-123 |

These accounts exist only in the local demo database.

## Reset data, stubs, smoke test

- Fresh demo data: `./run-local.sh reset` in the backend repo.
- Stubbed locally: Hermes (deterministic stubs; Studio chat answers from your stats), text-to-speech,
  embeddings, Brevo email (printed to the backend log), Cloudinary (local disk), Stripe, GA4, Google sign-in.
- Playwright smoke test (home, an article, Studio sign-in + Today, admin sign-in):
  `./run-local.sh test` in the backend repo.

## Troubleshooting

- **First page load takes 10 to 30 seconds** and may reload once: Vite is optimising dependencies on the
  first visit. Later loads are fast.
- **Port 3000 in use**: stop the other dev server; `dev:local` uses `--strictPort` so it fails instead of moving.
- **"backend ... is not answering yet"**: start it with `./run-local.sh backend` in the backend repo.
- **Blank stories or CORS errors**: open http://localhost:8000/api/articles/ ; it must answer. Use
  `localhost`, not `127.0.0.1`, for both.
- **Studio: "Studio is for staff only"**: you are signed in as the reader account.
- **Old checkout without `dev:local`**: `git checkout main && git pull`.
