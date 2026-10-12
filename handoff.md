# Q2M Website — Handoff

*Last updated: 2026-10-12 · Session 20*

Sessions 1–19 are condensed into the history table and the lessons below. Per-session detail lives in git history (`git log -- handoff.md`).

---

## Quick Reference

| Item | Value |
|------|-------|
| Live URL | `https://www.q2m.io` (non-www and http both 301 → `https://www.q2m.io/`) |
| GitHub repo | `brandonr2630/q2m-website` |
| Default branch | `master` — protected, changes go through a PR |
| Deploy | Push to `master` → `.github/workflows/deploy.yml` → reusable workflow `brandonr2630/projects/.github/workflows/deploy.yml@master` → **SSH/rsync** to GreenGeeks (`/home/terranre/public_html/q2m.io`). Takes ~15 s. (The old cPanel Fileman API path was killed by the host WAF and replaced 2026-09-02.) |
| Merging | Auto-merge is allowed on the repo but is **not** switched on per PR. A new PR sits open until merged (`gh pr merge <n> --merge`). |
| Manual redeploy | Actions → Deploy to cPanel → Run workflow |
| Not deployed | `scripts/`, `server.js`, `convert-webp.js`, `implementation-guide.html` files (`exclude_extra` in `deploy.yml`), plus `.github/`, `.cpanel.yml`, `handoff.md`, `CLAUDE.md` (shared workflow's built-in exclude list) |

### Repo shape

- `index.html`, `depot.html`, `projects.html` are the **source** pages. `es/ pt/ nl/ fr/` are **generated** from them — never hand-edit those.
- After changing any source page or `listings.json`, regenerate and commit the source and generated pages together:

```bash
cd scripts
npm install          # first time only (cheerio, sharp)
npm run build-all    # build-lang-pages + build-depot-langs + build-projects-langs
```

- Source files use **CRLF** line endings. Scripts that rewrite them must preserve CRLF or the diff becomes the whole file.
- `README.md` still describes the old Fileman deploy — out of date (see Open Items §7).

---

## Where Things Stand (2026-10-12)

**Live and healthy:** multilingual site (en/es/pt/nl/fr) with pre-rendered language pages for home, depot and projects; hreflang, canonicals, schema, sitemap (15 URLs); every page passes mobile LCP (home 1.1 s, depot 2.3 s, projects 2.0 s, CLS 0 — lab, Fast 3G, 4× CPU). Lighthouse on home: SEO 100, Best Practices 100, Accessibility 96.

**The real problem is visibility, not speed** (Search Console, 3 months to 2026-10-10):

- ~490 impressions, 9 clicks (≈1.8% CTR). **All 9 clicks came from Trinidad & Tobago** (59 impressions, avg position 3.8).
- Almost every named query is a brand search or a misspelling: `q2 machining`, `q2m`, `q²`, `q2m-enterprises`, `q machine`. There are **zero** category queries ("conveyor manufacturer Trinidad", etc.). Only ~90 impressions have a named query; the rest are anonymised.
- US (79) and the long tail of other countries are brand-name noise — "Q2" collides with unrelated things. Guyana/Suriname/Venezuela (target markets) show ~5 impressions combined.
- Indexing: **11 of 15 indexed, 4 "Discovered – currently not indexed"** (stuck for months). The 4 pages with no impressions are, by elimination, `/depot.html`, `/pt/depot.html`, `/fr/depot.html`, `/nl/projects.html` (unconfirmed — verify with URL Inspection).
- Dutch pages rank for generic used-equipment queries (`gebruikte industriële apparatuur` pos 5.9, `verkoop van tweedehands industriële apparatuur` pos 9.1) with no clicks — the translated-page strategy can rank.
- Mobile position is better than desktop (6.1 vs 13.4); 7 of 9 clicks were mobile.

**Work in progress (not on `master`):** the Products page. Branch `feat/products-page` in the main checkout. It is **behind master** (missing #53–#55) and holds **uncommitted, untracked** WIP — see Open Items §2. It exists only on OneDrive; commit it to the branch before anything risky.

---

## Open Items

### 1. Indexing & visibility (highest value)

- [x] **Indexing requested 2026-10-12** (URL Inspection → Request indexing) for `/depot.html`, `/pt/depot.html`, `/fr/depot.html`, `/nl/projects.html` and the other depot pages. `es/depot.html` was already indexed.
- [ ] **Follow up in 2–4 weeks:** Search Console → Pages: confirm "Discovered – currently not indexed" drops from 4 (footer language links live since PR #54). Re-inspect the depot pages (Test live URL): the **Product snippets / Merchant listings "7 invalid items"** errors came from the removed `Product`/`Offer` markup (PR #56). Google's *stored* copy still shows them until it recrawls — the live pages are clean (verified: no `Product`/`Offer` in any of the 5 depot pages). If Test live URL still reports errors, something else on the page triggers them.
- [ ] **Google Business Profile** — the schema `sameAs` already links a Maps place ("Q2 Machines"). A profile likely exists; the job is to **claim, verify and complete** it (category, hours, photos, website link, services). Main route to "machine shop near me" and Maps results.
- [ ] **Backlinks / directories** — regional trade directories and association listings (e.g. Caribbean Manufacturers Association). Low-authority domain; this is the biggest lever and no code change replaces it.
- [ ] **Category pages** — the homepage is one page for 8 services, so nothing targets "conveyor systems Trinidad" or "concrete batching plant Caribbean". Dedicated service pages (conveyors, concrete plants, structural steel, pumps & power transmission) plus the Products page. Needs a design pass first.
- [ ] **Search Console housekeeping** — confirm the Domain property is verified (DNS TXT) and `sitemap.xml` is submitted and shows 15 discovered URLs.
- [ ] **Re-pull the Search results export** in ~4 weeks (Performance + Pages) and compare with the baseline above. Most queries are anonymised in exports.
- [ ] **"Q2 Machining"** (16 impressions, the #1 query) is **not** used as an alternate name or visible text, because it is not a name the business has said it uses. Confirm with the owner.

### 2. Products page (paused mid-design — Session 19)

Status: design drafted, **not approved, no code**. Branch `feat/products-page` exists; merge/rebase `master` into it first.

- **Existing WIP (untracked, only on disk):** `products.html` (848 lines: SEO head, i18n redirect stub, nav, hero, category cards, EmailJS enquiry form, client-side i18n for 5 languages), `products.json` (2 pump entries), `products-mockup.html` (superseded — delete). Also `pumpcurveshandoff.md` — an unrelated, unstarted "interactive pump curve charts" feature blocked on the user supplying PDF datasheets.
- **Decisions made:** build on the WIP; pre-render languages via a new `scripts/build-products-langs.js` (add to `build-all`); populate all 5 categories (Conveyors, Concrete, Pumps, Crushers, Fabrication); build the filter bar (strings `prod_filter_*` exist, no handlers yet); crushers/mixer/screen get **TBD spec placeholders** and "supplied by Q² Machines" wording — do **not** reuse the vetted `depot.html` specs (Products = capability catalogue, Depot = specific in-stock units); MK-TRK dump truck excluded.
- **Design to approve:** extend `products.json`; `ItemList` JSON-LD referencing the existing `Organization` by `@id` — **do not use `Product` + `Offer` unless a real `price` exists** (see Session 20 lesson 7; products are likely price-on-request too); add "Products" to nav/mobile menu/footer on index/depot/projects and the es/pt/nl/fr variants (13 files); add `products.html` + 4 language variants to `sitemap.xml`; fix trust-badge copy "All equipment manufactured to your specification" for supplied/OEM items in 5 languages.
- **Next steps:** get design sign-off → write spec to `docs/superpowers/specs/2026-07-02-products-page-design.md` → `writing-plans` → implement. The footer language row and the `footer_slogan` / `footer_rights` i18n keys now exist on master; the products page needs the same footer.

### 3. Technical SEO / performance

- [ ] **`projects.html` Google Fonts are render-blocking** (plain `<link rel="stylesheet">`, line ~44). Use the `media="print"` non-blocking pattern from `index.html`/`depot.html`.
- [ ] **`depot.html` loads and inits EmailJS on page load** (lines ~54–55). Defer until first interaction with the contact section, as `index.html` does.
- [ ] **`sitemap.xml` `lastmod` is stale** — every entry is still `2026-05-20`. Add a pre-deploy step or script to bump `lastmod` for changed files.
- [ ] **Unique `og:image` per page** — depot and projects reuse the homepage `og_banner.jpg`.
- [ ] **Slideshow photos** — 20 about-section photos are loaded via JS (`data-webp`/`data-jpg`) into CSS backgrounds with no alt text, invisible to image search. Convert to `<img>` with descriptive alt text.
- [ ] **JS-only inventory** — `/depot.html` loads listings client-side. Use URL Inspection → "View crawled page" to confirm Googlebot sees the listings; if not, add a static fallback. (Projects data is already inline via `window.__PROJECTS__`.)
- [ ] `og:image:alt` on the generated language pages is still English.

### 4. AI search / structured data

- [ ] **Expand `llms.txt`** (years in operation 15+, Depot, Projects, richer capability text) and add **`llms-full.txt`** (verbose company profile).
- [ ] **`FAQPage` schema** on `index.html` (6–8 Q&As: services, industries, geography, custom design, outside Trinidad, contact/hours). None exists yet.
- [ ] **`url` on each `Service`** in the `ItemList` (link to `/#services` or per-service anchors/pages).
- [ ] **Certifications/accreditations** on-page and in the `Organization` node, if BS/ASME/ISO apply.
- [ ] Standalone **`/about.html`** (history, team, values) for E-E-A-T and a citable page.
- [ ] **Privacy policy page** — the contact form collects name, email, phone.

### 5. CRO — homepage (Session 16 audit; none verified done)

- [ ] Hero message clarity — one-line descriptor ("Industrial plant engineering, manufacture & maintenance — Trinidad & the Caribbean").
- [ ] CTA hierarchy — primary button solid, secondary outlined.
- [ ] Project Description field — make optional with helper text ("Not sure yet? Just say hello — we'll follow up within 1 business day.").
- [ ] Social proof above the fold (client logos, pull-quote, or stat row).
- [ ] "We typically respond within 1 business day" near Submit.
- [ ] Services carousel → 2×4 icon grid (deferred repeatedly).

### 6. CRO — depot and projects

- [ ] Depot: show a "having trouble loading? contact us" message after a 3 s timeout; disable filters until listings load and show per-filter counts; add a context line above the enquiry form.
- [ ] Projects: embed 2–3 static featured cards so above-the-fold content never depends on the fetch; deepen case studies (industry, problem, measurable outcome).
- [ ] Filter categories (Fabrication, Motors & Pumps, Structural, Machine Shop) return empty — hide them or add projects. **Project 3** has no images/data. `year` is not shown on cards.
- [ ] **nl/fr translations** need native-speaker review. `es` and `en` were human-reviewed.

### 7. Housekeeping

- [ ] **`README.md` is out of date** — still documents the Fileman API deploy, lists only three pages and one script. Update to match Quick Reference above.
- [ ] Contact form uses EmailJS (client-side). Decide whether that is the long-term answer or a server-side backend is wanted.
- [ ] `pumpcurveshandoff.md` — decide whether to keep, move into `docs/`, or drop.

### Verified resolved (do not re-open)

One `<h1>` on the homepage. www/non-www/http all 301 to `https://www.q2m.io/`. Favicon paths, 404 `noindex`, Twitter cards, schema email, `CreativeWork`, `geoRadius`/`areaServed`, canonicals, hreflang, nl/fr depot pages, es/pt/nl/fr nav-link patching, `WebSite` schema node, AI crawlers in `robots.txt`, `llms.txt` email/service fixes, footer language links, `(Q2M)` brand signals, footer tagline and copyright translated, depot `Product`/`Offer` invalid-items error (removed in #56).

---

## Session 20 — Search Console Diagnosis, Brand/Indexing Fix, Footer i18n

**Date:** 2026-10-12
**PRs:** [#54](https://github.com/brandonr2630/q2m-website/pull/54), [#55](https://github.com/brandonr2630/q2m-website/pull/55) and [#56](https://github.com/brandonr2630/q2m-website/pull/56) — merged, deployed, verified live.

### Why

The owner found the Search Console results poor. Lighthouse/trace runs showed the pages are fast; the problem is that almost nobody finds the site (numbers in "Where Things Stand").

### What changed

| Item | Detail |
|------|--------|
| Footer language row (#54) | Plain `<a>` links (English · Español · Português · Nederlands · Français) on all 15 pages (home/depot/projects × 5), each pointing at the same page in that language. The JS switcher only used buttons, so language variants had no crawlable internal links. Markup is `<div class="footer-langs" role="navigation">` with its own CSS on each source page. |
| Build scripts (#54) | `build-*.js` now do `.not('.footer-langs a')` when rewriting `/depot.html` and `/projects.html`, so the English link in the row is not turned into a Spanish one. |
| Brand signals (#54) | Homepage title now `Q² Machines (Q2M) — …` in all 5 languages (via `LANGS` in `build-lang-pages.js`). `Organization` and `LocalBusiness` `alternateName` = Q2M / Q2 Machines; new `WebSite` JSON-LD node with `publisher` → `#organization`. |
| Footer tagline i18n (#55) | `data-i18n="footer_slogan"` added to `index.html` and `depot.html` (projects already had it), keys for 5 languages. |
| Depot schema (#56) | URL Inspection on `/depot.html` reported **7 invalid items**: each listing was a `Product` whose `Offer` had `priceCurrency` + `availability` but **no `price`** (required for product rich results). Prices are **on request**, so Product rich results are not possible. The 7 items in the depot `ItemList` are now plain `Thing` (name, description, image); the `Offer` is removed, and so is `brand: Q² Machines` (wrong for third-party equipment such as the SBM crushers). Regenerated es/pt/nl/fr. |
| Copyright i18n (#55) | "All rights reserved." wrapped in `<span data-i18n="footer_rights">` on all three source pages, keys for 5 languages. |

### Lessons (new this session)

1. **Do not name a custom footer element `<nav>`.** The site's global `nav { position: fixed; top: 0 }` CSS pins it under the header, so it renders hidden although the markup is correct. Use a `div` with `role="navigation"`.
2. **A markup check is not a rendering check.** Scripted checks passed while the row was hidden and, on `depot.html`, unstyled (a silent `str.replace` missed its anchor because of one space). Assert the CSS exists and measure layout in a browser.
3. **`applyTranslations()` replaces `textContent`.** `data-i18n` on an element that contains `<span id="footer-year">` or `<sup>` destroys that markup. Wrap only the translatable phrase in its own span.
4. **Python `str.replace` does nothing, silently, when the anchor is missing.** Assert the replacement count or that the output changed.
5. **Check for CRLF before scripting edits** to source files; normalise, edit, restore.
6. **Use a clean `git worktree` off `origin/master`** when the main checkout holds uncommitted WIP — create it **inside the repo** at `.worktrees/<name>` (excluded via `.git/info/exclude`), never in Temp.
7. **Do not mark up a `Product` without a price.** An `Offer` needs `price` (or a `priceSpecification`); currency + availability alone makes the item invalid. For price-on-request stock use plain `Thing`/`ListItem` markup. Never fake a price (e.g. `0`) — Google treats that as misleading. If prices are ever published, add a `price` field to `listings.json` and restore `Product` + `Offer` only for items that have one.

### Notes

- In-app browser screenshots time out on very long pages; use DOM measurements (bounding rects, computed style) as evidence for layout checks.
- Search Console exports used: *Performance on Search*, *Performance on Search – Generative AI Features* (impressions only, tiny — not representative), and *Coverage*. Exports end ~2026-10-08/10 due to reporting lag.

---

## Key Lessons (carried forward)

1. **`$('head').append(canonical)` adds a second canonical** (Google uses the first). Replace in place: `$('link[rel="canonical"]').attr('href', url)`. This once kept all language pages out of the index.
2. **Cross-page nav hrefs on language pages must be patched in the build script** — `href="/depot.html"` inside `/es/` otherwise goes to the English page. Repeat the patch (and keep the `.footer-langs` exclusion) in any new build script.
3. **Language pages in subdirectories need root-relative asset paths** (`/assets/img.webp`), or `es/projects.html` resolves `assets/…` to `es/assets/…` (404).
4. **hreflang pointing every alternate at the same URL gives no multilingual signal** — each language needs its own URL.
5. **Content that must be indexed should be inline, not fetched.** `window.__PROJECTS__` inline beats an async `fetch()` for Googlebot.
6. **`@type: "Project"` is not a schema.org type** and is silently ignored — use `CreativeWork`.
7. **Carousel slides using `position:absolute; inset:0` collapse** if the container only has `min-height` — set an explicit `height`.
8. **Update all four `summary_es/pt/nl/fr` fields in the same commit** as the English summary; stale translations have shipped twice.
9. **Image folder case matters on Linux:** project-2 images live under `WebP/` (capital W), project-1 under `webp/`. Check `projects.json` paths against the folder name.
10. **A green deploy Action means the rsync step ran** — verify live with `curl` against the changed pages.

---

## Condensed History

| Session | Date | Summary |
|---------|------|---------|
| 1 | 2026-05-16 | Fixed binary upload in the (then) Fileman deploy: hybrid binary/text upload, directory creation, `workflow_dispatch`. |
| 2 | 2026-05-16 | Scaffolded Projects page (`projects.html`, `projects.json`, project folders). |
| 3 | 2026-05-16 | Repo hygiene: `CPANEL_HOST`/`CPANEL_USER` to Secrets, `.gitignore`, README. |
| 4 | 2026-05-16 | Cleanup + cross-repo audit of the five Terran repos. |
| 5 | 2026-05-16 | Credential rotation, branch protection on `master`, dead `.cpanel.yml` removed, folders renamed kebab-case. |
| 6 | 2026-05-16 | Reusable deploy workflow in `brandonr2630/projects`; GitHub Projects board; auto-merge allowed on repos. |
| 7 | 2026-05-17 | Projects page launch: carousel, watermarked WebP, 5-language i18n, nav links (PRs #6–#8). |
| 8 | 2026-05-18 | Hero restructured into 3 tiers (Industries → Plant Services → Equipment) (PR #10). |
| 9 | 2026-05-18 | Carousel polish: progress bar, arrow hover, counter styling. |
| 10 | 2026-05-18 | First full SEO audit (findings later all actioned). |
| 11 | 2026-05-18 | Pre-rendered `/es/ /pt/ /nl/ /fr/` homepages via `build-lang-pages.js` (PR #19). |
| 12 | 2026-05-18 | Project 2 images converted to WebP + logo watermark (`sharp`). |
| 13 | 2026-05-19 | Projects page redesign (horizontal cards), Project 2, alt text, i18n, full SEO pass, language project pages (PRs #21–#33). |
| 14 | 2026-05-19 | LatAm/Caribbean visibility push: canonical bug fix, `areaServed`, sitemap, es/pt depot pages, `build-depot-langs.js`. |
| 15 | 2026-05-20 | nl/fr depot pages, nav-link patching, geo copy, `build-projects-langs.js`, schema (PRs #38–#42). |
| 16 | 2026-05-20 | SEO + CRO audit (CRO items still open — Open Items §5–6). |
| 17 | 2026-05-21 | Language auto-redirect (`navigator.language`, `sessionStorage` guard) and hero stats i18n (PRs #43, #44). |
| 18 | 2026-06-08 | SEO/AI-search audit: `llms.txt` fixes, 6 AI crawlers in `robots.txt` (PR #52). Remaining audit items are in Open Items §3–4. |
| 19 | 2026-07-02 | Products page design drafted, paused before approval. |
| 20 | 2026-10-12 | Search Console diagnosis; footer language links, Q2M brand signals, footer i18n, depot schema fix (PRs #54, #55, #56). |

---

## References

- **Repository:** https://github.com/brandonr2630/q2m-website
- **Live site:** https://www.q2m.io
- **Deploy workflow:** `.github/workflows/deploy.yml` → `brandonr2630/projects/.github/workflows/deploy.yml@master`
- **Build scripts:** `scripts/build-lang-pages.js`, `build-depot-langs.js`, `build-projects-langs.js` (`npm run build-all`); image watermarking in `scripts/upscale-images.js`
- **Project board:** https://github.com/users/brandonr2630/projects/1
