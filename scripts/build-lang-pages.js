#!/usr/bin/env node
/**
 * build-lang-pages.js
 *
 * Generates pre-rendered Spanish (es/) and Portuguese (pt/) versions of
 * index.html so Google can index both languages from separate URLs.
 *
 * Run this whenever index.html content or translations change.
 *
 * Usage:
 *   cd scripts && npm install && npm run build-langs
 *
 * Output:
 *   ../es/index.html
 *   ../pt/index.html
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');

// ── 1. Read index.html ────────────────────────────────────────────────
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');

// ── 2. Extract translations object from embedded JS ───────────────────
const START_MARKER = 'const translations = {';
const FN_MARKER    = 'function applyTranslations';
const s   = html.indexOf(START_MARKER);
const eFn = html.indexOf(FN_MARKER);
if (s === -1 || eFn === -1) {
  console.error('ERROR: Could not locate translations object in index.html');
  process.exit(1);
}
// Find the closing }; immediately before the function declaration (works with CRLF and LF)
const e = html.lastIndexOf('};', eFn);
// eslint-disable-next-line no-eval
const translations = eval(`(${html.slice(s + 'const translations = '.length, e + 1)})`);

// ── 3. Language targets ────────────────────────────────────────────────
const LANGS = [
  {
    code:        'es',
    htmlLang:    'es',
    dir:         'es',
    canonical:   'https://www.q2m.io/es/',
    ogLocale:    'es_419',
    title:       'Q² Machines — Ingeniería Industrial | Caribe y Suramérica',
    description: 'Q² Machines es una empresa de ingeniería especializada en Sistemas Transportadores, Plantas de Concreto y Motores & Bombas — atendiendo industrias de minería, canteras y manufactura en el Caribe, Venezuela, Colombia y Suramérica.',
  },
  {
    code:        'pt',
    htmlLang:    'pt-BR',
    dir:         'pt',
    canonical:   'https://www.q2m.io/pt/',
    ogLocale:    'pt_BR',
    title:       'Q² Machines — Engenharia Industrial | Caribe e América do Sul',
    description: 'Q² Machines é uma empresa de engenharia especializada em Sistemas Transportadores, Usinas de Concreto e Motores & Bombas — atendendo indústrias de mineração, pedreiras e manufatura no Caribe, Venezuela, Guiana e América do Sul.',
  },
  {
    code:        'nl',
    htmlLang:    'nl',
    dir:         'nl',
    canonical:   'https://www.q2m.io/nl/',
    ogLocale:    'nl_NL',
    title:       'Q² Machines — Industriële Engineering, Trinidad en Caribisch Gebied',
    description: 'Q² Machines is een engineeringbedrijf gespecialiseerd in het Ontwerp, de Fabricage en het Onderhoud van Transportbandsystemen, Betonplanten, Motoren en Pompen in het Caribisch Gebied.',
  },
  {
    code:        'fr',
    htmlLang:    'fr',
    dir:         'fr',
    canonical:   'https://www.q2m.io/fr/',
    ogLocale:    'fr_FR',
    title:       'Q² Machines — Ingénierie Industrielle, Trinidad et Caraïbes',
    description: 'Q² Machines est une entreprise d\'ingénierie spécialisée dans la Conception, la Fabrication et la Maintenance de Systèmes de Convoyeurs, Centrales à Béton, Moteurs et Pompes dans les Caraïbes.',
  },
];

const HREFLANG = `
<link rel="alternate" hreflang="en"        href="https://www.q2m.io/">
<link rel="alternate" hreflang="es"        href="https://www.q2m.io/es/">
<link rel="alternate" hreflang="pt-BR"     href="https://www.q2m.io/pt/">
<link rel="alternate" hreflang="nl"        href="https://www.q2m.io/nl/">
<link rel="alternate" hreflang="fr"        href="https://www.q2m.io/fr/">
<link rel="alternate" hreflang="x-default" href="https://www.q2m.io/">`;

// ── 4. Generate each language page ────────────────────────────────────
for (const lang of LANGS) {
  const t = translations[lang.code];
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

  // canonical — replace the existing English canonical rather than appending a second one
  const existingCanonical = $('link[rel="canonical"]');
  if (existingCanonical.length) {
    existingCanonical.attr('href', lang.canonical);
  } else {
    $('head').append(`<link rel="canonical" href="${lang.canonical}">`);
  }

  // hreflang
  $('head').append(HREFLANG);

  // data-i18n elements (covers all labelled text, nav, form labels, button, etc.)
  $('[data-i18n]').each((_, el) => {
    const key = $(el).attr('data-i18n');
    if (t[key] !== undefined) $(el).html(t[key]);
  });

  // Input placeholders (not annotated with data-i18n, translated via phMap in JS)
  const phMap = {
    '#cf-name':    'ph_name',
    '#cf-company': 'ph_company',
    '#cf-email':   'ph_email',
    '#cf-phone':   'ph_phone',
    '#cf-message': 'ph_message',
  };
  Object.entries(phMap).forEach(([sel, key]) => {
    if (t[key]) $(sel).attr('placeholder', t[key]);
  });

  // Hours (direct text node in last .project-detail-item; no data-i18n)
  const hoursEl  = $('.project-detail-item').last();
  const iconHtml = hoursEl.find('.project-detail-icon').prop('outerHTML') || '';
  hoursEl.html(`${iconHtml}\n          ${t.hours}\n        `);

  // Active language flag
  $('.lang-flag').removeClass('active');
  $(`.lang-flag[data-lang="${lang.code}"]`).addClass('active');

  // Patch cross-page nav hrefs to stay in the same language subdirectory
  $('a[href="/depot.html"]').attr('href', `/${lang.code}/depot.html`);
  $('a[href="/projects.html"]').attr('href', `/${lang.code}/projects.html`);

  // Schema: fix known issues + add WebPage node with inLanguage
  const schemaEl = $('script[type="application/ld+json"]');
  try {
    const schema = JSON.parse(schemaEl.html());
    schema['@graph'].forEach(node => {
      // Fix obfuscated email
      if (node.contactPoint?.email) node.contactPoint.email = 'qhub@q2m.io';
      if (node.email === 'qhub-at-q2m.io') node.email = 'qhub@q2m.io';
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

  // Write output
  const outDir = path.join(ROOT, lang.dir);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), $.html(), 'utf-8');
  console.log(`✓  ${lang.dir}/index.html`);
}

console.log('Done.');
