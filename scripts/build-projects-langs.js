#!/usr/bin/env node
/**
 * build-projects-langs.js
 *
 * Generates pre-rendered es/pt/nl/fr versions of projects.html so Google
 * can index the project portfolio in each language.
 *
 * Usage:
 *   cd scripts && node build-projects-langs.js
 *
 * Output:
 *   ../es/projects.html
 *   ../pt/projects.html
 *   ../nl/projects.html
 *   ../fr/projects.html
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT    = path.resolve(__dirname, '..');
const rawHtml = fs.readFileSync(path.join(ROOT, 'projects.html'), 'utf-8');

const START_MARKER = 'const translations = {';
const FN_MARKER    = 'function applyTranslations';
const s   = rawHtml.indexOf(START_MARKER);
const eFn = rawHtml.indexOf(FN_MARKER);
if (s === -1 || eFn === -1) {
  console.error('ERROR: Could not locate translations object in projects.html');
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
    canonical:   'https://www.q2m.io/es/projects.html',
    ogLocale:    'es_419',
    title:       'Proyectos de Ingeniería — Sistemas Transportadores y Plantas de Concreto | Q² Machines',
    description: 'Proyectos de ingeniería entregados por Q² Machines en el Caribe — sistemas transportadores, plantas de concreto, herrería estructural y puesta en marcha de maquinaria. Con sede en Trinidad y Tobago.',
  },
  {
    code:        'pt',
    htmlLang:    'pt-BR',
    dir:         'pt',
    canonical:   'https://www.q2m.io/pt/projects.html',
    ogLocale:    'pt_BR',
    title:       'Projetos de Engenharia — Sistemas de Esteiras e Usinas de Concreto | Q² Machines',
    description: 'Projetos de engenharia entregues pela Q² Machines no Caribe — sistemas de esteiras, usinas de concreto, estruturas metálicas e comissionamento de maquinário. Sediada em Trinidad e Tobago.',
  },
  {
    code:        'nl',
    htmlLang:    'nl',
    dir:         'nl',
    canonical:   'https://www.q2m.io/nl/projects.html',
    ogLocale:    'nl_NL',
    title:       'Technische Projecten — Transportbandsystemen & Betonplanten | Q² Machines',
    description: 'Technische projecten uitgevoerd door Q² Machines in het Caribisch gebied — transportbandsystemen, betonplanten, staalconstructies en inbedrijfstelling van machines. Gevestigd in Trinidad en Tobago.',
  },
  {
    code:        'fr',
    htmlLang:    'fr',
    dir:         'fr',
    canonical:   'https://www.q2m.io/fr/projects.html',
    ogLocale:    'fr_FR',
    title:       "Projets d'Ingénierie — Systèmes Convoyeurs et Centrales à Béton | Q² Machines",
    description: "Projets d'ingénierie réalisés par Q² Machines dans les Caraïbes — systèmes convoyeurs, centrales à béton, charpentes métalliques et mise en service de machines. Basée à Trinité-et-Tobago.",
  },
];

const HREFLANG = `
<link rel="alternate" hreflang="en"        href="https://www.q2m.io/projects.html">
<link rel="alternate" hreflang="es"        href="https://www.q2m.io/es/projects.html">
<link rel="alternate" hreflang="pt-BR"     href="https://www.q2m.io/pt/projects.html">
<link rel="alternate" hreflang="nl"        href="https://www.q2m.io/nl/projects.html">
<link rel="alternate" hreflang="fr"        href="https://www.q2m.io/fr/projects.html">
<link rel="alternate" hreflang="x-default" href="https://www.q2m.io/projects.html">`;

for (const lang of LANGS) {
  const t = translations[lang.code];
  const $ = cheerio.load(rawHtml, { decodeEntities: false });

  // <html lang>
  $('html').attr('lang', lang.htmlLang);

  // <title>
  $('title').text(lang.title);

  // meta description + og/twitter
  $('meta[name="description"]').attr('content', lang.description);
  $('meta[property="og:title"]').attr('content', lang.title);
  $('meta[property="og:description"]').attr('content', lang.description);
  $('meta[property="og:url"]').attr('content', lang.canonical);
  $('meta[property="og:locale"]').attr('content', lang.ogLocale);
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

  // Apply data-i18n translations
  $('[data-i18n]').each((_, el) => {
    const key = $(el).attr('data-i18n');
    if (t[key] !== undefined) $(el).html(t[key]);
  });

  // Active language flag
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

  // Update JSON-LD: fix url fields and add WebPage node with inLanguage
  const schemaEls = $('script[type="application/ld+json"]');
  schemaEls.each((_, el) => {
    try {
      const schema = JSON.parse($(el).html());
      if (schema.url === 'https://www.q2m.io/projects.html') {
        schema.url = lang.canonical;
        if (schema['@id']) schema['@id'] = lang.canonical;
      }
      if (!Array.isArray(schema['@graph'])) {
        $(el).html(`\n${JSON.stringify(schema, null, 2)}\n`);
        return;
      }
      schema['@graph'].forEach(node => {
        if (node.url === 'https://www.q2m.io/projects.html') node.url = lang.canonical;
      });
      schema['@graph'].push({
        '@type':      'WebPage',
        '@id':        `${lang.canonical}#webpage`,
        'url':        lang.canonical,
        'name':       lang.title,
        'inLanguage': lang.htmlLang,
        'isPartOf':   { '@id': 'https://www.q2m.io/#organization' },
      });
      $(el).html(`\n${JSON.stringify(schema, null, 2)}\n`);
    } catch (err) {
      console.warn(`Schema parse error for ${lang.code}:`, err.message);
    }
  });

  const outDir = path.join(ROOT, lang.dir);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'projects.html'), $.html(), 'utf-8');
  console.log(`✓  ${lang.dir}/projects.html`);
}

console.log('Done.');
