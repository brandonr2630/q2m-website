# Products catalogue (stages 1 + 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the McMaster-style Products catalogue (hub tiles, category tiles, family page with spec table, filters and quote buttons) with one launch family, the OCR RP Series, in 5 languages.

**Architecture:** One data file (`scripts/products-data.js`) holds a node tree and UI strings; `scripts/products-tree.js` validates it and computes the published set and URLs; `scripts/build-product-pages.js` clones the `about.html` shell (as `build-service-pages.js` does) and writes static hub, category and family pages plus sitemap and `llms*.txt` blocks; filters are a small inline script. The rating rows are generated from a committed CSV by an importer, never retyped.

**Tech Stack:** Node (CommonJS), `cheerio`, `sharp` (both already in `scripts/package.json`), vanilla JS, no test framework (plain `node:assert` scripts run with `node`).

**Spec:** `docs/superpowers/specs/2026-10-14-products-catalogue-design.md` (read it first; section numbers below refer to it). Stage 2 (search) is a separate later plan.

## Global Constraints

- Own wording only; no prices; no `Product`/`Offer` schema (spec §3.5; handoff lesson 7).
- Nothing from `assets/ocr/` is committed or deployed: the catalogue PDF is source only. Only generated images under `assets/products/ocr-rp/` are committed.
- Page contact details are Q² Machines' standard ones; one link to OCR's website (`https://www.ocr-riduttori.com`, confirm it before use) is allowed. No oil-maker names on the page.
- Slugs English in every language; language pages under `/es/ /pt/ /nl/ /fr/` with root-relative asset paths (lesson 3). Every string in all 5 languages (lessons 14, 16).
- Tree is `<div role="navigation" aria-label>`, never `<nav>` (lesson 1). No `--text-3` for text. No `localStorage`, `document.cookie` or third-party requests on Products pages.
- Generated HTML is CRLF; `npm run build-all` must be idempotent (second run, no diff).
- Single/double-reduction labels from the extraction are an unverified grouping guess: do NOT publish them; the table has no stage column.
- Meta descriptions ≤ 160 characters. Decimal separator is a point in all languages.
- Use a worktree off `origin/master` (`.worktrees/products-structure`, branch `feat/products-structure`), conventional commits. Never commit direct to `master`.
- `.htaccess` is not touched (old OCR URLs are 404, nothing to redirect).

## Review Focus

- Filter min greater than max, or empty/`abc` values in `?kw-min=` → no crash, ignored or "no models match" (Task 6).
- A node with empty `rows` and no live copy stays unpublished: no file, tree link, sitemap URL or `llms` line (Task 2 test, Task 8 verifier).
- A dimension or photo file referenced in data but missing on disk → build fails naming the file (Task 4).
- Quote link `item` containing `<script>`, quotes or >60 chars is ignored by the form prefill and never overwrites text the visitor already typed (Task 7).
- Browser with JS off: the full 280-row table is visible, no empty filter bar (Task 6 browser check).

---

### Task 1: Assets, sources and images

**Files:**
- Modify: `.gitignore` (add `assets/ocr/`)
- Create: `scripts/products-data/ocr-rp-rating.csv` (copy of the verified extraction, source of truth for rows)
- Create: `scripts/build-product-images.js`
- Create (generated, committed): `assets/products/ocr-rp/tile.webp`, `tile.jpg`, `hero.webp`, `hero.jpg`, `dim-85.webp` … `dim-250.webp` (8)
- Modify: `scripts/package.json` (script `build-product-images`)

**Interfaces:**
- Produces: image files with the names above; `build-product-images.js` exports nothing and is run manually (not in `build-all`).

