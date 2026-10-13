# Products section (OCR RP Series reducers) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Products hub and an OCR RP Series gear-reducer product page, pre-rendered in en/es/pt/nl/fr, with "Products" in the nav, footer and sitemap of every page.

**Architecture:** A new `scripts/build-product-pages.js` mirrors `build-service-pages.js`: it takes the page shell (head, CSS, nav, footer, CTA) from `about.html`, bakes per-language text from `scripts/product-pages-content.js`, and writes `products/index.html`, `products/<slug>.html` and the four language copies. A new `scripts/verify-products.js` is the test suite (the repo has none): it is written first, fails, and goes green as tasks land.

**Tech Stack:** Node.js scripts with `cheerio` (already in `scripts/package.json`), static HTML/CSS/JS, no bundler.

**Spec:** `docs/superpowers/specs/2026-10-13-products-ocr-reducers-design.md`

## Global Constraints

- Own wording only for OCR content; do **not** reproduce OCR rating tables, drawings, logo or catalogue photos. No `<img>` on the new pages.
- Every figure on the product page must come from the verified-facts list in spec section 5.
- No prices, no `Product` or `Offer` JSON-LD types.
- All five languages are baked into static HTML. No client-side translation or `fetch` on the new pages.
- Meta descriptions are at most 160 characters (the builder throws otherwise).
- Do not claim a sales territory for OCR. Say "authorised agent" only.
- Branch naming: `feature/<desc>`; commits are conventional, lowercase, imperative, subject at most 72 characters, ending with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Never edit `archives/`. Do not touch `products.html`, `products.json` or `products-mockup.html` on any branch.
- Enquiry deviation from spec section 7 (needs owner OK): the product page does **not** embed a second EmailJS form. Its CTA button opens the existing home-page contact form with the service pre-selected (`/?service=reducers#contact`), exactly as the service pages do. This avoids duplicating EmailJS credentials and form code.

## Review Focus

- Nav links to `/products/` leak English hrefs into es/pt/nl/fr copies of pages built by builders that were not updated (index, depot, projects, about, privacy, services): pinned by the nav check in Task 2.
- A long Dutch/French/Spanish title or description exceeds 160 characters or breaks the page: pinned by the description-length check in Task 4.
- The 5-item key-facts strip or the long Dutch H1 ("Opsteektandwielreductoren") overflows at 375 px: pinned by the manual 375 px check in Task 5 and `overflow-wrap` CSS in Task 4.
- JSON-LD accidentally uses `Product`/`Offer` or fails to parse: pinned by the schema check in Task 1.
- `?service=reducers` does not pre-select "Motors & Gear Reducers" on the home page: pinned by a browser check in Task 2.
- Apostrophes in French strings (`l'agent`) break generated attributes or JSON-LD: pinned by JSON-LD parse and description checks in Task 1.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `scripts/verify-products.js` (create) | Test suite: nav, pages, schema, hreflang, link, sitemap checks. |
| `scripts/product-pages-content.js` (create) | `HUB` and `PAGES` content, five languages. |
| `scripts/build-product-pages.js` (create) | Generates 10 HTML files. |
| `scripts/package.json` (modify) | Add `build-product-pages`, `verify-products`; extend `build-all`. |
| `index.html`, `about.html`, `depot.html`, `projects.html`, `privacy.html` (modify) | Add Products to mobile menu, nav, footer; add `nav_products` strings; `reducers` key in the contact-form map (index only). |
| `scripts/build-lang-pages.js`, `build-depot-langs.js`, `build-projects-langs.js`, `build-static-langs.js`, `build-service-pages.js` (modify) | Keep `/products/` links inside the language directory. |
| generated: `{es,pt,nl,fr}/{index,about,depot,projects,privacy}.html`, `{,es/,pt/,nl/,fr/}services/*.html`, `{,es/,pt/,nl/,fr/}products/*.html` | Build output, committed. |
| `sitemap.xml` (modify) | 10 new URLs. |
| `handoff.md` (modify) | Record what shipped and the follow-ups. |

## Task 1: Test suite (written first, fails)

**Files:**
- Create: `scripts/verify-products.js`
- Modify: `scripts/package.json`

**Interfaces:**
- Produces: `node verify-products.js [nav] [pages] [sitemap]`; with no argument it runs all three. Exit code 1 if any check fails. Later tasks run it with a named section.

- [ ] **Step 1: Create the worktree and install dependencies**

```bash
cd "C:/Users/brand/OneDrive/Documents/Projects/q2m-website"
git fetch -q origin
git worktree add .worktrees/products-build -b feature/products-ocr-reducers origin/master
cd .worktrees/products-build/scripts
npm install --no-audit --no-fund
```

Expected: `node_modules/cheerio` exists. If the install is blocked, run later commands with `NODE_PATH="C:/Users/brand/OneDrive/Documents/Projects/q2m-website/scripts/node_modules"` instead.

- [ ] **Step 2: Write `scripts/verify-products.js`**

