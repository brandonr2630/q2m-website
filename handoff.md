# Q2M Website Handoff

**Date:** 2026-05-16  
**Session:** Structure Standardization & Case Studies Preparation  
**Commit:** `6d798af` — Standardized directory structure to lowercase with hyphens, reorganized assets

---

## What Changed

The Q2M Website directory structure has been **completely reorganized** to:
1. Use **lowercase names with hyphens** (CLI-friendly, modern convention)
2. **Centralize all assets** under `assets/` with semantic subdirectories
3. **Prepare for case studies** with dedicated `assets/case-studies/` folder
4. **Update all file references** in HTML and JSON files to point to new paths

---

## New Directory Structure

```
Q2M WEBSITE/
├── assets/
│   ├── images/           # Homepage gallery slides (photo1-20 + webp)
│   ├── products/         # Equipment depot images (formerly depot-photos/)
│   ├── branding/         # Logo files (formerly BRAND/)
│   └── case-studies/     # Case study projects (ready for content)
│       ├── project-1/    # Example structure (to be created)
│       │   ├── images/
│       │   └── metadata.json
│       └── project-2/
├── archives/             # Old/legacy content (formerly ARCHIVES)
├── depot/                # Equipment depot folder (formerly DEPOT)
├── index.html            # Homepage
├── depot.html            # Equipment depot page
├── listings.json         # Main listings file
├── .htaccess
├── .github/              # GitHub Actions workflows
└── [other static files]
```

---

## Files Updated

All references to images have been updated across:

### HTML Files
- **index.html** — Updated 22 photo references (slides, preload), 3 logo references
- **depot.html** — Updated 1 logo reference

### JSON Files
- **listings.json** (root) — Updated 7 product image paths
- **depot/listings.json** — Updated 7 product image paths

### Path Changes Summary
| Old Path | New Path |
|----------|----------|
| `photo1.webp` | `assets/images/photo1.webp` |
| `photo1.jpg` | `assets/images/photo1.jpg` |
| `Q2M_Logo.svg` | `assets/branding/Q2M_Logo.svg` |
| `/depot-photos/[image].jpg` | `/assets/products/[image].jpg` |

---

## For Case Studies

The `assets/case-studies/` folder is **ready for your first project**. Structure for each case study:

```
assets/case-studies/
└── project-name/
    ├── images/
    │   ├── before.jpg
    │   ├── after.jpg
    │   └── [other project photos]
    └── metadata.json
```

### Metadata Template (`metadata.json`)
```json
{
  "id": 1,
  "title": "Project Name",
  "customer": "Customer Name",
  "equipment": "Equipment Type",
  "challenge": "Brief description of the challenge",
  "results": {
    "metric1": "value",
    "metric2": "value"
  },
  "year": 2026,
  "images": [
    {"src": "images/before.jpg", "caption": "Before"},
    {"src": "images/after.jpg", "caption": "After"}
  ]
}
```

---

## Deployment Status

✅ **GitHub:** Pushed to `brandonr2630/q2m-website` on `master` branch  
✅ **Server:** Auto-deployed to `q2m.io` via cPanel Git Version Control API  
✅ **Live:** Changes are now live at https://www.q2m.io

---

## Next Steps

1. **Add Case Studies**
   - Create folders in `assets/case-studies/`
   - Upload project images
   - Create `metadata.json` files with project details

2. **Build Case Studies Page** (optional)
   - Create `case-studies.html` or add section to `index.html`
   - Fetch and render from `case-studies.json` (can aggregate all metadata)

3. **Update case-studies.json** (optional)
   - Create at root level if building a case studies page
   - Aggregate all project metadata for easy rendering

---

## Directory Naming Conventions

Going forward, use these conventions for consistency:

| Type | Convention | Example |
|------|-----------|---------|
| **Folders** | lowercase with hyphens | `case-studies`, `assets`, `product-images` |
| **Files** | lowercase with hyphens or descriptive names | `photo1.jpg`, `my-case-study.json` |
| **Acronyms** | Preserve as-is in filenames | `Q2M_Logo.svg`, `OG_Banner.jpg` |

---

## References

- **Repository:** https://github.com/brandonr2630/q2m-website
- **Live Site:** https://www.q2m.io
- **Commit Details:** `git show 6d798af`
- **Deployment:** cPanel Git Version Control API → GreenGeeks

---

## Notes for Future Work

- The old `BRAND/`, `DEPOT/` folders still exist but are now empty; safe to delete if desired
- `ARCHIVES/` preserved in case historical content needs to stay accessible
- All asset paths are absolute (`/assets/...`) to work across subdirectories
- Service worker cache name in `q2-machines-job-cards/` unaffected

---

**Last Updated:** 2026-05-16  
**Status:** ✅ Complete & Deployed
