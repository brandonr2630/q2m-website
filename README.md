# Q2M Website

Marketing, equipment depot and projects site for Q2 Machines Ltd (Trinidad & Tobago). Static HTML/CSS/JS, no bundler. Available in English, Spanish, Portuguese, Dutch and French.

**Live:** https://www.q2m.io (non-www and http redirect to it)

## Structure

| Path | Purpose |
|------|---------|
| `index.html` | Homepage (source page) |
| `depot.html` | Equipment depot page (source page); loads `listings.json` |
| `projects.html` | Projects showcase: carousel, lightbox (source page) |
| `listings.json` | Depot equipment data. Listings have no prices (prices are on request) |
| `projects.json` | Projects data |
| `sitemap.xml`, `robots.txt`, `llms.txt` | SEO, crawler and AI-crawler files |
| `404.html` | Not-found page |
| `googlee18c12f89a30fbd3.html` | Google Search Console verification file |
| `.htaccess`, `htaccess` | Apache server config (both are tracked) |
| `es/` `pt/` `nl/` `fr/` | **Generated** language pages (index, depot, projects). Never hand-edit |
| `assets/` | Branding, product and project images |
| `DEPOT/`, `ARCHIVES/` | Depot photos and old versions; reference only |
| `scripts/build-lang-pages.js` | Generates `index.html` in each language directory |
| `scripts/build-depot-langs.js` | Generates `depot.html` in each language directory |
| `scripts/build-projects-langs.js` | Generates `projects.html` in each language directory |
| `scripts/upscale-images.js` | sharp utility: upscales JPG/PNG and converts to WebP |
| `handoff.md`, `CLAUDE.md` | Working notes for developers and Claude Code (not deployed) |

## Language pages are generated

`es/ pt/ nl/ fr/` are generated from `index.html`, `depot.html` and `projects.html`. After changing a source page or `listings.json`, regenerate and commit the generated pages in the same commit as the source change:

```bash
cd scripts
npm install          # first time only (cheerio, sharp)
npm run build-all    # runs the three build-*.js scripts
```

Source files use CRLF line endings. Keep them when editing or scripting changes, or the diff becomes the whole file.

## Deploy

`master` is protected: open a PR and merge it. A push or merge to `master` triggers the workflow in `.github/workflows/deploy.yml`, which calls the reusable workflow `deploy.yml@master` in the brandonr2630/projects repo. That workflow uploads the changed files over SSH with rsync to /home/terranre/public_html/q2m.io on GreenGeeks. It takes about 15 seconds.

- **Manual full redeploy:** Actions -> Deploy to cPanel -> Run workflow.
- **GitHub secrets read by the shared workflow** (passed via `secrets: inherit`): `SSH_PRIVATE_KEY`, `SSH_HOST`, `SSH_PORT` (defaults to 22 if unset), `CPANEL_USER` (used as the SSH user).
- **Not deployed:** the `scripts/` directory, server.js, convert-webp.js, any implementation-guide.html under `assets/projects/` (the `exclude_extra` pattern in the repo workflow), plus `.github/`, .cpanel.yml, `handoff.md` and `CLAUDE.md` (built into the shared workflow).

## Adding a project

1. Put images in assets/projects/your-project-id/webp/. Existing folders are named webp in project-1 and WebP in project-2; paths are case-sensitive on the server, so match whatever your `projects.json` entry says.
2. Optional: upscale and convert originals to WebP with `cd scripts && node upscale-images.js ../assets/projects/your-project-id`. Output files are named like photo-upscaled.webp next to the originals. The script does not add a watermark.
3. Add an entry to `projects.json` (format below).
4. Run `npm run build-all` in `scripts/` and commit the generated pages with your change.
5. Open a PR to `master`.

```json
{
  "id": "your-project-id",
  "title": "Project Title",
  "client": "Confidential",
  "sector": "Quarrying",
  "category": "conveyor",
  "year": 2024,
  "summary": "English summary.",
  "summary_es": "Spanish summary.",
  "summary_pt": "Portuguese summary.",
  "summary_nl": "Dutch summary.",
  "summary_fr": "French summary.",
  "cover": "assets/projects/your-project-id/webp/cover.webp",
  "images": ["assets/projects/your-project-id/webp/01-photo.webp"]
}
```

Existing entries also carry `title_*` translations, `location` and `tags`; copy a current entry for the full shape. Categories in use: `conveyor`, `concrete`, `fabrication`, `motors-pumps`, `structural`, `machine-shop`.

## Updating depot listings

Edit `listings.json` (English plus `title_*` / `description_*` translations; no price fields, prices are on request), run `npm run build-all` in `scripts/`, and commit source and generated pages together via a PR.

## Repository

https://github.com/brandonr2630/q2m-website
