#!/usr/bin/env node
/**
 * build-depot-langs.js
 *
 * Generates pre-rendered Spanish (es/) and Portuguese (pt/) versions of
 * depot.html so Google can index the equipment listings in each language.
 *
 * Usage:
 *   cd scripts && node build-depot-langs.js
 *
 * Output:
 *   ../es/depot.html
 *   ../pt/depot.html
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');

// Pre-patch currentLang in the raw HTML before cheerio loads it — safer than
// post-serialisation string replace which can silently no-op if DOM is reordered.
const rawHtml  = fs.readFileSync(path.join(ROOT, 'depot.html'), 'utf-8');
const listings = JSON.parse(fs.readFileSync(path.join(ROOT, 'listings.json'), 'utf-8'));

// Extract the translations object from the embedded script
const START_MARKER = 'const translations = {';
const FN_MARKER    = 'function applyTranslations';
const s   = rawHtml.indexOf(START_MARKER);
const eFn = rawHtml.indexOf(FN_MARKER);
if (s === -1 || eFn === -1) {
  console.error('ERROR: Could not locate translations object in depot.html');
  process.exit(1);
}
const e = rawHtml.lastIndexOf('};', eFn);
// eslint-disable-next-line no-eval
const translations = eval(`(${rawHtml.slice(s + 'const translations = '.length, e + 1)})`);

const LANGS = [
  {
    code:        'es',
    htmlLang:    'es',
    dir:         'es',
    canonical:   'https://www.q2m.io/es/depot.html',
    ogLocale:    'es_419',
    title:       'Equipos Industriales en Venta — Caribe y Suramérica | Q² Machines',
    description: 'Equipos industriales nuevos, usados y reacondicionados en venta desde Trinidad — bombas, trituradoras, cribas, mezcladoras y más. Disponibles para compradores en el Caribe, Venezuela, Colombia y Suramérica.',
  },
  {
    code:        'pt',
    htmlLang:    'pt-BR',
    dir:         'pt',
    canonical:   'https://www.q2m.io/pt/depot.html',
    ogLocale:    'pt_BR',
    title:       'Equipamentos Industriais à Venda — Caribe e América do Sul | Q² Machines',
    description: 'Equipamentos industriais novos, usados e recondicionados à venda desde Trinidad — bombas, britadores, peneiras, misturadoras e mais. Disponíveis para compradores no Caribe, Venezuela, Guiana e América do Sul.',
  },
  {
    code:        'nl',
    htmlLang:    'nl',
    dir:         'nl',
    canonical:   'https://www.q2m.io/nl/depot.html',
    ogLocale:    'nl_NL',
    title:       'Industriële Apparatuur te Koop — Caribisch gebied & Zuid-Amerika | Q² Machines',
    description: 'Nieuwe, gebruikte en gereviseerde industriële apparatuur te koop vanuit Trinidad — pompen, brekers, zeven, mixers en meer. Beschikbaar voor kopers in het Caribisch gebied, Venezuela, Colombia en Zuid-Amerika.',
  },
  {
    code:        'fr',
    htmlLang:    'fr',
    dir:         'fr',
    canonical:   'https://www.q2m.io/fr/depot.html',
    ogLocale:    'fr_FR',
    title:       'Équipements Industriels à Vendre — Caraïbes et Amérique du Sud | Q² Machines',
    description: "Équipements industriels neufs, d'occasion et reconditionnés à vendre depuis Trinidad — pompes, concasseurs, cribles, malaxeurs et plus. Disponibles pour les acheteurs aux Caraïbes, au Venezuela, en Colombie et en Amérique du Sud.",
  },
];

const HREFLANG = `
<link rel="alternate" hreflang="en"        href="https://www.q2m.io/depot.html">
<link rel="alternate" hreflang="es"        href="https://www.q2m.io/es/depot.html">
<link rel="alternate" hreflang="pt-BR"     href="https://www.q2m.io/pt/depot.html">
<link rel="alternate" hreflang="nl"        href="https://www.q2m.io/nl/depot.html">
<link rel="alternate" hreflang="fr"        href="https://www.q2m.io/fr/depot.html">
<link rel="alternate" hreflang="x-default" href="https://www.q2m.io/depot.html">`;

for (const lang of LANGS) {
  const t = translations[lang.code];
  // Patch currentLang in the raw source before cheerio loads, avoiding
  // a post-serialisation string replace that can silently no-op.
  const html = rawHtml.replace("let currentLang = 'en';", `let currentLang = '${lang.code}';`);
  const $ = cheerio.load(html, { decodeEntities: false });

  // <html lang>
  $('html').attr('lang', lang.htmlLang);

  // <title>
  $('title').text(lang.title);

  // meta description
  $('meta[name="description"]').attr('content', lang.description);

  // Open Graph
  $('meta[property="og:title"]').attr('content', lang.title);
  $('meta[property="og:description"]').attr('content', lang.description);
  $('meta[property="og:url"]').attr('content', lang.canonical);
  $('meta[property="og:locale"]').attr('content', lang.ogLocale);

  // Twitter card
  $('meta[name="twitter:title"]').attr('content', lang.title);
  $('meta[name="twitter:description"]').attr('content', lang.description);

  // Canonical — replace existing
  const existingCanonical = $('link[rel="canonical"]');
  if (existingCanonical.length) {
    existingCanonical.attr('href', lang.canonical);
  } else {
    $('head').append(`<link rel="canonical" href="${lang.canonical}">`);
  }

  // Remove existing hreflang links then append the full set
  $('link[rel="alternate"][hreflang]').remove();
  $('head').append(HREFLANG);

  // Apply data-i18n translations (static text)
  $('[data-i18n]').each((_, el) => {
    const key = $(el).attr('data-i18n');
    if (t[key] !== undefined) $(el).html(t[key]);
  });

  // Apply data-ph placeholder translations
  $('[data-ph]').each((_, el) => {
    const key = $(el).attr('data-ph');
    if (t[key]) $(el).attr('placeholder', t[key]);
  });

  // Set active language flag
  $('.lang-flag').removeClass('active');
  $(`.lang-flag[data-lang="${lang.code}"]`).addClass('active');

  // Patch cross-page nav hrefs to stay in the same language subdirectory
  $('a[href="/depot.html"]').attr('href', `/${lang.code}/depot.html`);
  $('a[href="/projects.html"]').attr('href', `/${lang.code}/projects.html`);

  // Fix relative asset paths for subdirectory (assets/ → /assets/)
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('/') && !src.startsWith('http')) {
      $(el).attr('src', '/' + src);
    }
  });

  // Update JSON-LD schema url to match language page
  const schemaEl = $('script[type="application/ld+json"]');
  try {
    if (!schemaEl.length) throw new Error('no ld+json element found');
    const schema = JSON.parse(schemaEl.html());
    schema['@graph'].forEach(node => {
      if (node['@type'] === 'ItemList') {
        node.url = lang.canonical;
        (node.itemListElement || []).forEach(listItem => {
          const src = listings.find(l => l.id === listItem.position);
          if (!src) return;
          const tName = src[`title_${lang.code}`];
          const tDesc = src[`description_${lang.code}`];
          if (tName) listItem.item.name        = tName;
          if (tDesc) listItem.item.description = tDesc;
        });
      }
    });
    schema['@graph'].push({
      '@type':      'WebPage',
      '@id':        `${lang.canonical}#webpage`,
      'url':        lang.canonical,
      'name':       lang.title,
      'inLanguage': lang.htmlLang,
      'isPartOf':   { '@id': 'https://www.q2m.io/#organization' },
    });
    schemaEl.html(`\n${JSON.stringify(schema, null, 2)}\n`);
  } catch (err) {
    console.warn(`Schema parse error for ${lang.code}:`, err.message);
  }

  const outDir = path.join(ROOT, lang.dir);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'depot.html'), $.html(), 'utf-8');
  console.log(`✓  ${lang.dir}/depot.html`);
}

console.log('Done.');