```js
#!/usr/bin/env node
/**
 * verify-products.js
 *
 * Checks the Products section (hub + OCR RP Series page, 5 languages), the Products nav link on
 * every page, and the sitemap entries.
 *
 * Usage:  cd scripts && node verify-products.js [nav] [pages] [sitemap]
 * No argument runs all three sections. Exit code 1 if any check fails.
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://www.q2m.io';
const SLUG = 'ocr-rp-series-shaft-mounted-gear-reducers';
const LANGS = [
  { code: 'en', dir: '',      html: 'en',    hreflang: 'en'    },
  { code: 'es', dir: 'es/',   html: 'es',    hreflang: 'es'    },
  { code: 'pt', dir: 'pt/',   html: 'pt-BR', hreflang: 'pt-BR' },
  { code: 'nl', dir: 'nl/',   html: 'nl',    hreflang: 'nl'    },
  { code: 'fr', dir: 'fr/',   html: 'fr',    hreflang: 'fr'    },
];

const args = process.argv.slice(2);
const want = (name) => args.length === 0 || args.includes(name);
let failures = 0;
let checks = 0;
function check(cond, msg) { checks++; if (!cond) { failures++; console.error('FAIL: ' + msg); } }
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf-8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const hubUrl = (l) => `${BASE}/${l.dir}products/`;
const pageUrl = (l) => `${BASE}/${l.dir}products/${SLUG}.html`;
const navHref = (l) => (l.dir ? `/${l.code}/products/` : '/products/');

// ── nav: Products link in mobile menu, desktop nav and footer of every page ─────────────
function verifyNav() {
  const base = ['index.html', 'about.html', 'depot.html', 'projects.html', 'privacy.html', 'services/index.html'];
  const services = fs.readdirSync(path.join(ROOT, 'services')).filter((f) => f.endsWith('.html') && f !== 'index.html').map((f) => 'services/' + f);
  const files = base.concat(services);
  for (const l of LANGS) {
    for (const f of files) {
      const rel = l.dir + f;
      if (!exists(rel)) { check(false, `${rel} is missing`); continue; }
      const $ = cheerio.load(read(rel));
      const href = navHref(l);
      for (const sel of ['#mobile-menu', '.nav-links', '.footer-links']) {
        check($(`${sel} a[href="${href}"]`).length === 1, `${rel}: ${sel} needs exactly one link to ${href}`);
      }
    }
  }
}

// ── pages: hub + product page in every language ─────────────────────────────────────────
function typesOf(graph) { return graph.map((n) => n['@type']); }

function verifyPage(l, kind) {
  const rel = `${l.dir}products/${kind === 'hub' ? 'index.html' : SLUG + '.html'}`;
  if (!exists(rel)) { check(false, `${rel} is missing`); return; }
  const raw = read(rel);
  const $ = cheerio.load(raw);
  const url = kind === 'hub' ? hubUrl(l) : pageUrl(l);
  const text = $('body').text();

  check($('html').attr('lang') === l.html, `${rel}: html lang should be ${l.html}`);
  check($('link[rel="canonical"]').attr('href') === url, `${rel}: canonical should be ${url}`);
  const desc = $('meta[name="description"]').attr('content') || '';
  check(desc.length > 40 && desc.length <= 160, `${rel}: meta description length ${desc.length} not in 41..160`);
  check(($('title').text() || '').trim().length > 10, `${rel}: empty title`);

  // hreflang: six alternates, correct hrefs
  const alts = {};
  $('link[rel="alternate"][hreflang]').each((_, el) => { alts[$(el).attr('hreflang')] = $(el).attr('href'); });
  check(Object.keys(alts).length === 6, `${rel}: expected 6 hreflang links, got ${Object.keys(alts).length}`);
  for (const x of LANGS) check(alts[x.hreflang] === (kind === 'hub' ? hubUrl(x) : pageUrl(x)), `${rel}: hreflang ${x.hreflang} wrong`);
  check(alts['x-default'] === (kind === 'hub' ? hubUrl(LANGS[0]) : pageUrl(LANGS[0])), `${rel}: x-default wrong`);

  // no client-side translation leftovers, no loading placeholder, no images
  check(!raw.includes('data-i18n'), `${rel}: still contains data-i18n attributes`);
  check(!/Loading catalogue|Cargando|fetch\('\/products\.json/.test(raw), `${rel}: contains loading placeholder or products.json fetch`);
  check($('.page-inner img').length === 0, `${rel}: product pages must not contain images in the content area`);
  check(!/ocr-riduttori\.com\/[^"']*\.(jpg|png|webp|svg)/i.test(raw), `${rel}: must not hotlink OCR images`);
  check(!/\$\s?\d|US\$|TT\$/.test($('.page-inner').text()), `${rel}: must not show prices`);

  // internal links stay in the language directory
  if (l.code !== 'en') {
    $('a[href^="/"]').not('.footer-langs a').each((_, el) => {
      const h = $(el).attr('href');
      check(h.startsWith(`/${l.code}/`), `${rel}: link ${h} should start with /${l.code}/`);
    });
  }

  // JSON-LD parses, no Product/Offer
  let graph = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try { const j = JSON.parse($(el).html()); graph = graph.concat(j['@graph'] || [j]); }
    catch (e) { check(false, `${rel}: JSON-LD does not parse (${e.message})`); }
  });
  const types = typesOf(graph);
  check(!types.includes('Product') && !types.includes('Offer'), `${rel}: JSON-LD must not use Product or Offer`);
  check(types.includes('BreadcrumbList'), `${rel}: missing BreadcrumbList`);

  if (kind === 'hub') {
    check(types.includes('CollectionPage'), `${rel}: missing CollectionPage`);
    const list = graph.find((n) => n['@type'] === 'ItemList');
    check(!!list && list.itemListElement.length >= 1, `${rel}: missing ItemList`);
    if (list) check(list.itemListElement[0].url === pageUrl(l), `${rel}: ItemList should list ${pageUrl(l)}`);
    check($(`a[href="${l.dir ? '/' + l.code : ''}/products/${SLUG}.html"]`).length >= 1, `${rel}: hub must link to the product page`);
  } else {
    check(types.includes('WebPage'), `${rel}: missing WebPage`);
    check(types.includes('Brand'), `${rel}: missing Brand`);
    const faq = graph.find((n) => n['@type'] === 'FAQPage');
    check(!!faq && faq.mainEntity.length >= 3, `${rel}: FAQPage needs at least 3 questions`);
    check(/OCR/.test(text), `${rel}: must name OCR`);
    for (const n of ['85', '250', '155']) check(text.includes(n), `${rel}: missing figure ${n}`);
    check($(`.cta-btn-primary[href$="service=reducers#contact"]`).length === 1, `${rel}: CTA must open the home form with service=reducers`);
    if (l.code === 'en') {
      for (const s of ['OCR RP Series', 'authorised agent', '0.6', '11,280', '0.98']) check(text.includes(s), `${rel}: missing "${s}"`);
    }
    check(!/\bterritor|exclusive/i.test(text), `${rel}: must not claim a sales territory or exclusivity`);
  }
}

function verifyPages() {
  for (const l of LANGS) { verifyPage(l, 'hub'); verifyPage(l, 'product'); }
}

// ── sitemap ─────────────────────────────────────────────────────────────────────────────
function verifySitemap() {
  const xml = read('sitemap.xml');
  for (const l of LANGS) {
    check(xml.includes(`<loc>${hubUrl(l)}</loc>`), `sitemap.xml: missing ${hubUrl(l)}`);
    check(xml.includes(`<loc>${pageUrl(l)}</loc>`), `sitemap.xml: missing ${pageUrl(l)}`);
  }
}

if (want('nav')) verifyNav();
if (want('pages')) verifyPages();
if (want('sitemap')) verifySitemap();
console.log(`${checks} checks, ${failures} failed`);
process.exit(failures ? 1 : 0);
```

- [ ] **Step 3: Add npm scripts**

In `scripts/package.json`, inside `"scripts"`, add after the `"update-sitemap"` line:

```json
    "verify-products": "node verify-products.js",
```

- [ ] **Step 4: Run it and confirm it fails**

