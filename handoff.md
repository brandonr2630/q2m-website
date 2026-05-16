# Q2M Website Handoff

**Date:** 2026-05-16
**Session:** Deploy Pipeline Fix — Binary Asset Upload
**Commits:** `587fecd`, `e85bb0b`, `fcc02bc`, `b113eb4`

---

## What Changed

Fixed a broken deploy pipeline that was silently failing to upload binary files (images, logos) to the live server. All assets are now live at https://www.q2m.io.

---

## Root Cause

The previous deploy workflow used `Fileman/save_file_content` for all files. This API is text-only — it URL-encodes content via `--data-urlencode "content@file"`, which corrupts binary data. The API returned HTTP 200 with `"status": 0` and error:

> `"Failed to read vaild Cpanel::AdminBin::Serializer data in json connect mode"`

Additionally, the `assets/` subdirectories (`assets/branding/`, `assets/images/`, `assets/products/`) were never created on the server, so even SVG uploads (text) failed with `"The file "" does not exist for the account."`.

---

## Fix Applied

Updated [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) with three changes:

### 1. Hybrid upload strategy (binary vs text)
- **Binary files** (detected via `file --mime ... | grep "charset=binary"`): delete existing on server first, then upload via `Fileman/upload_files` (multipart form data — handles binary correctly)
- **Text files** (HTML, CSS, JS, JSON, SVG, etc.): `Fileman/save_file_content` as before (supports overwrite natively)

### 2. Directory creation before upload
Iterates through each path component of every file's subdirectory and calls `Fileman/mkdir` before starting uploads. Errors are ignored (already-exists is fine).

### 3. `workflow_dispatch` trigger
Added manual trigger so a full redeploy (`git ls-files`) can be kicked off from the GitHub Actions UI without needing a code change.

---

## Deploy Workflow Behaviour

| Trigger | Files uploaded |
|---------|---------------|
| Push to `master` | Only files changed in the push (`git diff --name-only --diff-filter=ACM`) |
| Manual `workflow_dispatch` | All tracked files (`git ls-files`) |

Always excluded from deploy: `.github/`, `.cpanel.yml`, `handoff.md`

---

## Current State

- ✅ Live site: https://www.q2m.io — logos and gallery images confirmed working
- ✅ Equipment depot images at https://www.q2m.io/depot.html confirmed working
- ✅ Deploy pipeline: incremental push deploys and full manual redeployments both pass
- ✅ `assets/branding/`, `assets/images/`, `assets/products/` directories exist on server

---

## Directory Structure (as deployed)

```
Q2M WEBSITE/
├── assets/
│   ├── images/           # Homepage gallery slides (photo1-20 + webp)
│   ├── products/         # Equipment depot images
│   ├── branding/         # Logo files (Q2M_Logo.svg/png/webp + dated variants)
│   └── case-studies/     # Ready for content (empty)
├── archives/             # Old/legacy content
├── depot/                # Equipment depot subfolder
├── index.html
├── depot.html
├── listings.json
├── .htaccess
└── .github/workflows/deploy.yml
```

---

## Next Steps

1. **Add Case Studies** — `assets/case-studies/` folder is ready. Each project goes in its own subfolder with images and a `metadata.json` (see previous handoff for template).
2. **Build Case Studies page** — `case-studies.html` or a new section in `index.html`.

---

## References

- **Repository:** https://github.com/brandonr2630/q2m-website
- **Live Site:** https://www.q2m.io
- **Deploy workflow:** `.github/workflows/deploy.yml`
- **Deployment:** cPanel Fileman API → GreenGeeks (`chi203.greengeeks.net`)

---

**Last Updated:** 2026-05-16
**Status:** ✅ Complete & Deployed
