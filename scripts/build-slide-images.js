// Generates web-sized slideshow images: assets/images/photoN.{webp,jpg} -> assets/images/slides/photoN.{webp,jpg}
// Longest side is capped at MAX_SIDE (never upscaled). Originals are left untouched.
// Run: node build-slide-images.js   (from scripts/, after `npm install`)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'assets', 'images');
const OUT = path.join(SRC, 'slides');
const MAX_SIDE = 1280;
const COUNT = 20;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let before = 0, after = 0;
  for (let i = 1; i <= COUNT; i++) {
    const base = 'photo' + i;
    const input = path.join(SRC, base + '.jpg');
    if (!fs.existsSync(input)) throw new Error('missing ' + input);
    const resize = { width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true };
    const webp = path.join(OUT, base + '.webp');
    const jpg = path.join(OUT, base + '.jpg');
    await sharp(input).rotate().resize(resize).webp({ quality: 74 }).toFile(webp);
    await sharp(input).rotate().resize(resize).jpeg({ quality: 74, mozjpeg: true }).toFile(jpg);
    before += fs.statSync(path.join(SRC, base + '.webp')).size;
    after += fs.statSync(webp).size;
    console.log(base, Math.round(fs.statSync(webp).size / 1024) + 'KB webp,', Math.round(fs.statSync(jpg).size / 1024) + 'KB jpg');
  }
  console.log('webp total: ' + Math.round(before / 1024) + 'KB -> ' + Math.round(after / 1024) + 'KB');
})();
