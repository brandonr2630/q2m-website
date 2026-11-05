// Generates product catalogue images for OCR RP from the (untracked) source folder.
// Run manually: cd scripts && node build-product-images.js
// Source root: env OCR_SRC (default Z:/09-DevPro/projects/q2m-website/assets/ocr)
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC = process.env.OCR_SRC || 'Z:/09-DevPro/projects/q2m-website/assets/ocr';
const OUT = path.join(__dirname, '..', 'assets', 'products', 'ocr-rp');
const SIZES = [85, 105, 125, 150, 165, 180, 210, 250];

const jobs = [
  {
    name: 'tile', src: 'pics/IMMAGINE-RP85.jpg', jpg: true,
    // trim the source's white margin so the product fills the tile, then keep a 22px frame
    make: (s) => s.flatten({ background: '#ffffff' }).trim({ background: '#ffffff', threshold: 12 })
      .resize(556, 556, { fit: 'contain', background: '#ffffff' })
      .extend({ top: 22, bottom: 22, left: 22, right: 22, background: '#ffffff' })
  },
  {
    name: 'hero', src: 'pics/P1101652.jpg.jpeg', jpg: true,
    make: (s) => s.rotate().resize({ width: 1200, withoutEnlargement: true })
  },
  ...SIZES.map((n) => ({
    name: 'dim-' + n, src: 'dims/ocr-rp' + n + '-dimensions.png', jpg: false,
    make: (s) => s.resize({ width: 1400, withoutEnlargement: true })
  }))
];

(async () => {
  const missing = jobs.filter((j) => !fs.existsSync(path.join(SRC, j.src)));
  if (missing.length) {
    missing.forEach((j) => console.error('Missing source: ' + path.join(SRC, j.src)));
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });
  for (const j of jobs) {
    const file = path.join(SRC, j.src);
    const targets = [['webp', (s) => s.webp({ quality: 82 })]];
    if (j.jpg) targets.push(['jpg', (s) => s.jpeg({ quality: 82, mozjpeg: true })]);
    for (const [ext, enc] of targets) {
      const dest = path.join(OUT, j.name + '.' + ext);
      const buf = await enc(j.make(sharp(file))).toBuffer();
      fs.writeFileSync(dest, buf);
      const m = await sharp(buf).metadata();
      console.log(j.name + '.' + ext + ' ' + m.width + 'x' + m.height + ' ' + buf.length + ' bytes');
    }
  }
})().catch((e) => { console.error(e); process.exit(1); });
