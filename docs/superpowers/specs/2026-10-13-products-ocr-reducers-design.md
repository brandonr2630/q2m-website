# Products section: OCR RP Series gear reducers (first release)

Date: 2026-10-13 · Status: draft for review · Repo: `brandonr2630/q2m-website`

## 1. Goal

Add a Products section to q2m.io that works as a capability catalogue for **supplied (agency) equipment** and turns visits into enquiries. It is built progressively, one product line at a time. The first line is the **OCR RP Series shaft-mounted gear reducers**; concrete mixers follow in a later release and are out of scope here.

Visitors: buyers and maintenance/project engineers in Trinidad and Tobago, the wider Caribbean, Venezuela, Colombia, Guyana and South America. The pages must also rank in search, so all text is baked into static HTML in all five languages (en, es, pt, nl, fr).

## 2. Decisions already made

| Topic | Decision |
|-------|----------|
| Structure | Hub plus one page per product line (not one long catalogue page, not client-rendered cards). |
| Brand | Q² Machines is OCR's **authorised agent**; owner approved naming OCR on the page. |
| Source material | OCR catalogue `Cat_OCR 2014 RP 2C` (40 pp, it/en) and OCR company profile. **Own wording only.** |
| Not reproduced | OCR rating tables, drawings, logo and catalogue photos (catalogue p. 2 reserves all rights). Revisit if OCR gives written permission. |
| Previous draft | `products.html`, `products.json` (two depot-style pump units) and `products-mockup.html` on `feat/products-page` are **not** used. They stay out of the site. |
| Pricing | None published. No `Product`/`Offer` schema. |
| Interchangeability | OCR's interchangeability appendix is **not** used in this release (names third-party brands; needs OCR's agreement). |
| Language work | All five languages written by Claude; es/pt/nl/fr need a native review afterwards (nl/fr first). |

## 3. URLs and files

| Page | English URL | Language variants |
|------|-------------|-------------------|
| Hub | `/products/` (`products/index.html`) | `/es/products/`, `/pt/products/`, `/nl/products/`, `/fr/products/` |
| OCR RP Series | `/products/ocr-rp-series-shaft-mounted-gear-reducers.html` | same filename under each language directory |

New source files:

- `scripts/product-pages-content.js`: exports `HUB` (hub text) and `PAGES` (one entry per product line), each with a block per language (`en`, `es`, `pt`, `nl`, `fr`). Same pattern as `service-pages-content.js` and `service-hub-content.js`, in a single file.
- `scripts/build-product-pages.js`: generates the hub and each product page in all five languages. Added to `build-all` in `scripts/package.json`.

The generator reuses the shell (head, CSS, nav, footer, scripts) from `about.html`, as `build-service-pages.js` does, so styling and nav stay consistent. Page text is baked per language; flags navigate to the same page in the other language.

## 4. Hub page content

- Hero: label "Products", H1 along the lines of "Equipment we supply", one-paragraph intro: Q² Machines supplies industrial equipment from manufacturers it represents, backed by in-house repair, rewinding, fabrication and commissioning.
- One product card: OCR RP Series Shaft-Mounted Gear Reducers (headline facts + link). A single line states more product lines are being added; it does not name unreleased products.
- Cross-links: Services hub, Equipment Depot (stock units), enquiry CTA.
- JSON-LD: `CollectionPage` + `ItemList` (one item, URL of the product page) + `BreadcrumbList`, referencing the existing `#organization` and `#website` nodes.

## 5. Product page content (OCR RP Series)

All wording is original, derived from the catalogue facts below.

**Verified facts (catalogue pp. 4-5, company profile):**
- Eight sizes: 85, 105, 125, 150, 165, 180, 210, 250.
- Nominal reduction ratios 4 to 25 (4, 10, 16, 20, 25 as printed).
- Rated power 0.6 to 155 kW; rated output torque 160 to 11,280 Nm.
- Efficiency about 0.98 (single stage), 0.96 (double stage).
- Gear capacity rated to ISO 6336, DIN 3990, AGMA 2001-B88.
- Grey cast-iron housing with ribs; case-hardened helical gears (16CrNi4, 20MnCr5 or 18NiCrMo5); ball and/or taper-roller bearings; hollow output shaft (Fe510) with keyway and circlip groove; oil-bath lubrication; double-lip seals; RAL 5010 blue finish; torque arm with brackets.
- Backstop available on request for all sizes; special executions and accessories; drawings in DXF, PDF, XT, IGS and STEP on request.
- Advantages: quick to install, no coupling or base plate, speed range by changing pulleys, one-way rotation lock.
- Applications: conveyors, screw conveyors, elevators, mixers, crushers (catalogue); screens and stackers (company profile).
- Made in-house by O.C.R. s.r.l., Modena, Italy.

