# Q2M Website Handoff

---

## Session 6 — GitHub Infrastructure

**Date:** 2026-05-16
**Commits:** `9677483` (q2m-website), `3a2dd8e` (projects)

### What Changed

Centralised the deploy logic, enabled auto-merge, and wired up a cross-repo Projects board.

### Changes Made

| Change | Detail |
|--------|--------|
| Reusable deploy workflow | 130-line inline script replaced by 14-line call to `brandonr2630/projects/.github/workflows/deploy.yml@master` |
| Auto-merge enabled | All 5 repos — PRs merge as soon as they're opened (no required status checks blocking) |
| GitHub Projects board | [github.com/users/brandonr2630/projects/1](https://github.com/users/brandonr2630/projects/1) — all 5 repos linked |
| `projects` repo made public | Required for reusable workflow to be callable from the 5 public project repos |

### Outstanding

- ⏳ Projects page (`projects.html`, `projects.json`, `assets/projects/`) — local only, needs real photos before deploying

---

## Session 5 — Security, Cleanup & Docs

**Date:** 2026-05-16
**Commits:** `788f006` (q2m-website); cross-repo work below

### What Changed

Cleared all actionable items from the Session 4 audit. Rotated credentials, fixed remaining deploy workflows, cleaned dead files, added branch protection, renamed project folders.

### Changes Made — This Repo

| Change | Commit |
|--------|--------|
| Removed one-time `assets/case-studies/` cleanup step from `deploy.yml` | `788f006` |

### Cross-Repo Work

| Repo | Change |
|------|--------|
| `coc-website`, `meridian-erp` | Deploy workflow: hybrid binary upload, directory creation, `workflow_dispatch` |
| `coc-website`, `meridian-erp`, `q2-machines-job-cards` | Removed dead `.cpanel.yml` |
| `coc-website`, `meridian-erp` | `HOST` and `CPANEL_USER` moved from hardcoded to GitHub Secrets |
| `meridian-erp`, `coc-website` | README corrected (live URL, deploy section) |
| `q2-machines-job-cards` | Word doc (`Q2_JobCard_ProjectContext.docx`) removed from git; `*.docx` added to `.gitignore` |
| All 5 repos | Branch protection ruleset on `master` — requires PR, blocks force pushes, restricts deletions |
| All repos | Project folders renamed to kebab-case to match GitHub repo names |
| All repos | `CPANEL_API_TOKEN` rotated; token file deleted from disk |
| `meridian-erp` | `handoff.md` created |
| `projects` | `LLM` repo deleted; `my-web-pages` folder removed |

### Outstanding

- ⏳ Projects page (`projects.html`, `projects.json`, `assets/projects/`) — local only, needs real photos before deploying

---

## Session 4 — Outstanding Cleanup & Cross-Repo Audit

**Date:** 2026-05-16
**Commits:** `cd64c0b`, `8d6a8cc`, `8eac062`, `24e971c`

### What Changed

Resolved both outstanding items from Session 3. Conducted a full audit of all five Terran Resources repositories.

### Changes Made

| File | Change |
|------|--------|
| `Q2M_Logo.png/svg/webp` | Removed from repo root — canonical copies already in `assets/branding/` (`cd64c0b`) |
| `.github/workflows/deploy.yml` | Added "Remove stale server directories" step to delete `assets/case-studies/` on next deploy (`8eac062`) |

### Cross-Repo Work (same session)

All other repos brought up to the same standard:

| Repo | Changes |
|------|---------|
| `q2-machines-job-cards` | Deploy workflow overhauled — binary upload, secrets, `workflow_dispatch`, subdirectory creation |
| `q2-machines-job-cards` | `.gitignore` created |
| `meridian-erp` | `.gitignore` and `README.md` created |
| `coc-website` | `.gitignore` expanded; `README.md` created |
| `terran-resources-website` | `.gitignore` and `README.md` created |

### Audit Findings — Outstanding Items

Items from the cross-repo audit that apply to this repo:

- ✅ `assets/case-studies/` deletion step removed (`788f006`, Session 5)
- ✅ Branch protection on `master` configured — all 5 repos (Session 5)
- ⏳ Projects page still local only — needs real photos before deploying
- ✅ COC Website and Meridian ERP deploy workflows updated (Session 5)
- ✅ `.cpanel.yml` files removed from all repos (Session 5)

### Phone Management Strategy

All repos are being prepared for remote management from GitHub Mobile:
- `workflow_dispatch` on all workflows = manual redeploy from phone
- Branch protection + PRs = code review from phone
- `github.dev` (press `.` on any repo page in mobile browser) = file editing without a laptop

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

- ✅ Root-level logo files removed from git (`cd64c0b`) — canonical copies live in `assets/branding/`
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

### Server Cleanup

`assets/case-studies/` on the server will be deleted automatically on next deploy — a "Remove stale server directories" step was added to `deploy.yml` (`8eac062`). No manual cPanel action needed.

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

**Last Updated:** 2026-05-16 (Session 6)