Run: `cd scripts && node verify-products.js nav`
Expected: FAIL lines such as `index.html: #mobile-menu needs exactly one link to /products/`, final line `N checks, N failed`, exit code 1.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-products.js scripts/package.json
git commit -m "test: add verify-products checks for the Products section"
```

## Task 2: "Products" in the nav, footer, strings and link rules

**Files:**
- Modify: `index.html`, `about.html`, `depot.html`, `projects.html`, `privacy.html`
- Modify: `scripts/build-lang-pages.js:155-157`, `scripts/build-depot-langs.js:145`, `scripts/build-projects-langs.js:129`, `scripts/build-static-langs.js:41`, `scripts/build-service-pages.js` (the `PAGE_LINKS.has(href) || href.startsWith('/services/')` line)
- Modify (generated): `{es,pt,nl,fr}/{index,about,depot,projects,privacy}.html`, `{,es/,pt/,nl/,fr/}services/*.html`

**Interfaces:**
- Produces: translation key `nav_products` in all five translations objects of each source page (values: Products, Productos, Produtos, Producten, Produits). The Task 4 builder reads `aboutT[code].nav_products` indirectly because it clones `about.html`.
- Produces: nav link `<a href="/products/" data-i18n="nav_products">` placed immediately after the Services link in the mobile menu, desktop nav and footer.

- [ ] **Step 1: Confirm the nav check fails**

Run: `cd scripts && node verify-products.js nav`
Expected: many FAIL lines (it was already failing in Task 1).

- [ ] **Step 2: Add the nav links and strings with a one-off script**

Save the following as `scripts/_add-nav-products.js` (it is deleted after use, never committed), then run `node _add-nav-products.js` from `scripts/`:

```js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const NL = String.fromCharCode(10), CR = String.fromCharCode(13);
const FILES = ['index.html', 'about.html', 'depot.html', 'projects.html', 'privacy.html'];
const MAP = { Projects: 'Products', Proyectos: 'Productos', Projetos: 'Produtos', Projecten: 'Producten', Projets: 'Produits' };

for (const f of FILES) {
  const full = path.join(ROOT, f);
  const raw = fs.readFileSync(full, 'utf-8');
  const crlf = raw.includes(CR + NL);
  let s = raw.split(CR + NL).join(NL);

  // 1. links: duplicate each nav_services anchor line as a nav_products line
  let links = 0;
  const out = [];
  for (const line of s.split(NL)) {
    out.push(line);
    if (line.includes('data-i18n="nav_services"') && line.includes('<a href=')) {
      out.push(line
        .replace(/href="[^"]*"/, 'href="/products/"')
        .replace(/nav_services/g, 'nav_products')
        .replace('>Services<', '>Products<')
        .replace(/\s*class="active"/, '')
        .replace(/\s*style="[^"]*"/, ''));
      links++;
    }
  }
  if (links !== 3) throw new Error(`${f}: expected 3 nav_services links, found ${links}`);
  s = out.join(NL);

  // 2. strings: add nav_products after nav_projects in each translations object
  let strings = 0;
  s = s.replace(/(["']?)nav_projects\1(\s*:\s*)(["'])(Projects|Proyectos|Projetos|Projecten|Projets)\3/g, (m, kq, sep, vq, val) => {
    strings++;
    return `${m}, ${kq}nav_products${kq}${sep}${vq}${MAP[val]}${vq}`;
  });
  if (strings !== 5) throw new Error(`${f}: expected 5 nav_projects strings, found ${strings}`);

  fs.writeFileSync(full, crlf ? s.split(NL).join(CR + NL) : s);
  console.log(`ok ${f}: ${links} links, ${strings} strings`);
}
```

Expected output: five `ok` lines, each `3 links, 5 strings`.

- [ ] **Step 3: Pre-select the reducers service from the product page CTA**

In `index.html`, in the `map` object of the "CONTACT FORM" IIFE (search for `conveyors: 'Bulk Material Handling Systems'`), change the `pumps` entry line to:

```js
    conveyors: 'Bulk Material Handling Systems', concrete: 'Concrete Plants', pumps: 'Pumps', reducers: 'Motors & Gear Reducers',
```

(The `<option value="Motors &amp; Gear Reducers">` already exists, so the value matches after HTML decoding.)

- [ ] **Step 4: Keep `/products/` links inside the language directory in each builder**

`scripts/build-lang-pages.js`, directly after the line `$('a[href^="/services/"]')...`:

```js
  $('a[href^="/products/"]').not('.footer-langs a').each((_, el) => { $(el).attr('href', `/${lang.code}${$(el).attr('href')}`); });
```

`scripts/build-depot-langs.js` and `scripts/build-projects-langs.js`, directly after the `$('a[href="/about.html"]')...` line in each:

```js
  $('a[href^="/products/"]').not('.footer-langs a').each((_, el) => { $(el).attr('href', `/${lang.code}${$(el).attr('href')}`); });
```

`scripts/build-static-langs.js` line 41, replace the set with:

```js
const PAGE_LINKS = new Set(['/depot.html', '/projects.html', '/about.html', '/privacy.html', '/products/']);
```

`scripts/build-service-pages.js`, change the condition `else if (PAGE_LINKS.has(href) || href.startsWith('/services/'))` to:

```js
      else if (PAGE_LINKS.has(href) || href.startsWith('/services/') || href.startsWith('/products/'))
```

- [ ] **Step 5: Regenerate the language copies and the service pages**

```bash
cd scripts
node build-lang-pages.js
node build-depot-langs.js
node build-projects-langs.js
node build-static-langs.js
node build-service-pages.js
rm _add-nav-products.js
cd ..
git status --short
```

Some outputs may differ only by line endings. For any modified file where `git diff -w --quiet -- <file>` exits 0, revert it with `git checkout -- <file>`. Expected: the changed files are the 5 sources, the 5 builders' scripts, and their generated copies.

- [ ] **Step 6: Run the nav check and confirm it passes**

Run: `cd scripts && node verify-products.js nav`
Expected: `N checks, 0 failed`.

- [ ] **Step 7: Check the contact-form pre-select in a browser**

Serve the worktree root (`python -m http.server 8770` from the worktree root, run in the background), open `http://localhost:8770/?service=reducers#contact`, and read the service select value.
Expected: "Motors & Gear Reducers" is selected. Stop the server afterwards.

- [ ] **Step 8: Commit**

```bash
git add -A index.html about.html depot.html projects.html privacy.html scripts es pt nl fr services
git commit -m "feat(nav): add Products link to nav, footer and language pages"
```

## Task 3: Product and hub content in five languages

**Files:**
- Create: `scripts/product-pages-content.js`

**Interfaces:**
- Produces: `module.exports = { HUB, PAGES }`.
  - `HUB[code]` = `{ label, title, description, h1Html, lead, more, moreLine, linksHtml }`.
  - `PAGES` is an array; each entry = `{ slug, serviceParam, heroWord, brand: { name, url }, en|es|pt|nl|fr: { label, title, description, h1Html, lead, facts: [[value,label] x5], howH, how, buildH, build: string[8], buildNote, appH, apps: string[5], supportH, supportHtml, faqH, faq: [[q,a] x3] } }`.

- [ ] **Step 1: Write the content file**

```js
'use strict';
/**
 * Product pages: hub text and one entry per product line (5 languages each).
 * All wording is original; facts come from the OCR catalogue (RP Series) and company profile.
 * Spec: docs/superpowers/specs/2026-10-13-products-ocr-reducers-design.md (section 5, verified facts).
 */

const HUB = {
  en: {
    label: 'Products',
    title: 'Products — Equipment We Supply | Q² Machines',
    description: 'Industrial equipment supplied by Q² Machines from manufacturers it represents, backed by repair, fabrication and commissioning in Trinidad.',
    h1Html: 'Equipment We <span>Supply</span>',
    lead: 'Q² Machines supplies industrial equipment from manufacturers it represents, backed by our own repair, rewinding, fabrication and commissioning capability in Trinidad.',
    more: 'View product →',
    moreLine: 'More product lines are being added.',
    linksHtml: 'See our <a href="/services/">services</a> or the <a href="/depot.html">Equipment Depot</a> for units in stock.',
  },
  es: {
    label: 'Productos',
    title: 'Productos — Equipos que Suministramos | Q² Machines',
    description: 'Equipos industriales que suministra Q² Machines de fabricantes que representa, con reparación, fabricación y puesta en marcha en Trinidad.',
    h1Html: 'Equipos que <span>Suministramos</span>',
    lead: 'Q² Machines suministra equipos industriales de fabricantes a los que representa, respaldados por nuestra propia capacidad de reparación, rebobinado, fabricación y puesta en marcha en Trinidad.',
    more: 'Ver producto →',
    moreLine: 'Estamos incorporando más líneas de productos.',
    linksHtml: 'Consulte nuestros <a href="/services/">servicios</a> o el <a href="/depot.html">Depósito de Equipos</a> para ver unidades en existencia.',
  },
  pt: {
    label: 'Produtos',
    title: 'Produtos — Equipamentos que Fornecemos | Q² Machines',
    description: 'Equipamentos industriais fornecidos pela Q² Machines de fabricantes que representa, com reparo, fabricação e comissionamento em Trinidad.',
    h1Html: 'Equipamentos que <span>Fornecemos</span>',
    lead: 'A Q² Machines fornece equipamentos industriais de fabricantes que representa, apoiados pela nossa própria capacidade de reparo, rebobinamento, fabricação e comissionamento em Trinidad.',
    more: 'Ver produto →',
    moreLine: 'Estamos adicionando mais linhas de produtos.',
    linksHtml: 'Veja nossos <a href="/services/">serviços</a> ou o <a href="/depot.html">Depósito de Equipamentos</a> para unidades em estoque.',
  },
  nl: {
    label: 'Producten',
    title: 'Producten — Apparatuur die Wij Leveren | Q² Machines',
    description: 'Industriële apparatuur die Q² Machines levert van fabrikanten die het vertegenwoordigt, met reparatie, fabricage en inbedrijfstelling in Trinidad.',
    h1Html: 'Apparatuur die wij <span>leveren</span>',
    lead: 'Q² Machines levert industriële apparatuur van fabrikanten die het vertegenwoordigt, ondersteund door onze eigen reparatie-, herwikkel-, fabricage- en inbedrijfstellingscapaciteit in Trinidad.',
    more: 'Product bekijken →',
    moreLine: 'Er worden meer productlijnen toegevoegd.',
    linksHtml: 'Bekijk onze <a href="/services/">diensten</a> of het <a href="/depot.html">Apparatuurdepot</a> voor machines op voorraad.',
  },
  fr: {
    label: 'Produits',
    title: 'Produits — Équipements que Nous Fournissons | Q² Machines',
    description: "Équipements industriels fournis par Q² Machines pour des fabricants qu'elle représente, avec réparation, fabrication et mise en service à Trinidad.",
    h1Html: 'Équipements que nous <span>fournissons</span>',
    lead: "Q² Machines fournit des équipements industriels de fabricants qu'elle représente, soutenus par notre propre capacité de réparation, de rebobinage, de fabrication et de mise en service à Trinidad.",
    more: 'Voir le produit →',
    moreLine: "D'autres gammes de produits seront ajoutées.",
    linksHtml: 'Consultez nos <a href="/services/">services</a> ou le <a href="/depot.html">Dépôt d\'Équipements</a> pour les unités en stock.',
  },
};

