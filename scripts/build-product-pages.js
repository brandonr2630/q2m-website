#!/usr/bin/env node
/**
 * build-product-pages.js
 *
 * Generates the Products catalogue from the node tree in scripts/products-data.js, in all five languages:
 *   products/index.html                                   hub (tile grid of published top-level nodes)
 *   products/<category>/index.html                        category (breadcrumb, intro, tile grid of children)
 *   products/<category>/<family>/index.html               family (breadcrumb, copy, dimensions, CTA)
 *   {es,pt,nl,fr}/products/...                            same paths per language
 *
 * Only published nodes (products-tree.js published()) produce pages; stale generated .html files under the
 * five products/ trees are deleted. The page shell (head, CSS, nav, footer, CTA, scripts) is cloned from
 * about.html, like build-service-pages.js. Text is baked per language (no client-side translation).
 *
 * It also owns one generated block in each of sitemap.xml (<!-- products:start --> ... <!-- products:end -->,
 * one <url> per published page x language; lastmod is refreshed afterwards by update-sitemap-lastmod.js),
 * llms.txt and llms-full.txt ("# products:start" ... "# products:end" lines, English). Edit the data,
 * not the blocks. Files are only rewritten when their bytes change; each file keeps its line endings.
 *
 * Usage:  cd scripts && node build-product-pages.js
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const vm      = require('vm');
const cheerio = require('cheerio');
const T       = require('./products-tree');
const { UI, NODES, HUB } = require('./products-data');

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
const FIRST_ROW = 4; // tiles per row on desktop; the first row loads eagerly

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const asset = (f) => (f.startsWith('/') ? f : `/${f}`);

function loadTranslations(raw) {
  const start = raw.indexOf('const translations = {');
  const fn    = raw.indexOf('function applyTranslations');
  if (start === -1 || fn === -1) throw new Error('could not locate the translations object');
  const end = raw.lastIndexOf('};', fn);
  // The object literal comes from this repository's own source page; evaluate it in an empty sandbox.
  return vm.runInNewContext(`(${raw.slice(start + 'const translations = '.length, end + 1)})`, Object.create(null));
}

// ── DATA: published set, image check (validate() runs first in main) ──
const PUB = T.published(NODES);
const PNODES = NODES.filter((n) => PUB.has(n.id));
const kids = (id) => T.childrenOf(PNODES, id);
const nodeById = new Map(NODES.map((n) => [n.id, n]));

function checkImages() {
  const missing = [];
  const need = (f, where) => { if (!f || !fs.existsSync(path.join(ROOT, f))) missing.push(`${where}: ${f}`); };
  for (const n of PNODES) {
    if (n.tileImage) need(n.tileImage.file, `${n.id}.tileImage.file`);
    (n.images || []).forEach((im, i) => { need(im.file, `${n.id}.images[${i}].file`); if (im.jpg) need(im.jpg, `${n.id}.images[${i}].jpg`); });
    (n.dimensions || []).forEach((d, i) => need(d.file, `${n.id}.dimensions[${i}].file`));
  }
  if (missing.length) throw new Error(`missing image file(s):\n  ${missing.join('\n  ')}`);
}

const aboutRaw = fs.readFileSync(path.join(ROOT, 'about.html'), 'utf-8');
const aboutT   = loadTranslations(aboutRaw);

// ── PAGES ───────────────────────────────────────────────────
// page: { kind: 'hub' | 'category' | 'family', node (null for hub) }
const nodeId = (page) => (page.node ? page.node.id : null);
const relUrl = (lang, page) => T.nodeUrl(PNODES, nodeId(page), lang.code);
const absUrl = (lang, page) => BASE + relUrl(lang, page);
const isFamily = (n) => !!(n.copy || (n.specs && n.specs.rows && n.specs.rows.length) || n.live);

function pageText(page, code) {
  if (page.kind === 'hub') {
    const h = HUB[code];
    return { title: h.title, description: h.description, h1Html: esc(UI.products[code]), lead: h.lead };
  }
  const n = page.node;
  if (page.kind === 'family' && n.copy) {
    const c = n.copy[code];
    return { title: c.title, description: c.description, h1Html: c.h1Html, lead: c.lead };
  }
  return {
    title: `${n.name[code]} — ${UI.products[code]} | Q² Machines`,
    description: n.description[code],
    h1Html: esc(n.name[code]),
    lead: n.intro ? n.intro[code] : n.description[code],
  };
}

// Visible breadcrumb trail (also the BreadcrumbList): Home › Products › ...ancestors › page
function trail(lang, page) {
  const code = lang.code;
  const items = [
    { name: UI.crumb_home[code], url: `${BASE}/${lang.dir}` },
    { name: UI.products[code], url: BASE + T.nodeUrl(PNODES, null, code) },
  ];
  if (page.node) for (const n of T.pathTo(PNODES, page.node.id)) items.push({ name: n.name[code], url: BASE + T.nodeUrl(PNODES, n.id, code) });
  return items;
}

function crumbsHtml(lang, page) {
  const items = trail(lang, page);
  const lis = items.map((x, i) => (i === items.length - 1
    ? `        <li><span aria-current="page">${esc(x.name)}</span></li>`
    : `        <li><a href="${attr(x.url.replace(BASE, ''))}">${esc(x.name)}</a></li>`)).join('\n');
  return `
      <div class="crumbs" role="navigation" aria-label="${attr(UI.crumbs_label[lang.code])}">
        <ol>
${lis}
        </ol>
      </div>`;
}

function breadcrumbSchema(lang, page, url) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: trail(lang, page).map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: x.url })),
  };
}

function collectionSchema(lang, page, p, url) {
  const list = kids(nodeId(page));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#webpage`,
        url,
        name: p.title,
        description: p.description,
        inLanguage: lang.htmlLang,
        isPartOf: { '@id': `${BASE}/#website` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        about: { '@id': `${BASE}/#organization` },
        mainEntity: { '@id': `${url}#list` },
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#list`,
        itemListElement: list.map((n, i) => ({ '@type': 'ListItem', position: i + 1, name: n.name[lang.code], url: BASE + T.nodeUrl(PNODES, n.id, lang.code) })),
      },
      breadcrumbSchema(lang, page, url),
    ],
  };
}

function familySchema(lang, page, p, url) {
  const n = page.node;
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: p.title,
      description: p.description,
      inLanguage: lang.htmlLang,
      isPartOf: { '@id': `${BASE}/#website` },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      publisher: { '@id': `${BASE}/#organization` },
    },
  ];
  if (n.brand) {
    graph[0].about = { '@id': `${url}#brand` };
    graph.push({ '@type': 'Brand', '@id': `${url}#brand`, name: n.brand.name, url: n.brand.url });
  }
  graph.push(breadcrumbSchema(lang, page, url));
  const faq = n.copy && n.copy[lang.code].faq;
  if (faq && faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      inLanguage: lang.htmlLang,
      mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

// ── TREE ────────────────────────────────────────────────────
function treeHtml(lang, page) {
  const code = lang.code;
  const current = nodeId(page);
  const onPath = new Set(current ? T.pathTo(PNODES, current).map((n) => n.id) : []);
  const cur = (id) => (id === current ? ' aria-current="page"' : '');
  const link = (id, name) => `<a href="${attr(T.nodeUrl(PNODES, id, code))}"${cur(id)}>${esc(name)}</a>`;
  const level = (parent, depth) => {
    const pad = '  '.repeat(depth);
    return kids(parent).map((n) => {
      const ch = kids(n.id);
      if (!ch.length) return `${pad}<li>${link(n.id, n.name[code])}</li>`;
      // Branch: the link and the disclosure are siblings, so no link sits inside <summary> (axe nested-interactive).
      // The summary is a 44 px toggle named after the node; its children list sits below the link.
      return `${pad}<li class="tree-branch">${link(n.id, n.name[code])}<details${onPath.has(n.id) ? ' open' : ''}><summary class="tree-toggle"><span class="vh">${esc(n.name[code])}</span></summary>\n${pad}  <ul>\n${level(n.id, depth + 2)}\n${pad}  </ul>\n${pad}</details></li>`;
    }).join('\n');
  };
  return `
      <div class="cat-tree" role="navigation" aria-label="${attr(UI.categories[code])}">
        <details class="cat-tree-box"${page.kind === 'hub' ? ' open' : ''}>
          <summary class="cat-tree-head">${esc(UI.categories[code])}</summary>
          <ul class="cat-tree-root">
            <li>${link(null, UI.all_categories[code])}</li>
${level(null, 6)}
          </ul>
        </details>
      </div>`;
}

// ── TILES ───────────────────────────────────────────────────
function tilesHtml(lang, parent) {
  const code = lang.code;
  const items = kids(parent).map((n, i) => {
    const href = attr(T.nodeUrl(PNODES, n.id, code));
    const name = `<span class="tile-name">${esc(n.name[code])}</span>`;
    if (!n.tileImage) return `        <li><a class="tile tile-text" href="${href}">${name}</a></li>`;
    const im = n.tileImage;
    const lazy = i >= FIRST_ROW ? ' loading="lazy"' : '';
    // Decorative: the visible name is the link text, so the image takes alt="" (data alt kept for other uses)
    return `        <li><a class="tile" href="${href}"><span class="tile-img"><img src="${attr(asset(im.file))}" width="${im.w}" height="${im.h}" alt=""${lazy} decoding="async"></span>${name}</a></li>`;
  });
  return `
      <ul class="tiles">
${items.join('\n')}
      </ul>`;
}

// ── FAMILY SECTIONS ─────────────────────────────────────────
const li = (arr) => arr.map((x) => `          <li>${esc(x)}</li>`).join('\n');
const sec = (id, heading, inner) => `
      <section id="${id}" class="content-block">
        <h2>${esc(heading)}</h2>
${inner}
      </section>`;

function heroHtml(lang, n) {
  const ims = n.images || [];
  if (!ims.length) return '';
  const figs = ims.map((im, i) => {
    const lazy = i > 0 ? ' loading="lazy"' : '';
    const img = `<img src="${attr(asset(im.jpg || im.file))}" width="${im.w}" height="${im.h}" alt="${attr(im.alt[lang.code])}"${lazy} decoding="async">`;
    const pic = im.jpg ? `<picture><source type="image/webp" srcset="${attr(asset(im.file))}">${img}</picture>` : img;
    return `        ${pic}`;
  });
  return `
      <figure class="fam-hero">
${figs.join('\n')}
      </figure>`;
}

function dimsHtml(lang, n) {
  const dims = n.dimensions || [];
  if (!dims.length) return '';
  const code = lang.code;
  const rows = (n.specs && n.specs.rows) || [];
  const figs = dims.map((d) => {
    const row = rows.find((r) => String(r.size) === String(d.size));
    const model = row ? row.model : String(d.size);
    const cap = `${model} · ${UI.dims_weight[code].replace('{kg}', d.weightKg)}`;
    return `          <figure><img src="${attr(asset(d.file))}" width="${d.w}" height="${d.h}" alt="${attr(d.alt[code])}" loading="lazy" decoding="async"><figcaption>${esc(cap)}</figcaption></figure>`;
  });
  return `
      <section id="dimensions" class="content-block">
        <h2>${esc(UI.dims_heading[code])}</h2>
        <div class="dim-grid">
${figs.join('\n')}
        </div>
      </section>`;
}

// ── SPEC TABLE (spec §7.1) ──────────────────────────────────
// Full table in the static HTML. Each row carries data-* equal to its visible cells; units live in
// the headers only. The filter UI is built by products-filters.js: in the rail on desktop, in
// .spec-filter-slot on phones. On these pages the Categories tree moves into #specs (spec revision).
const hasRows = (n) => !!(n && n.specs && n.specs.rows && n.specs.rows.length);
const colLabel = (c, code) => UI[`col_${c.key}`][code];
const quoteHref = (n, r) => `/?service=${n.serviceParam}&item=${encodeURIComponent(r.id)}#contact`;

function specsHtml(lang, page) {
  const code = lang.code;
  const n = page.node;
  const cols = n.specs.columns;
  const capId = `spec-cap-${n.id}`;
  const head = cols.map((c) => {
    const unit = c.unit ? ` <span class="unit">(${esc(c.unit)})</span>` : '';
    const cls = c.key === 'model' ? 'col-model' : 'num';
    return `<th scope="col" class="${cls}"><span class="col-name">${esc(colLabel(c, code))}</span>${unit}</th>`;
  }).join('');
  const body = n.specs.rows.map((r) => {
    const data = cols.filter((c) => c.key !== 'model').map((c) => ` data-${c.key}="${attr(r[c.key])}"`).join('');
    const cells = cols.map((c) => (c.key === 'model'
      ? `<th scope="row">${esc(r.model)}</th>`
      : `<td class="num">${esc(r[c.key])}</td>`)).join('');
    return `            <tr id="${attr(r.id)}"${data}>${cells}<td class="quote"><a href="${attr(quoteHref(n, r))}">${esc(UI.request_quote[code])}</a></td></tr>`;
  }).join('\n');
  return `
      <section id="specs" class="content-block">
        <h2>${esc(UI.specs_heading[code])}</h2>
        <div class="spec-cats">${treeHtml(lang, page)}
        </div>
        <div class="spec-filter-slot"></div>
        <div class="spec-scroll" tabindex="0" role="region" aria-labelledby="${capId}">
          <table class="spec-table">
            <caption id="${capId}"><span class="cap-title">${esc(n.name[code])}: ${esc(UI.specs_heading[code])}</span> <span class="cap-note">${esc(UI.spec_caption[code])}</span></caption>
            <thead><tr>${head}<th scope="col" class="col-quote"><span class="vh">${esc(UI.request_quote[code])}</span></th></tr></thead>
            <tbody>
${body}
            </tbody>
          </table>
        </div>
      </section>`;
}

// Inline filter definitions and strings (spec §7.2, §9): read by products-filters.js, no extra request.
function filterDefs(lang, n) {
  const code = lang.code;
  const rows = n.specs.rows;
  const columns = n.specs.columns.filter((c) => c.filter).map((c) => {
    const d = { key: c.key, type: c.filter === 'select' ? 'enum' : 'range', label: colLabel(c, code), unit: c.unit || null };
    if (d.type === 'enum') d.options = [...new Set(rows.map((r) => String(r[c.key])))];
    else {
      const v = rows.map((r) => Number(r[c.key]));
      if (v.some((x) => !Number.isFinite(x))) throw new Error(`${n.id}: column ${c.key} has a non-numeric value`);
      d.min = Math.min(...v);
      d.max = Math.max(...v);
    }
    return d;
  });
  const strings = {
    models: UI.filter_models[code], all: UI.filter_all[code], clear: UI.filter_clear[code], count: UI.filter_count[code],
    none: UI.filter_none[code], min: UI.filter_min[code], max: UI.filter_max[code], active: UI.filter_active[code],
  };
  return JSON.stringify({ columns, strings }).replace(/</g, '\\u003c');
}

const FILTERS_JS = fs.readFileSync(path.join(__dirname, 'products-filters.js'), 'utf-8').replace(/\r\n/g, '\n').trim();
if (/<\/script/i.test(FILTERS_JS)) throw new Error('products-filters.js must not contain "</script"');

function familyHtml(lang, page) {
  const code = lang.code;
  const n = page.node;
  const c = n.copy ? n.copy[code] : null;
  const p = pageText(page, code);
  const parts = [crumbsHtml(lang, page), `
      <h1>${p.h1Html}</h1>
      <p class="fam-desc">${esc(p.lead)}</p>`];
  // Spec §7: the facts strip is the summary, directly under the description and above the hero
  if (c) {
    parts.push(`
      <section id="facts" class="facts-strip">
${c.facts.map(([v, l]) => `        <div class="fact"><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`).join('\n')}
      </section>`);
  }
  parts.push(heroHtml(lang, n));
  if (hasRows(n)) parts.push(specsHtml(lang, page));
  parts.push(dimsHtml(lang, n));
  if (c) {
    parts.push(sec('how', c.howH, `        <p>${esc(c.how)}</p>`));
    parts.push(sec('build', c.buildH, `        <ul class="facts-list">\n${li(c.build)}\n        </ul>\n        <p>${esc(c.buildNote)}</p>`));
    parts.push(sec('apps', c.appH, `        <ul class="facts-list">\n${li(c.apps)}\n        </ul>`));
    const brand = n.brand ? `\n        <p><a href="${attr(n.brand.url)}" rel="noopener external">${esc(UI.brand_link[code])}: ${esc(n.brand.name)}</a></p>` : '';
    parts.push(sec('support', c.supportH, `        <p>${c.supportHtml}</p>${brand}`));
    parts.push(sec('faq', c.faqH, c.faq.map(([q, a]) => `        <h3>${esc(q)}</h3>\n        <p>${esc(a)}</p>`).join('\n')));
  }
  parts.push(`
      <p class="fam-cta"><a class="cta-btn cta-btn-primary" href="${attr(ctaHref(page))}">${esc(UI.request_quote[code])}</a></p>`);
  return parts.join('');
}

function listingHtml(lang, page) {
  const code = lang.code;
  const p = pageText(page, code);
  const parts = [crumbsHtml(lang, page), `
      <h1>${p.h1Html}</h1>
      <p class="cat-intro">${esc(p.lead)}</p>`];
  if (page.kind === 'hub') parts.push(`
      <h2 class="tiles-head">${esc(UI.all_categories[code])}</h2>`);
  parts.push(tilesHtml(lang, nodeId(page)));
  if (page.kind === 'hub') parts.push(`
      <div class="cat-note">
        <p>${esc(HUB[code].moreLine)}</p>
        <p>${HUB[code].linksHtml}</p>
      </div>`);
  return parts.join('');
}

const ctaHref = (page) => (page.kind === 'family' && page.node.serviceParam ? `/?service=${page.node.serviceParam}#contact` : '/#contact');

// ── CSS / JS ────────────────────────────────────────────────
// Scoped under .products-page. Text colours use --text / --text-2 only (never --text-3).
const PRODUCTS_CSS = `
.products-page.page-section{padding-top:200px;}
.products-page .prod-layout{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:240px minmax(0,1fr);gap:48px;align-items:start;}
.products-page .prod-rail{position:sticky;top:130px;max-height:calc(100vh - 150px);overflow-y:auto;}
.products-page .prod-main{min-width:0;max-width:900px;}
.products-page .crumbs ol{list-style:none;display:flex;flex-wrap:wrap;gap:6px;margin:0 0 18px;padding:0;font-family:'Barlow Condensed',sans-serif;font-size:14px;letter-spacing:.5px;color:var(--text-2);}
.products-page .crumbs li+li::before{content:'›';margin-right:6px;color:var(--text-2);}
.products-page .crumbs a{color:var(--text-2);text-decoration:none;}
.products-page .crumbs a:hover,.products-page .crumbs a:focus-visible{color:var(--gold);text-decoration:underline;text-underline-offset:3px;}
.products-page .crumbs [aria-current]{color:var(--text);}
.products-page h1{font-family:'Oswald',sans-serif;font-size:clamp(32px,4.5vw,52px);font-weight:700;letter-spacing:-.5px;line-height:1.1;text-wrap:balance;overflow-wrap:break-word;margin:0 0 14px;color:var(--text);}
.products-page h1 span{color:var(--gold);}
.products-page .cat-intro,.products-page .fam-desc{font-size:16px;color:var(--text-2);line-height:1.7;max-width:720px;margin:0 0 32px;}
.products-page .tiles-head{font-family:'Oswald',sans-serif;font-size:22px;font-weight:700;letter-spacing:.3px;color:var(--text);margin:0 0 16px;}
.products-page .tiles{list-style:none;margin:0 0 40px;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;}
.products-page .tile{display:flex;flex-direction:column;height:100%;min-height:44px;background:var(--ink-3);border:1px solid var(--border);border-radius:2px;text-decoration:none;color:var(--text);transition:border-color .2s;}
.products-page .tile:hover,.products-page .tile:focus-visible{border-color:var(--gold);outline:none;}
.products-page .tile:focus-visible{box-shadow:0 0 0 2px var(--gold);}
.products-page .tile-img{display:block;aspect-ratio:1/1;background:#fff;overflow:hidden;}
.products-page .tile-img img{display:block;width:100%;height:100%;object-fit:contain;}
.products-page .tile-name{display:block;padding:10px 12px 12px;font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:.3px;line-height:1.25;color:var(--text);overflow-wrap:break-word;}
.products-page .tile:hover .tile-name,.products-page .tile:focus-visible .tile-name{color:var(--gold);}
.products-page .tile-text{justify-content:center;min-height:120px;}
.products-page .cat-note p{font-size:15px;color:var(--text-2);line-height:1.7;margin:0 0 8px;}
.products-page .cat-note a{color:var(--gold);text-decoration:underline;text-underline-offset:3px;}
.products-page .cat-tree-head{font-family:'Oswald',sans-serif;font-size:15px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text);cursor:pointer;padding:6px 0 10px;border-bottom:1px solid var(--border);margin-bottom:10px;}
.products-page .cat-tree ul{list-style:none;margin:0;padding:0;}
.products-page .cat-tree ul ul{padding-left:14px;border-left:1px solid var(--border);margin:2px 0 4px 4px;}
.products-page .cat-tree li{margin:0;}
.products-page .cat-tree a{display:inline-block;padding:5px 0;min-height:24px;font-size:14px;line-height:1.35;color:var(--text-2);text-decoration:none;overflow-wrap:break-word;}
.products-page .cat-tree a:hover,.products-page .cat-tree a:focus-visible{color:var(--gold);text-decoration:underline;text-underline-offset:3px;}
.products-page .cat-tree a[aria-current="page"]{color:var(--gold);font-weight:600;}
.products-page .cat-tree-root>li>a{font-family:'Oswald',sans-serif;font-size:15px;letter-spacing:.3px;color:var(--text);}
.products-page .cat-tree-root>li>a[aria-current="page"]{color:var(--gold);}
.products-page .cat-tree summary{cursor:pointer;}
.products-page .cat-tree-head::marker{color:var(--text-2);}
.products-page .vh{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;}
.products-page .tree-branch{position:relative;}
.products-page .tree-branch>a{display:block;padding-right:40px;}
.products-page .tree-toggle{position:absolute;top:0;right:0;width:36px;height:32px;display:flex;align-items:center;justify-content:center;list-style:none;color:var(--text-2);border-radius:2px;}
.products-page .tree-toggle::-webkit-details-marker{display:none;}
.products-page .tree-toggle::before{content:'';width:7px;height:7px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(-45deg);transition:transform .2s;}
.products-page details[open]>.tree-toggle::before{transform:rotate(45deg);}
.products-page .tree-toggle:hover{color:var(--gold);}
.products-page .tree-toggle:focus-visible{color:var(--gold);outline:2px solid var(--gold);outline-offset:-2px;}
.products-page .fam-hero{margin:0 0 40px;background:#fff;border:1px solid var(--border);}
.products-page .fam-hero img{display:block;width:100%;height:auto;}
.products-page .dim-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:16px;}
.products-page .dim-grid figure{margin:0;background:#fff;border:1px solid var(--border);}
.products-page .dim-grid img{display:block;width:100%;height:auto;}
.products-page .dim-grid figcaption{background:var(--ink-3);font-family:'Barlow Condensed',sans-serif;font-size:15px;letter-spacing:.5px;color:var(--text);padding:8px 12px;font-variant-numeric:tabular-nums;}
.products-page .content-block h3{font-family:'Barlow Condensed',sans-serif;font-size:19px;font-weight:700;letter-spacing:.5px;color:var(--text);margin:22px 0 8px;text-transform:none;}
.products-page .facts-strip{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-top:2px solid var(--gold);margin:0 0 48px;}
.products-page .fact{background:var(--ink-3);padding:18px 14px;display:flex;flex-direction:column;gap:6px;min-width:0;}
.products-page .fact strong{font-family:'Oswald',sans-serif;font-size:21px;color:var(--gold);line-height:1.15;overflow-wrap:break-word;font-variant-numeric:tabular-nums;}
.products-page .fact span{font-size:13px;color:var(--text-2);line-height:1.4;}
.products-page .fam-cta{margin:8px 0 0;}
.products-page .fam-cta .cta-btn{display:inline-block;}
.products-page .spec-cats{margin:0 0 12px;}
.products-page .spec-cats .cat-tree-box{border:1px solid var(--border);background:var(--ink-3);padding:4px 14px;}
.products-page .spec-cats .cat-tree-head{border-bottom:none;margin:0;padding:12px 0;min-height:44px;}
.products-page .spec-cats .cat-tree-box[open] .cat-tree-head{border-bottom:1px solid var(--border);margin-bottom:8px;}
.products-page .spec-cats .cat-tree-root{padding-bottom:10px;}
.products-page .filters{border:1px solid var(--border);background:var(--ink-3);padding:4px 14px;}
.products-page .filters>summary{font-family:'Oswald',sans-serif;font-size:15px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--text);cursor:pointer;padding:12px 0;min-height:44px;}
.products-page .filters[open]>summary{border-bottom:1px solid var(--border);margin-bottom:12px;}
.products-page .filters>summary:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
.products-page .filters-n{font-family:'Barlow Condensed',sans-serif;font-weight:400;letter-spacing:.5px;text-transform:none;color:var(--gold);margin-left:4px;}
.products-page .filters-body{padding-bottom:14px;}
.products-page .f-field,.products-page .f-range{margin:0 0 14px;padding:0;border:0;min-width:0;}
.products-page .f-field>label,.products-page .f-range>legend{display:block;padding:0;margin:0 0 6px;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;letter-spacing:.5px;color:var(--text);}
.products-page .f-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
.products-page .f-pair label{display:block;font-size:13px;color:var(--text-2);margin:0 0 4px;}
.products-page .filters select,.products-page .filters input{display:block;width:100%;min-height:44px;padding:8px 10px;background:var(--ink);color:var(--text);border:1px solid var(--border);border-radius:2px;font:inherit;font-size:15px;font-variant-numeric:tabular-nums;}
.products-page .filters input::placeholder{color:var(--text-2);opacity:1;}
.products-page .filters select:focus-visible,.products-page .filters input:focus-visible{outline:2px solid var(--gold);outline-offset:1px;border-color:var(--gold);}
.products-page .filters .filters-count{font-size:15px;line-height:1.4;color:var(--gold);margin:0 0 10px;min-height:1.4em;font-variant-numeric:tabular-nums;}
.products-page .filters-clear{min-height:44px;padding:8px 14px;background:transparent;border:1px solid var(--gold);border-radius:2px;color:var(--gold);font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;}
.products-page .filters-clear:hover:not(:disabled){background:var(--gold-dim);}
.products-page .filters-clear:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
.products-page .filters-clear:disabled{border-color:var(--border);color:var(--text-2);cursor:default;}
.products-page .spec-scroll{overflow:auto;max-height:75vh;border:1px solid var(--border);background:var(--ink);}
.products-page .spec-scroll:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
.products-page .spec-table{width:100%;border-collapse:separate;border-spacing:0;font-size:14px;font-variant-numeric:tabular-nums;}
.products-page .spec-table caption{caption-side:top;text-align:left;padding:12px;background:var(--ink);}
.products-page .cap-title{display:block;font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:700;letter-spacing:.5px;color:var(--text);}
.products-page .cap-note{display:block;font-size:14px;line-height:1.5;color:var(--text-2);}
.products-page .spec-table th,.products-page .spec-table td{padding:8px 12px;border-bottom:1px solid var(--border);white-space:nowrap;text-align:left;color:var(--text);font-weight:400;}
.products-page .spec-table thead th{position:sticky;top:0;z-index:2;background:var(--ink-3);vertical-align:bottom;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;line-height:1.25;}
.products-page .spec-table .unit{text-transform:none;color:var(--text-2);}
.products-page .spec-table .num{text-align:right;}
.products-page .spec-table tbody th{position:sticky;left:0;z-index:1;background:var(--ink);font-weight:600;}
.products-page .spec-table thead th.col-model{left:0;z-index:3;}
.products-page .spec-table tbody tr:hover>*{background:linear-gradient(var(--gold-dim),var(--gold-dim)),var(--ink);}
.products-page .spec-table .quote a{display:inline-block;padding:2px 0;}
.products-page .spec-none td{white-space:normal;padding:16px 12px;}
.products-page .spec-none .filters-clear{margin-left:8px;}
@media(max-width:1024px){.products-page.page-section{padding-top:170px;}}
@media(max-width:899px){
.products-page .prod-layout{grid-template-columns:minmax(0,1fr);gap:0;}
.products-page .prod-rail{position:static;max-height:none;overflow:visible;order:2;margin-bottom:24px;}
.products-page .prod-main{order:3;}
.products-page .prod-rail:empty{display:none;}
.products-page .spec-filter-slot .filters{margin:0 0 12px;}
.products-page .spec-scroll{max-height:70vh;}
.products-page .cat-tree-box{border:1px solid var(--border);background:var(--ink-3);padding:4px 14px;}
.products-page .cat-tree-head{border-bottom:none;margin:0;padding:12px 0;min-height:44px;}
.products-page .cat-tree-box[open] .cat-tree-head{border-bottom:1px solid var(--border);margin-bottom:8px;}
.products-page .cat-tree-root{padding-bottom:10px;}
.products-page .cat-tree a{padding:10px 0;min-height:44px;}
.products-page .tree-branch>a{padding-right:52px;}
.products-page .tree-toggle{width:44px;height:44px;}
.products-page .facts-strip{grid-template-columns:repeat(2,1fr);}
.products-page .fact:last-child{grid-column:1/-1;}
}
@media(max-width:768px){.products-page.page-section{padding-top:140px;}}
@media(max-width:600px){.products-page .dim-grid{grid-template-columns:minmax(0,1fr);}}
`;

const FLAG_SCRIPT = `// ── LANGUAGE FLAGS ────────────────────────────────────────
document.querySelectorAll('.lang-flag').forEach(btn => {
  btn.addEventListener('click', () => {
    try { sessionStorage.setItem('q2m-lang-redir', '1'); } catch (e) {}
    location.href = btn.getAttribute('data-href');
  });
});

// ── PRODUCTS TREE: open the categories disclosure on desktop (rail only; closed above a spec table) ──
(function () {
  var box = document.querySelector('.prod-rail .cat-tree-box');
  if (box && window.matchMedia && window.matchMedia('(min-width: 900px)').matches) box.open = true;
})();

`;

// ── PER-PAGE CONTENT CHECKS (run for all pages before anything is rendered or written) ──
function checkPage(page, lang) {
  const code = lang.code;
  const label = `${page.node ? page.node.id : 'hub'}/${code}`;
  const p = pageText(page, code);
  for (const k of ['title', 'description', 'h1Html', 'lead']) {
    if (typeof p[k] !== 'string' || p[k].trim() === '') throw new Error(`${label}: ${k} missing or empty`);
  }
  if (p.description.length > MAX_DESC) throw new Error(`${label}: description is ${p.description.length} characters (max ${MAX_DESC})`);
  if (page.kind === 'family' && page.node.copy) {
    const c = page.node.copy[code];
    for (const k of ['howH', 'how', 'buildH', 'buildNote', 'appH', 'supportH', 'supportHtml', 'faqH']) {
      if (typeof c[k] !== 'string' || c[k].trim() === '') throw new Error(`${label}: copy.${k} missing or empty`);
    }
    for (const k of ['facts', 'build', 'apps', 'faq']) {
      if (!Array.isArray(c[k]) || !c[k].length) throw new Error(`${label}: copy.${k} missing or empty`);
    }
  }
}

// ── BUILD ONE PAGE ──────────────────────────────────────────
function build(page, lang) {
  const code = lang.code;
  const t = aboutT[code];
  const p = pageText(page, code);

  const url = absUrl(lang, page);
  const $ = cheerio.load(aboutRaw, { decodeEntities: false });

  $('html').attr('lang', lang.htmlLang);

  // Language auto-redirect: keep on the English page only (language pages are already localised)
  $('head script:not([type])').each((_, el) => {
    const txt = $(el).html() || '';
    if (!txt.includes('q2m-lang-redir')) return;
    if (code !== 'en') { $(el).remove(); return; }
    const dest = '/$1' + relUrl(LANGS[0], page);
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
  // Canonical: replace the shell's existing tag in place (never append a second one)
  const canon = $('link[rel="canonical"]');
  if (canon.length !== 1) throw new Error(`about.html has ${canon.length} canonical links (expected 1)`);
  canon.attr('href', url);
  $('link[rel="alternate"][hreflang]').remove();
  canon.after(
    '\n' + LANGS.map((l) => `<link rel="alternate" hreflang="${HREFLANG[l.code]}" href="${absUrl(l, page)}">`).join('\n') +
    `\n<link rel="alternate" hreflang="x-default" href="${absUrl(LANGS[0], page)}">`
  );

  const schema = page.kind === 'family' ? familySchema(lang, page, p, url) : collectionSchema(lang, page, p, url);
  const ld = $('script[type="application/ld+json"]');
  if (ld.length !== 1) throw new Error(`about.html has ${ld.length} JSON-LD blocks (expected 1)`);
  ld.html(`\n${JSON.stringify(schema, null, 2)}\n`);

  // CSS: one scoped block for the catalogue, after the shell styles
  $('style').first().after(`\n<style id="products-css">${PRODUCTS_CSS}</style>`);

  // Shared strings (nav, footer, CTA) from about.html translations
  $('[data-i18n]').each((_, el) => {
    const key = $(el).attr('data-i18n');
    if (t[key] !== undefined) $(el).text(t[key]);
  });
  $('[data-i18n-html]').each((_, el) => {
    const key = $(el).attr('data-i18n-html');
    if (t[key] !== undefined) $(el).html(t[key]);
  });

  // Body: replace the about hero, divider and content section with the catalogue layout
  const hero = $('section.page-hero');
  const content = $('section.page-section');
  if (hero.length !== 1 || content.length !== 1) throw new Error('about.html no longer has one .page-hero and one .page-section');
  hero.next('.gold-divider').remove();
  hero.remove();
  const main = page.kind === 'family' ? familyHtml(lang, page) : listingHtml(lang, page);
  // Family with rows: the rail is left empty for the filters (the tree sits in #specs); otherwise the tree.
  const withTable = page.kind === 'family' && hasRows(page.node);
  const rail = withTable ? '<div class="prod-rail"></div>' : `<div class="prod-rail">${treeHtml(lang, page)}
    </div>`;
  content.replaceWith(`<main class="page-section products-page">
  <div class="prod-layout">
    ${rail}
    <div class="prod-main">${main}
    </div>
  </div>
</main>`);

  // CTA: enquiry opens the home-page contact form (service pre-selected on family pages)
  $('.cta-section .cta-btn-primary').attr('href', ctaHref(page));

  // About is not the current page; Products is. Nav/footer "Services" opens the services hub.
  $('a[href="/about.html"]').removeClass('active');
  $('.mobile-menu a[href="/about.html"]').removeAttr('style');
  $('a[href="/#services"]').attr('href', '/services/');
  $('.nav-links a[href="/products/"]').addClass('active');
  $('.mobile-menu a[href="/products/"]').attr('style', 'color:var(--gold);');

  // Language flags: current language active, buttons navigate to the same page in each language
  $('.lang-flag').each((_, el) => {
    const l = LANGS.find((x) => x.code === $(el).attr('data-lang'));
    $(el).attr('data-href', relUrl(l, page));
    $(el).toggleClass('active', l.code === code);
  });
  $('.footer-langs a').each((_, el) => {
    const l = LANGS.find((x) => x.code === $(el).attr('lang'));
    $(el).attr('href', relUrl(l, page));
  });

  // Links stay inside the language directory (not the footer language row). Catalogue links are
  // already language-prefixed (/es/products/...) and do not match these rules.
  if (code !== 'en') {
    $('a[href]').not('.footer-langs a').each((_, el) => {
      const href = $(el).attr('href');
      if (href === '/') $(el).attr('href', `/${code}/`);
      else if (href.startsWith('/#') || href.startsWith('/?')) $(el).attr('href', `/${code}/${href.slice(1)}`);
      else if (PAGE_LINKS.has(href) || href.startsWith('/services/') || href.startsWith('/products/')) $(el).attr('href', `/${code}${href}`);
    });
  }

  // Root-relative asset paths (pages live two to four directories deep)
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('/') && !src.startsWith('http') && !src.startsWith('data:')) $(el).attr('src', '/' + src);
  });

  // Scripts: drop the client-side translation block, add flag navigation and the tree opener
  let patched = 0;
  $('script:not([type])').each((_, el) => {
    const txt = $(el).html() || '';
    const a = txt.indexOf('// ── i18n');
    const b = txt.indexOf('// ── REVEAL');
    if (a === -1 || b === -1) return;
    $(el).html(txt.slice(0, a) + FLAG_SCRIPT + txt.slice(b));
    patched++;
  });
  if (patched !== 1) throw new Error(`about.html: expected one script with the i18n and REVEAL markers, found ${patched}`);

  // Spec-table filters: definitions + strings as inline JSON, then the client script, at the end of <body>
  if (withTable) {
    $('body').append(`<script type="application/json" id="filter-defs">${filterDefs(lang, page.node)}</script>
<script>
${FILTERS_JS}
</script>
`);
  }

  $('[data-i18n]').removeAttr('data-i18n');
  $('[data-i18n-html]').removeAttr('data-i18n-html');
  $('[data-i18n-alt]').removeAttr('data-i18n-alt');
  $('[data-i18n-aria]').removeAttr('data-i18n-aria');

  // Rendered in memory only; main() writes after every page has rendered without error
  const rel = relUrl(lang, page).replace(/^\//, '') + 'index.html';
  return { rel, html: $.html().replace(/\r?\n/g, '\r\n') };
}

// ── STALE OUTPUT ────────────────────────────────────────────
// Deletes generated .html files that are no longer in the published set, inside the five products/ trees only.
function removeStale(written) {
  const keep = new Set(written.map((r) => path.join(ROOT, r)));
  const removed = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(abs);
        if (fs.readdirSync(abs).length === 0) fs.rmdirSync(abs);
      } else if (ent.name.endsWith('.html') && !keep.has(abs)) {
        fs.unlinkSync(abs);
        removed.push(path.relative(ROOT, abs).replace(/\\/g, '/'));
      }
    }
  };
  for (const l of LANGS) walk(path.join(ROOT, l.dir, 'products'));
  return removed;
}

// ── PAGE LIST (hub, then categories and families depth-first in tree order) ──
// Takes the node list as a parameter so verify-products.js can run it on the data plus an
// in-memory unpublished fixture node and prove the fixture never reaches a page, sitemap or llms line.
function pageList(nodes) {
  const pub = T.published(nodes);
  const pn = nodes.filter((n) => pub.has(n.id));
  const pages = [{ kind: 'hub', node: null }];
  const visit = (parent) => {
    for (const n of T.childrenOf(pn, parent)) {
      const ch = T.childrenOf(pn, n.id);
      if (ch.length) { pages.push({ kind: 'category', node: n }); visit(n.id); }
      else if (isFamily(n)) pages.push({ kind: 'family', node: n });
      else throw new Error(`${n.id}: published leaf without family content`);
    }
  };
  visit(null);
  return { pages, pn };
}

// ── GENERATED BLOCKS IN sitemap.xml, llms.txt, llms-full.txt (spec §10) ──
// Each file holds one delimited block, regenerated from the published set; everything outside the
// block is left byte for byte. Markers: XML comments in sitemap.xml; "# products:start" /
// "# products:end" lines in the llms files (their own comment-line convention, as in their header).
const MARK = {
  sitemap: { start: '<!-- products:start -->', end: '<!-- products:end -->', indent: '  ' },
  llms: { start: '# products:start', end: '# products:end', indent: '' },
};
// Same changefreq as every neighbouring entry; priorities as the removed Products entries had them
// (hub 0.7, pages below it 0.6, the same in every language).
const SITEMAP_PRIORITY = { hub: '0.7', category: '0.6', family: '0.6' };

function todayLocal() { // same rule as update-sitemap-lastmod.js
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Lines of the sitemap block. lastmod: kept from the current file for a URL already listed (the dates
// belong to update-sitemap-lastmod.js, which runs after this script in build-all), else today.
function sitemapLines(nodes, lastmods, today) {
  const { pages, pn } = pageList(nodes);
  const i = MARK.sitemap.indent;
  const out = [i + MARK.sitemap.start];
  for (const pg of pages) {
    for (const l of LANGS) {
      const loc = BASE + T.nodeUrl(pn, pg.node ? pg.node.id : null, l.code);
      out.push(`${i}<url>`, `${i}  <loc>${loc}</loc>`, `${i}  <lastmod>${lastmods.get(loc) || today}</lastmod>`,
        `${i}  <changefreq>monthly</changefreq>`, `${i}  <priority>${SITEMAP_PRIORITY[pg.kind]}</priority>`, `${i}</url>`);
    }
  }
  out.push(i + MARK.sitemap.end);
  return out;
}

// English entries for the llms files (the files are written in English): hub, categories, families.
function llmsEntries(nodes) {
  const { pages, pn } = pageList(nodes);
  return pages.map((pg) => ({
    id: pg.node ? pg.node.id : null,
    name: pg.node ? pg.node.name.en : UI.products.en,
    url: BASE + T.nodeUrl(pn, pg.node ? pg.node.id : null, 'en'),
    desc: pg.node ? pg.node.description.en : HUB.en.description,
    depth: pg.node ? T.pathTo(pn, pg.node.id).length : 0,
  }));
}

function llmsLines(nodes, full) {
  const es = llmsEntries(nodes);
  const body = [];
  es.forEach((e, k) => {
    if (!full) { body.push(`${'  '.repeat(e.depth)}- ${e.name}: ${e.url} (${e.desc})`); return; }
    if (k) body.push('');
    body.push(`${e.name}: ${e.url}`, e.desc);
  });
  return [MARK.llms.start, '## Products', ...body, MARK.llms.end];
}

const count = (s, sub) => s.split(sub).length - 1;

function eolOf(raw, file) {
  const crlf = count(raw, '\r\n');
  const lf = count(raw, '\n');
  if (crlf && crlf !== lf) throw new Error(`${file}: mixed line endings (${crlf} CRLF, ${lf - crlf} LF)`);
  return crlf ? '\r\n' : '\n';
}

// Replaces the block between the markers (whole lines), or, on the first run, inserts it before the
// anchor line (followed by `gap` blank lines). Throws if a marker or the anchor is not found exactly once.
function spliceBlock(raw, file, mark, lines, anchor, gap) {
  const eol = eolOf(raw, file);
  const block = lines.join(eol);
  const ns = count(raw, mark.start);
  const ne = count(raw, mark.end);
  if (ns !== ne || ns > 1) throw new Error(`${file}: expected 0 or 1 "${mark.start}" / "${mark.end}" pair, found ${ns} / ${ne}`);
  if (ns === 1) {
    const s = raw.lastIndexOf('\n', raw.indexOf(mark.start)) + 1;
    const e = raw.indexOf(mark.end) + mark.end.length;
    if (e < s) throw new Error(`${file}: "${mark.end}" comes before "${mark.start}"`);
    return raw.slice(0, s) + block + raw.slice(e);
  }
  const quoted = anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('^' + quoted + '\\r?$', 'gm');
  const hits = raw.match(re) || [];
  if (hits.length !== 1) throw new Error(`${file}: anchor line "${anchor}" found ${hits.length} times (expected 1)`);
  const at = raw.search(re);
  return raw.slice(0, at) + block + eol.repeat(1 + gap) + raw.slice(at);
}

function blockFiles(nodes) {
  const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf-8');
  const sm = read('sitemap.xml');
  const lastmods = new Map();
  for (const m of sm.matchAll(/<url>[\s\S]*?<loc>\s*([^<]*?)\s*<\/loc>[\s\S]*?<lastmod>\s*([^<]*?)\s*<\/lastmod>[\s\S]*?<\/url>/g)) lastmods.set(m[1], m[2]);
  return [
    { rel: 'sitemap.xml', before: sm, html: spliceBlock(sm, 'sitemap.xml', MARK.sitemap, sitemapLines(nodes, lastmods, todayLocal()), '</urlset>', 0) },
    { rel: 'llms.txt', before: read('llms.txt'), html: spliceBlock(read('llms.txt'), 'llms.txt', MARK.llms, llmsLines(nodes, false), '## About page and Privacy Policy', 1) },
    { rel: 'llms-full.txt', before: read('llms-full.txt'), html: spliceBlock(read('llms-full.txt'), 'llms-full.txt', MARK.llms, llmsLines(nodes, true), '## About page and Privacy Policy', 1) },
  ];
}

// Writes only when the bytes differ, so a no-op build leaves every file (and its mtime) alone.
function writeIfChanged(rel, content) {
  const out = path.join(ROOT, rel);
  if (fs.existsSync(out) && fs.readFileSync(out, 'utf-8') === content) return false;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content, 'utf-8');
  return true;
}

function main() {
  T.validate(NODES); // a data error aborts the build before anything is written
  checkImages();
  const { pages } = pageList(NODES);
  for (const pg of pages) if (pg.node && !nodeById.has(pg.node.id)) throw new Error(`${pg.node.id}: unknown node`);

  // 1. Per-page content checks for every page and language, 2. render all pages and blocks in memory,
  // 3. only then write and clean up. A late data error therefore never leaves a partial write.
  for (const pg of pages) for (const lang of LANGS) checkPage(pg, lang);
  const rendered = [];
  for (const pg of pages) for (const lang of LANGS) rendered.push(build(pg, lang));
  const blocks = blockFiles(NODES);
  let changed = 0;
  for (const r of rendered) {
    const w = writeIfChanged(r.rel, r.html);
    if (w) changed++;
    console.log(`${w ? '✓ ' : '= '} ${r.rel}`);
  }
  for (const b of blocks) {
    const w = writeIfChanged(b.rel, b.html);
    console.log(`${w ? '✓ ' : '= '} ${b.rel} (products block${w ? ' updated' : ' unchanged'})`);
  }
  const written = rendered.map((r) => r.rel);
  const removed = removeStale(written);
  for (const r of removed) console.log(`✗  removed stale ${r}`);
  console.log(`Done: ${written.length} pages (${pages.length} × ${LANGS.length} languages), ${changed} rewritten, ${written.length - changed} unchanged.`);
}

module.exports = { pageList, sitemapLines, llmsEntries, llmsLines, spliceBlock, MARK, BASE, LANGS, PRODUCTS_CSS };

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(`build-product-pages: ${err.message}`);
    process.exit(1);
  }
}
