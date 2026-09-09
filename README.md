# Conference Manager web

RTL-first dashboard for the Conference Manager API.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

`VITE_API_URL` defaults to `http://localhost:8080`. Set `VITE_UI_PREVIEW=1` in `.env` and restart the dev server to open the dashboard without login (dev only).

## Deploy to GitHub Pages

Set `VITE_API_URL` in `.env` to the public API, then:

```bash
npm run deploy
```

That builds the app and publishes `dist` to the `gh-pages` branch. In the GitHub repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `gh-pages` / root**.

The site is at https://kyriakosmilad.github.io/conference-manager-web/
