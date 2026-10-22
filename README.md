# Minute Cryptic Answer Today

Static Astro site with the daily Minute Cryptic clue, five progressive hints, the answer and an explanation.

## How it updates itself

1. `.github/workflows/daily-puzzle.yml` runs just after midnight Eastern (plus a morning retry).
2. It runs `scripts/fetch-puzzle.mjs`, which reads today's puzzle from minutecryptic.com's public JSON
   (`/api/daily_puzzle/today?tz=America/New_York`) and saves it to `src/data/puzzles/YYYY-MM-DD.json`.
3. If the file is new it's committed and pushed, which triggers a rebuild on the host.
4. Pages are generated from those JSON files: the homepage, `/answer/YYYY-MM-DD/`, and `/archive/`.
   A puzzle is never published before its date starts in US Eastern time.

If a fetch fails, the workflow fails and GitHub emails you. To add a day by hand, save the API response
to a file and run `node scripts/fetch-puzzle.mjs --from that-file.json`.

## Deploy (Cloudflare Pages)

- Connect this repo in Cloudflare Pages. Build command `npm run build`, output directory `dist`.
- Add the custom domain. If it isn't `minutecrypticanswertoday.com`, update `site` in `astro.config.mjs` and
  `public/robots.txt`.
- Optional: create a Deploy Hook in Cloudflare Pages and save it as the `DEPLOY_HOOK_URL` repository secret.

## Local

```
npm install
npm run dev
npm run fetch   # pull today's puzzle
```