const PAGES = [
  {
    slug: 'ocr-rp-series-shaft-mounted-gear-reducers',
    serviceParam: 'reducers',
    heroWord: 'REDUCERS',
    brand: { name: 'O.C.R. Riduttori', url: 'https://www.ocr-riduttori.com' },
    en: {
      label: 'Products',
      title: 'OCR RP Series Shaft-Mounted Gear Reducers — Trinidad & Caribbean | Q² Machines',
      description: 'Q² Machines is the authorised agent for OCR RP Series shaft-mounted gear reducers: 8 sizes, 0.6–155 kW, up to 11,280 Nm. Supplied from Trinidad.',
      h1Html: 'OCR RP Series <span>Shaft-Mounted Gear Reducers</span>',
      lead: 'Q² Machines is the authorised agent for O.C.R. s.r.l. of Modena, Italy. The RP Series shaft-mounted reducers are built for conveyors, screw conveyors, elevators, mixers and crushers, and are supplied and supported by our team.',
      facts: [['8', 'sizes (85 to 250)'], ['0.6–155 kW', 'rated power'], ['up to 11,280 Nm', 'output torque'], ['0.98', 'efficiency, single stage'], ['Modena, Italy', 'made by OCR']],
      howH: 'How a shaft-mounted reducer works',
      how: 'A shaft-mounted reducer fits directly onto the shaft of the driven machine, so no coupling or base plate is needed. The motor drives the reducer through a belt, and a torque arm anchors the reducer and keeps the belts at the correct tension. Changing the motor and reducer pulleys gives a range of output speeds.',
      buildH: 'Construction and options',
      build: [
        'Grey cast-iron housing with reinforcing and cooling ribs',
        'Case-hardened helical steel gears with a controlled or ground tooth profile',
        'Ball and taper-roller bearings',
        'Hollow output shaft in Fe510 steel, with keyway and circlip groove',
        'Oil-bath lubrication with filler, level and drain plugs',
        'Double-lip seals and blue RAL 5010 finish',
        'Torque arm with brackets',
        'Backstop available on request for all sizes, plus special executions and accessories',
      ],
      buildNote: 'Gear capacity is calculated to ISO 6336, DIN 3990 and AGMA 2001-B88. Efficiency is about 0.98 for single-stage and 0.96 for double-stage units.',
      appH: 'Applications',
      apps: ['Belt and screw conveyors', 'Bucket elevators', 'Mixers', 'Crushers', 'Feeders, screens and stackers'],
      supportH: 'Support from Q² Machines',
      supportHtml: 'We supply the RP Series with spares and drawings (DXF, PDF, STEP) on request, and help you select the right size for your duty. Repair, rewinding and servicing of gear reducers is covered on our <a href="/services/pumps-and-drives.html">Pumps, Motors &amp; Gear Reducers</a> page.',
      faqH: 'Frequently asked questions',
      faq: [
        ['Which sizes and ratings does the RP Series cover?', 'There are eight sizes, from 85 to 250, covering 0.6 to 155 kW and output torques from 160 to 11,280 Nm. Send us your power, speed and duty details and we will recommend a size.'],
        ['Is a backstop available?', 'Yes. A backstop that prevents rotation in one direction is available on request for all sizes.'],
        ['Can you supply drawings and spare parts?', 'Yes. Dimensional drawings in DXF, PDF and STEP formats, and spare parts, are available on request.'],
      ],
    },
    es: {
      label: 'Productos',
      title: 'Reductores Montados en Eje OCR Serie RP — Trinidad y el Caribe | Q² Machines',
      description: 'Q² Machines es el agente autorizado de los reductores montados en eje OCR Serie RP: 8 tamaños, 0,6–155 kW, hasta 11.280 Nm. Suministro desde Trinidad.',
      h1Html: 'Reductores Montados en Eje <span>OCR Serie RP</span>',
      lead: 'Q² Machines es el agente autorizado de O.C.R. s.r.l., de Módena, Italia. Los reductores montados en eje de la Serie RP están pensados para transportadores, transportadores de tornillo, elevadores, mezcladoras y trituradoras, y los suministra y respalda nuestro equipo.',
      facts: [['8', 'tamaños (de 85 a 250)'], ['0,6–155 kW', 'potencia nominal'], ['hasta 11.280 Nm', 'par de salida'], ['0,98', 'rendimiento, una etapa'], ['Módena, Italia', 'fabricado por OCR']],
      howH: 'Cómo funciona un reductor montado en eje',
      how: 'Un reductor montado en eje se instala directamente sobre el eje de la máquina accionada, por lo que no se necesitan acoplamiento ni bancada. El motor acciona el reductor mediante correas, y un brazo de reacción fija el reductor y mantiene la tensión correcta de las correas. Al cambiar las poleas del motor y del reductor se obtiene un rango de velocidades de salida.',
      buildH: 'Construcción y opciones',
      build: [
        'Carcasa de hierro fundido gris con nervaduras de refuerzo y refrigeración',
        'Engranajes helicoidales de acero cementado y templado, con perfil de diente controlado o rectificado',
        'Rodamientos de bolas y de rodillos cónicos',
        'Eje de salida hueco de acero Fe510, con chavetero y ranura para anillo elástico',
        'Lubricación por baño de aceite, con tapones de llenado, nivel y drenaje',
        'Retenes de doble labio y acabado azul RAL 5010',
        'Brazo de reacción con soportes',
        'Dispositivo antirretorno disponible bajo pedido en todos los tamaños, además de ejecuciones especiales y accesorios',
      ],
      buildNote: 'La capacidad de carga de los engranajes se calcula según ISO 6336, DIN 3990 y AGMA 2001-B88. El rendimiento es de aproximadamente 0,98 en unidades de una etapa y 0,96 en unidades de dos etapas.',
      appH: 'Aplicaciones',
      apps: ['Transportadores de banda y de tornillo', 'Elevadores de cangilones', 'Mezcladoras', 'Trituradoras', 'Alimentadores, cribas y apiladores'],
      supportH: 'Respaldo de Q² Machines',
      supportHtml: 'Suministramos la Serie RP con repuestos y planos (DXF, PDF, STEP) bajo pedido, y le ayudamos a elegir el tamaño adecuado para su servicio. La reparación, el rebobinado y el mantenimiento de reductores se describen en nuestra página de <a href="/services/pumps-and-drives.html">Bombas, Motores y Reductores</a>.',
      faqH: 'Preguntas frecuentes',
      faq: [
        ['¿Qué tamaños y capacidades cubre la Serie RP?', 'Hay ocho tamaños, del 85 al 250, que cubren de 0,6 a 155 kW y pares de salida de 160 a 11.280 Nm. Envíenos los datos de potencia, velocidad y servicio y le recomendaremos un tamaño.'],
        ['¿Hay dispositivo antirretorno disponible?', 'Sí. Hay un dispositivo antirretorno, que impide el giro en un sentido, disponible bajo pedido para todos los tamaños.'],
        ['¿Pueden suministrar planos y repuestos?', 'Sí. Los planos dimensionales en formatos DXF, PDF y STEP, así como los repuestos, están disponibles bajo pedido.'],
      ],
    },
    pt: {
      label: 'Produtos',
      title: 'Redutores de Eixo Montado OCR Série RP — Trinidad e Caribe | Q² Machines',
      description: 'A Q² Machines é a agente autorizada dos redutores de eixo montado OCR Série RP: 8 tamanhos, 0,6–155 kW, até 11.280 Nm. Fornecimento a partir de Trinidad.',
      h1Html: 'Redutores de Eixo Montado <span>OCR Série RP</span>',
      lead: 'A Q² Machines é a agente autorizada da O.C.R. s.r.l., de Módena, Itália. Os redutores de eixo montado da Série RP são projetados para transportadores, transportadores helicoidais, elevadores, misturadores e britadores, e são fornecidos e apoiados pela nossa equipe.',
      facts: [['8', 'tamanhos (de 85 a 250)'], ['0,6–155 kW', 'potência nominal'], ['até 11.280 Nm', 'torque de saída'], ['0,98', 'rendimento, um estágio'], ['Módena, Itália', 'fabricado pela OCR']],
      howH: 'Como funciona um redutor de eixo montado',
      how: 'Um redutor de eixo montado é instalado diretamente no eixo da máquina acionada, dispensando acoplamento e base. O motor aciona o redutor por correias, e um braço de reação fixa o redutor e mantém a tensão correta das correias. Trocando as polias do motor e do redutor obtém-se uma faixa de velocidades de saída.',
      buildH: 'Construção e opcionais',
      build: [
        'Carcaça de ferro fundido cinzento com nervuras de reforço e de refrigeração',
        'Engrenagens helicoidais de aço cementado e temperado, com perfil de dente controlado ou retificado',
        'Rolamentos de esferas e de rolos cônicos',
        'Eixo de saída oco em aço Fe510, com rasgo de chaveta e ranhura para anel elástico',
        'Lubrificação por banho de óleo, com bujões de enchimento, nível e dreno',
        'Retentores de duplo lábio e acabamento azul RAL 5010',
        'Braço de reação com suportes',
        'Dispositivo antirretorno disponível sob consulta em todos os tamanhos, além de execuções especiais e acessórios',
      ],
      buildNote: 'A capacidade de carga das engrenagens é calculada conforme ISO 6336, DIN 3990 e AGMA 2001-B88. O rendimento é de cerca de 0,98 nas unidades de um estágio e 0,96 nas de dois estágios.',
      appH: 'Aplicações',
      apps: ['Transportadores de correia e helicoidais', 'Elevadores de canecas', 'Misturadores', 'Britadores', 'Alimentadores, peneiras e stackers'],
      supportH: 'Suporte da Q² Machines',
      supportHtml: 'Fornecemos a Série RP com peças de reposição e desenhos (DXF, PDF, STEP) sob consulta, e ajudamos você a escolher o tamanho adequado para a sua aplicação. O reparo, o rebobinamento e a manutenção de redutores estão descritos na nossa página de <a href="/services/pumps-and-drives.html">Bombas, Motores e Redutores</a>.',
      faqH: 'Perguntas frequentes',
      faq: [
        ['Que tamanhos e capacidades a Série RP abrange?', 'São oito tamanhos, do 85 ao 250, cobrindo de 0,6 a 155 kW e torques de saída de 160 a 11.280 Nm. Envie-nos os dados de potência, rotação e regime de trabalho e recomendaremos um tamanho.'],
        ['Há dispositivo antirretorno disponível?', 'Sim. Um dispositivo antirretorno, que impede a rotação em um sentido, está disponível sob consulta para todos os tamanhos.'],
        ['Vocês fornecem desenhos e peças de reposição?', 'Sim. Desenhos dimensionais nos formatos DXF, PDF e STEP, bem como peças de reposição, estão disponíveis sob consulta.'],
      ],
    },
    nl: {
      label: 'Producten',
      title: 'OCR RP-serie Opsteektandwielreductoren — Trinidad & Caribisch Gebied | Q² Machines',
      description: 'Q² Machines is de erkende agent voor OCR RP-serie opsteektandwielreductoren: 8 maten, 0,6–155 kW, tot 11.280 Nm. Geleverd vanuit Trinidad.',
      h1Html: 'OCR RP-serie <span>Opsteektandwielreductoren</span>',
      lead: 'Q² Machines is de erkende agent van O.C.R. s.r.l. uit Modena, Italië. De opsteekreductoren van de RP-serie zijn gebouwd voor transportbanden, schroeftransporteurs, elevators, mengers en brekers en worden door ons team geleverd en ondersteund.',
      facts: [['8', 'maten (85 tot 250)'], ['0,6–155 kW', 'nominaal vermogen'], ['tot 11.280 Nm', 'uitgaand koppel'], ['0,98', 'rendement, enkele trap'], ['Modena, Italië', 'gemaakt door OCR']],
      howH: 'Hoe een opsteekreductor werkt',
      how: 'Een opsteekreductor wordt direct op de as van de aangedreven machine gemonteerd, zodat geen koppeling of grondplaat nodig is. De motor drijft de reductor aan via riemen en een reactiearm zet de reductor vast en houdt de riemen op de juiste spanning. Door de riemschijven van motor en reductor te wisselen krijgt u een bereik aan uitgaande toerentallen.',
      buildH: 'Constructie en opties',
      build: [
        'Behuizing van grijs gietijzer met versterkings- en koelribben',
        'Schuin vertande tandwielen van gecementeerd en gehard staal, met gecontroleerd of geslepen tandprofiel',
        'Kogellagers en kegelrollagers',
        'Holle uitgaande as van Fe510-staal, met spiebaan en groef voor borgring',
        'Oliebadsmering met vul-, peil- en aftapplug',
        'Afdichtingen met dubbele lip en blauwe afwerking RAL 5010',
        'Reactiearm met beugels',
        'Terugloopbeveiliging op aanvraag leverbaar voor alle maten, plus speciale uitvoeringen en accessoires',
      ],
      buildNote: 'De belastbaarheid van de tandwielen is berekend volgens ISO 6336, DIN 3990 en AGMA 2001-B88. Het rendement bedraagt circa 0,98 bij enkeltraps- en 0,96 bij tweetrapsuitvoeringen.',
      appH: 'Toepassingen',
      apps: ['Band- en schroeftransporteurs', 'Emmerelevators', 'Mengers', 'Brekers', 'Voeders, zeven en stackers'],
      supportH: 'Ondersteuning door Q² Machines',
      supportHtml: 'Wij leveren de RP-serie met reserveonderdelen en tekeningen (DXF, PDF, STEP) op aanvraag en helpen u de juiste maat voor uw toepassing te kiezen. Reparatie, herwikkeling en onderhoud van reductoren vindt u op onze pagina <a href="/services/pumps-and-drives.html">Pompen, Motoren &amp; Reductoren</a>.',
      faqH: 'Veelgestelde vragen',
      faq: [
        ['Welke maten en vermogens omvat de RP-serie?', 'Er zijn acht maten, van 85 tot 250, voor 0,6 tot 155 kW en uitgaande koppels van 160 tot 11.280 Nm. Stuur ons uw vermogen, toerental en bedrijfsomstandigheden en wij adviseren een maat.'],
        ['Is een terugloopbeveiliging leverbaar?', 'Ja. Een terugloopbeveiliging, die rotatie in één richting voorkomt, is op aanvraag leverbaar voor alle maten.'],
        ['Kunt u tekeningen en reserveonderdelen leveren?', 'Ja. Maattekeningen in DXF-, PDF- en STEP-formaat en reserveonderdelen zijn op aanvraag beschikbaar.'],
      ],
    },
    fr: {
      label: 'Produits',
      title: 'Réducteurs Pendulaires OCR Série RP — Trinidad et Caraïbes | Q² Machines',
      description: "Q² Machines est l'agent agréé des réducteurs pendulaires OCR Série RP : 8 tailles, 0,6–155 kW, jusqu'à 11 280 Nm. Fourniture depuis Trinidad.",
      h1Html: 'Réducteurs Pendulaires <span>OCR Série RP</span>',
      lead: "Q² Machines est l'agent agréé d'O.C.R. s.r.l., de Modène, en Italie. Les réducteurs pendulaires de la Série RP sont conçus pour les convoyeurs, les vis de convoyage, les élévateurs, les malaxeurs et les concasseurs, et sont fournis et soutenus par notre équipe.",
      facts: [['8', 'tailles (de 85 à 250)'], ['0,6–155 kW', 'puissance nominale'], ["jusqu'à 11 280 Nm", 'couple de sortie'], ['0,98', 'rendement, un étage'], ['Modène, Italie', 'fabriqué par OCR']],
      howH: 'Comment fonctionne un réducteur pendulaire',
      how: "Un réducteur pendulaire se monte directement sur l'arbre de la machine entraînée, sans accouplement ni socle. Le moteur entraîne le réducteur par courroies, et un bras de réaction fixe le réducteur et maintient la bonne tension des courroies. En changeant les poulies du moteur et du réducteur, on obtient une plage de vitesses de sortie.",
      buildH: 'Construction et options',
      build: [
        'Carter en fonte grise avec nervures de renfort et de refroidissement',
        'Engrenages hélicoïdaux en acier cémenté et trempé, à profil de denture contrôlé ou rectifié',
        'Roulements à billes et à rouleaux coniques',
        'Arbre de sortie creux en acier Fe510, avec rainure de clavette et gorge pour circlip',
        "Lubrification par bain d'huile, avec bouchons de remplissage, de niveau et de vidange",
        'Joints à double lèvre et finition bleue RAL 5010',
        'Bras de réaction avec étriers',
        'Dispositif antidévireur disponible sur demande pour toutes les tailles, ainsi que des exécutions spéciales et des accessoires',
      ],
      buildNote: "La capacité de charge des engrenages est calculée selon ISO 6336, DIN 3990 et AGMA 2001-B88. Le rendement est d'environ 0,98 pour les unités à un étage et de 0,96 pour celles à deux étages.",
      appH: 'Applications',
      apps: ['Convoyeurs à bande et à vis', 'Élévateurs à godets', 'Malaxeurs', 'Concasseurs', 'Alimentateurs, cribles et stackers'],
      supportH: 'Le soutien de Q² Machines',
      supportHtml: "Nous fournissons la Série RP avec pièces de rechange et plans (DXF, PDF, STEP) sur demande, et nous vous aidons à choisir la taille adaptée à votre service. La réparation, le rebobinage et l'entretien des réducteurs sont décrits sur notre page <a href=\"/services/pumps-and-drives.html\">Pompes, Moteurs et Réducteurs</a>.",
      faqH: 'Questions fréquentes',
      faq: [
        ['Quelles tailles et capacités couvre la Série RP ?', 'Huit tailles, de 85 à 250, couvrent de 0,6 à 155 kW et des couples de sortie de 160 à 11 280 Nm. Envoyez-nous vos données de puissance, de vitesse et de service et nous vous recommanderons une taille.'],
        ['Un dispositif antidévireur est-il disponible ?', 'Oui. Un dispositif antidévireur, qui empêche la rotation dans un sens, est disponible sur demande pour toutes les tailles.'],
        ['Pouvez-vous fournir des plans et des pièces de rechange ?', 'Oui. Les plans dimensionnels aux formats DXF, PDF et STEP, ainsi que les pièces de rechange, sont disponibles sur demande.'],
      ],
    },
  },
];

