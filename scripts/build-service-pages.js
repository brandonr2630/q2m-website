#!/usr/bin/env node
/**
 * build-service-pages.js
 *
 * Generates the service pages in all five languages from scripts/service-pages-content.js:
 *   services/<slug>.html            (English)
 *   {es,pt,nl,fr}/services/<slug>.html
 *
 * The page shell (head, CSS, nav, footer, scripts) is taken from about.html so the pages stay
 * consistent with the rest of the site; nav/footer/CTA strings come from about.html's translations.
 * Page text is baked in per language (no client-side translation), flags navigate to the
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
  if (start === -1 || fn === -1) throw new Error('could not locate the translations object in about.html');
  const end = raw.lastIndexOf('};', fn);
  // The object literal comes from this repository's own source page; evaluate it in an empty sandbox.
  return vm.runInNewContext(`(${raw.slice(start + 'const translations = '.length, end + 1)})`, Object.create(null));
}

const aboutRaw = fs.readFileSync(path.join(ROOT, 'about.html'), 'utf-8');
const aboutT   = loadTranslations(aboutRaw);

const urlFor = (lang, slug) => `${BASE}/${lang.dir}services/${slug}.html`;

function schemaFor(page, lang, p, url) {
  const name = plain(p.h1Html);
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
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: aboutT[lang.code].nav_home, item: `${BASE}/${lang.dir}` },
          { '@type': 'ListItem', position: 2, name, item: url },
        ],
      },
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

function contentHtml(c, p) {
  const li = (arr) => arr.map((x) => `        <li>${esc(x)}</li>`).join('\n');
  const note = p.supplyNoteHtml ? p.supplyNoteHtml : esc(p.supplyNote);
  return `
    <div class="content-block reveal">
      <h2>${esc(c.supplyH)}</h2>
      <ul class="facts-list">
${li(p.supply)}
      </ul>
      <p>${note}</p>
    </div>
    <div class="content-block reveal">
      <h2>${esc(c.doH)}</h2>
      <ul class="facts-list">
${li(p.does)}
      </ul>
    </div>
    <div class="content-block reveal">
      <h2>${esc(c.houseH)}</h2>
      <p>${esc(p.house)}</p>
    </div>
    <div class="content-block reveal">
      <h2>${esc(c.projectH)}</h2>
      <p>${esc(p.project)}</p>
      <p><a href="/projects.html">${esc(c.projectsLink)}</a></p>
    </div>
    <div class="content-block reveal">
      <h2>${esc(c.faqH)}</h2>
${p.faq.map(([q, a]) => `      <h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n')}
    </div>
  `;
}

const FAQ_CSS = `.content-block h3{font-family:'Barlow Condensed',sans-serif;font-size:19px;font-weight:700;letter-spacing:.5px;color:var(--text);margin:22px 0 8px;}
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
  const p = page[code];
  if (!p) throw new Error(`${page.slug}: missing ${code} content`);
  if (p.description.length > MAX_DESC) throw new Error(`${page.slug}/${code}: description is ${p.description.length} characters (max ${MAX_DESC})`);

  const url = urlFor(lang, page.slug);
  const $ = cheerio.load(aboutRaw, { decodeEntities: false });

  $('html').attr('lang', lang.htmlLang);

  // Language auto-redirect: keep on the English page only (language pages are already localised)
  $('head script:not([type])').each((_, el) => {
    const txt = $(el).html() || '';
    if (!txt.includes('q2m-lang-redir')) return;
    if (code !== 'en') { $(el).remove(); return; }
    $(el).html(txt.replace(/\/(es|pt|nl|fr)\/about\.html/g, `/$1/services/${page.slug}.html`));
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
    '\n' + LANGS.map((l) => `<link rel="alternate" hreflang="${HREFLANG[l.code]}" href="${urlFor(l, page.slug)}">`).join('\n') +
    `\n<link rel="alternate" hreflang="x-default" href="${urlFor(LANGS[0], page.slug)}">`
  );

  $('script[type="application/ld+json"]').first().html(`\n${JSON.stringify(schemaFor(page, lang, p, url), null, 2)}\n`);

  // CSS: decorative hero word + FAQ headings
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

  // Page-specific sections
  $('.page-hero-inner').html(`
    <div class="section-label reveal">${esc(c.label)}</div>
    <h1 class="reveal reveal-delay-1">${p.h1Html}</h1>
    <p class="reveal reveal-delay-2">${esc(p.lead)}</p>
  `);
  $('.page-inner').html(contentHtml(c, p));

  // CTA: enquiry form with the service pre-selected; secondary button to the depot
  $('.cta-btn-primary').attr('href', `/?service=${page.serviceParam}#contact`);

  // About is not the current page
  $('a[href="/about.html"]').removeClass('active');
  $('.mobile-menu a[href="/about.html"]').removeAttr('style');

  // Language flags: current language active, buttons navigate to the same page in each language
  $('.lang-flag').each((_, el) => {
    const l = LANGS.find((x) => x.code === $(el).attr('data-lang'));
    $(el).attr('data-href', urlFor(l, page.slug).replace(BASE, ''));
    $(el).toggleClass('active', l.code === code);
  });
  $('.footer-langs a').each((_, el) => {
    const l = LANGS.find((x) => x.code === $(el).attr('lang'));
    $(el).attr('href', urlFor(l, page.slug).replace(BASE, ''));
  });

  // Links stay inside the language directory (not the footer language row)
  if (code !== 'en') {
    $('a[href]').not('.footer-langs a').each((_, el) => {
      const href = $(el).attr('href');
      if (href === '/') $(el).attr('href', `/${code}/`);
      else if (href.startsWith('/#') || href.startsWith('/?')) $(el).attr('href', `/${code}/${href.slice(1)}`);
      else if (PAGE_LINKS.has(href)) $(el).attr('href', `/${code}${href}`);
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
  fs.writeFileSync(path.join(outDir, `${page.slug}.html`), out, 'utf-8');
  console.log(`✓  ${lang.dir}services/${page.slug}.html`);
}

for (const page of PAGES) for (const lang of LANGS) build(page, lang);
console.log('Done.');
