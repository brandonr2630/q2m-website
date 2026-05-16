# CLAUDE.md — Q2 Machines Website

Live URL: `q2m.io` · Repo: `brandonr2630/q2m-website`

## Architecture

Static HTML/CSS/JS site. No build system or bundler — files are deployed as-is.

- **`index.html`** — main landing page
- **`depot.html`** — equipment depot listings page
- **`projects.html`** — projects showcase page
- **`listings.json`** — equipment data consumed by `depot.html`
- **`assets/`** — branding and images
- **`archives/`** — old versions; never edit, never deploy

## Deployment

Push to `master` auto-deploys via GitHub Actions → cPanel Fileman API (GreenGeeks). Deploy dir: `/home/terranre/public_html/q2m.io`. Manual redeploy: Actions → Deploy to cPanel → Run workflow.

## Session context

See `handoff.md` for the running log of completed work and known issues.