- [ ] **Step 1:** Copy `C:/Users/brand/AppData/Local/Temp/claude/92ed5f8a592859d9/7c650761-cd96-46c4-852d-7831d3e4c839/scratchpad/ocr/ocr-table.csv` to `scripts/products-data/ocr-rp-rating.csv`. Copy the 8 PNGs from that folder's `dims/ocr-rp<size>-dimensions.png` into `Z:/09-DevPro/projects/q2m-website/assets/ocr/dims/` (untracked source folder). Add `assets/ocr/` to `.gitignore`. Confirm `git status` shows no file under `assets/ocr/`.
- [ ] **Step 2:** Write `scripts/build-product-images.js` using `sharp`. Source root from env `OCR_SRC` (default `Z:/09-DevPro/projects/q2m-website/assets/ocr`). Outputs: `tile` from `pics/IMMAGINE-RP85.jpg` (square 600×600, `fit: contain`, white background), `hero` from `pics/P1101652.jpg.jpeg` (max width 1200, EXIF-rotated), `dim-<size>` from `dims/ocr-rp<size>-dimensions.png` (max width 1400, WebP q82, no JPG fallback). `tile` and `hero` also get a JPG fallback. Print width×height of each output and exit non-zero if any source is missing.
- [ ] **Step 3:** Run `cd scripts && node build-product-images.js`. Expected: 12 files written under `assets/products/ocr-rp/`, sizes printed; open `tile.jpg` and `hero.jpg` once to confirm orientation and that no person is identifiable.
- [ ] **Step 4:** Commit: `git add .gitignore scripts assets/products/ocr-rp && git commit -m "feat(products): OCR RP images and rating source CSV"`.

### Task 2: Tree helpers and tests

**Files:**
- Create: `scripts/products-tree.js`, `scripts/test-products-tree.js`

**Interfaces:**
- Produces (all CommonJS exports of `products-tree.js`):
  - `LANG_CODES: ['en','es','pt','nl','fr']`
  - `validate(nodes: Node[], opts?: {ui?: object}): void` throws `Error` whose message names node id and field
  - `published(nodes: Node[]): Set<string>` (ids)
  - `childrenOf(nodes, id: string|null): Node[]` sorted by `order`
  - `pathTo(nodes, id): Node[]` root→node
  - `nodeUrl(nodes, id: string|null, lang: string): string` e.g. `nodeUrl(n,'ocr-rp-series','es') === '/es/products/gear-reducers/ocr-rp-series/'`, `nodeUrl(n,null,'en') === '/products/'`
- Node shape (from spec §4): `{id, parent, slug, order, name{5}, description{5}, tileImage?{file,w,h,alt{5}}}`; categories add `intro{5}`; families add `brand`, `serviceParam`, copy blocks, `images`, `dimensions`, `specs{columns,rows}`. A family is **populated** when `specs.rows.length > 0` or `live === true`.

- [ ] **Step 1:** In `test-products-tree.js` write failing tests (assert) with an inline 4-node fixture: `published` returns ancestors of a populated family and excludes an empty sibling family (`published(n).has('empty')===false`); `nodeUrl` cases above; `validate` throws with the node id for: duplicate sibling slug, unknown `parent`, a parent cycle, missing `es` name, `description` of 161 chars, slug `Bad_Slug`, a row key not in `columns`.
- [ ] **Step 2:** Run `cd scripts && node test-products-tree.js`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement `products-tree.js` to the signatures above; `validate` collects nothing, it throws on first problem with `"<node id>: <field>: <reason>"`.
- [ ] **Step 4:** Run the test again. Expected: `all tree tests passed`.
- [ ] **Step 5:** Commit: `feat(products): tree helpers and validation`.

### Task 3: Spec-table importer

**Files:**
- Create: `scripts/import-spec-table.js`, `scripts/test-import-spec-table.js`, `scripts/products-data/ocr-rp-rows.js` (generated, committed)
- Modify: `scripts/package.json` (`import-table`)

**Interfaces:**
- Produces: `importRating(csvText: string): Row[]` exported from `import-spec-table.js`; `Row = {id, model, size, ratio, n2, n1, kw, torque}` (numbers except `id`, `model`, `size` strings); CLI `node import-spec-table.js <csv> <out.js>` writes `module.exports = [...]` and prints row count.
- Consumes: the long-format CSV columns `table,source_page,size,ratio,quantity,unit,value`.

