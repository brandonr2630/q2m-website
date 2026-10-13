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
.facts-strip{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-top:2px solid var(--gold);margin:0 0 48px;}
.fact{background:var(--ink-3);padding:18px 14px;display:flex;flex-direction:column;gap:6px;min-width:0;}
.fact strong{font-family:'Oswald',sans-serif;font-size:21px;color:var(--gold);line-height:1.15;overflow-wrap:break-word;font-variant-numeric:tabular-nums;}
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