module.exports = { HUB, PAGES };
```

- [ ] **Step 2: Load it and check shape and description lengths**

Run:

```bash
cd scripts
node -e "const {HUB,PAGES}=require('./product-pages-content'); let bad=0; for (const c of ['en','es','pt','nl','fr']) { for (const [n,o] of [['hub',HUB[c]],['page',PAGES[0][c]]]) { if (o.description.length>160) { bad++; console.log('TOO LONG', n, c, o.description.length); } } const p=PAGES[0][c]; if (p.facts.length!==5||p.build.length!==8||p.apps.length!==5||p.faq.length!==3) { bad++; console.log('SHAPE', c); } } console.log(bad ? bad+' problems' : 'content ok');"
```

Expected: `content ok`. If a description is too long, shorten it in the content file and rerun.

- [ ] **Step 3: Commit**

```bash
git add scripts/product-pages-content.js
git commit -m "feat(products): add hub and OCR RP Series content in five languages"
```

## Task 4: Builder, build-all, generated pages

**Files:**
- Create: `scripts/build-product-pages.js`
- Modify: `scripts/package.json`
- Create (generated): `products/index.html`, `products/ocr-rp-series-shaft-mounted-gear-reducers.html`, and the same pair under `es/`, `pt/`, `nl/`, `fr/`

**Interfaces:**
- Consumes: `HUB`, `PAGES` from Task 3; `about.html` (with Products nav from Task 2) as the page shell.
- Produces: the 10 output files that `verify-products.js pages` checks.

- [ ] **Step 1: Confirm the pages check fails**

Run: `cd scripts && node verify-products.js pages`
Expected: FAIL lines `products/index.html is missing` etc.

- [ ] **Step 2: Write `scripts/build-product-pages.js`**

```js
#!/usr/bin/env node
/**
 * build-product-pages.js
 *
 * Generates the Products hub and product pages in all five languages:
 *   products/index.html, products/<slug>.html                 (English)
 *   {es,pt,nl,fr}/products/index.html, .../products/<slug>.html
 *
 * Content: scripts/product-pages-content.js. The page shell (head, CSS, nav, footer, CTA) is taken
 * from about.html, like build-service-pages.js. Text is baked per language (no client-side translation).
 *
 * Usage:  cd scripts && node build-product-pages.js
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const vm      = require('vm');
const cheerio = require('cheerio');
const { HUB, PAGES } = require('./product-pages-content');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://www.q2m.io';

const LANGS = [
  { code: 'en', htmlLang: 'en',    ogLocale: 'en_TT',  dir: ''    },
  { code: 'es', htmlLang: 'es',    ogLocale: 'es_419', dir: 'es/' },
  { code: 'pt', htmlLang: 'pt-BR', ogLocale: 'pt_BR',  dir: 'pt/' },
  { code: 'nl', htmlLang: 'nl',    ogLocale: 'nl_NL',  dir: 'nl/' },
  { code: 'fr', htmlLang: 'fr',    ogLocale: 'fr_FR',  dir: 'fr/' },
];
const HREFLANG = { en: 'en', es: 'es', pt: 'pt-BR', nl: 'nl', fr: 'fr' };
const PAGE_LINKS = new Set(['/depot.html', '/projects.html', '/about.html', '/privacy.html']);
const MAX_DESC = 160;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plain = (html) => cheerio.load(`<div>${html}</div>`)('div').text();

function loadTranslations(raw) {
  const start = raw.indexOf('const translations = {');
  const fn    = raw.indexOf('function applyTranslations');
  if (start === -1 || fn === -1) throw new Error('could not locate the translations object');
  const end = raw.lastIndexOf('};', fn);
  // The object literal comes from this repository's own source page; evaluate it in an empty sandbox.
  return vm.runInNewContext(`(${raw.slice(start + 'const translations = '.length, end + 1)})`, Object.create(null));
}

const aboutRaw = fs.readFileSync(path.join(ROOT, 'about.html'), 'utf-8');
const aboutT   = loadTranslations(aboutRaw);

// The hub is the "page" with hub: true; its URL is /products/ (products/index.html)
const HUB_PAGE = { hub: true, slug: 'index', heroWord: 'PRODUCTS' };
const pageUrl  = (lang, page) => page.hub ? `${BASE}/${lang.dir}products/` : `${BASE}/${lang.dir}products/${page.slug}.html`;
const pageName = (code, page) => plain(page[code].h1Html);

function breadcrumb(lang, page, url) {
  const code = lang.code;
  const items = [{ name: aboutT[code].nav_home, item: `${BASE}/${lang.dir}` }];
  if (page.hub) items.push({ name: HUB[code].label, item: url });
  else {
    items.push({ name: HUB[code].label, item: pageUrl(lang, HUB_PAGE) });
    items.push({ name: pageName(code, page), item: url });
  }
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: x.item })),
  };
}

function productSchema(page, lang, p, url) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: p.title,
        description: p.description,
        inLanguage: lang.htmlLang,
        isPartOf: { '@id': `${BASE}/#website` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        about: { '@id': `${url}#brand` },
        publisher: { '@id': `${BASE}/#organization` },
      },
      { '@type': 'Brand', '@id': `${url}#brand`, name: page.brand.name, url: page.brand.url },
      breadcrumb(lang, page, url),
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        inLanguage: lang.htmlLang,
        mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  };
}

function hubSchema(lang, h, url) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#webpage`,
        url,
        name: h.title,
        description: h.description,
        inLanguage: lang.htmlLang,
        isPartOf: { '@id': `${BASE}/#website` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        about: { '@id': `${BASE}/#organization` },
        mainEntity: { '@id': `${url}#list` },
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#list`,
        itemListElement: PAGES.map((pg, i) => ({ '@type': 'ListItem', position: i + 1, name: pageName(lang.code, pg), url: pageUrl(lang, pg) })),
      },
      breadcrumb(lang, HUB_PAGE, url),
    ],
  };
}

const li = (arr) => arr.map((x) => `        <li>${esc(x)}</li>`).join('\n');
const block = (heading, inner) => `
    <div class="content-block reveal">
      <h2>${esc(heading)}</h2>
${inner}
    </div>`;

function productHtml(p) {
  const facts = `
    <div class="facts-strip reveal">
${p.facts.map(([v, l]) => `      <div class="fact"><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`).join('\n')}
    </div>`;
  return facts +
    block(p.howH, `      <p>${esc(p.how)}</p>`) +
    block(p.buildH, `      <ul class="facts-list">\n${li(p.build)}\n      </ul>\n      <p>${esc(p.buildNote)}</p>`) +
    block(p.appH, `      <ul class="facts-list">\n${li(p.apps)}\n      </ul>`) +
    block(p.supportH, `      <p>${p.supportHtml}</p>`) +
    block(p.faqH, p.faq.map(([q, a]) => `      <h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n')) +
    '\n  ';
}

function hubHtml(code, h) {
  const cards = PAGES.map((pg) => `
      <a class="svc-card reveal" href="/products/${pg.slug}.html">
        <h3>${esc(pageName(code, pg))}</h3>
        <p>${esc(pg[code].description)}</p>
        <span class="svc-card-more">${esc(h.more)}</span>
      </a>`).join('');
  return `
    <div class="svc-cards">${cards}
    </div>
    <div class="content-block reveal">
      <p>${esc(h.moreLine)}</p>
      <p>${h.linksHtml}</p>
    </div>
  `;
}

const PRODUCT_CSS = `.page-hero h1{overflow-wrap:break-word;}
.section-label a{color:inherit;text-decoration:none;}
.section-label a:hover{text-decoration:underline;text-underline-offset:3px;}
.content-block h3{font-family:'Barlow Condensed',sans-serif;font-size:19px;font-weight:700;letter-spacing:.5px;color:var(--text);margin:22px 0 8px;}
.svc-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin:0 0 52px;}
.svc-card{display:flex;flex-direction:column;gap:10px;padding:24px 26px;background:var(--ink-3);border:1px solid var(--border);border-radius:2px;text-decoration:none;transition:border-color .2s,transform .2s;}
.svc-card:hover{border-color:var(--gold);transform:translateY(-2px);}
.svc-card h3{font-family:'Oswald',sans-serif;font-size:22px;font-weight:700;letter-spacing:.3px;line-height:1.2;color:var(--text);margin:0;overflow-wrap:break-word;}
.svc-card p{font-size:14px;color:var(--text-2);line-height:1.65;margin:0;}
.svc-card-more{margin-top:auto;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--gold);}
.facts-strip{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--border);border:1px solid var(--border);margin:0 0 48px;}
.fact{background:var(--ink-3);padding:18px 14px;display:flex;flex-direction:column;gap:6px;min-width:0;}
.fact strong{font-family:'Oswald',sans-serif;font-size:21px;color:var(--gold);line-height:1.15;overflow-wrap:break-word;}
.fact span{font-size:13px;color:var(--text-2);line-height:1.4;}
@media(max-width:900px){.facts-strip{grid-template-columns:repeat(2,1fr);}.fact:last-child{grid-column:1/-1;}}
@media(max-width:700px){.svc-cards{grid-template-columns:1fr;}}
`;

const FLAG_SCRIPT = `// ── LANGUAGE FLAGS ────────────────────────────────────────
document.querySelectorAll('.lang-flag').forEach(btn => {
  btn.addEventListener('click', () => {
    try { sessionStorage.setItem('q2m-lang-redir', '1'); } catch (e) {}
    location.href = btn.getAttribute('data-href');
  });
});

`;

function build(page, lang) {
  const code = lang.code;
  const t = aboutT[code];
  const p = page.hub ? HUB[code] : page[code];
  const label = page.slug;
  if (!p) throw new Error(`${label}: missing ${code} content`);
  if (p.description.length > MAX_DESC) throw new Error(`${label}/${code}: description is ${p.description.length} characters (max ${MAX_DESC})`);

  const url = pageUrl(lang, page);
  const $ = cheerio.load(aboutRaw, { decodeEntities: false });

  $('html').attr('lang', lang.htmlLang);

  // Language auto-redirect: keep on the English page only (language pages are already localised)
  $('head script:not([type])').each((_, el) => {
    const txt = $(el).html() || '';
    if (!txt.includes('q2m-lang-redir')) return;
    if (code !== 'en') { $(el).remove(); return; }
    const dest = page.hub ? '/$1/products/' : `/$1/products/${page.slug}.html`;
    $(el).html(txt.replace(/\/(es|pt|nl|fr)\/about\.html/g, dest));
  });

  $('title').text(p.title);
  $('meta[name="description"]').attr('content', p.description);
  $('meta[property="og:title"]').attr('content', p.title);
  $('meta[property="og:description"]').attr('content', p.description);
  $('meta[property="og:url"]').attr('content', url);
  $('meta[property="og:locale"]').attr('content', lang.ogLocale);
  $('meta[name="twitter:title"]').attr('content', p.title);
  $('meta[name="twitter:description"]').attr('content', p.description);
  $('link[rel="canonical"]').attr('href', url);
  $('link[rel="alternate"][hreflang]').remove();
  $('head').append(
    '\n' + LANGS.map((l) => `<link rel="alternate" hreflang="${HREFLANG[l.code]}" href="${pageUrl(l, page)}">`).join('\n') +
    `\n<link rel="alternate" hreflang="x-default" href="${pageUrl(LANGS[0], page)}">`
  );

  const schema = page.hub ? hubSchema(lang, p, url) : productSchema(page, lang, p, url);
  $('script[type="application/ld+json"]').first().html(`\n${JSON.stringify(schema, null, 2)}\n`);

  // CSS: decorative hero word + shared page styles
  const style = $('style').first();
  let css = style.html();
  if (!css.includes("content:'ABOUT'")) throw new Error("about.html no longer has the page-hero ::after content:'ABOUT'");
  css = css.replace("content:'ABOUT'", `content:'${page.heroWord}'`);
  if (!css.includes('/* ── RESPONSIVE')) throw new Error('about.html no longer has the RESPONSIVE marker');
  css = css.replace('/* ── RESPONSIVE', PRODUCT_CSS + '/* ── RESPONSIVE');
  style.html(css);

  // Shared strings (nav, footer, CTA) from about.html translations
  $('[data-i18n]').each((_, el) => {
    const key = $(el).attr('data-i18n');
    if (t[key] !== undefined) $(el).text(t[key]);
  });
  $('[data-i18n-html]').each((_, el) => {
    const key = $(el).attr('data-i18n-html');
    if (t[key] !== undefined) $(el).html(t[key]);
  });

  // Page-specific sections. The hero label links to the hub (the hub itself shows plain text).
  const labelHtml = page.hub ? esc(p.label) : `<a href="/products/">${esc(p.label)}</a>`;
  $('.page-hero-inner').html(`
    <div class="section-label reveal">${labelHtml}</div>
    <h1 class="reveal reveal-delay-1">${p.h1Html}</h1>
    <p class="reveal reveal-delay-2">${esc(p.lead)}</p>
  `);
  $('.page-inner').html(page.hub ? hubHtml(code, p) : productHtml(p));

  // CTA: enquiry opens the home-page contact form (service pre-selected on product pages)
  $('.cta-btn-primary').attr('href', page.hub ? '/#contact' : `/?service=${page.serviceParam}#contact`);

  // About is not the current page; Products is. Nav/footer "Services" opens the services hub.
  $('a[href="/about.html"]').removeClass('active');
  $('.mobile-menu a[href="/about.html"]').removeAttr('style');
  $('a[href="/#services"]').attr('href', '/services/');
  $('.nav-links a[href="/products/"]').addClass('active');

  // Language flags: current language active, buttons navigate to the same page in each language
  $('.lang-flag').each((_, el) => {
    const l = LANGS.find((x) => x.code === $(el).attr('data-lang'));
    $(el).attr('data-href', pageUrl(l, page).replace(BASE, ''));
    $(el).toggleClass('active', l.code === code);
  });
  $('.footer-langs a').each((_, el) => {
    const l = LANGS.find((x) => x.code === $(el).attr('lang'));
    $(el).attr('href', pageUrl(l, page).replace(BASE, ''));
  });

  // Links stay inside the language directory (not the footer language row)
  if (code !== 'en') {
    $('a[href]').not('.footer-langs a').each((_, el) => {
      const href = $(el).attr('href');
      if (href === '/') $(el).attr('href', `/${code}/`);
      else if (href.startsWith('/#') || href.startsWith('/?')) $(el).attr('href', `/${code}/${href.slice(1)}`);
      else if (PAGE_LINKS.has(href) || href.startsWith('/services/') || href.startsWith('/products/')) $(el).attr('href', `/${code}${href}`);
    });
  }

  // Root-relative asset paths (pages live one or two directories deep)
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('/') && !src.startsWith('http') && !src.startsWith('data:')) $(el).attr('src', '/' + src);
  });

  // Scripts: drop the client-side translation block, add flag navigation
  $('script:not([type])').each((_, el) => {
    const txt = $(el).html() || '';
    const a = txt.indexOf('// ── i18n');
    const b = txt.indexOf('// ── REVEAL');
    if (a === -1 || b === -1) return;
    $(el).html(txt.slice(0, a) + FLAG_SCRIPT + txt.slice(b));
  });

  $('[data-i18n]').removeAttr('data-i18n');
  $('[data-i18n-html]').removeAttr('data-i18n-html');
  $('[data-i18n-alt]').removeAttr('data-i18n-alt');
  $('[data-i18n-aria]').removeAttr('data-i18n-aria');

  const outDir = path.join(ROOT, lang.dir, 'products');
  fs.mkdirSync(outDir, { recursive: true });
  const out = $.html().replace(/\r?\n/g, '\r\n');
  const file = page.hub ? 'index.html' : `${page.slug}.html`;
  fs.writeFileSync(path.join(outDir, file), out, 'utf-8');
  console.log(`✓  ${lang.dir}products/${file}`);
}

for (const page of PAGES) for (const lang of LANGS) build(page, lang);
for (const lang of LANGS) build(HUB_PAGE, lang);
console.log('Done.');
```

- [ ] **Step 3: Wire it into `package.json`**

In `scripts/package.json` add the script after `"build-service-pages"`:

```json
    "build-product-pages": "node build-product-pages.js",
```

and change `build-all` so `node build-product-pages.js` runs after `node build-service-pages.js` and before `node update-sitemap-lastmod.js`:

```json
    "build-all": "node build-lang-pages.js && node build-depot-langs.js && node build-projects-langs.js && node build-static-langs.js && node build-service-pages.js && node build-product-pages.js && node update-sitemap-lastmod.js",
```

- [ ] **Step 4: Build and run the pages check**

```bash
cd scripts
node build-product-pages.js
node verify-products.js pages
```

Expected: ten `✓` lines, then `N checks, 0 failed`. If a check fails, fix the builder or the content and rerun; do not weaken the check.

- [ ] **Step 5: Spot-check the output in a browser at desktop and 375 px**

Serve the worktree root (`python -m http.server 8770`, run in the background) and open `/products/`, `/products/ocr-rp-series-shaft-mounted-gear-reducers.html` and `/nl/products/ocr-rp-series-shaft-mounted-gear-reducers.html`. At 375 px confirm: no horizontal scroll (`document.documentElement.scrollWidth === innerWidth`), the five key facts wrap in two columns with the last full width, and the Dutch H1 wraps instead of overflowing. Stop the server afterwards.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-product-pages.js scripts/package.json products es/products pt/products nl/products fr/products
git commit -m "feat(products): build hub and OCR RP Series pages in five languages"
```

## Task 5: Sitemap, handoff, full verification, pull request

**Files:**
- Modify: `sitemap.xml`
- Modify: `handoff.md`

**Interfaces:**
- Consumes: the 10 generated pages from Task 4 (the sitemap script maps URL paths to files for `lastmod`).

- [ ] **Step 1: Confirm the sitemap check fails**

Run: `cd scripts && node verify-products.js sitemap`
Expected: FAIL lines `sitemap.xml: missing https://www.q2m.io/products/` etc.

- [ ] **Step 2: Add the ten URLs to `sitemap.xml`**

Run this once from `scripts/` (inline, not committed):

```bash
node -e "
const fs=require('fs'); const p='../sitemap.xml'; let x=fs.readFileSync(p,'utf8'); const crlf=x.includes('\r\n'); x=x.replace(/\r\n/g,'\n');
const slug='ocr-rp-series-shaft-mounted-gear-reducers'; const dirs=['','es/','pt/','nl/','fr/']; let add='';
for (const d of dirs) for (const [rel,pri] of [['products/','0.7'],['products/'+slug+'.html','0.6']]) {
  add += '  <url>\n    <loc>https://www.q2m.io/'+d+rel+'</loc>\n    <lastmod>2026-10-13</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>'+pri+'</priority>\n  </url>\n';
}
if (!x.includes('</urlset>')) throw new Error('no </urlset>');
x=x.replace('</urlset>', add+'</urlset>'); fs.writeFileSync(p, crlf?x.replace(/\n/g,'\r\n'):x); console.log('added 10');"
```

Expected output: `added 10`.

- [ ] **Step 3: Refresh `lastmod` values from git**

Commit the pages first so git history exists for them, then run the updater:

```bash
git add sitemap.xml
git commit -m "feat(products): add Products URLs to the sitemap"
cd scripts && node update-sitemap-lastmod.js && cd ..
git diff --stat sitemap.xml
```

Expected: `sitemap.xml: N updated, M unchanged`. If it changed `lastmod` values, commit them in Step 6.

- [ ] **Step 4: Run the whole suite**

Run: `cd scripts && node verify-products.js`
Expected: `N checks, 0 failed`.

- [ ] **Step 5: Run the full build and confirm it is idempotent**

```bash
cd scripts && node build-product-pages.js >/dev/null && cd .. && git status --short
```

Expected: no unexpected changes (only line-ending noise, which you revert with `git checkout -- <file>` after `git diff -w --quiet -- <file>` shows no content change).

- [ ] **Step 6: Update `handoff.md`**

In "Open Items", replace the "Products page" subsection summary with a short note stating: the Products section shipped with the OCR RP Series page (hub + one product, 5 languages, built by `scripts/build-product-pages.js`, checked by `scripts/verify-products.js`); the old `products.html`/`products.json`/`products-mockup.html` draft is superseded and unused; es/pt/nl/fr copy needs a native check (nl/fr first); the CTA opens the home contact form with `?service=reducers` rather than embedding a second form; next product line is concrete mixers (source and relationship still to be confirmed); OCR images, tables and interchangeability content stay out until OCR agrees. Add one line to the Session log with today's date.

- [ ] **Step 7: Commit, push and open the pull request**

```bash
git add handoff.md sitemap.xml
git commit -m "docs: record Products section in handoff"
git push -u origin feature/products-ocr-reducers
gh pr create --repo brandonr2630/q2m-website --base master --head feature/products-ocr-reducers \
  --title "feat(products): Products hub and OCR RP Series reducers page" \
  --body "Adds /products/ and the OCR RP Series page in five languages, Products in the nav and footer everywhere, and 10 sitemap URLs. Spec: docs/superpowers/specs/2026-10-13-products-ocr-reducers-design.md. Translations need a native check. CTA opens the home contact form with service=reducers (no second EmailJS form)."
```

Expected: a PR URL. Do not merge without the owner's approval.

---

## Self-review

- **Spec coverage:** structure and URLs (Tasks 3-4); hub content and JSON-LD (Tasks 3-4, checks in Task 1); product page content and verified facts (Task 3); nav, footer, sitemap (Tasks 2, 5); build integration (Task 4 Step 3); testing and acceptance (Task 1 plus Task 4 Step 5 and Task 5 Step 4); out-of-scope items stay out (no images, no tables, no filters, no prices, no mixers). Enquiry flow deviates from spec section 7 by design and is flagged in Global Constraints.
- **Placeholders:** none; every step has the code or command.
- **Type consistency:** `HUB`/`PAGES` shape (Task 3) matches what the builder reads (`p.label`, `p.facts`, `p.build`, `p.apps`, `p.faq`, `page.brand`, `page.serviceParam`, `page.heroWord`). `nav_products` keys come from Task 2 and are read via `aboutT` in Task 4. `verify-products.js` URL helpers match the builder's `pageUrl`.
- **Review Focus mapping:** nav leak (Task 2 nav check), description length (Task 3 Step 2 and Task 1 page check), 375 px overflow (Task 4 Step 5), JSON-LD types (Task 1), `?service=reducers` (Task 2 Step 7), apostrophes (Task 1 JSON-LD parse and description checks).