- [ ] **Step 1:** Failing tests: with a 8-line CSV fixture (two rating blocks, `output_rpm,input_rpm,power_kw,torque_nm` repeated per row) `importRating` returns rows in file order with `id === 'RP85-3.64-355'` (`RP<size>-<ratio>-<n2>`), `model === 'RP 85'`, `kw === 5.95`; ids are unique; a row group missing one of the four quantities throws naming the line; a value with a comma decimal throws; non-rating tables (`weights`, `input_speed`, `efficiency_*`) are skipped.
- [ ] **Step 2:** Run it, expect FAIL. Implement: group each four consecutive rating lines `(n2,n1,kw,torque)` by size/ratio; parse numbers with `Number`; reject non-finite values.
- [ ] **Step 3:** Run the real import: `node import-spec-table.js products-data/ocr-rp-rating.csv products-data/ocr-rp-rows.js`. Expected: `280 rows`. Also assert in the test that the generated file has 280 rows, 8 distinct sizes, and `Math.max(...kw) === 155` and `Math.max(...torque) === 11280`.
- [ ] **Step 4:** Commit: `feat(products): spec-table importer and OCR RP rating rows`.

### Task 4: Data file (copy migration + OCR node)

**Files:**
- Create: `scripts/products-data.js`
- Reference (do not restore): `git show 7440a82^:scripts/product-pages-content.js` (the 5-language OCR copy and hub text), `docs/superpowers/specs/2026-10-14-products-catalogue-design.md` §4

**Interfaces:**
- Produces: `module.exports = { UI, NODES }`. `UI` is `{ <key>: {en,es,pt,nl,fr} }` and must include these keys (used by Tasks 5-7): `products`, `all_categories`, `categories`, `crumb_home`, `request_quote`, `filter_models`, `filter_all`, `filter_clear`, `filter_count` (contains `{n}` and `{total}`), `filter_none`, `col_model`, `col_size`, `col_ratio`, `col_n2`, `col_n1`, `col_kw`, `col_torque`, `spec_caption`, `dims_heading`, `dims_weight` (contains `{kg}`), `quote_prefill` (contains `{model}`), `enquire_cta`, `brand_link`.
- `NODES`: `gear-reducers` (category, order 10, tile image `assets/products/ocr-rp/tile.webp`) and `ocr-rp-series` (family, `live: true`, `serviceParam: 'reducers'`, `brand: {name:'O.C.R. Riduttori', url}`, `images: [hero]`, `dimensions: [{size, file:'assets/products/ocr-rp/dim-<size>.webp', w, h, weightKg, alt{5}}]` ×8 with weights 18, 27, 41, 62, 87, 107, 188, 315, `specs: {columns, rows: require('./products-data/ocr-rp-rows')}`). Columns: model (text, sticky), size (enum, filter select), ratio (number, filter range), n2 (number, unit rpm), n1 (number, unit rpm), kw (number, unit kW, filter range), torque (number, unit Nm, filter range).

- [ ] **Step 1:** Write `scripts/test-products-data.js`: loads `products-data.js`, runs `validate(NODES)` (no throw), asserts `published` equals `{gear-reducers, ocr-rp-series}`, every `dimensions[i].weightKg` equals the CSV `weight_kg` for that size (read `products-data/ocr-rp-rating.csv` independently), `rows.length === 280`, every referenced image file exists on disk, every `UI` key above exists with 5 non-empty languages, and no string in any node contains the words `Agip`, `Shell`, `Mobil`, `Castrol`, `Danfoss`. Run: expect FAIL.
- [ ] **Step 2:** Build `products-data.js`. Move the OCR copy from the history file into the family node unchanged (same wording: that makes the rendered copy a no-op diff); keep `titles`, `lead`, `facts`, `how`, `build`, `apps`, `support`, `faq`. New text you write (UI strings, category intro, tile and dimension alt text, `quote_prefill` like "Enquiry about {model}: ") gets all 5 languages; mark nl/fr new strings in a `// native review` comment.
- [ ] **Step 3:** Cross-check migrated numbers against the extraction: add to the test a check that every number in the family's English `facts` appears in `C:/Users/brand/AppData/Local/Temp/claude/92ed5f8a592859d9/7c650761-cd96-46c4-852d-7831d3e4c839/scratchpad/ocr/technical-facts.md` or in the rows; fix the data (or note a mismatch to the owner) for any number that does not. Do not "fix" by editing the facts file.
- [ ] **Step 4:** Run `node test-products-data.js`. Expected: passes.
- [ ] **Step 5:** Commit: `feat(products): catalogue data with OCR RP node`.

