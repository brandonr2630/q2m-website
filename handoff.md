# Q2M Website — Handoff

*Last updated: 2026-10-13 · Session 21*

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
- `README.md` was rewritten 2026-10-12 and is current. `sitemap.xml` `lastmod` dates come from git: run `npm run build-all` (or `npm run update-sitemap`) before committing page changes.

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

**Work in progress (not on `master`):** the Products section (hub + OCR RP Series page) is built on branch `feature/products-ocr-reducers` and not yet merged or deployed (Session 21); the old `feat/products-page` draft is superseded and unused (see Open Items §2).

---

## Open Items

### 1. Indexing & visibility (highest value)

- [x] **Indexing requested 2026-10-12** (URL Inspection → Request indexing) for `/depot.html`, `/pt/depot.html`, `/fr/depot.html`, `/nl/projects.html` and the other depot pages. `es/depot.html` was already indexed.
- [ ] **Follow up in 2–4 weeks:** Search Console → Pages: confirm "Discovered – currently not indexed" drops from 4 (footer language links live since PR #54). Re-inspect the depot pages (Test live URL): the **Product snippets / Merchant listings "7 invalid items"** errors came from the removed `Product`/`Offer` markup (PR #56). Google's *stored* copy still shows them until it recrawls — the live pages are clean (verified: no `Product`/`Offer` in any of the 5 depot pages). If Test live URL still reports errors, something else on the page triggers them.
- [ ] **Google Business Profile** — the Maps place ("Q2 Machines", linked in the schema `sameAs`) is **already claimed by the business**. Public view on 2026-10-12: category "Machine shop" only, 71 Warren Road, Bejucal, Cunupia, hours close 5 pm, phone (868) 230-9702 (all match the site), 19 photos, **no reviews/rating**, last owner post 2026-04-29, website link is bare `q2m.io`. Owner-only tasks (needs the Google login; cannot be done from the repo): add secondary categories (e.g. conveyor system supplier, industrial equipment supplier, steel fabricator, concrete plant), fill the services list and description, set the website to `https://www.q2m.io`, ask customers for reviews, post updates every few weeks. Site-side address match is done (PR #58).
- [ ] **Backlinks / directories** — regional trade directories and association listings (e.g. Caribbean Manufacturers Association). Low-authority domain; this is the biggest lever and no code change replaces it.
- [x] **Service pages (2026-10-12):** six pages x 5 languages live: `/services/conveyor-systems.html`, `concrete-plants.html`, `pumps-and-drives.html` (pumps + motors + gear reducers), `fabrication-and-machining.html` (machine shop + fabrication & welding), `structural-steel.html`, `geotechnical-equipment.html` (+ es/pt/nl/fr). Built by `scripts/build-service-pages.js` from `scripts/service-pages-content.js` (pages 1-2) and `service-pages-content-more.js` (pages 3-6); shell, nav and footer come from `about.html`, language pages have no client-side translation, part of `npm run build-all`. Pages 3-6 take their bullet lists from the homepage service-card strings (`supplyKeys`/`doKeys`, e.g. `c4_p1`), so they match the cards in every language (Title Case; pages 1-2 use sentence case, harmonise later if wanted). Optional page fields: `supplyNote(Html)`, `house` or `where`, `project`. To add a page: add a `PAGES` entry (all 5 languages), its URLs to `sitemap.xml`, a `svcp_*` link on the homepage row, `llms*.txt`, and its `serviceParam` to the `?service=` map in `index.html`. Content uses only site facts (no capacities, standards beyond those already on the site, or client names). nl/fr wording needs a native check. The **`/services/` hub** (`services/index.html`, `/es/services/` etc.) is built by the same script from `scripts/service-hub-content.js`: cards come from the six pages (name = heading, text = meta description) and the "how we work"/"where we work" blocks reuse `about.html` strings, so a new page appears on the hub automatically. Service pages' breadcrumbs are Home > Services > page, the hero label links to the hub, and the nav/footer "Services" link on these pages opens the hub. **Products pages:** see Open Items §2.
- [ ] **Search Console housekeeping** — confirm the Domain property is verified (DNS TXT) and `sitemap.xml` is submitted and shows 70 discovered URLs (the sitemap lists 70 URLs; 60 before the Products pages).
- [ ] **Re-pull the Search results export** in ~4 weeks (Performance + Pages) and compare with the baseline above. Most queries are anonymised in exports.
- [x] **"Q2 Machining"** (16 impressions, the #1 query): owner confirmed 2026-10-12 it is an acceptable name if it helps searchers find the business. Added as `alternateName` on the `Organization`/`LocalBusiness`/`WebSite` nodes, to the first FAQ answer in all 5 languages (visible + `FAQPage` schema, kept identical) and to the `llms.txt`/`llms-full.txt` intro. It is **not** in titles or headings. Re-check the query in the next Search Console export.

### 2. Products section (built 2026-10-13 on branch feature/products-ocr-reducers, not yet merged or deployed, Session 21)

The Products section is built on the branch, not yet merged or deployed, with the OCR RP Series page: hub `/products/` plus one product page, in 5 languages. It is built by `scripts/build-product-pages.js` from `scripts/product-pages-content.js` and checked by `scripts/verify-products.js` (sections `nav|pages|sitemap|links`).

- **Superseded:** the old `products.html` / `products.json` / `products-mockup.html` draft (branch `feat/products-page`) is unused. `products-mockup.html` can be deleted.
- **Native check needed:** es/pt/nl/fr copy is new. Check nl and fr first. nl uses "Opsteekreductoren"; pt/nl/fr use "stackers" for the English term.
- **Enquiry flow:** the CTA opens the home contact form with `?service=reducers` rather than embedding a second EmailJS form.
- **Titles omit "Caribbean" on purpose:** OCR's agency territory is unconfirmed. Restore the word once confirmed.
- **Cross-link:** the services page (pumps-and-drives) now links to the product page.
- **Held back until OCR agrees:** OCR images, tables, logo, and the interchangeability appendix.
- **Next product line:** concrete mixers (source and relationship still to be confirmed). The nav label "Products" is assumed.

### 3. Technical SEO / performance

- [ ] **Unique `og:image` per page** — depot and projects reuse the homepage `og_banner.jpg`.
- [ ] **Slideshow photos** — 20 about-section photos are loaded via JS (`data-webp`/`data-jpg`) into CSS backgrounds with no alt text, invisible to image search. Convert to `<img>` with descriptive alt text.
- [ ] **JS-only inventory** — `/depot.html` loads listings client-side. Use URL Inspection → "View crawled page" to confirm Googlebot sees the listings; if not, add a static fallback. (Projects data is already inline via `window.__PROJECTS__`.)
- [ ] `og:image:alt` on the generated language pages is still English.

### 4. AI search / structured data

- [ ] **FAQ follow-ups:** nl/fr FAQ translations (and the rest of the nl/fr site) need native-speaker review; if a founding year or other facts change, update `faq_*` keys, `llms.txt` and `llms-full.txt` together. Google no longer shows FAQ rich results for most sites, so the value is AI/other-engine readability, not snippets.
- [ ] **Privacy policy: owner review (partly done).** The wording is a plain factual draft, not legal advice. Done 2026-10-12: the host is no longer named, the sentence now says "Our hosting provider may keep standard server logs…" (#72). **Still to confirm:** "we do not sell your information" / not used for advertising; "we keep enquiry emails as long as needed to respond and for our business records" (no fixed period stated); and the promise that visitors can ask what we hold, and have it corrected or deleted, by contacting us. If a tracker, analytics tool or new third-party script is ever added, **update `privacy.html` first** (an offline check fails if one appears).
- [x] **Indexing requested 2026-10-12** for `https://www.q2m.io/about.html` and `https://www.q2m.io/privacy.html`. Check back in ~2 weeks (Pages report) that both, and their es/pt/nl/fr versions, are indexed.
- [ ] **About page content is deliberately short** (confirmed facts only: since 2013, services, markets, two projects, depot). Add a company story, key people, certifications or client names only when the owner supplies them.
- [ ] **Non-visible text is still English on language pages:** `aria-label="Menu"` on the hamburger button, image `alt` text, tooltips (`title`). The translation checks only cover visible text.
- [ ] **Small wording items for native review:** Spanish "Tell us your needs" is "Cuéntenos su Necesidad" on the homepage but "Cuéntenos sus Necesidades" on the About page. Dutch/French wording written in Session 20 (e.g. Dutch hero "Techniek & Productie", "precisietechnische oplossingen") needs a native check. "Reverse Engineering" and "Turnarounds" are kept in Dutch on purpose (standard industry terms; "Turnarounds" is also kept in es/pt/fr).
- [ ] **Hero line on phones:** fixed in #71 for the homepage; the other pages' heading areas were measured and already fit. Re-measure whenever hero text or the tagline animation changes.
- [ ] **Keep `llms-full.txt` in sync** when `listings.json` (depot stock) or `projects.json` change; it lists the 7 depot items and both projects by hand. Consider generating it from the JSON in `build-all`.
- [ ] **`url` on each `Service`** in the `ItemList` (link to `/#services` or per-service anchors/pages).
- [ ] **Certifications/accreditations** on-page and in the `Organization` node, if BS/ASME/ISO apply.

### 5. CRO — homepage (Session 16 audit; none verified done)

- [x] Hero message clarity — one-line lead under the tagline (`hero_lead`: "Trinidad-based engineers who design, manufacture and service industrial plant equipment."), all 5 languages. nl/fr wording needs a native check.
- [x] CTA hierarchy — "Tell Us Your Needs" is now the solid primary button (first), "Our Services ↓" the outlined secondary. The old primary was the browse action, not the enquiry.
- [x] Project Description field — now optional (label without `*`, no `required`, handler needs only name + email, empty description is sent as "—"); placeholder ends "Not sure yet? Just say hello." in 5 languages. The depot enquiry form is unchanged.
- [ ] Social proof above the fold (client logos, pull-quote, or stat row).
- [ ] "We typically respond within 1 business day" near Submit.
- [ ] Services carousel → 2×4 icon grid (deferred repeatedly).

### 6. CRO — depot and projects

- [ ] Depot: show a "having trouble loading? contact us" message after a 3 s timeout; disable filters until listings load and show per-filter counts; add a context line above the enquiry form.
- [ ] Projects: embed 2–3 static featured cards so above-the-fold content never depends on the fetch; deepen case studies (industry, problem, measurable outcome).
- [ ] Filter categories (Fabrication, Motors & Pumps, Structural, Machine Shop) return empty — hide them or add projects. **Project 3** has no images/data. `year` is not shown on cards.
- [ ] **nl/fr translations** need native-speaker review. `es` and `en` were human-reviewed.

### 7. Housekeeping

- [ ] Contact form uses EmailJS (client-side). Decide whether that is the long-term answer or a server-side backend is wanted.
- [ ] `pumpcurveshandoff.md` — decide whether to keep, move into `docs/`, or drop.
- [ ] **About page rework** — merged and deployed 2026-10-13 (#88). New hero intro, "Who are we?", "What do we offer?" (Manufacturing / Engineering Services / Equipment Sales), "Industries we serve"; "What guides us" removed; "Our work" is a one-line lead-in plus projects link. Source copy: `docs/q2_machines_company_profile.md` (untracked). **Still to do:** native check of the new es/pt/nl/fr strings (nl/fr first). `<meta>` description and JSON-LD left on the old summary on purpose (new intro too long for a snippet). `Quarryquip Ltd` now only in `<meta name="author">`. `llms.txt`/`llms-full.txt` still say "Imagination, Ideas & Innovation" — decide whether to keep. Homepage/services hub not reviewed against the new three-group offer wording. **Photos (feature/about-photos):** 9 shop/site photos from `about-pics/` (untracked originals) processed to WebP in `assets/about/` (900x1200 portrait for before/after pairs, 1000x750 landscape otherwise). Alt text and captions are translated per language via `data-i18n-alt` / `data-i18n` (build-static-langs.js now handles `data-i18n-alt`, so crawlers see translated alt in the static HTML). Not used: `6IN Cylinder Mold-01.jpg` (CAD screenshot), `Hardware.jpg` (people in background), `motor-rep-03.jpg`.

### 8. Infrastructure & visibility review (2026-10-12)

**Conclusion:** speed and server setup are not the bottleneck. Search Console showed zero category queries in 3 months, so the biggest levers are *being found* (service pages, Business Profile, backlinks), then page weight.

**Baseline measured (re-measure to compare):**
- Server: gzip works (homepage 186 KB → 56 KB), HTTP/3 advertised (`alt-svc`), HSTS (1 year, preload), `X-Frame-Options`, `nosniff`; non-www/http → `https://www` in **one** 301 hop; TTFB ≈0.27 s (measured from the dev machine, **not** from Trinidad).
- Homepage weight: ≈2.3 MB transferred, ≈2.28 MB of it images; HTML 42 KB; load ≈0.8 s. `photo1.jpg` (870 KB) **and** `photo1.webp` (593 KB) are both fetched, plus `photo4/3/2.webp` (308/302/200 KB) — the slideshow appears to load the JPG fallback alongside the WebP (cause not yet confirmed).
- Lab LCP (mobile, throttled): home 1.1 s, depot 2.3 s, projects 2.0 s, CLS 0. **No CrUX field data** yet (too little traffic).
- Caching: images ≈15 days, logo 7 days, HTML has no `Cache-Control`. Missing headers: CSP, Referrer-Policy, Permissions-Policy; no `/.well-known/security.txt`.
- Repo: ≈190 MB of tracked images (originals up to 5 MB, e.g. `assets/images/photo5.jpg`, and a duplicate copy under `ARCHIVES/`); not served, but heavy to clone.

**To do, in order of expected impact:**
- [ ] **Service pages — one URL per service** (conveyors, concrete plants, motors & pumps, gear reducers, machine shop, fabrication & welding, structural, geotechnical). The main ranking lever for "conveyor systems Trinidad"-type searches. Needs owner content; start with a short brief per page, build with the same generated-language pattern as About/Privacy, no `Product`/`Offer` schema (prices on request).
- [ ] **Business Profile + backlinks** (owner): see §1.
- [~] **Bing Webmaster Tools:** site added by the owner and `https://www.q2m.io/` shows "Indexed successfully" in Bing URL Inspection. **IndexNow:** key file `/46fcb51183dfc278668a0f5f6ef8573e.txt` (the file contains the key; it is public by design). Submit changed URLs with `POST https://api.indexnow.org/indexnow` (`host`, `key`, `keyLocation`, `urlList`) after each deploy that changes pages. **Still to do:** check Bing shows the sitemap.
- [~] **Homepage image weight**: cause found and fixed in the `perf/homepage-image-weight` PR: a second `<link rel="preload" as="image" href="photo1.jpg">` fetched the JPG on every browser (removed both preloads; the slideshow is below the fold, not the LCP), and the slideshow timer ran from page load so photos 2–4 downloaded unseen (now starts/pauses via `IntersectionObserver`, 100px margin). Verified locally: 0 slideshow images at the top, loads on scroll to About, stops after leaving. Slides now served from `assets/images/slides/` (max 1280px, generated by `scripts/build-slide-images.js`; WebP set 6.1 MB → 2.7 MB, JPG fallbacks 5 MB → ≤260 KB). Originals in `assets/images/` are no longer referenced. **Still to do:** re-measure live; consider 1-year `max-age` only with versioned filenames; consider removing originals/`ARCHIVES/` from the repo.
- [ ] **Measurement**: Search Console is the only data source (the privacy page promises no analytics). Optional: cookieless analytics (Plausible/Umami) — **update `privacy.html` first**, plus its translations.
- [~] Security headers: `Referrer-Policy` + `Permissions-Policy` (`.htaccess`, in `<IfModule mod_headers.c>`) and `/.well-known/security.txt` added (expires 2027-10-12: renew). **CSP deliberately not added:** the pages use inline scripts/styles, so a CSP would need `'unsafe-inline'` and add little; revisit only if the inline code is moved out. After deploy, `curl -I` the headers and re-check 200s/301s.
- [ ] Optional / low value: Cloudflare free tier (DNS change + privacy-page line), unique `og:image` per page.

- [x] **Meta descriptions** were 145–260 characters on 24 of 25 pages; Bing URL Inspection flagged "too long or too short". All 25 are now ≤160 (most ~140–155), written per language in `build-lang-pages.js`, `build-depot-langs.js`, `build-projects-langs.js`, `scripts/static-pages-meta.json` and the English source pages. `og:`/`twitter:` descriptions on the translated pages follow the same string; the English pages keep their own longer og/twitter text. nl/fr wording needs a native check. Keep new descriptions ≤160 characters.

- [x] **H1 words in body text:** an SEO checker warned "words from the H1 are not used in the page content" on the homepage; the only missing word was "Latin" (H1 "Caribbean & Latin America" appeared nowhere in the body). The hero lead line now ends "…for the Caribbean and Latin America" (each language uses its H1 wording). Checked: no overflow at 390/320px in all 5 languages.

- [x] **Broken logo and slideshow on es/pt/nl/fr homepages (found 2026-10-12):** `build-lang-pages.js` copied the homepage with relative `assets/...` paths (nav logo, footer logo, 20 slides via `data-webp`/`data-jpg`), which resolve to `/es/assets/...` (404) in the language directories; English was fine. Now rewritten to root-relative like the other build scripts (Key Lessons #3). **Check every new page type in a language subdirectory for `assets/` paths** (`grep -c "[\"'(]assets/"` should be 0 outside English).

### Verified resolved (do not re-open)

One `<h1>` on the homepage. www/non-www/http all 301 to `https://www.q2m.io/`. Favicon paths, 404 `noindex`, Twitter cards, schema email, `CreativeWork`, `geoRadius`/`areaServed`, canonicals, hreflang, nl/fr depot pages, es/pt/nl/fr nav-link patching, `WebSite` schema node, AI crawlers in `robots.txt`, `llms.txt` email/service fixes, footer language links, `(Q2M)` brand signals, footer tagline and copyright translated, depot `Product`/`Offer` invalid-items error (removed in #56), depot EmailJS now lazy-loaded, projects Google Fonts non-blocking, sitemap `lastmod` automated, README rewritten, schema + visible address now "71 Warren Road" (all PR #58), homepage FAQ + `FAQPage` schema, expanded `llms.txt` and new `llms-full.txt` (#60), `.txt` files now served as `charset=UTF-8` (#62), About and Privacy pages in 5 languages with consent notice under both forms (#64), top-menu About link opens `/about.html` (#65), leftover English on the language pages translated (#66, #67, #68).

---

## Session 20 — Search Console Diagnosis, Brand/Indexing Fix, Footer i18n

**Date:** 2026-10-12
**PRs:** [#54](https://github.com/brandonr2630/q2m-website/pull/54), [#55](https://github.com/brandonr2630/q2m-website/pull/55), [#56](https://github.com/brandonr2630/q2m-website/pull/56) and [#58](https://github.com/brandonr2630/q2m-website/pull/58), [#60](https://github.com/brandonr2630/q2m-website/pull/60), [#61](https://github.com/brandonr2630/q2m-website/pull/61) and [#62](https://github.com/brandonr2630/q2m-website/pull/62), [#64](https://github.com/brandonr2630/q2m-website/pull/64), [#65](https://github.com/brandonr2630/q2m-website/pull/65), [#66](https://github.com/brandonr2630/q2m-website/pull/66), [#67](https://github.com/brandonr2630/q2m-website/pull/67) and [#68](https://github.com/brandonr2630/q2m-website/pull/68), [#70](https://github.com/brandonr2630/q2m-website/pull/70), [#71](https://github.com/brandonr2630/q2m-website/pull/71) and [#72](https://github.com/brandonr2630/q2m-website/pull/72) (plus the handoff updates in #57, #59, #63, #69) — merged, deployed, verified live.

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
| Technical fixes (#58) | Five independent fixes built in parallel (one worktree each) and merged as one PR: **depot EmailJS** now loads on first interaction with `#eq-form` via `loadEmailJS()` (a cached Promise; submit waits on it and retries if the CDN fails; no email is sent until the user submits); **projects fonts** use the `media="print"` swap + `<noscript>` pattern; **sitemap** `lastmod` is set by `scripts/update-sitemap-lastmod.js` (last commit date of each URL's source file, today if uncommitted; run by `build-all` or `npm run update-sitemap`; warns and leaves entries unchanged in shallow clones); **README** rewritten; **address** `71 Warren Road, Bejucal, Cunupia` in both schema nodes and the three visible address strings, matching the Business Profile. |
| FAQ + llms (#60) | **Visible 7-question FAQ** (`<section id="faq">`, `<details class="faq-item">` accordions, between Services and Contact) with `faq_*` i18n keys in all 5 languages. **`FAQPage` JSON-LD** whose text equals the visible text; `build-lang-pages.js` translates it per language page (own `@id`, `inLanguage`). **`llms.txt`** rewritten (fixed the `q2hub@` typo, 71 street number, operating since 2013, industries, depot with prices on request, projects, FAQ, language URLs) and new **`llms-full.txt`** (about 7,000 chars: services, the 7 depot items, both projects, markets, FAQ, contact incl. WhatsApp). Decision: say **"since 2013"** (founding year given by the owner), never a running "15+ years" number that goes stale; no certification, response-time or other unverified claims; no email address in the FAQ (keeps the page's email obfuscation). |
| Charset (#61, #62) | `llms.txt`, `llms-full.txt` and `robots.txt` were served as `text/plain` with no charset, so "Q²" could be misread. `AddCharset UTF-8 .txt` (#61) was **ignored** by this server; `AddDefaultCharset UTF-8` (#62) works and now sends `charset=UTF-8` on text responses (HTML and JSON too, harmless). |
| About + Privacy (#64) | New **`about.html`** and **`privacy.html`** (+ es/pt/nl/fr) generated by the new **`scripts/build-static-langs.js`** (in `build-all`); page text lives in each page's `translations` object (`data-i18n` for plain text, `data-i18n-html` where a translation contains links/markup), per-language title/description in **`scripts/static-pages-meta.json`**. About = confirmed facts only. Privacy = what the forms collect, EmailJS delivery, no cookies/analytics (only a `sessionStorage` flag `q2m-lang-redir`), third parties (Google Fonts, jsDelivr, hosting), contact email assembled by JS. Footer links to About + Privacy on all pages; translated consent notice under both enquiry forms; homepage About section links to `/about.html`; `AboutPage`/`WebPage` + `BreadcrumbList` schema; sitemap now 25 URLs; `llms.txt`/`llms-full.txt` link both pages. |
| Menu link (#65) | Top-menu (desktop + mobile) About link was still `#about` on the homepage, so the new page was only reachable from the footer. Now `/about.html` (per language) on every page. The homepage About section is reached by scrolling. |
| Translation leftovers (#66, #67, #68) | A scan of every generated page for visible text outside a translation key found English on es/pt/nl/fr: About-page CTA headline (#66); homepage "Depot" links, hero buttons, "Scroll", arrow hint, "Get Directions", the 9 service-dropdown options, and the projects heading, CTA and "Loading projects…" (#67); the homepage "Projects" menu link, which had a `data-i18n` hook but **no `nav_projects` key in any language block** (#68). Dropdown options keep their **English `value`** so enquiry emails are unchanged. |
| Dutch "Engineering" (#70) | The Dutch pages kept "Engineering" in English where es/pt/fr translate it (hero heading "PLANT ENGINEERING & PRODUCTIE", About title, projects heading, service sub-lists, a hero sentence, my own FAQ/About copy, the Dutch homepage `<title>`/description). Now "Techniek & Productie", "Precisie Techniek Oplossingen", "Technische Projecten", "Proces- en Technisch Ontwerp", etc. The first choice "Industriële Techniek & Productie" measured 385px and would be clipped on a 390px phone, so the shorter heading was used. New offline check: no English technical words inside es/pt/nl/fr translations or generated titles. |
| Hero clipped on phones (#71) | On a 390px phone the homepage hero block was 403–469px wide in es/pt/nl/fr (English 358px), so description, tagline and tags were cut off on the right. Three causes: `applyTaglinePulse()` turned every space into `&nbsp;` (tagline could never wrap), a `&nbsp;` between the two tagline parts in the markup, and `.hero-content` (a flex item) had `min-width:auto`. Fixed with normal spaces and `min-width: 0`. Verified live at 390px in all 5 languages; 320px locally. |
| Privacy wording (#72) | Owner request: the server-logs sentence no longer names GreenGeeks ("Our hosting provider may keep…"), all 5 languages. |
| Copyright i18n (#55) | "All rights reserved." wrapped in `<span data-i18n="footer_rights">` on all three source pages, keys for 5 languages. |

### Lessons (new this session)

1. **Do not name a custom footer element `<nav>`.** The site's global `nav { position: fixed; top: 0 }` CSS pins it under the header, so it renders hidden although the markup is correct. Use a `div` with `role="navigation"`.
2. **A markup check is not a rendering check.** Scripted checks passed while the row was hidden and, on `depot.html`, unstyled (a silent `str.replace` missed its anchor because of one space). Assert the CSS exists and measure layout in a browser.
3. **`applyTranslations()` replaces `textContent`.** `data-i18n` on an element that contains `<span id="footer-year">` or `<sup>` destroys that markup. Wrap only the translatable phrase in its own span.
4. **Python `str.replace` does nothing, silently, when the anchor is missing.** Assert the replacement count or that the output changed.
5. **Check for CRLF before scripting edits** to source files; normalise, edit, restore.
6. **Use a clean `git worktree` off `origin/master`** when the main checkout holds uncommitted WIP — create it **inside the repo** at `.worktrees/<name>` (excluded via `.git/info/exclude`), never in Temp.
7. **Do not mark up a `Product` without a price.** An `Offer` needs `price` (or a `priceSpecification`); currency + availability alone makes the item invalid. For price-on-request stock use plain `Thing`/`ListItem` markup. Never fake a price (e.g. `0`) — Google treats that as misleading. If prices are ever published, add a `price` field to `listings.json` and restore `Product` + `Offer` only for items that have one.
8. **Parallel fixes:** give each fix its own worktree under `.worktrees/` with disjoint files, write the pass/fail check *first* (scripted, with a negative control that fails on unmodified master), merge the branches into one integration branch, confirm `npm run build-all` leaves no diff, then open one PR.
9. **Treat sub-agent reports as claims.** Re-run the checks yourself and read the diff: one agent fixed the schema address but left three visible address strings, and another caught that `upscale-images.js` never watermarked (the old docs said it did).
10. **Markup checks are not behaviour checks:** for JS changes, load the page and observe the network (EmailJS: 0 requests on load, 1 after focusing the form) and `document.fonts`; do not submit real forms (it emails the business).
11. **Server config needs a live check:** `AddCharset` in `.htaccess` was accepted but did nothing on this host; `AddDefaultCharset` worked. After any `.htaccess` change, `curl -I` the real header and re-check that key pages still return 200 and the redirects still 301. `.htaccess` is site-wide; a syntax error 500s everything, so keep edits small and wrap optional directives in `<IfModule>`. The repo also has a dead `htaccess` (no dot) and the HTTPS redirect is written twice in `.htaccess`.
12. **Schema must match visible text:** `FAQPage` markup is only valid when the same text is on the page. The oracle compares the JSON-LD with the rendered `<details>` text in every language, and was mutation-tested (break the schema only, break a year, delete an item) to prove it can fail.
13. **Check at the right viewport:** the in-app browser pane can report a 0px-wide viewport; set an explicit size with `resize_window` before measuring overflow, then reset it to desktop.
14. **A translation hook is not a translation.** Three different bugs shipped because a check passed on the wrong thing: (a) a copied section (`#cta-title`) relied on script in the source page that the new page did not have; (b) static HTML text with no `data-i18n` at all; (c) `data-i18n="nav_projects"` with no value in any language block. Check all three: every visible text element sits behind a key, every key used in markup has a value in all five languages, and the rendered text equals the source translation.
15. **Run the check against the broken version first.** A check that has never failed proves nothing: confirm each new oracle fails on current master and on deliberate breakages (mutation tests), and watch for "all caught" results that are really a failing baseline.
16. **`data-i18n` replaces `textContent`.** Never put it on an element that also holds icons or other elements (scroll indicator, map button); wrap only the words in a `<span data-i18n>`. Elements set by id in script (`#proj-title`, `#cta-title`) also get `data-i18n` so the static build translates them.
17. **Contrast:** secondary text must be at least 4.5:1; the first form-notice colour (`--text-3` on near-black) was about 2:1. Measure with computed styles, not by eye.
18. **Live-check after every deploy, not just the build:** the post-deploy fetch of the real pages is what found the missing `nav_projects` key.
19. **Mixed/duplicate files:** `projects.html`'s id-based script and `about.html`'s generated script are different; when copying a section between pages, copy its script behaviour too.
20. **A word list only finds the words you thought of.** The Dutch "Engineering" bug survived an English-word check until the check was widened. Compare against the other languages (what do es/pt/fr do with this term?) and read the text once; do not rely on a list.
21. **A test that fails for the wrong reason proves nothing.** Three times a deliberate-breakage test "passed" because the baseline was already failing, or the pattern did not exist in the copy. Check the failure message names the thing you broke, and that the mutation actually changed the file.
22. **A flex item with `min-width:auto` can push a whole block off a phone screen.** One long nowrap child sets the minimum width of its flex parent; measure the block's width at 390px and 320px in every language, not only English. Also: an animation script that rewrites spaces as `&nbsp;` stops text from wrapping.
23. **Do not name the host in legal text** unless the policy has been read: the owner removed "GreenGeeks" from the privacy wording; `README.md`/`CLAUDE.md` still name it as the deployment host.

### Notes

- In-app browser screenshots time out on very long pages; use DOM measurements (bounding rects, computed style) as evidence for layout checks.
- Search Console exports used: *Performance on Search*, *Performance on Search – Generative AI Features* (impressions only, tiny — not representative), and *Coverage*. Exports end ~2026-10-08/10 due to reporting lag.

---

## Session 21 — Products section (OCR RP Series reducers)

**Date:** 2026-10-13

Added the Products section: hub `/products/` and the OCR RP Series shaft-mounted gear reducers page in 5 languages (10 pages), Products in the nav and footer on all pages, a link from the reducers service page, and 10 new sitemap URLs. Details and open questions are in Open Items §2.

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
| 20 | 2026-10-12 | Search Console diagnosis; footer language links, Q2M brand signals, footer i18n, depot schema fix, lazy EmailJS, non-blocking projects fonts, sitemap lastmod script, README rewrite, address match, homepage FAQ + FAQPage schema, llms.txt/llms-full.txt, UTF-8 charset, About + Privacy pages, menu link, translation leftovers, Dutch wording, hero on phones, privacy wording (PRs #54–#72). |
| 21 | 2026-10-13 | Products section: hub and OCR RP Series reducers page in 5 languages, Products nav/footer link, services cross-link, 10 sitemap URLs, `build-product-pages.js` and `verify-products.js`. |

---

## References

- **Repository:** https://github.com/brandonr2630/q2m-website
- **Live site:** https://www.q2m.io
- **Deploy workflow:** `.github/workflows/deploy.yml` → `brandonr2630/projects/.github/workflows/deploy.yml@master`
- **Build scripts:** `scripts/build-lang-pages.js`, `build-depot-langs.js`, `build-projects-langs.js` (`npm run build-all`); `scripts/update-sitemap-lastmod.js` (sitemap dates, also run by `build-all`); `scripts/upscale-images.js` only upscales/converts to `-upscaled.webp` — it does **not** watermark (the Session 7/12 watermarking was done with an ad-hoc `sharp` script that was never committed)
- **Project board:** https://github.com/users/brandonr2630/projects/1
