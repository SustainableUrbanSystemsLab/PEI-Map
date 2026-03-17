# PEI-Map

[![Deploy to GitHub Pages](https://github.com/SustainableUrbanSystemsLab/PEI-Map/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/SustainableUrbanSystemsLab/PEI-Map/actions/workflows/deploy-pages.yml)

Interactive PEI (Pedestrian Environment Index) map dashboard.

Live site: http://sustainableurbansystems.com/PEI-Map/

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create local env:
   ```bash
   Copy-Item .env.example .env
   ```
3. Set `VITE_MAPBOX_TOKEN` in `.env` (public restricted `pk.` token).
4. Run:
   ```bash
   npm run dev
   ```

## Production Build

```bash
npm run build
npm run preview
```

<!--
Maintainer Notes (hidden):
- Deployment is handled by .github/workflows/deploy-pages.yml.
- Required GitHub secret: MAPBOX_PUBLIC_TOKEN.
- Never use Mapbox secret (sk.) tokens in client code.
-->
