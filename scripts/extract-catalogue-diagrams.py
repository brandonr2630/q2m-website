"""Crop the diagrams used by the OCR RP data sheets out of the OCR catalogue PDF.

Run from the repo root:  python scripts/extract-catalogue-diagrams.py
Needs: pymupdf, pillow.  Source: assets/ocr/Cat_OCR 2014 RP 2C ITALIANO INGL..pdf
Output: scripts/products-data/catalogue-crops/*.jpg (inputs to build-datasheets.py, committed).

Crop boxes are in pixels of a 75 dpi render of the page (x0, y0, x1, y1).
NOTE: the catalogue is (c) O.C.R. S.R.L. Written consent from OCR is needed to publish these crops.
"""
import io
import os

import pymupdf
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PDF = os.path.join(ROOT, 'assets', 'ocr', 'Cat_OCR 2014 RP 2C ITALIANO INGL..pdf')
OUT = os.path.join(ROOT, 'scripts', 'products-data', 'catalogue-crops')

CROPS = {
    # name: (page, (x0, y0, x1, y1))
    'install-shaft': (29, (28, 135, 222, 304)),
    'install-steps': (29, (50, 388, 556, 522)),
    'install-washer': (29, (86, 532, 222, 668)),
    'mounting-positions': (31, (28, 395, 598, 640)),
    'torque-arm-angles': (30, (28, 162, 590, 402)),
    'backstop': (18, (218, 182, 402, 372)),
    'motor-mount': (20, (175, 348, 458, 540)),
    'shrink-disc': (21, (203, 100, 420, 300)),
    'special-seals': (22, (208, 228, 412, 466)),
    'reduction-bushing': (26, (200, 335, 420, 520)),
    'torque-arm-plain': (27, (135, 157, 488, 317)),
    'torque-arm-plate': (28, (150, 127, 460, 262)),
    'hollow-shaft': (24, (163, 218, 460, 346)),
    'photo-1': (39, (28, 103, 205, 262)),
    'photo-2': (39, (30, 268, 212, 466)),
    'photo-3': (39, (272, 332, 592, 530)),
    'photo-4': (39, (28, 642, 335, 825)),
}


def main():
    os.makedirs(OUT, exist_ok=True)
    doc = pymupdf.open(PDF)
    for name, (pg, (x0, y0, x1, y1)) in CROPS.items():
        k = 72 / 75
        clip = pymupdf.Rect(x0 * k, y0 * k, x1 * k, y1 * k)
        pix = doc[pg - 1].get_pixmap(dpi=200, clip=clip)
        im = Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')
        path = os.path.join(OUT, name + '.jpg')
        im.save(path, 'JPEG', quality=72, optimize=True, subsampling=0)
        print(name, im.size)


if __name__ == '__main__':
    main()
