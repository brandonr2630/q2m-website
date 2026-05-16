# Q2M Website Handoff

---

## Session 3 — Repo Hygiene

**Date:** 2026-05-16
**Commit:** `854c3ba`

### What Changed

Cleaned up the GitHub repository to use it more efficiently.

### Changes Made

| File | Change |
|------|--------|
| `.github/workflows/deploy.yml` | `CPANEL_HOST` and `CPANEL_USER` moved from hardcoded values to GitHub Secrets |
| `.gitignore` | Added `.DS_Store`, `Thumbs.db`, `Desktop.ini`, editor config files |
| `README.md` | Created — covers live URL, file structure, deploy process, secrets, and how to add projects/listings |

### GitHub Secrets Added

Two new secrets added to `brandonr2630/q2m-website` → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `CPANEL_HOST` | `https://chi203.greengeeks.net:2083` |
| `CPANEL_USER` | `terranre` |

### Outstanding

- `Q2M_Logo.png`, `Q2M_Logo.svg`, `Q2M_Logo.webp` are showing as deleted in git — they were moved to `assets/branding/` but the move was never committed. Commit this cleanup separately when ready.
- Branch protection on `master` not yet configured — set via GitHub → Settings → Branches → Add rule.

---

## Session 2 — Projects Page Scaffold

**Date:** 2026-05-16

### What Changed

Scaffolded a Projects page to showcase completed engineering work. No deployment yet — files are local only.

### Files Created

| File | Purpose |
|------|---------|
| `projects.html` | Projects listing page — matches site design (nav, footer, noise texture, reveal animations) |
| `projects.json` | Data index — one entry per project, fetched client-side |
| `assets/projects/project-1/` | Image folder for project 1 |
| `assets/projects/project-2/` | Image folder for project 2 |
| `assets/projects/project-3/` | Image folder for project 3 |

### Design Decisions

- **Page name:** "Projects" (not "Case Studies") — more natural for an engineering/trades audience
- **Format:** Annotated photos rather than long narratives. Each project card shows a cover image, category badge, sector, year, and a one-line summary. Clicking opens a lightbox with image cycling and caption.
- **Filter bar:** All / Conveyor & Bulk / Concrete Plants / Fabrication / Motors & Pumps
- **Data structure** (`projects.json`): each entry has `id`, `title`, `client`, `sector`, `category`, `year`, `summary`, `cover`, `images[]`
- **CTA section** at bottom links to contact form and Equipment Depot

### projects.json Entry Format

```json
{
  "id": "your-project-id",
  "title": "Project Title",
  "client": "Confidential",
  "sector": "Quarrying",
  "category": "conveyor",
  "year": 2024,
  "summary": "One-line description of what was built and delivered.",
  "cover": "assets/projects/your-project-id/cover.jpg",
  "images": [
    "assets/projects/your-project-id/cover.jpg",
    "assets/projects/your-project-id/img2.jpg"
  ]
}
```

Valid `category` values: `conveyor`, `concrete`, `fabrication`, `motors-pumps`, `structural`, `machine-shop`

### Server Cleanup Required

`assets/case-studies/` exists on the server (created during Session 1) but is superseded by `assets/projects/`. It is empty. Delete it via cPanel File Manager after next deploy.

### Before Deploying

1. Drop real photos into `assets/projects/project-1/` (and 2, 3)
2. Update `projects.json` with real project data and correct image paths
3. Add "Projects" nav link to `index.html` and `depot.html`
4. Delete `assets/projects/project-*/placeholder.txt` files

### Current State

- ⏳ `projects.html` — local only, not deployed
- ⏳ `projects.json` — placeholder data only
- ⏳ `assets/projects/` — folders exist locally, images not yet added

---

## Session 1 — Deploy Pipeline Fix — Binary Asset Upload

**Date:** 2026-05-16
**Commits:** `587fecd`, `e85bb0b`, `fcc02bc`, `b113eb4`

### What Changed

Fixed a broken deploy pipeline that was silently failing to upload binary files (images, logos) to the live server. All assets are now live at https://www.q2m.io.

### Root Cause

The previous deploy workflow used `Fileman/save_file_content` for all files. This API is text-only — it URL-encodes content via `--data-urlencode "content@file"`, which corrupts binary data. The API returned HTTP 200 with `"status": 0` and error:

> `"Failed to read vaild Cpanel::AdminBin::Serializer data in json connect mode"`

Additionally, the `assets/` subdirectories (`assets/branding/`, `assets/images/`, `assets/products/`) were never created on the server, so even SVG uploads (text) failed with `"The file "" does not exist for the account."`.

### Fix Applied

Updated [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) with three changes:

**1. Hybrid upload strategy (binary vs text)**
- **Binary files** (detected via `file --mime ... | grep "charset=binary"`): delete existing on server first, then upload via `Fileman/upload_files` (multipart form data — handles binary correctly)
- **Text files** (HTML, CSS, JS, JSON, SVG, etc.): `Fileman/save_file_content` as before (supports overwrite natively)

**2. Directory creation before upload**
Iterates through each path component of every file's subdirectory and calls `Fileman/mkdir` before starting uploads. Errors are ignored (already-exists is fine).

**3. `workflow_dispatch` trigger**
Added manual trigger so a full redeploy (`git ls-files`) can be kicked off from the GitHub Actions UI without needing a code change.

### Deploy Workflow Behaviour

| Trigger | Files uploaded |
|---------|---------------|
| Push to `master` | Only files changed in the push (`git diff --name-only --diff-filter=ACM`) |
| Manual `workflow_dispatch` | All tracked files (`git ls-files`) |

Always excluded from deploy: `.github/`, `.cpanel.yml`, `handoff.md`

### State After Session 1

- ✅ Live site: https://www.q2m.io — logos and gallery images confirmed working
- ✅ Equipment depot images at https://www.q2m.io/depot.html confirmed working
- ✅ Deploy pipeline: incremental push deploys and full manual redeployments both pass
- ✅ `assets/branding/`, `assets/images/`, `assets/products/` directories exist on server

---

## References

- **Repository:** https://github.com/brandonr2630/q2m-website
- **Live Site:** https://www.q2m.io
- **Deploy workflow:** `.github/workflows/deploy.yml`
- **Deployment:** cPanel Fileman API → GreenGeeks (`chi203.greengeeks.net`)

---

**Last Updated:** 2026-05-16 (Session 3)