### Task 5: Build script: hub, category, family pages, tree, breadcrumbs

**Files:**
- Create: `scripts/build-product-pages.js`
- Modify: `scripts/package.json` (`build-product-pages`; add `node build-product-pages.js` to `build-all` before `update-sitemap-lastmod.js`)
- Reference: `scripts/build-service-pages.js` (shell cloning, hreflang, schema helpers) and `git show 7440a82^:scripts/build-product-pages.js` (previous Products build; reuse its structure)

**Interfaces:**
- Consumes: `products-data.js`, `products-tree.js` (Tasks 2, 4).
- Produces: writes `products/index.html`, `products/<cat>/index.html`, `products/<cat>/<family>/index.html` and the same under `es/ pt/ nl/ fr/`; exports nothing. Page markup contracts used by Tasks 6 and 8: tree `div.cat-tree[role=navigation]`; breadcrumb `div.crumbs[role=navigation] ol`; tile grid `ul.tiles > li > a.tile`; family sections in this order: `.crumbs`, `h1`, `.fam-desc`, `.fam-hero`, `section#specs` (when rows exist), `section#dimensions`, copy sections (`facts how build apps support faq`), CTA.

- [ ] **Step 1:** Write the failing check first as `scripts/verify-products.js --quick` (created fully in Task 8): for now a throwaway script that asserts 15 expected files exist (3 pages × 5 languages) and the English hub contains exactly one `a.tile` pointing at `/products/gear-reducers/`. Run it; expect FAIL (files missing).
- [ ] **Step 2:** Implement the build. Required behaviour:
  - Hub: H1 "Products", "All Categories" heading, tile grid of published top-level nodes, tree rail on desktop (spec §5, §6), no search box (stage 2). Category page: breadcrumb, intro, tile grid of direct published children. Family page per the section order above.
  - Tile = one link, square image area (`width`/`height` set, `loading="lazy"` except the first row), name below; a node without `tileImage` renders a text-only tile (spec §5). CSS in one `<style>` block scoped under `.products-page`.
  - Tree: nested `ul`, ancestors in `<details open>`, `aria-current="page"` on the current node, only published nodes, language-prefixed hrefs.
  - JSON-LD: `CollectionPage` + `ItemList` + `BreadcrumbList` for hub and category; `WebPage` + `Brand` + `BreadcrumbList` + `FAQPage` for the family (visible FAQ text identical, lesson 12); reference `#organization`/`#website`; no `Product`/`Offer`.
  - `hreflang` set computed from the node (5 + `x-default`); canonical in place (lesson 1 of Key Lessons); root-relative assets; the `.footer-langs a` exclusion kept.
  - Dimensions section: 8 `<figure>` elements, each `<img>` with width/height, `loading="lazy"`, alt from data, `<figcaption>` "RP 85 · weight 18 kg" using `UI.dims_weight`.
  - Request-quote and CTA links: `/?service=reducers#contact` (language-prefixed on language pages); per-row links `&item=<row id>` (Task 6).
  - Delete stale generated files only under `products/` and the 4 language `products/` trees that are no longer in the published set.
  - Fail the build, naming the file, if any image referenced by data is missing on disk.
- [ ] **Step 3:** Run `cd scripts && node build-product-pages.js`. Expected: prints the page count (3 × 5 = 15) and no error. Re-run the throwaway check: passes. Run twice and `git status --short` is identical between runs.
- [ ] **Step 4:** Mutation: temporarily point one `dimensions[0].file` at a missing path; build must exit non-zero naming that path. Revert and confirm the file changed back (`git diff --stat` shows the data file clean).
- [ ] **Step 5:** Commit: `feat(products): generate hub, category and family pages`.

### Task 6: Spec table and filters

**Files:**
- Modify: `scripts/build-product-pages.js` (table renderer, inline script injection)
- Create: `scripts/products-filters.js` (the client script, read by the build and inlined at end of body)

