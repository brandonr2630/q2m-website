// Builds assets/products/icons/pdf-datasheet.webp (data sheet icon in the spec table) from the
// owner-supplied SVG in products-data/. Run by hand; the output is committed.
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, 'products-data', 'pdf-datasheet-icon-source.svg');
const OUT = path.join(__dirname, '..', 'assets', 'products', 'icons', 'pdf-datasheet.webp');

sharp(SRC, { density: 72 })
  .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(OUT)
  .then((i) => console.log(`${OUT}: ${i.width}x${i.height}, ${i.size} bytes`));
