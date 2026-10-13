#!/usr/bin/env node
/**
 * verify-products.js
 *
 * Checks the Products section (hub + OCR RP Series page, 5 languages), the Products nav link on
 * every page, and the sitemap entries.
 *
 * Usage:  cd scripts && node verify-products.js [nav] [pages] [sitemap] [links]
 * No argument runs all four sections. Exit code 1 if any check fails.
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
    check(!!list && (list.itemListElement || []).length >= 1, `${rel}: missing ItemList`);
    if (list) check((list.itemListElement || [])[0] && list.itemListElement[0].url === pageUrl(l), `${rel}: ItemList should list ${pageUrl(l)}`);
    check($(`a[href="${l.dir ? '/' + l.code : ''}/products/${SLUG}.html"]`).length >= 1, `${rel}: hub must link to the product page`);
  } else {
    check(types.includes('WebPage'), `${rel}: missing WebPage`);
    check(types.includes('Brand'), `${rel}: missing Brand`);
    const faq = graph.find((n) => n['@type'] === 'FAQPage');
    check(!!faq && (faq.mainEntity || []).length >= 3, `${rel}: FAQPage needs at least 3 questions`);
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

// ── cross-links: the services page for reducers links to the product page ───────────────
function verifyLinks() {
  for (const l of LANGS) {
    const rel = `${l.dir}services/pumps-and-drives.html`;
    if (!exists(rel)) { check(false, `${rel} is missing`); continue; }
    const $ = cheerio.load(read(rel));
    const href = `${l.dir ? '/' + l.code : ''}/products/${SLUG}.html`;
    check($(`.page-inner a[href="${href}"]`).length === 1, `${rel}: expected exactly one in-content link to ${href}`);
  }
}

if (want('nav')) verifyNav();
if (want('pages')) verifyPages();
if (want('sitemap')) verifySitemap();
if (want('links')) verifyLinks();
console.log(`${checks} checks, ${failures} failed`);
process.exit(failures ? 1 : 0);
