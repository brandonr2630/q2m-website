# Q2M Website Handoff

---

## Session 15 — SEO Visibility Push (continued)

**Date:** 2026-05-20
**PRs:** [#38](https://github.com/brandonr2630/q2m-website/pull/38), [#39](https://github.com/brandonr2630/q2m-website/pull/39), [#40](https://github.com/brandonr2630/q2m-website/pull/40), [#41](https://github.com/brandonr2630/q2m-website/pull/41), [#42](https://github.com/brandonr2630/q2m-website/pull/42) — all open, pending merge

### Goal

Complete the multilingual SEO buildout started in Session 14: add nl/fr depot pages, fix all cross-language navigation, add geo-targeted indexable copy to every page, and ensure `areaServed` schema signals are consistent across the full site.

### What Changed

| Item | Detail |
|------|--------|
| **nl/depot.html + fr/depot.html** | New pre-rendered Dutch and French equipment depot pages. Full translated UI, canonical, hreflang, og/twitter meta, translated JSON-LD product schema (all 7 listings). (#38) |
| **listings.json — nl/fr translations** | Added `title_nl`, `description_nl`, `title_fr`, `description_fr` to all 7 items. Product schema on nl/fr depot pages is now fully translated. (#38) |
| **depot.html hreflang** | Added nl and fr alternates to the English depot page hreflang block. Was previously only en/es/pt-BR/x-default. (#38) |
| **depot_intro paragraph** | Added `<p class="listings-intro reveal" data-i18n="depot_intro">` above the filter bar in depot.html — static, Googlebot-visible keyword copy naming the Caribbean, Venezuela, Colombia, Guyana and South America. Translation in all 5 languages (en/es/pt/nl/fr). (#38) |
| **Nav link fix — all language pages** | All language pages (es/pt/nl/fr × index/depot/projects) were sending "Depot" and "Projects" nav clicks back to `/depot.html` and `/projects.html` (English). All three build scripts now patch `a[href="/depot.html"]` → `/{lang}/depot.html` and `a[href="/projects.html"]` → `/{lang}/projects.html`. (#38, #39) |
| **build-projects-langs.js** | New build script at `scripts/build-projects-langs.js`. Generates es/pt/nl/fr versions of projects.html with correct canonical, hreflang, og locale, translated UI, nav link patching, and a WebPage JSON-LD node with `inLanguage`. (#39) |
| **scripts/package.json** | Added `build-projects-langs` script; updated `build-all` to run all three build scripts. (#39) |
| **proj_intro paragraph** | Added `<p class="proj-intro reveal" data-i18n="proj_intro">` above the projects filter bar — static copy naming Trinidad, Guyana and the Caribbean with project type keywords (conveyor systems, concrete batching plants, structural fabrication, motors and pumps). Translation in all 5 languages. (#40) |
| **about_body — all 5 languages** | Extended from "serve clients across the Caribbean" to name Venezuela, Colombia, Guyana and South America explicitly. Updated in both the static HTML and the JS translation objects. (#41) |
| **about_pt5 — all 5 languages** | Replaced vague "Caribbean and Latin America" with specific country list: Caribbean, Venezuela, Colombia, Guyana, Suriname and South America. All 5 languages. (#41) |
| **depot.html schema — areaServed** | Added `Organization` node to the `@graph` with full `areaServed` array (11 countries/regions matching index.html). Updated `ItemList` description to name specific countries. (#42) |
| **projects.html schema — areaServed** | Added `@id` and `areaServed` array to the `publisher` Organization node. Updated `CollectionPage` description to name target countries. (#42) |
| **sitemap.xml** | Added `nl/depot.html` and `fr/depot.html` entries (priority 0.6). Bumped all `lastmod` to 2026-05-20. (#38, #41) |
| **Google Search Console walkthrough** | Documented DNS TXT verification steps and sitemap submission process for the user. |

### Build Commands (updated)

```bash
cd scripts

# Regenerate language homepages (run after index.html changes)
node build-lang-pages.js

# Regenerate language depot pages — es/pt/nl/fr (run after depot.html or listings.json changes)
node build-depot-langs.js

# Regenerate language projects pages — es/pt/nl/fr (run after projects.html changes)
node build-projects-langs.js

# All three at once
npm run build-all
```

### Key Lesson

**Cross-page nav hrefs in language subdirectory pages must be patched in the build script.** When a language page is in `/es/`, a nav link `href="/depot.html"` correctly navigates to the root English page — not the Spanish one. All three build scripts now include:
```js
$('a[href="/depot.html"]').attr('href', `/${lang.code}/depot.html`);
$('a[href="/projects.html"]').attr('href', `/${lang.code}/projects.html`);
```
This must be repeated in any future build script that generates pages in a language subdirectory.

### Outstanding

- [ ] Merge and deploy PRs #38–#42
- [ ] **Google Search Console** — add `q2m.io` as a Domain property, verify via DNS TXT record in GreenGeeks Zone Editor, submit `sitemap.xml`, request indexing for `/`, `/depot.html`, `/projects.html`, `/es/`, `/pt/`
- [ ] **Google Business Profile** — create a profile for Q² Machines (improves visibility in Maps and regional search)
- [ ] Filter categories (Fabrication, Motors & Pumps, Structural, Machine Shop) return empty — hide or add projects
- [ ] Project 3 — no images or data yet
- [ ] nl/fr translations should be verified by native speakers before relying on them for market trust
- [ ] Backlinks — reach out to regional trade directories, industry association listings (Caribbean Manufacturers Association, etc.)

---

## Session 14 — LatAm & Caribbean Visibility Push

**Date:** 2026-05-19

### Goal

Improve Q2M website visibility across South America, the Caribbean, and Latin America.

### What Changed

| Item | Detail |
|------|--------|
| **Canonical bug fixed — all 4 language homepages** | `es/`, `pt/`, `nl/`, `fr/` index.html each had a wrong canonical (`href="https://www.q2m.io/"`) in `<head>`, plus duplicate appended canonicals at the bottom. Google was treating all language pages as duplicates of English and not indexing them. Fixed by updating `build-lang-pages.js` to replace the existing canonical (`.attr('href', ...)`) instead of appending a second one. Regenerated all 4 pages. |
| **Duplicate canonical removed from index.html** | A stale `<link rel="canonical" href="https://www.q2m.io/" />` existed outside `</head>` at line 1444. Removed. |
| **ES & PT titles/descriptions — LatAm targeting** | ES: "Q² Machines — Ingeniería Industrial \| Caribe y Suramérica" + description mentioning Venezuela, Colombia, Suramérica. PT: "Engenharia Industrial \| Caribe e América do Sul" + description mentioning Venezuela, Guiana, América do Sul. Updated in `build-lang-pages.js` LANGS config and regenerated. |
| **Schema `areaServed` — explicit country list** | Replaced `GeoCircle` (800km radius) with an array of explicit `Country`/`AdministrativeArea` nodes: TT, GY, SR, VE, CO, BR, JM, BB, DO, Caribbean, Latin America. Applied to `index.html`; all language pages pick it up via build script. |
| **index.html meta description** | Added "South America and Latin America" to the English meta description. |
| **Sitemap — language pages added** | Added `es/`, `pt/` (priority 0.9), `nl/`, `fr/` (priority 0.7) homepage URLs — all were missing. Added `es/depot.html` and `pt/depot.html` (priority 0.7). |
| **depot.html — title & description** | Title: "Industrial Equipment for Sale — Caribbean & South America \| Q² Machines". Description explicitly mentions Caribbean, South America, Latin America. |
| **depot.html — OG/Twitter card** | Added `og:image:width/height/alt` and full Twitter card meta (was missing). |
| **depot.html — favicon paths fixed** | `favicon32x32.png` → `favicon-32x32.png`, etc. (was causing 404s on every load). |
| **depot.html — non-blocking fonts** | Replaced blocking `<link rel="stylesheet">` for Google Fonts with `media="print"` non-blocking pattern + `<noscript>` fallback. |
| **depot.html — hreflang** | Added `en`, `es`, `pt-BR`, and `x-default` alternates. |
| **depot.html — ItemList/Product schema** | Added `@type: ItemList` JSON-LD with 7 `Product` nodes from `listings.json`. Enables Google rich results for individual equipment items. |
| **es/depot.html + pt/depot.html** | New pre-rendered Spanish and Portuguese equipment depot pages. Spanish buyers searching "equipos industriales venta Caribe" or "trituradora de mandíbula Trinidad" will now find an indexed Spanish page. PT equivalent for Brazil. |
| **404.html — noindex** | Added `<meta name="robots" content="noindex, follow">`. |
| **build-depot-langs.js** | New build script at `scripts/build-depot-langs.js`. Run with `cd scripts && node build-depot-langs.js`. Added to `package.json` as `build-depot-langs`; `build-all` runs both scripts. |

### Key Lesson

**`$('head').append(canonical)` does not replace an existing canonical — it adds a second one.** When there are multiple canonical tags, Google uses the first. The build script was appending a correct language-specific canonical *after* the English one already in `<head>`, so Google always saw the English URL as canonical and never indexed the language pages. Fix: use `$('link[rel="canonical"]').attr('href', url)` to replace in-place.

### Build Commands

```bash
cd scripts

# Regenerate all language homepages (run after index.html changes)
node build-lang-pages.js

# Regenerate Spanish + Portuguese depot pages (run after depot.html changes)
node build-depot-langs.js

# Both at once
npm run build-all
```

### Outstanding

- [ ] es/depot.html nav Depot link still points to `/depot.html` (English) — consider updating to `/es/depot.html`
- [ ] Product schema descriptions in es/depot.html are English — translate for richer Spanish indexation
- [ ] nl/depot.html and fr/depot.html not yet created (Suriname / French Antilles markets)
- [ ] Add more projects to projects.html (content depth)
- [ ] Filter categories (Fabrication, Motors & Pumps, Structural, Machine Shop) return empty — hide or add stubs
- [ ] Translations for nl/fr should be verified by native speakers

---

## Session 13 — Projects Page Redesign, Content & Full SEO Pass

**Date:** 2026-05-19
**PRs:** [#21](https://github.com/brandonr2630/q2m-website/pull/21) → [#33](https://github.com/brandonr2630/q2m-website/pull/33) — all merged & deployed

### What Changed

Complete overhaul of `projects.html`: layout, content, storytelling, and a full SEO pass covering structured data, meta tags, language pages, and crawl hygiene.

---

### Layout — Horizontal Card with Carousel

Replaced the card grid with a vertical list of full-width horizontal cards. Each card has:
- **Left (46%):** image carousel (480px tall, auto-advance 3.5s, hover-pause, arrows, touch-swipe, progress bar)
- **Right (flex:1):** tier tags → project title → location → scope narrative → enquiry button

`object-fit: contain` kept throughout to avoid cropping engineering photos. The carousel container needs **explicit `height`** (not just `min-height`) because the slides use `position:absolute;inset:0` — see lesson below.

---

### Project 2 Added

- 27 WebP images at `assets/projects/project-2/WebP/` (capital W — case-sensitive on Linux server)
- Full data entry in `window.__PROJECTS__` and `projects.json`: id, titles ×5 langs, tags (tier1/2/3), summaries ×5 langs, images[], imageAlts[]

---

### Carousel Storytelling

- **Slide 0:** Final product preview (completion aerial) — no label. For project 1, a copy of the last image was prepended for this purpose.
- **Slide 1:** "How it began" (bold, gold, italic — 20px, top-right)
- **Last slide:** "How it ended" (same style)

---

### Image Alt Text (Google Image Search)

`imageAlts[]` arrays added to both projects in `window.__PROJECTS__` and `projects.json`. Project 1 alts sourced from `assets/projects/project-1/captions.json`. Project 2 alts are context-descriptive.

Render logic: `p.imageAlts?.[si] || fallback-string` — never an empty alt.

---

### i18n

- Tiered specialism tags translated via `translateTag(text)` → `translations[currentLang].tags[text]`
- Project titles use `p['title_' + currentLang] || p.title`
- Enquiry button uses `t.proj_enquire` key (contextual, not the generic CTA copy)
- All 5 languages have tags map in `translations` object

**Critical:** When updating a project summary in English, always update all four `summary_es/pt/nl/fr` fields in the same commit. Stale translations have shipped twice in this project and are the most visible content bug.

---

### Contact Button

"View Project" (dead, called removed lightbox) replaced with "Enquire About a Similar Project →" (`proj_enquire` i18n key) linking to `/#contact`. Translated in all 5 languages.

---

### SEO Changes (PR #32, #33)

| Item | Change |
|------|--------|
| `robots.txt` | `Disallow: /archives/` — blocks 15+ stale HTML versions from Google's index |
| `projects.html` head | Preconnect hints for fonts.googleapis.com, fonts.gstatic.com, cdn.jsdelivr.net |
| JSON-LD | `@type: "Project"` → `@type: "CreativeWork"` (Project is not a schema.org type) |
| JSON-LD | Added BreadcrumbList (Home → Projects) |
| JSON-LD | Project 2 description was stale in structured data — corrected |
| Meta | Twitter card tags added; og:image dimensions and alt added |
| Meta | Page title strengthened with keywords; meta description adds T&T location signal |
| hreflang | All alternates now point to language-specific URLs (not the same URL ×6) |
| Language pages | `es/projects.html`, `pt/projects.html`, `nl/projects.html`, `fr/projects.html` created — full copies with correct `html lang`, meta, canonical, hreflang, BreadcrumbList in each language, `currentLang` defaulted, root-relative asset paths |
| `sitemap.xml` | All 4 language project pages added at priority 0.6 |

---

### Key Lessons (also in lessons-learned skill)

1. **`height:100%` on absolute-positioned carousel slides collapses if parent only has `min-height`** — set explicit `height` on the carousel container.
2. **`window.__PROJECTS__` inline vs `fetch()`** — inline guarantees Googlebot sees the data without executing async JS. Use inline for any content that must be indexed.
3. **`@type: "Project"` is silently ignored by Google** — not a valid schema.org type. Use `CreativeWork`.
4. **hreflang all pointing to the same URL gives zero multilingual SEO signal** — each language must have its own URL for hreflang to work.
5. **Language pages in subdirectories must use root-relative asset paths** — `assets/img.webp` from `es/projects.html` resolves to `es/assets/img.webp` (404). Use `/assets/img.webp`.

---

### Outstanding

- [ ] Project 3 — no images or data yet. Add when ready.
- [ ] Filter categories (Fabrication, Motors & Pumps, Structural, Machine Shop) return empty — hide them or add stub projects.
- [ ] `year` field in project data is not displayed on the card — consider adding.
- [ ] Translations for projects are human-reviewed for English and Spanish; Dutch and French should be verified by native speakers.
- [ ] depot.html: favicon paths still broken (missing hyphens) — carried over from Session 10 audit.
- [ ] 404.html: missing `noindex` meta — carried over from Session 10 audit.

---

## Session 12 — Project 2 WebP Images & Watermarks

**Date:** 2026-05-18

### What Changed

Converted all 27 project-2 source images (JPG) to WebP and applied the Q2M logo watermark, matching the treatment used for project-1.

#### Conversion

- 27 images from `assets/projects/project-2/original/` converted to WebP at quality 85
- Output to `assets/projects/project-2/WebP/`
- Filenames retain original numeric prefix (01–28) with `.webp` extension
- Tool: `sharp` v0.34.5 via Node.js (installed in `%TEMP%\webp-convert`)

#### Watermark

- Logo: `assets/branding/Q2M_Logo.png`, resized to fit, placed bottom-left on a `#F4F3EF` background tile with 16px inner padding, 36px from edge — same spec as project-1
- Large images (≥2000px shortest side): logo at **300px wide**
- Small images (02, 03, 04 — WhatsApp shots ~960px; 10 — 1712px): logo scaled to **~9% of shortest dimension** (86px and 154px respectively) to maintain consistent visual weight

| Image | Dimensions | Logo width |
|-------|-----------|-----------|
| 01, 05–09, 11–28 (DJI / PlantInstallation) | 1795–3648px | 300px |
| 02, 03, 04 (WhatsApp) | 960–1280px | 86px |
| 10 (PlantInstallation-8838) | 1712×1910 | 154px |

### Files Changed

| Path | Change |
|------|--------|
| `assets/projects/project-2/WebP/*.webp` | 27 new watermarked WebP files |

### Notes

- No script committed — conversion run ad-hoc via temp Node environment
- If images need to be regenerated, use the same sharp pipeline: convert from `original/`, composite logo tile at 9% of shortest dimension (max 300px), quality 85

---

## Session 11 — Multilingual SEO: Pre-rendered Pages for All 5 Languages

**Date:** 2026-05-18
**PR:** [#19](https://github.com/brandonr2630/q2m-website/pull/19) — merged & deployed

### What Changed

Fixed the root cause of zero multilingual SEO benefit: all five translated languages were JS-rendered from one URL, so Google only ever indexed English. Pre-rendered static pages at `/es/`, `/pt/`, `/nl/`, `/fr/` are now generated by a build script, making all four non-English variants indexable by Google.

Target markets: Latin America (ES), Brazil (PT), Suriname (NL), French Guiana / Antilles (FR).

Also fixed: the 19 hero tier tags (Industries / Plant Services / Equipment) were added in Session 8 without translation keys — they now have `data-i18n` attributes and translations in all 5 languages, covering both the static pages and the live language switcher.

### Files Created / Changed

| File | Change |
|------|--------|
| `es/index.html` | Pre-rendered Spanish homepage (generated) |
| `pt/index.html` | Pre-rendered Portuguese/BR homepage (generated) |
| `nl/index.html` | Pre-rendered Dutch homepage (generated) |
| `fr/index.html` | Pre-rendered French homepage (generated) |
| `scripts/build-lang-pages.js` | cheerio build script — reads `index.html`, extracts translations, outputs all four language pages |
| `scripts/package.json` | Added `cheerio ^1.0.0`; `npm run build-langs` script |
| `index.html` | Canonical tag; full hreflang set (en/es/pt-BR/nl/fr/x-default); `data-i18n` on 19 hero tags; translations for all 5 langs; schema email fixed; `geoRadius` added |

### Hreflang Setup (all five pages cross-reference each other)

```html
<link rel="alternate" hreflang="en"        href="https://www.q2m.io/">
<link rel="alternate" hreflang="es"        href="https://www.q2m.io/es/">
<link rel="alternate" hreflang="pt-BR"     href="https://www.q2m.io/pt/">
<link rel="alternate" hreflang="nl"        href="https://www.q2m.io/nl/">
<link rel="alternate" hreflang="fr"        href="https://www.q2m.io/fr/">
<link rel="alternate" hreflang="x-default" href="https://www.q2m.io/">
```

### Schema Changes (applied to all generated pages)

- Email fixed: `"qhub-at-q2m.io"` → `"qhub@q2m.io"`
- `geoRadius: "800000"` added to `GeoCircle`
- `WebPage` node with `inLanguage` and correct URL/name added per page

### How to Regenerate When index.html Changes

```bash
cd scripts && npm run build-langs
```

Commit `index.html` + all four `{lang}/index.html` together. The deploy workflow picks them up automatically — no workflow changes needed.

### Outstanding from SEO Audit (still open)

- [ ] depot.html favicon paths (missing hyphens)
- [ ] depot.html + projects.html font loading (non-blocking pattern)
- [ ] Twitter card meta on depot.html and projects.html
- [ ] noindex on 404.html
- [ ] Expand depot.html and projects.html title tags
- [ ] ItemList/Product schema on depot.html
- [ ] Add more projects to projects.html
- [ ] Decide: language versions of depot.html and projects.html (es/depot.html, etc.)

---

## Session 10 — SEO Audit

**Date:** 2026-05-18

### Audit Summary

Full technical + on-page SEO audit of all three pages (index.html, depot.html, projects.html). No deployment changes made this session — findings and action list recorded below.

### Findings

#### Critical

| Finding | Detail |
|---------|--------|
| JS-rendered translations invisible to Google | All 5 languages (EN/ES/PT/NL/FR) are rendered client-side from a single URL. Google only indexes English. No hreflang tags exist because there are no alternate-language URLs. Zero SEO benefit from translations. No penalty either — it's one page. |

#### High

| Finding | Detail |
|---------|--------|
| depot.html — broken favicon paths | `favicon32x32.png`, `favicon16x16.png`, `appletouchicon.png` — all missing hyphens. These 404 on every page load. |
| depot.html + projects.html — blocking Google Fonts | Both pages use a plain `<link rel="stylesheet">` for Google Fonts. index.html uses the `media="print"` non-blocking trick. Should be consistent. |

#### Medium

| Finding | Detail |
|---------|--------|
| depot.html + projects.html — missing Twitter card meta | OG tags present on both pages, but no `twitter:card`, `twitter:title`, `twitter:description`, or `twitter:image`. |
| depot.html — no schema markup | The equipment listings page has zero structured data. Opportunity for `ItemList`/`Product` schema and rich results. |
| Schema — email obfuscated | `ContactPoint` in index.html JSON-LD has `"email": "qhub-at-q2m.io"` — not a valid email format. Machine-readable structured data should use the real address or omit the field. |
| Schema — invalid `@type: "Project"` | projects.html uses `"@type": "Project"` which is not a valid Schema.org type. Use `"@type": "CreativeWork"` instead. |
| Schema — `GeoCircle` missing `geoRadius` | index.html `areaServed` uses `GeoCircle` without the required `geoRadius` property. Add `"geoRadius": "800000"` or simplify to a plain string. |

#### Low

| Finding | Detail |
|---------|--------|
| 404.html missing noindex | Custom 404 page has no `<meta name="robots" content="noindex, follow">`. Google may index it. |
| depot.html + projects.html title tags too short | depot.html: "Equipment Depot \| Q² Machines" (31 chars). projects.html: "Projects \| Q² Machines" (23 chars). Both leave keyword opportunity on the table. |
| `<meta name="keywords">` on index.html | Ignored by Google/Bing since 2009. Harmless dead weight. |
| OG image identical across all pages | All three pages share the same `og_banner.jpg`. Not incorrect, but per-page images would improve social sharing CTR. |

### Action List

#### Do Now (easy wins)

- [ ] Fix depot.html favicon paths — add hyphens: `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`
- [ ] Fix depot.html + projects.html font loading — replace blocking `<link rel="stylesheet">` with `media="print"` non-blocking pattern from index.html
- [ ] Add Twitter card meta to depot.html and projects.html (4 lines each: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
- [ ] Add `<meta name="robots" content="noindex, follow">` to 404.html
- [ ] Fix schema email in index.html — change `"qhub-at-q2m.io"` to `"qhub@q2m.io"` or remove the field
- [ ] Fix `"@type": "Project"` → `"@type": "CreativeWork"` in projects.html schema
- [ ] Add `"geoRadius": "800000"` to `GeoCircle` in index.html schema, or simplify `areaServed` to a plain string

#### Medium Effort

- [ ] Expand depot.html title — e.g. "Used & Refurbished Industrial Equipment Trinidad | Q² Machines"
- [ ] Expand projects.html title — e.g. "Engineering Projects Caribbean | Q² Machines"
- [ ] Add `ItemList`/`Product` schema to depot.html (generate from listings.json at render time via JS)
- [ ] Add introductory paragraph above depot.html listings for on-page keyword content

#### Longer Term

- [ ] Add more projects to projects.html (content depth and indexed text)
- [ ] Decide on multilingual SEO strategy: separate URL paths per language (`/es/`, `/pt/`) with hreflang, or accept English-only indexation

---

## Session 9 — Carousel UI Polish (Tier 1)

**Date:** 2026-05-18
**Commit:** `ce0402a`

### What Changed

Enhanced the project card carousel with refined UI/UX for improved perceived professionalism: visual progress bar, polished arrow interactions, and refined counter styling.

### Changes Made

| Enhancement | Detail |
|------------|--------|
| Progress bar | Gold bar at bottom of carousel that fills as you advance (CSS `::after` with dynamic width via `--progress-width`) |
| Carousel hover effect | Subtle border highlight + inset glow on hover (border-color transition, box-shadow) |
| Arrow button polish | Enhanced hover state: scale 1.1 transform + gold glow shadow, opacity smooth transition |
| Counter styling | Larger (11px → 12px), bolder (font-weight: 600), better contrast (text-2 color), visible on hover only |
| Lightbox counter | Matching styling to carousel counter for visual consistency |

### Implementation Details

**CSS:**
- `.card-carousel::after` — progress bar using CSS custom property `--progress-width`
- `.card-carousel.has-slides::after { opacity: 1; }` — show progress only for multi-image carousels
- `.card-carousel-arrow:hover { transform: translateY(-50%) scale(1.1); box-shadow: 0 4px 12px rgba(245,197,0,0.3); }` — 3D-like interaction
- Counter visibility managed via hover state: `opacity: 0` → `opacity: 1` on parent hover

**JavaScript:**
- `initCarousels()` — adds `has-slides` class and sets initial progress `--progress-width`
- `cardCarouselGoTo()` — updates progress bar: `percent = ((next + 1) / total) * 100`

### Outstanding

None — ready to deploy.

---

## Session 8 — Hero Section Restructuring

**Date:** 2026-05-18
**PR:** [#10](https://github.com/brandonr2630/q2m-website/pull/10)

### What Changed

Restructured the hero section from a flat list of 8 capability tags into a 3-tier hierarchy that answers customer needs: Industries → Plant Services → Equipment/Capabilities. Added tiered typography and color gradient for visual hierarchy.

### Changes Made

| Change | Detail |
|--------|--------|
| Hero tags — restructured | From 8 items to 17 items across 3 visual tiers |
| Tier 1 (Industries) | Minerals, Quarrying, Concrete & Cement, Asphalt, Recycling, Manufacturing |
| Tier 2 (Plant Services) | EPC, Plant Turnarounds, O&M, Emergency Repair & Rebuild, Commissioning & Startup |
| Tier 3 (Equipment/Capabilities) | Conveyors & Bulk Material Handling Systems, Concrete Plants and Equipment, Pumps & Power Transmission Systems, Structural Steelwork, Plant Foundations & Infrastructure, Fabrication & Machining |
| Font sizes — tiered | 14px (Tier 1) → 12px (Tier 2) → 10px (Tier 3) |
| Colors — gradient | Gold (Tier 1) → White (Tier 2) → Gray (Tier 3) |
| Spacing — standardized | 16px gap between rows; 44px gap before action buttons |
| CSS classes added | `.tier-1`, `.tier-2`, `.tier-3` for targeting specific rows |

### Rationale

The original 8 tags focused on **what Q2M offers** (company-centric). The new 3-tier structure answers **what problems customers face** and **which industries they operate in** (customer-centric):
- Visitors identify their industry first
- Then see the plant-related services Q2M provides
- Then see the specific equipment and systems available

The visual hierarchy (size, color, spacing) reinforces this flow: industries are prominent, services are mid-tone, equipment is subtle.

### Design Details

- **Tier 1 colors:** Gold (#F5C500) with 50% border opacity, 15% background opacity
- **Tier 2 colors:** White (#FFFFFF) with 30% border opacity, 8% background opacity
- **Tier 3 colors:** Gray (#808080) with 30% border opacity, 10% background opacity
- **Row spacing:** `.hero-specialisms { margin-bottom: 16px; }` with `.hero-specialisms:last-of-type { margin-bottom: 44px; }` to preserve space before buttons

### Outstanding

None — ready to deploy once PR is merged.

---

## Session 7 — Projects Page Launch

**Date:** 2026-05-17
**PRs:** [#6](https://github.com/brandonr2630/q2m-website/pull/6), [#7](https://github.com/brandonr2630/q2m-website/pull/7), [#8](https://github.com/brandonr2630/q2m-website/pull/8)

### What Changed

Built and deployed the Projects page end-to-end — image carousel, watermarks, full i18n, and nav integration across all pages.

### Changes Made

| Change | Detail |
|--------|--------|
| `projects.html` — image carousel | CSS fade carousel per card: auto-advance 3.5s, hover pause, prev/next arrows, touch swipe, slide counter |
| `projects.html` — i18n | Full 5-language support (EN/ES/PT/NL/FR): `data-i18n` on all static text, `applyTranslations()` re-renders cards and lightbox on language switch |
| `projects.json` — translated summaries | Added `summary_es`, `summary_pt`, `summary_nl`, `summary_fr` fields; card and lightbox use `p['summary_' + currentLang]` |
| WebP images (34) | All watermarked: Q2M logo, 300px wide, bottom-left, `#F4F3EF` background tile, 16px inner padding, 36px edge padding |
| WebP images — orientation | 3-batch rotation pass (CW and CCW) to correct portrait images shot sideways |
| Slide 35 removed | `31-20161123_065704.webp` removed from `projects.json` image array; file kept on disk |
| `scripts/upscale-images.js` | Sharp-based watermark utility — reads `assets/projects/<dir>`, composites logo onto each image |
| `scripts/.gitignore` | `node_modules/` excluded from git |
| `deploy.yml` | `exclude_extra` updated to exclude `^scripts/` from deploy |
| `index.html` nav | "Projects" link added to desktop nav, mobile menu and footer |
| `depot.html` nav | "Projects" link added to desktop nav, mobile menu and footer; `nav_projects` translation key added in all 5 languages |

### Image Carousel — Key CSS

```css
.card-carousel { width:100%; aspect-ratio:1; position:relative; overflow:hidden; }
.card-carousel-slide { position:absolute; inset:0; opacity:0; transition:opacity .6s ease; }
.card-carousel-slide.active { opacity:1; }
.card-carousel-slide img { width:100%; height:100%; object-fit:contain; display:block; }
```

`object-fit: contain` on a 1:1 square container — no cropping for either portrait (9:16) or landscape (16:9) images.

### projects.json Entry Format (current)

```json
{
  "id": "plant-upgrade-2016",
  "title": "...",
  "client": "Confidential",
  "sector": "Quarrying",
  "category": "conveyor",
  "year": 2016,
  "summary": "English summary.",
  "summary_es": "...",
  "summary_pt": "...",
  "summary_nl": "...",
  "summary_fr": "...",
  "cover": "assets/projects/project-1/webp/29-20160819_065320.webp",
  "images": ["assets/projects/project-1/webp/01-....webp", "..."]
}
```

### Watermark Script

```bash
cd scripts && npm install   # first time only
node upscale-images.js ../assets/projects/project-1
```

Reads from the directory's `webp/` subfolder, writes watermarked files in-place.

### Outstanding

- ⏳ Projects page has only 1 project (project-1). Add project-2, project-3 by dropping WebP images into `assets/projects/project-2/webp/` etc. and adding entries to `projects.json`.

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

**Last Updated:** 2026-05-20 (Session 15 — full SEO visibility push, PRs #38–#42 pending)
