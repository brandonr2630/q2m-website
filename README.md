# Q2M Website

Marketing and equipment depot site for Q2 Machines Ltd.

**Live:** https://www.q2m.io

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Homepage |
| `depot.html` | Equipment depot listings |
| `projects.html` | Completed projects showcase — image carousel, i18n, lightbox |
| `listings.json` | Equipment depot data — edit this to update listings |
| `projects.json` | Projects data — edit this to add/update projects |
| `assets/` | Images, branding, product photos |
| `scripts/upscale-images.js` | Sharp utility — watermarks WebP images with Q2M logo |

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

1. Create `assets/projects/<project-id>/webp/` and add watermarked WebP images
2. To watermark: drop originals into the folder, run `cd scripts && node upscale-images.js ../assets/projects/<project-id>`
3. Add an entry to `projects.json` — see format below
4. Push to `master`

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

Valid categories: `conveyor`, `concrete`, `fabrication`, `motors-pumps`, `structural`, `machine-shop`

## Adding Equipment Listings

Edit `listings.json` directly and push to `master`.

## AI Feature Ideas

Reference implementations from [Shubhamsaboo/awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps) that map to plausible next features for the site:

| Idea | Reference example |
|------|--------------------|
| Chat widget answering equipment/depot questions from `listings.json` | [`advanced_llm_apps/thinkpath_chatbot_app`](https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/advanced_llm_apps/thinkpath_chatbot_app) |
| Natural-language search across `listings.json` / `projects.json` | [`rag_tutorials/ai_blog_search`](https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/rag_tutorials/ai_blog_search) |
| Auto-generate alt text / summaries for depot and project photos | [`starter_ai_agents/multimodal_ai_agent`](https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/starter_ai_agents/multimodal_ai_agent) |

These are starting points, not dependencies — evaluate before adding to the site.

## Repository

https://github.com/brandonr2630/q2m-website
