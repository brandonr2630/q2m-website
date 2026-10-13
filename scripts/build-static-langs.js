#!/usr/bin/env node
/**
 * build-static-langs.js
 *
 * Generates pre-rendered es/pt/nl/fr versions of about.html and privacy.html
 * (the two plain content pages) so each language is indexable at its own URL.
 *
 * Page text lives in each source page's `translations` object. Elements use
 *   data-i18n       -> plain text
 *   data-i18n-html  -> HTML (used where a translation contains links or a <span>)
 *   data-i18n-alt   -> the alt attribute of an <img> (so crawlers see translated alt text)
 * Per-language <title> and meta description live in static-pages-meta.json.
 *
 * Usage:
 *   cd scripts && node build-static-langs.js
 *
 * Output:
 *   ../{es,pt,nl,fr}/about.html
 *   ../{es,pt,nl,fr}/privacy.html
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const cheerio = require('cheerio');

const ROOT  = path.resolve(__dirname, '..');
const BASE  = 'https://www.q2m.io';
const PAGES = ['about', 'privacy'];
const META  = JSON.parse(fs.readFileSync(path.join(__dirname, 'static-pages-meta.json'), 'utf-8'));

const LANGS = [
  { code: 'es', htmlLang: 'es',    ogLocale: 'es_419' },
  { code: 'pt', htmlLang: 'pt-BR', ogLocale: 'pt_BR'  },
  { code: 'nl', htmlLang: 'nl',    ogLocale: 'nl_NL'  },
  { code: 'fr', htmlLang: 'fr',    ogLocale: 'fr_FR'  },
];

// Site pages whose links must stay inside the language directory.
const PAGE_LINKS = new Set(['/depot.html', '/projects.html', '/about.html', '/privacy.html']);

function loadTranslations(raw, page) {
  const start = raw.indexOf('const translations = {');
  const fn    = raw.indexOf('function applyTranslations');
  if (start === -1 || fn === -1) {
    console.error(`ERROR: could not locate the translations object in ${page}.html`);
    process.exit(1);
  }
  const end = raw.lastIndexOf('};', fn);
  // The object literal comes from this repository's own source page (same approach as the other build scripts).
  // eslint-disable-next-line no-eval
  return eval(`(${raw.slice(start + 'const translations = '.length, end + 1)})`);
}

for (const page of PAGES) {
  const raw          = fs.readFileSync(path.join(ROOT, `${page}.html`), 'utf-8');
  const translations = loadTranslations(raw, page);

  const hreflang = `
<link rel="alternate" hreflang="en"        href="${BASE}/${page}.html">
<link rel="alternate" hreflang="es"        href="${BASE}/es/${page}.html">
<link rel="alternate" hreflang="pt-BR"     href="${BASE}/pt/${page}.html">
<link rel="alternate" hreflang="nl"        href="${BASE}/nl/${page}.html">
<link rel="alternate" hreflang="fr"        href="${BASE}/fr/${page}.html">
<link rel="alternate" hreflang="x-default" href="${BASE}/${page}.html">`;

  for (const lang of LANGS) {
    const t         = translations[lang.code];
    const m         = META[page][lang.code];
    const canonical = `${BASE}/${lang.code}/${page}.html`;
    const $         = cheerio.load(raw, { decodeEntities: false });

    $('html').attr('lang', lang.htmlLang);
    $('title').text(m.title);
    $('meta[name="description"]').attr('content', m.description);
    $('meta[property="og:title"]').attr('content', m.title);
    $('meta[property="og:description"]').attr('content', m.description);
    $('meta[property="og:url"]').attr('content', canonical);
    $('meta[property="og:locale"]').attr('content', lang.ogLocale);
    $('meta[name="twitter:title"]').attr('content', m.title);
    $('meta[name="twitter:description"]').attr('content', m.description);

    // Replace the canonical in place (appending would leave two, and Google uses the first)
    $('link[rel="canonical"]').attr('href', canonical);
    $('link[rel="alternate"][hreflang]').remove();
    $('head').append(hreflang);

    $('[data-i18n]').each((_, el) => {
      const key = $(el).attr('data-i18n');
      if (t[key] !== undefined) $(el).text(t[key]);
    });
    $('[data-i18n-html]').each((_, el) => {
      const key = $(el).attr('data-i18n-html');
      if (t[key] !== undefined) $(el).html(t[key]);
    });

    $('[data-i18n-alt]').each((_, el) => {
      const key = $(el).attr('data-i18n-alt');
      if (t[key] !== undefined) $(el).attr('alt', t[key]);
    });

    $('.lang-flag').removeClass('active');
    $(`.lang-flag[data-lang="${lang.code}"]`).addClass('active');

    // Keep links inside the language directory (not the footer language row, which lists every language)
    $('a[href]').not('.footer-langs a').each((_, el) => {
      const href = $(el).attr('href');
      if (href === '/') $(el).attr('href', `/${lang.code}/`);
      else if (href.startsWith('/#')) $(el).attr('href', `/${lang.code}/${href.slice(1)}`);
      else if (PAGE_LINKS.has(href)) $(el).attr('href', `/${lang.code}${href}`);
    });

    // Root-relative asset paths for the subdirectory
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !src.startsWith('/') && !src.startsWith('http')) $(el).attr('src', '/' + src);
    });

    // Structured data: language-specific url/name/description/breadcrumb
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const schema = JSON.parse($(el).html());
        const swap   = (s) => s.split(`${BASE}/${page}.html`).join(canonical);
        for (const node of schema['@graph']) {
          if (node['@type'] === 'BreadcrumbList') {
            node['@id'] = swap(node['@id']);
            node.itemListElement[0].name = t.nav_home;
            node.itemListElement[0].item = `${BASE}/${lang.code}/`;
            node.itemListElement[1].name = t.bc_page;
            node.itemListElement[1].item = canonical;
          } else {
            node['@id']        = swap(node['@id']);
            node.url           = canonical;
            node.name          = m.title;
            node.description   = m.description;
            node.inLanguage    = lang.htmlLang;
            if (node.breadcrumb) node.breadcrumb['@id'] = swap(node.breadcrumb['@id']);
          }
        }
        $(el).html(`\n${JSON.stringify(schema, null, 2)}\n`);
      } catch (err) {
        console.warn(`Schema parse error for ${lang.code}/${page}:`, err.message);
      }
    });

    const outDir = path.join(ROOT, lang.code);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, `${page}.html`), $.html(), 'utf-8');
    console.log(`✓  ${lang.code}/${page}.html`);
  }
}

console.log('Done.');