**Sections, in order:**
1. Hero: H1 "OCR RP Series Shaft-Mounted Gear Reducers"; lead says Q² Machines is OCR's authorised agent for the region.
2. Key-facts strip: 8 sizes · 0.6-155 kW · up to 11,280 Nm · efficiency · made in Italy.
3. How a shaft-mounted reducer works (shaft mounting, belt drive from motor, torque arm holds reducer and belt tension).
4. Construction and options (housing, gears, bearings, lubrication, backstop, accessories).
5. Applications.
6. Support from Q² Machines: spares, drawings on request, and a link to the existing "Pumps, Motors & Gear Reducers" service page for repair and rewind.
7. FAQ (also emitted as `FAQPage` JSON-LD), including: how to select a size; whether drawings are available; whether a backstop is available.
8. Enquiry form with the product pre-selected.

Sizing/selection tables are not published; the page says ratings and selection support are available on request.

**JSON-LD graph:** `WebPage` (about -> the brand), `BreadcrumbList`, `FAQPage`, and a `Brand` node (O.C.R. Riduttori) linked from the page. `provider` and `isPartOf` reference the existing `#organization` / `#website` nodes.

## 6. Navigation, footer and sitemap

- Add "Products" to the main nav, mobile menu and footer links. String key `nav_products` added in en/es/pt/nl/fr.
- English sources to edit: `index.html`, `about.html`, `depot.html`, `projects.html`, `privacy.html`. Language pages are then regenerated with the existing build scripts (`build-lang-pages`, `build-depot-langs`, `build-projects-langs`, `build-static-langs`, `build-service-pages`). Service pages already take nav and footer from `about.html`.
- `sitemap.xml`: add the hub and product page in all five languages (via `update-sitemap-lastmod.js` or its source list).
- Footer trust-badge copy "All equipment manufactured to your specification" is not applied to supplied items; the product pages avoid that wording.

## 7. Enquiry flow

Reuse the existing EmailJS form pattern from the home page contact form (same service/template, no new third-party). The product page pre-fills a subject such as "OCR RP Series enquiry". Required fields as on the home page; confirmation and error text translated in all five languages.

## 8. Out of scope

- Concrete mixers (next release; source and relationship to be confirmed).
- OCR logo, catalogue photos, rating tables, drawings, interchangeability content.
- Pump curves feature (`pumpcurveshandoff.md`).
- Filters, search or e-commerce features. With one line there is nothing to filter.
- Price display.

## 9. Testing and acceptance

- `npm run build-all` (from `scripts/`) completes with no errors; generated files are committed.
- For each of the 10 new pages: correct language, no untranslated English, valid `canonical` and full `hreflang` set (including `x-default`), JSON-LD parses, internal links resolve inside the language directory, no horizontal scroll at 375 px.
- Nav shows "Products" on every existing page and language variant; sitemap lists all new URLs.
- Enquiry form submits in a local test or is verified against the EmailJS template.
- Claims check: every figure on the page appears in section 5's verified-facts list.
- Delivery: feature branch, PR, owner review of English copy; native review of es/pt/nl/fr tracked in `handoff.md`.

## 10. Risks and open items

- **Copyright:** the catalogue forbids copying; the design avoids it. Confirm with OCR before adding any of their images, tables or drawings.
- **Overlap with the service page:** the existing "Pumps, Motors & Gear Reducers" page covers supply and repair generally. The product page must stay product-specific and link to it, not repeat it.
- **Thin hub:** a one-card hub is short. Acceptable for the first release; it grows with each line.
- **Translations:** machine-assisted; native check needed before the pages are promoted.
- **Nav label:** "Products" assumed; confirm or rename ("Equipment Catalogue").
