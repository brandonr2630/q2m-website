#!/usr/bin/env node

/**
 * Batch Image Upscaler & WebP Converter
 * Upscales JPG/PNG images 2-3x and converts to WebP format
 * Usage: node upscale-images.js <input-dir> [--quality=75] [--scale=2]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Error: sharp is not installed.\n');
  console.log('Install dependencies with:');
  console.log('  npm install sharp');
  process.exit(1);
}

const args = process.argv.slice(2);
const inputDir = args[0] || './assets/projects/project-1';
const quality = parseInt(args.find(a => a.startsWith('--quality='))?.split('=')[1] || '80');
const scale = parseInt(args.find(a => a.startsWith('--scale='))?.split('=')[1] || '2');

if (!fs.existsSync(inputDir)) {
  console.error(`❌ Input directory not found: ${inputDir}`);
  process.exit(1);
}

const extensions = ['.jpg', '.jpeg', '.png'];
const files = fs.readdirSync(inputDir)
  .filter(f => extensions.includes(path.extname(f).toLowerCase()));

if (files.length === 0) {
  console.log(`⚠️  No image files found in ${inputDir}`);
  process.exit(0);
}

console.log(`🔄 Processing ${files.length} images from ${inputDir}\n`);
console.log(`Settings: scale=${scale}x, quality=${quality}%\n`);

let processed = 0;
let errors = 0;

async function processImage(filename) {
  const inputPath = path.join(inputDir, filename);
  const outputName = path.parse(filename).name + '-upscaled.webp';
  const outputPath = path.join(inputDir, outputName);

  try {
    const metadata = await sharp(inputPath).metadata();
    const newWidth = Math.round(metadata.width * scale);
    const newHeight = Math.round(metadata.height * scale);

    await sharp(inputPath)
      .resize(newWidth, newHeight, {
        fit: 'fill',
        kernel: 'lanczos3' // High-quality interpolation
      })
      .sharpen({ sigma: 0.5 }) // Enhance detail after upscaling
      .webp({ quality })
      .toFile(outputPath);

    console.log(`✅ ${filename}`);
    console.log(`   → ${outputName} (${metadata.width}x${metadata.height} → ${newWidth}x${newHeight})`);
    processed++;
  } catch (err) {
    console.error(`❌ ${filename}: ${err.message}`);
    errors++;
  }
}

async function main() {
  for (const file of files) {
    await processImage(file);
  }

  console.log(`\n📊 Complete: ${processed} processed, ${errors} errors`);
  if (processed > 0) {
    console.log(`\n💾 Upscaled images saved to: ${inputDir}`);
    console.log('All original files preserved with -upscaled.webp suffix\n');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
