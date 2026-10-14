#!/usr/bin/env node
/**
 * Static gates for the About slideshow images (index.html + es/pt/nl/fr).
 * Usage: node verify-slides.js [rootDir]   (default: repo root)
 * Exit 0 and prints "SLIDE GATES PASS" only if every gate holds.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const alts = JSON.parse(fs.readFileSync(path.join(__dirname, 'slide-alts.json'), 'utf-8'));
const PAGES = { en: 'index.html', es: 'es/index.html', pt: 'pt/index.html', nl: 'nl/index.html', fr: 'fr/index.html' };
const fails = [];
const fail = (m) => fails.push(m);

for (const [lang, rel] of Object.entries(PAGES)) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { fail(`${lang}: ${rel} missing`); continue; }
  const $ = cheerio.load(fs.readFileSync(file, 'utf-8'));
  const imgs = $('#about-slideshow .slide img');
  if (imgs.length !== 20) fail(`${lang}: ${imgs.length} slide <img>, expected 20`);
  if ($('#about-slideshow .slide[data-webp],#about-slideshow .slide[data-jpg]').length) fail(`${lang}: legacy data-webp/data-jpg still present`);
  imgs.each((i, el) => {
    const alt = ($(el).attr('alt') || '').trim();
    if (!alt) fail(`${lang}: slide ${i + 1} has empty alt`);
    else if (alt !== alts[lang][i]) fail(`${lang}: slide ${i + 1} alt does not match slide-alts.json`);
    if ($(el).attr('src')) fail(`${lang}: slide ${i + 1} has src at load (must be gated)`);
    const jpg = $(el).attr('data-src') || '';
    const webp = $(el).prev('source').attr('data-srcset') || '';
    const prefix = lang === 'en' ? '' : '/';
    for (const u of [jpg, webp]) {
      if (!u.startsWith(prefix + 'assets/images/slides/photo' + (i + 1) + '.')) fail(`${lang}: slide ${i + 1} bad path "${u}"`);
      else if (!fs.existsSync(path.join(ROOT, u.replace(/^\//, '')))) fail(`${lang}: slide ${i + 1} file missing ${u}`);
    }
    if (!$(el).attr('width') || !$(el).attr('height')) fail(`${lang}: slide ${i + 1} missing width/height`);
  });
  if ($('#about-slideshow .slide.active').length !== 1) fail(`${lang}: expected exactly one .slide.active`);
  if ($('#about-slideshow .slide[aria-hidden="true"]').length !== 19) fail(`${lang}: expected 19 aria-hidden slides`);
  if (lang !== 'en') {
    const n = (fs.readFileSync(file, 'utf-8').match(/["'(]assets\//g) || []).length;
    if (n) fail(`${lang}: ${n} relative assets/ paths`);
  }
}
for (const l of Object.keys(alts)) {
  if (alts[l].length !== 20 || alts[l].some((a) => !a.trim())) fail(`slide-alts.json ${l}: not 20 non-empty strings`);
}
const others = ['es', 'pt', 'nl', 'fr'];
alts.en.forEach((a, i) => { for (const l of others) if (alts[l][i] === a) fail(`slide-alts.json ${l}[${i}] identical to English`); });

if (fails.length) { console.log(fails.join('\n')); console.log(`SLIDE GATES FAIL (${fails.length})`); process.exit(1); }
console.log('SLIDE GATES PASS');
