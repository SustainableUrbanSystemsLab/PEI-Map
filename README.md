# PEI-Map

Vite setup for the PEI Map dashboard.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a local env file from the template:
   ```bash
   cp .env.example .env
   ```
   On PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```
3. Set `VITE_MAPBOX_TOKEN` in `.env` to a restricted public Mapbox token (`pk.`).
4. Start dev server:
   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## GitHub Pages

This project uses `base: './'` in Vite so it can be hosted on GitHub Pages (repo subpath) without extra base-path config.

Before publishing:

1. Use a **public Mapbox token** (`pk.`), never `sk.`.
2. Restrict token URL usage in Mapbox to your GitHub Pages domain and localhost.
3. Rotate any previously committed token.

This repo includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

Setup steps:

1. Add repo secret `MAPBOX_PUBLIC_TOKEN` with your restricted `pk.` token.
2. In GitHub repo settings, set Pages source to **GitHub Actions**.
3. Push to `main` to trigger deployment.
