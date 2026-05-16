# Q2M Website

Marketing and equipment depot site for Q2 Machines Ltd.

**Live:** https://www.q2m.io

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Homepage |
| `depot.html` | Equipment depot listings |
| `projects.html` | Completed projects showcase (not yet deployed) |
| `listings.json` | Equipment depot data — edit this to update listings |
| `projects.json` | Projects data — edit this to add/update projects |
| `assets/` | Images, branding, product photos |

## Deploy

Every push to `master` auto-deploys via GitHub Actions → cPanel Fileman API (GreenGeeks).

- **Incremental push:** only files changed in the push are uploaded
- **Full redeploy:** trigger manually via Actions → Deploy to cPanel → Run workflow

Binary files (images) use `Fileman/upload_files` (multipart). Text files use `Fileman/save_file_content`.

### Required GitHub Secrets

| Secret | Value |
|--------|-------|
| `CPANEL_API_TOKEN` | cPanel API token |
| `CPANEL_HOST` | `https://chi203.greengeeks.net:2083` |
| `CPANEL_USER` | `terranre` |

## Adding Projects

1. Create `assets/projects/<project-id>/` and drop in photos
2. Add an entry to `projects.json` — see format below
3. Push to `master`

```json
{
  "id": "your-project-id",
  "title": "Project Title",
  "client": "Confidential",
  "sector": "Quarrying",
  "category": "conveyor",
  "year": 2024,
  "summary": "One-line description.",
  "cover": "assets/projects/your-project-id/cover.jpg",
  "images": ["assets/projects/your-project-id/cover.jpg"]
}
```

Valid categories: `conveyor`, `concrete`, `fabrication`, `motors-pumps`, `structural`, `machine-shop`

## Adding Equipment Listings

Edit `listings.json` directly and push to `master`.

## Repository

https://github.com/brandonr2630/q2m-website