**Interfaces:**
- Consumes: the family `specs` object and `UI` keys from Task 4.
- Produces: `<table class="spec-table">` with `<caption>`, `<th scope="col">`, `<th scope="row">` model cell, `<tr id="<row id>" data-size data-ratio data-n2 data-n1 data-kw data-torque>`, last cell "Request quote" link `…&item=<row id>#contact`; an inline `<script type="application/json" id="filter-defs">` with column definitions and translated strings; the client script exposes no globals.

- [ ] **Step 1:** Write `scripts/test-products-filters.js` using `node:vm` with a minimal DOM stub, or (preferred) a Playwright script against `python -m http.server` from the repo root, asserting for the English family page: 280 `tr` rows; picking size 105 shows only that size's rows and the count reads "35 of 280"; `kw-min=5&kw-max=10` gives only rows with 5 ≤ kw ≤ 10; both filters together give the intersection; Clear restores 280 and disables itself; min > max shows the "no models match" row and does not throw; `?kw-min=abc` is ignored; reloading with `?size=105` restores the filter; hidden rows have the `hidden` attribute. Run: expect FAIL.
- [ ] **Step 2:** Implement the table in the build (full table in HTML, spec §7.1) and `products-filters.js` (spec §7.2: select for `enum`, two `input type=number inputmode=decimal` for `number` filter columns, visible labels, `role=status aria-live=polite` count debounced ~300 ms, `history.replaceState` for the query, filters in a `<details class="filters">` below 900 px, scroll container `tabindex=0` with an accessible name, sticky model column on phones). Skip all work when no `.spec-table` exists. Table, filters and model rows carry no unit text in cells; units are in headers.
- [ ] **Step 3:** Rebuild and run the test from step 1 plus a JS-disabled check (Playwright `javaScriptEnabled: false`): all 280 rows visible, no `.filters` element rendered visibly.
- [ ] **Step 4:** Mutation: change one `data-kw` in a generated page by hand; Task 8's table check must fail later; here confirm the filter test fails when `data-kw` is wrong, then rebuild to restore.
- [ ] **Step 5:** Commit: `feat(products): spec table with progressive filters`.

### Task 7: Navigation links and quote prefill

**Files:**
- Modify: `index.html`, `about.html`, `depot.html`, `projects.html`, `scripts/build-lang-pages.js`, `scripts/build-depot-langs.js`, `scripts/build-projects-langs.js`, `scripts/build-static-langs.js`, `scripts/build-service-pages.js` (and their content/translation objects) to restore the "Products" nav item (desktop and mobile menu), footer link and `nav_products` key in 5 languages, and the `/products/` link rule.
- Reference: reverse-apply only the nav/footer/link-rule hunks of `git show 7440a82` (the commit that removed them); do not reverse-apply the removal of build scripts.
- Modify: the `?service=` IIFE in `index.html` (about line 2303) and one `translations` key in each of the 5 language blocks for the prefill template.

**Interfaces:**
- Produces: `nav_products` key (5 languages) and `?item=` support. The prefill reads `item` with `^[A-Za-z0-9 ._/-]{1,60}$`; if valid and `#cf-message` is empty it sets the value to `quote_prefill` with `{model}` replaced by the item id; it never submits.

- [ ] **Step 1:** Failing check (Playwright, local server): on the English home page `a[href="/products/"]` exists in the desktop and mobile menus and the footer; on the es page the link is `/es/products/`; loading `/?service=reducers&item=RP85-3.64-355#contact` fills `#cf-message` with the template; loading with `item=<script>x</script>` and with an item of 61 characters leaves it empty; a message already typed is not overwritten. Run: expect FAIL.
- [ ] **Step 2:** Apply the nav/footer restore and the prefill IIFE change. Template text in all 5 languages; the `item` value is inserted as text, never as HTML.
- [ ] **Step 3:** Run `cd scripts && npm run build-all`. Expected: no error; `git diff --stat` shows only intended files; run it a second time, no further diff. Re-run the Step 1 check: passes.
- [ ] **Step 4:** Commit: `feat(products): nav and footer links, quote prefill`.

