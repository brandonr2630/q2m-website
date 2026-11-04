#!/usr/bin/env node
/**
 * build-service-pages.js
 *
 * Generates the service pages and the /services/ hub in all five languages:
 *   services/<slug>.html, services/index.html            (English)
 *   {es,pt,nl,fr}/services/<slug>.html, .../services/index.html
 *
 * Content: scripts/service-pages-content.js (+ -more.js) for the pages, scripts/service-hub-content.js for the hub.
 * The page shell (head, CSS, nav, footer, scripts) is taken from about.html so the pages stay
 * consistent with the rest of the site; nav/footer/CTA strings come from about.html's translations.
 * Page text is baked in per language (no client-side translation); flags navigate to the
 * same page in the other language.
 *
 * Usage:  cd scripts && node build-service-pages.js
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const vm      = require('vm');
const cheerio = require('cheerio');
const { COMMON, PAGES } = require('./service-pages-content');
const HUB = require('./service-hub-content');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://www.q2m.io';

const LANGS = [
  { code: 'en', htmlLang: 'en',    ogLocale: 'en_TT', dir: ''    },
  { code: 'es', htmlLang: 'es',    ogLocale: 'es_419', dir: 'es/' },
  { code: 'pt', htmlLang: 'pt-BR', ogLocale: 'pt_BR',  dir: 'pt/' },
  { code: 'nl', htmlLang: 'nl',    ogLocale: 'nl_NL',  dir: 'nl/' },
  { code: 'fr', htmlLang: 'fr',    ogLocale: 'fr_FR',  dir: 'fr/' },
];
const HREFLANG = { en: 'en', es: 'es', pt: 'pt-BR', nl: 'nl', fr: 'fr' };
const AREA_SERVED = ['Trinidad and Tobago', 'Venezuela', 'Colombia', 'Guyana'];
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
// Homepage service-card strings (c3_p1, c4_s2, ...): bullet lists reuse them so pages match the cards
const indexT   = loadTranslations(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8'));

// The hub is the "page" with hub: true; its URL is /services/ (services/index.html)
const HUB_PAGE = { hub: true, slug: 'index', heroWord: HUB.heroWord };
const pageUrl  = (lang, page) => page.hub ? `${BASE}/${lang.dir}services/` : `${BASE}/${lang.dir}services/${page.slug}.html`;
const pageName = (code, page) => plain(page[code].h1Html);

function breadcrumb(lang, page, url) {
  const code = lang.code;
  const items = [{ name: aboutT[code].nav_home, item: `${BASE}/${lang.dir}` }];
  if (page.hub) items.push({ name: plain(HUB[code].h1Html), item: url });
  else {
    items.push({ name: aboutT[code].nav_services, item: pageUrl(lang, HUB_PAGE) });
    items.push({ name: pageName(code, page), item: url });
  }
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: x.item })),
  };
}

function schemaFor(page, lang, p, url) {
  const name = pageName(lang.code, page);
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
        about: { '@id': `${url}#service` },
      },
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name,
        serviceType: name,
        description: p.lead,
        url,
        provider: { '@id': `${BASE}/#organization` },
        areaServed: AREA_SERVED.map((n) => ({ '@type': 'Country', name: n })),
      },
      breadcrumb(lang, page, url),
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        inLanguage: lang.htmlLang,
        mainEntity: p.faq.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
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
        itemListElement: PAGES.map((pg, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: pageName(lang.code, pg),
          url: pageUrl(lang, pg),
        })),
      },
      breadcrumb(lang, HUB_PAGE, url),
    ],
  };
}

function contentHtml(c, p, supply, does) {
  const li = (arr) => arr.map((x) => `        <li>${esc(x)}</li>`).join('\n');
  const note = p.supplyNoteHtml ? p.supplyNoteHtml : (p.supplyNote ? esc(p.supplyNote) : '');
  const block = (heading, inner) => `
    <div class="content-block reveal">
      <h2>${esc(heading)}</h2>
${inner}
    </div>`;
  const parts = [];
  parts.push(block(c.supplyH, `      <ul class="facts-list">\n${li(supply)}\n      </ul>` + (note ? `\n      <p>${note}</p>` : '')));
  parts.push(block(c.doH, `      <ul class="facts-list">\n${li(does)}\n      </ul>`));
  if (p.house) parts.push(block(c.houseH, `      <p>${esc(p.house)}</p>`));
  else if (p.where) parts.push(block(c.whereH, `      <p>${esc(p.where)}</p>`));
  if (p.project) parts.push(block(c.projectH, `      <p>${esc(p.project)}</p>\n      <p><a href="/projects.html">${esc(c.projectsLink)}</a></p>`));
  parts.push(block(c.faqH, p.faq.map(([q, a]) => `      <h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n')));
  return parts.join('') + '\n  ';
}

// Hub body: one card per service page, then the shared "how we work" / "where we work" blocks from about.html
function hubHtml(code, h) {
  const t = aboutT[code];
  const cards = PAGES.map((pg) => `
      <a class="svc-card reveal" href="/services/${pg.slug}.html">
        <h3>${esc(pageName(code, pg))}</h3>
        <p>${esc(pg[code].description)}</p>
        <span class="svc-card-more">${esc(h.more)}</span>
      </a>`).join('');
  const caps = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `        <li>${esc(t['ab_cap' + n])}</li>`).join('\n');
  return `
    <div class="svc-cards">${cards}
    </div>
    <div class="content-block reveal">
      <h2>${esc(t.ab_how_h)}</h2>
      <p>${esc(t.ab_how_p)}</p>
      <ul class="facts-list">
${caps}
      </ul>
    </div>
    <div class="content-block reveal">
      <h2>${esc(t.ab_where_h)}</h2>
      <p>${esc(t.ab_where_p)}</p>
    </div>
  `;
}

const FAQ_CSS = `.page-hero h1{overflow-wrap:break-word;}
.section-label a{color:inherit;text-decoration:none;}
.section-label a:hover{text-decoration:underline;text-underline-offset:3px;}
.content-block h3{font-family:'Barlow Condensed',sans-serif;font-size:19px;font-weight:700;letter-spacing:.5px;color:var(--text);margin:22px 0 8px;}
.svc-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin:0 0 52px;}
.svc-card{display:flex;flex-direction:column;gap:10px;padding:24px 26px;background:var(--ink-3);border:1px solid var(--border);border-radius:2px;text-decoration:none;transition:border-color .2s,transform .2s;}
.svc-card:hover{border-color:var(--gold);transform:translateY(-2px);}
.svc-card h3{font-family:'Oswald',sans-serif;font-size:22px;font-weight:700;letter-spacing:.3px;line-height:1.2;color:var(--text);margin:0;overflow-wrap:break-word;}
.svc-card p{font-size:14px;color:var(--text-2);line-height:1.65;margin:0;}
.svc-card-more{margin-top:auto;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--gold);}
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
  const c = COMMON[code];
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
    const dest = page.hub ? '/$1/services/' : `/$1/services/${page.slug}.html`;
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

  const schema = page.hub ? hubSchema(lang, p, url) : schemaFor(page, lang, p, url);
  $('script[type="application/ld+json"]').first().html(`\n${JSON.stringify(schema, null, 2)}\n`);

  // CSS: decorative hero word + shared page styles
  const style = $('style').first();
  let css = style.html();
  if (!css.includes("content:'ABOUT'")) throw new Error("about.html no longer has the page-hero ::after content:'ABOUT'");
  css = css.replace("content:'ABOUT'", `content:'${page.heroWord}'`);
  if (!css.includes('/* ── RESPONSIVE')) throw new Error('about.html no longer has the RESPONSIVE marker');
  css = css.replace('/* ── RESPONSIVE', FAQ_CSS + '/* ── RESPONSIVE');
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
  const labelHtml = page.hub ? esc(c.label) : `<a href="/services/">${esc(c.label)}</a>`;
  $('.page-hero-inner').html(`
    <div class="section-label reveal">${labelHtml}</div>
    <h1 class="reveal reveal-delay-1">${p.h1Html}</h1>
    <p class="reveal reveal-delay-2">${esc(p.lead)}</p>
  `);
  if (page.hub) {
    $('.page-inner').html(hubHtml(code, p));
  } else {
    const listOf = (keys) => keys.map((k) => {
      if (indexT[code][k] === undefined) throw new Error(`${page.slug}/${code}: missing homepage string ${k}`);
      return indexT[code][k];
    });
    const supply = p.supply || listOf(page.supplyKeys);
    const does   = p.does   || listOf(page.doKeys);
    $('.page-inner').html(contentHtml(c, p, supply, does));
  }

  // CTA: enquiry form (service pre-selected on service pages); secondary button to the depot
  $('.cta-btn-primary').attr('href', page.hub ? '/#contact' : `/?service=${page.serviceParam}#contact`);

  // About is not the current page; Services is. Nav/footer "Services" opens the hub.
  $('a[href="/about.html"]').removeClass('active');
  $('.mobile-menu a[href="/about.html"]').removeAttr('style');
  $('a[href="/#services"]').attr('href', '/services/');
  $('.nav-links a[href="/services/"]').addClass('active');

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

  const outDir = path.join(ROOT, lang.dir, 'services');
  fs.mkdirSync(outDir, { recursive: true });
  const out = $.html().replace(/\r?\n/g, '\r\n');
  const file = page.hub ? 'index.html' : `${page.slug}.html`;
  fs.writeFileSync(path.join(outDir, file), out, 'utf-8');
  console.log(`✓  ${lang.dir}services/${file}`);
}

for (const page of PAGES) for (const lang of LANGS) build(page, lang);
for (const lang of LANGS) build(HUB_PAGE, lang);
console.log('Done.');
