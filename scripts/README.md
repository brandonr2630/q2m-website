# Image Scripts

Utilities for optimizing images for the q2m-website.

## Upscale Images to WebP

Batch upscales JPG/PNG images 2-3x resolution and converts to WebP format for web optimization.

### Setup

```bash
cd scripts
npm install
```

### Usage

**Process a specific project:**
```bash
npm run upscale:project-1
npm run upscale:project-2
npm run upscale:project-3
```

**Process all projects:**
```bash
npm run upscale:all
```

**Manual usage with custom settings:**
```bash
node upscale-images.js <input-dir> [--quality=75] [--scale=2]

# Examples
node upscale-images.js ../assets/projects/project-1 --quality=80 --scale=3
node upscale-images.js ../assets/projects/project-2 --quality=75 --scale=2
```

### Options

- `--quality` (default: 80) — WebP compression quality (1-100, higher = better)
- `--scale` (default: 2) — Upscaling factor (2x, 3x, etc.)

### Output

- Original files are preserved
- Upscaled images saved with `-upscaled.webp` suffix in the same directory
- Example: `IMG-20160109-WA0014.jpg` → `IMG-20160109-WA0014-upscaled.webp`

### Results

WebP format provides:
- **40-50% smaller file sizes** than JPEG at same quality
- Better compression than PNG
- Universal browser support (96%+)
- Recommended for all modern websites

### Website Integration

Update your HTML to use the new WebP images with fallbacks:

```html
<picture>
  <source srcset="IMG-20160109-WA0014-upscaled.webp" type="image/webp">
  <img src="IMG-20160109-WA0014.jpg" alt="Project image">
</picture>
```

Or use directly if you're dropping JPEG support:

```html
<img src="IMG-20160109-WA0014-upscaled.webp" alt="Project image">
```