### Task 8: Sitemap, llms blocks and verifier

**Files:**
- Modify: `scripts/build-product-pages.js` (write delimited blocks), `sitemap.xml` (add `<!-- products:start -->` / `<!-- products:end -->`), `llms.txt`, `llms-full.txt` (same delimiters), `scripts/update-sitemap-lastmod.js` (map `/products/…` URLs to their source files)
- Create: `scripts/verify-products.js` (reuse structure from `git show 7440a82^:scripts/verify-products.js`)
- Modify: `scripts/package.json` (`verify-products`)

**Interfaces:**
- Produces: `node verify-products.js` exits 0 and prints `0 failed`; sections: `tree`, `breadcrumbs`, `populated`, `i18n`, `table`, `sitemap`, `llms`, `tracking`, `contrast`, `assets`.

- [ ] **Step 1:** Write the verifier (spec §11.1 minus search and redirects): tree lists exactly the published nodes with one `aria-current`; breadcrumb text equals `BreadcrumbList` names/URLs; an unpublished fixture node (empty `rows`, `live` false, added in memory) leaks nowhere; no `assets/` path without a leading slash outside English; no `data-i18n`; no `<nav>` inside `.cat-tree`; table rows equal 280, every `data-*` equals its cell text, every row has `id` and a quote link with `item=`; sitemap `/products/` URLs equal published × 5 and every hreflang alternate is in the sitemap; the `llms*.txt` blocks list the published nodes; no `localStorage`, `document.cookie`, `gtag`, third-party `fetch(` in Products pages; no `--text-3` text colour in the Products CSS; every `<img src>` resolves on disk; no Agip/Shell/Mobil/Castrol/Danfoss anywhere in `products/`.
- [ ] **Step 2:** Run it against current `master` output (a temporary extra worktree on `origin/master`, where no Products pages exist) and record the failures; then run on this branch after `npm run build-all`. Expected: 0 failed.
- [ ] **Step 3:** Mutations, each shown failing with a message naming the thing, confirming the file changed first: delete a tree link; flip one `aria-current`; delete the `es` name of the family in a copy of the data; remove one products URL from `sitemap.xml`; change one `data-torque`; add `localStorage.x=1` to a generated page; add a `<nav class="cat-tree">`. Restore after each (`npm run build-all`; `git diff` clean).
- [ ] **Step 4:** Commit: `feat(products): sitemap and llms blocks, verify-products`.

### Task 9: Browser verification, docs, PR

**Files:**
- Modify: `handoff.md` (new session entry, replace Open Items §2), `CLAUDE.md` (Static websites: add the Products catalogue and its build scripts), `README.md` (scripts list)

- [ ] **Step 1:** Serve the repo root locally. At 1280, 390 and 320 px (explicit `resize_window`, lesson 13), in en and nl and fr: measure with `getBoundingClientRect` that no element is wider than the viewport on hub, category and family pages; tree rail 240 px at 1280; tiles ≥ 44 px tall on touch; model column stays visible when the table scrolls at 390 px; keyboard-only pass through filters; no console errors; zero 404 requests.
- [ ] **Step 2:** Lighthouse (mobile) on the hub, the category and the family page: accessibility ≥ 96, SEO 100, best practices 100, CLS 0; record LCP next to the baseline (home 1.1 s). Fix anything below target before continuing.
- [ ] **Step 3:** Update `handoff.md`, `CLAUDE.md`, `README.md` in the same commit (nl/fr native review list: "gear reducer", "shaft-mounted", "torque arm", "rated power", the new UI strings).
- [ ] **Step 4:** `git push -u origin feat/products-structure`, open a PR against `master` with the test evidence (verify-products `0 failed`, Lighthouse numbers, the mutation list). After merge, `curl -I` the 5 hub URLs (200), the family page and `llms.txt`, and fetch the live family page to confirm all 280 rows and 8 dimension images are in the served HTML. Owner then requests indexing in Search Console.
- [ ] **Step 5:** Final: `cd scripts && npm run build-all && node verify-products.js` (0 failed) and `git status` clean.
