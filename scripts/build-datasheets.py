# -*- coding: utf-8 -*-
"""Build the Q2 Machines-branded OCR RP data sheets: one 7-page PDF per size and language.

Run from the repo root or scripts/:  python scripts/build-datasheets.py [lang ...]
Needs: reportlab, pillow.
Data:  scripts/products-data/ocr-rp-rating.csv         (ratings, weights; OCR RP 2C catalogue, 2014)
       scripts/products-data/ocr-rp-options.json        (options / hardware / lubrication tables)
       scripts/products-data/catalogue-crops/           (diagrams, see extract-catalogue-diagrams.py)
       assets/products/ocr-rp/dim-<size>.webp           (dimension drawings)
       scripts/datasheet_strings.py                     (all text in en/es/pt/nl/fr)
Output: assets/products/ocr-rp/datasheets/Q2M-OCR-RP-<size>-data-sheet[-<lang>].pdf (committed)
Italian labels on the catalogue diagrams are whited out and replaced with text in the sheet language.
Fonts: Liberation Sans Narrow if found (Windows/Linux), else Helvetica.
"""
import csv
import io
import json
import os
import re
import sys
from collections import defaultdict

from PIL import Image
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from datasheet_strings import LANGS, tr  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CSV = os.path.join(ROOT, 'scripts', 'products-data', 'ocr-rp-rating.csv')
OPT = json.load(open(os.path.join(ROOT, 'scripts', 'products-data', 'ocr-rp-options.json'), encoding='utf8'))
CROPS = os.path.join(ROOT, 'scripts', 'products-data', 'catalogue-crops')
OUT = os.path.join(ROOT, 'assets', 'products', 'ocr-rp', 'datasheets')
LOGO = os.path.join(ROOT, 'assets', 'branding', 'Q2M_Logo.png')

GOLD = HexColor('#F5C500')
GOLD_DARK = HexColor('#C49B00')
INK = HexColor('#0A0A0A')
INK2 = HexColor('#1A1A1A')
GREY = HexColor('#555555')
LINE = HexColor('#D9D9D9')
BAND = HexColor('#F4F3EF')

W, H = A4
M = 14 * mm
CW = W - 2 * M
TOTAL = 7
LANG = 'en'


def T(key, **kw):
    return tr(key, LANG, **kw)


def fonts():
    for d in ('C:/Windows/Fonts', '/usr/share/fonts/truetype/liberation', '/usr/share/fonts/liberation'):
        names = {'Narrow': 'Regular', 'Narrow-Bold': 'Bold', 'Narrow-Italic': 'Italic', 'Narrow-BoldItalic': 'BoldItalic'}
        paths = {k: os.path.join(d, 'LiberationSansNarrow-%s.ttf' % v) for k, v in names.items()}
        if all(os.path.exists(p) for p in paths.values()):
            for k, p in paths.items():
                pdfmetrics.registerFont(TTFont(k, p))
            return 'Narrow', 'Narrow-Bold', 'Narrow-Italic', 'Narrow-BoldItalic'
    print('warning: Liberation Sans Narrow not found, using Helvetica', file=sys.stderr)
    return 'Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique', 'Helvetica-BoldOblique'


F, FB, FI, FBI = fonts()


# ---------------------------------------------------------------- number formatting
def nf(v):
    """Decimal comma for es/pt/nl/fr (applied to table values only)."""
    v = str(v)
    return v if LANG == 'en' else re.sub(r'(?<=\d)\.(?=\d)', ',', v)


def grp(n):
    n = int(n)
    if LANG == 'en':
        return '{:,}'.format(n)
    sep = '\u00a0' if LANG == 'fr' else '.'
    return '{:,}'.format(n).replace(',', sep)


# ---------------------------------------------------------------- data
def load():
    weights, eff, spd = {}, {}, {}
    with open(CSV, encoding='utf8', newline='') as fh:
        for r in csv.DictReader(fh):
            t, q, v = r['table'], r['quantity'], r['value']
            if t == 'weights':
                weights[r['size']] = v
            elif t.startswith('efficiency'):
                eff[t] = v
            elif t == 'input_speed':
                spd[q] = v
    return weights, eff, spd


def ratings():
    out = defaultdict(list)
    cur = {}
    with open(CSV, encoding='utf8', newline='') as fh:
        for r in csv.DictReader(fh):
            t, q, v = r['table'], r['quantity'], r['value']
            if not t.startswith('rating_'):
                continue
            stage = 1 if t == 'rating_single_stage' else 2
            k = (r['size'], stage, r['ratio'])
            if q == 'output_rpm':
                cur[k] = {'stage': stage, 'ratio': r['ratio'], 'n2': v}
                out[r['size']].append(cur[k])
            else:
                cur[k][{'input_rpm': 'n1', 'power_kw': 'kw', 'torque_nm': 'nm'}[q]] = v
    return out


def row_of(key, size):
    return OPT[key]['rows'][size]


# ---------------------------------------------------------------- images
def png_from(path):
    buf = io.BytesIO()
    Image.open(path).convert('RGB').save(buf, 'JPEG', quality=88, optimize=True)
    buf.seek(0)
    return ImageReader(buf)


def crop(name):
    return ImageReader(os.path.join(CROPS, name + '.jpg'))


# Italian label regions on the catalogue crops (pixels of the crop image, top-left origin) and the
# replacement text. 'white' boxes erase the original; 'text' = (key, x, y_centre, font, px, anchor, max_px)
OVERLAYS = {
    'mounting-positions': {
        'white': [(342, 6, 638, 45), (290, 46, 690, 106), (1141, 6, 1384, 45), (1062, 46, 1462, 106),
                  (158, 566, 378, 642), (672, 566, 898, 642), (1195, 566, 1428, 642)],
        'text': [('lbl_h', 490, 27, 'B', 27, 'c', 330), ('lbl_h2', 490, 80, 'I', 27, 'c', 390),
                 ('lbl_v', 1262, 27, 'B', 27, 'c', 235), ('lbl_v2', 1262, 80, 'I', 27, 'c', 390),
                 ('plug_fill', 164, 589, 'B', 26, 'l', 480), ('plug_level', 680, 591, 'B', 26, 'l', 480),
                 ('plug_drain', 1202, 591, 'B', 26, 'l', 290)],
    },
    'install-steps': {
        'white': [(14, 292, 322, 338), (362, 292, 672, 338), (705, 292, 1018, 338), (1058, 292, 1340, 338)],
        'text': [('step1', 20, 316, 'I', 24, 'l', 296), ('step2', 368, 316, 'I', 24, 'l', 296),
                 ('step3', 711, 316, 'I', 24, 'l', 296), ('step4', 1064, 316, 'I', 24, 'l', 270)],
    },
}


def apply_overlay(c, name, x, ytop, k):
    ov = OVERLAYS.get(name)
    if not ov:
        return
    c.setFillColor(white)
    for (x0, y0, x1, y1) in ov['white']:
        c.rect(x + x0 * k, ytop - y1 * k, (x1 - x0) * k, (y1 - y0) * k, stroke=0, fill=1)
    c.setFillColor(INK)
    for key, tx, ty, style, px, anchor, maxpx in ov['text']:
        font = {'B': FB, 'I': FI, 'R': F}[style]
        s = T(key)
        size = px
        while size > 12 and pdfmetrics.stringWidth(s, font, size) > maxpx:
            size -= 0.5
        c.setFont(font, size * k)
        yy = ytop - (ty + size * 0.35) * k
        if anchor == 'c':
            c.drawCentredString(x + tx * k, yy, s)
        else:
            c.drawString(x + tx * k, yy, s)


def pic(c, name, x, ytop, w=None, h=None, border=True):
    """Draw a catalogue crop with its top at ytop, fitted into w x h. Returns (bottom y, drawn width)."""
    img = crop(name)
    iw, ih = img.getSize()
    if w is None:
        w = h * iw / ih
    if h is not None and w * ih / iw > h:
        w = h * iw / ih
    dh = w * ih / iw
    c.drawImage(img, x, ytop - dh, width=w, height=dh)
    apply_overlay(c, name, x, ytop, w / iw)
    if border:
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.rect(x, ytop - dh, w, dh, stroke=1, fill=0)
    return ytop - dh, w


def pic_cover(c, name, x, ytop, w, h):
    img = crop(name)
    iw, ih = img.getSize()
    k = max(w / iw, h / ih)
    dw, dh = iw * k, ih * k
    c.saveState()
    p = c.beginPath()
    p.rect(x, ytop - h, w, h)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(img, x + (w - dw) / 2, ytop - h + (h - dh) / 2, width=dw, height=dh)
    c.restoreState()


# ---------------------------------------------------------------- building blocks
def footer(c, size, page):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(M, 20 * mm, W - M, 20 * mm)
    c.setFont(FB, 9)
    c.setFillColor(INK)
    c.drawString(M, 15 * mm, 'Q\u00b2 Machines')
    c.setFont(F, 8.5)
    c.setFillColor(GREY)
    c.drawString(M, 11 * mm, '71 Warren Road, Bejucal, Cunupia, Trinidad  |  +1 (868) 230-9702  |  qhub@q2m.io  |  www.q2m.io')
    fs = 8.5
    while fs > 6 and pdfmetrics.stringWidth(T('foot_note'), F, fs) > CW - 40 * mm + 38 * mm:
        fs -= 0.25
    c.setFont(F, fs)
    c.drawString(M, 7.5 * mm, T('foot_note'))
    c.drawRightString(W - M, 15 * mm, T('foot_page', size=size, p=page, n=TOTAL))


def header(c, size, big, title=None):
    band = 34 * mm if big else 20 * mm
    c.setFillColor(INK)
    c.rect(0, H - band, W, band, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.rect(0, H - band - 2.2 * mm, W, 2.2 * mm, stroke=0, fill=1)
    lh = band - 6 * mm
    lw = lh * 350 / 450
    c.setFillColor(white)
    c.roundRect(M - 1 * mm, H - band + 2 * mm, lw + 2 * mm, lh + 2 * mm, 2 * mm, stroke=0, fill=1)
    c.drawImage(LOGO, M, H - band + 3 * mm, width=lw, height=lh, mask='auto')
    x = M + lw + 7 * mm
    if big:
        c.setFillColor(GOLD)
        c.setFont(FB, 11)
        c.drawString(x, H - 13 * mm, T('hdr_title'))
        c.setFillColor(white)
        c.setFont(FB, 25)
        c.drawString(x, H - 23 * mm, 'OCR RP %s' % size)
        c.setFont(F, 12)
        c.drawString(x, H - 29.5 * mm, T('hdr_sub'))
    else:
        c.setFillColor(white)
        c.setFont(FB, 16)
        c.drawString(x, H - 11 * mm, 'OCR RP %s  |  %s' % (size, title))
        c.setFillColor(GOLD)
        c.setFont(FB, 9.5)
        c.drawString(x, H - 16.5 * mm, T('hdr_title'))
    return band + 2.2 * mm


def fact_box(c, x, y, w, h, label, value, sub=''):
    c.setFillColor(BAND)
    c.rect(x, y, w, h, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.rect(x, y, 1.6 * mm, h, stroke=0, fill=1)
    c.setFillColor(GREY)
    c.setFont(FB, 8.5)
    c.drawString(x + 4.5 * mm, y + h - 5.5 * mm, label.upper())
    c.setFillColor(INK)
    c.setFont(FB, 15)
    c.drawString(x + 4.5 * mm, y + h - 12.5 * mm, value)
    if sub:
        c.setFillColor(GREY)
        c.setFont(F, 8.5)
        c.drawString(x + 4.5 * mm, y + 2.4 * mm, sub)


def sec_title(c, y, text, sub=None):
    c.setFillColor(INK)
    c.setFont(FB, 13)
    c.drawString(M, y, text.upper())
    c.setFillColor(GOLD)
    c.rect(M, y - 2 * mm, 18 * mm, 0.9 * mm, stroke=0, fill=1)
    if sub:
        c.setFillColor(GREY)
        c.setFont(F, 9)
        c.drawString(M + pdfmetrics.stringWidth(text.upper(), FB, 13) + 5 * mm, y, sub)
    return y - 7 * mm


def sub_title(c, y, text, x=None):
    c.setFillColor(INK)
    c.setFont(FB, 10.5)
    c.drawString(M if x is None else x, y, text)
    return y - 5 * mm


def para(c, x, y, text, width, size=9.5, lead=4.6 * mm, color=None):
    c.setFont(F, size)
    c.setFillColor(color or INK2)
    for ln in simpleSplit(text, F, size, width):
        c.drawString(x, y, ln)
        y -= lead
    return y


def bullets(c, x, y, items, width, size=9.5, lead=4.6 * mm):
    c.setFont(F, size)
    for it in items:
        c.setFillColor(GOLD_DARK)
        c.rect(x, y + 0.5 * mm, 1.4 * mm, 1.4 * mm, stroke=0, fill=1)
        c.setFillColor(INK2)
        for ln in simpleSplit(it, F, size, width - 4 * mm):
            c.drawString(x + 3.6 * mm, y, ln)
            y -= lead
    return y


def dtable(c, x, y, w, heads, vals, hl=None, size=8.5, rh=5.4 * mm, colw=None):
    """One header row (black/gold) plus one value row. Returns bottom y."""
    n = len(heads)
    colw = colw or [w / n] * n
    c.setFillColor(INK)
    c.rect(x, y - rh, w, rh, stroke=0, fill=1)
    c.setFillColor(GOLD)
    cx = x
    for h_, cw in zip(heads, colw):
        fs = size
        while fs > 5.5 and pdfmetrics.stringWidth(h_, FB, fs) > cw - 1.5 * mm:
            fs -= 0.25
        c.setFont(FB, fs)
        c.drawCentredString(cx + cw / 2, y - rh + 1.7 * mm, h_)
        cx += cw
    c.setFillColor(BAND)
    c.rect(x, y - 2 * rh, w, rh, stroke=0, fill=1)
    c.setFillColor(INK)
    cx = x
    for i, (v, cw) in enumerate(zip(vals, colw)):
        if hl is not None and i == hl:
            c.setFillColor(GOLD)
            c.rect(cx, y - 2 * rh, cw, rh, stroke=0, fill=1)
            c.setFillColor(INK)
        s = nf(v)
        fs = size + 0.5
        while fs > 6 and pdfmetrics.stringWidth(s, F, fs) > cw - 1.5 * mm:
            fs -= 0.25
        c.setFont(F, fs)
        c.drawCentredString(cx + cw / 2, y - 2 * rh + 1.7 * mm, s)
        cx += cw
    return y - 2 * rh - 3 * mm


# ---------------------------------------------------------------- pages
def page1(c, size, pts, weight):
    top = header(c, size, True)
    y = H - top - 8 * mm
    bw = (W - 2 * M - 3 * 3 * mm) / 4
    bh = 20 * mm
    y -= bh
    kws = [float(p['kw']) for p in pts]
    nms = [float(p['nm']) for p in pts]
    ratios = sorted({(p['stage'], p['ratio']) for p in pts}, key=lambda s: float(s[1]))
    vals = [
        (T('f_weight'), '%s kg' % weight, T('f_weight_s')),
        (T('f_power'), nf('%g\u2013%g kW' % (min(kws), max(kws))), T('f_power_s')),
        (T('f_torque'), '%g\u2013%g Nm' % (min(nms), max(nms)), T('f_torque_s')),
        (T('f_ratios'), '%d' % len(ratios), T('f_ratios_s')),
    ]
    for i, (a, b, s) in enumerate(vals):
        fact_box(c, M + i * (bw + 3 * mm), y, bw, bh, a, b, s)
    y -= 7 * mm
    c.setFillColor(INK)
    c.setFont(FB, 12)
    c.drawString(M, y, T('dims_title'))
    c.setFillColor(GOLD)
    c.rect(M, y - 2 * mm, 18 * mm, 0.9 * mm, stroke=0, fill=1)
    dw = CW
    img = png_from(os.path.join(ROOT, 'assets', 'products', 'ocr-rp', 'dim-%s.webp' % size))
    iw, ih = img.getSize()
    dh = dw * ih / iw
    y -= 5 * mm + dh
    c.drawImage(img, M, y, width=dw, height=dh)
    # the drawing carries an Italian "Peso / Weight Kg nn" caption: replace with the sheet language
    k = dw / iw
    c.setFillColor(white)
    c.rect(M + 1150 * k, y + (ih - 820) * k, 238 * k, 42 * k, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont(F, 28 * k)
    c.drawRightString(M + 1380 * k, y + (ih - 808) * k, T('weight_label', kg=weight))
    y -= 8 * mm
    c.setFillColor(INK)
    c.setFont(FB, 12)
    c.drawString(M, y, T('cons_title'))
    c.setFillColor(GOLD)
    c.rect(M, y - 2 * mm, 18 * mm, 0.9 * mm, stroke=0, fill=1)
    c.setFont(F, 10)
    yy = y - 8.5 * mm
    for i in range(1, 8):
        c.setFillColor(GOLD_DARK)
        c.rect(M, yy + 0.6 * mm, 1.6 * mm, 1.6 * mm, stroke=0, fill=1)
        c.setFillColor(INK2)
        c.drawString(M + 4 * mm, yy, T('cons%d' % i))
        yy -= 5.2 * mm
    footer(c, size, 1)
    c.showPage()


def page2(c, size, pts, eff, spd):
    top = header(c, size, False, T('pg_rating'))
    y = H - top - 9 * mm
    cols = [(T('h_stage'), 20), (T('h_ratio'), 26), (T('h_n2'), 36), (T('h_n1'), 36), (T('h_kw'), 32), (T('h_nm'), 32)]
    tw = sum(w for _, w in cols) * mm
    rh = 5.6 * mm
    c.setFillColor(INK)
    c.rect(M, y - rh + 1.2 * mm, tw, rh, stroke=0, fill=1)
    c.setFillColor(GOLD)
    cx = M
    for name, w in cols:
        fs = 9.5
        while fs > 6 and pdfmetrics.stringWidth(name, FB, fs) > w * mm - 3 * mm:
            fs -= 0.25
        c.setFont(FB, fs)
        c.drawString(cx + 2.5 * mm, y - 2.4 * mm, name)
        cx += w * mm
    y -= rh
    prev = None
    n = 0
    for p in pts:
        stage_txt = T('single') if p['stage'] == 1 else T('double')
        key = (p['stage'], p['ratio'])
        if prev is not None and key != prev:
            c.setStrokeColor(GOLD_DARK)
            c.setLineWidth(0.8)
            c.line(M, y + 1.2 * mm, M + tw, y + 1.2 * mm)
            n = 0
        if n % 2 == 1:
            c.setFillColor(BAND)
            c.rect(M, y - rh + 1.2 * mm, tw, rh, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont(F, 9.5)
        cx = M
        for (name, w), v in zip(cols, [stage_txt, nf(p['ratio']), nf(p['n2']), nf(p['n1']), nf(p['kw']), nf(p['nm'])]):
            c.drawString(cx + 2.5 * mm, y - 2.4 * mm, v)
            cx += w * mm
        y -= rh
        prev = key
        n += 1
        if y < 58 * mm:
            raise SystemExit('rating table too long for one page at size %s' % size)
    y -= 7 * mm
    c.setFillColor(INK)
    c.setFont(FB, 11)
    c.drawString(M, y, T('notes'))
    c.setFillColor(GOLD)
    c.rect(M, y - 2 * mm, 12 * mm, 0.9 * mm, stroke=0, fill=1)
    notes = [
        T('note1'),
        T('note2', max=spd.get('input_rpm_max', '1400'), pref=spd.get('input_rpm_preferred', '710')),
        T('note3', e1=nf(eff.get('efficiency_single_stage', '0.98')), e2=nf(eff.get('efficiency_double_stage', '0.96'))),
        T('note4'),
        T('note5'),
    ]
    yy = y - 8 * mm
    c.setFont(F, 9.5)
    for t in notes:
        c.setFillColor(GOLD_DARK)
        c.rect(M, yy + 0.6 * mm, 1.5 * mm, 1.5 * mm, stroke=0, fill=1)
        c.setFillColor(INK2)
        for ln in simpleSplit(t, F, 9.5, CW - 4 * mm):
            c.drawString(M + 4 * mm, yy, ln)
            yy -= 4.6 * mm
    footer(c, size, 2)
    c.showPage()


def page3(c, size):
    top = header(c, size, False, T('pg_mounting'))
    y = H - top - 8 * mm
    y = sec_title(c, y, T('pg_mounting'), T('mo_sub'))
    r = row_of('machine_shaft', size)
    y = sub_title(c, y, T('inst_title'))
    yb, wimg = pic(c, 'install-shaft', M, y, h=46 * mm)
    xt = M + wimg + 6 * mm
    tw = CW - wimg - 6 * mm
    yy = para(c, xt, y - 3 * mm, T('inst_p'), tw, 9.2)
    yy = bullets(c, xt, yy - 1 * mm, [T('inst_b1'), T('inst_b2'), T('inst_b3'), T('inst_b4')], tw, 9.2, 4.3 * mm)
    y = min(yb, yy) - 4 * mm
    heads = ['\u00d8A (mm)', 'B', 'C', 'D', 'E', 'F', '\u00d8G', 'H', 'I', 'L']
    vals = [r['A_dia'] + ' h6/j6/k6', r['B_thread'], r['C'], r['D'], r['E'], r['F'], r['G_dia'], r['H'], r['I'], r['L']]
    cw = [30 * mm] + [(CW - 30 * mm) / 9] * 9
    y = sub_title(c, y, T('shaft_title', size=size))
    y = dtable(c, M, y, CW, heads, vals, colw=cw)
    y -= 1 * mm
    w = row_of('install_washer', size)
    yb, wimg = pic(c, 'install-washer', M, y, h=36 * mm)
    xt = M + wimg + 6 * mm
    tw = CW - wimg - 6 * mm
    yy = sub_title(c, y - 1 * mm, T('washer_title', size=size), xt)
    heads = ['\u00d8D h10', '\u00d8A', 'B', 'C', 'E', 'F', 'G', '\u00d8H']
    vals = [w['D_dia'], '%s (%s)' % (w['A_dia'], w['A_thread']), w['B_thread'], w['C'], w['E'], w['F'], w['G'], w['H_dia']]
    cw = [1, 1.5, 1, 1, 1, 1, 1, 1]
    cw = [v * tw / sum(cw) for v in cw]
    yy = dtable(c, xt, yy, tw, heads, vals, colw=cw)
    para(c, xt, yy - 1 * mm, T('washer_note'), tw, 8.8, 4.2 * mm, GREY)
    y = min(yb, yy) - 5 * mm
    y = sub_title(c, y, T('steps_title'))
    yb, _ = pic(c, 'install-steps', M, y, w=150 * mm)
    y = yb - 6 * mm
    y = sub_title(c, y, T('arm_title'))
    yb, wimg = pic(c, 'torque-arm-angles', M, y, h=50 * mm)
    xt = M + wimg + 6 * mm
    bullets(c, xt, y - 3 * mm, [T('arm_b1'), T('arm_b2'), T('arm_b3')], W - M - xt, 9, 4.2 * mm)
    footer(c, size, 3)
    c.showPage()


def page4(c, size):
    top = header(c, size, False, T('pg_lube'))
    y = H - top - 8 * mm
    y = sec_title(c, y, T('pos_title'), T('pos_sub'))
    yb, _ = pic(c, 'mounting-positions', M, y, w=150 * mm)
    y = yb - 5 * mm
    y = para(c, M, y, T('pos_p'), CW, 9.3)
    y -= 5 * mm
    y = sec_title(c, y, T('lube_title'), T('lube_sub'))
    y = para(c, M, y, T('lube_p'), CW, 9.3)
    y -= 2 * mm
    wL = 100 * mm
    rh = 6.2 * mm
    c.setFillColor(INK)
    c.rect(M, y - rh, wL, rh, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.setFont(FB, 9)
    c.drawString(M + 3 * mm, y - rh + 2 * mm, T('temp_h'))
    c.drawRightString(M + wL - 3 * mm, y - rh + 2 * mm, T('visc_h'))
    yy = y - rh
    for i, (k_, v_) in enumerate([('temp1', '100'), ('temp2', '150'), ('temp3', '220'), ('temp4', '320')]):
        if i % 2 == 0:
            c.setFillColor(BAND)
            c.rect(M, yy - rh, wL, rh, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont(F, 10)
        c.drawString(M + 3 * mm, yy - rh + 2 * mm, T(k_))
        c.setFont(FB, 10)
        c.drawRightString(M + wL - 3 * mm, yy - rh + 2 * mm, v_)
        yy -= rh
    xr = M + wL + 10 * mm
    c.setFillColor(INK)
    c.setFont(FB, 9.5)
    c.drawString(xr, y - 3 * mm, T('oils_title'))
    c.setFont(F, 9)
    c.setFillColor(INK2)
    makers = [('AGIP', 'Blasia'), ('ARAL', 'Degol BG'), ('BP', 'Energol GR-XP'), ('CASTROL', 'Alpha SP'), ('ESSO', 'Spartan EP'),
              ('MOBIL', 'Mobilgear Serie 6'), ('SHELL', 'Omala Oil'), ('TEXACO', 'Meropa'), ('TOTAL', 'Carter EP')]
    my = y - 8 * mm
    for k_, v_ in makers[:5]:
        c.drawString(xr, my, '%s %s' % (k_, v_))
        my -= 4.1 * mm
    my = y - 8 * mm
    for k_, v_ in makers[5:]:
        c.drawString(xr + 38 * mm, my, '%s %s' % (k_, v_))
        my -= 4.1 * mm
    y = yy - 7 * mm
    o = row_of('oil_litres', size)
    y = sub_title(c, y, T('oil_qty', size=size))
    y = dtable(c, M, y, CW, ['OS', 'OD', T('ob_std'), 'OA', 'VA', 'VB'], [o['OS'], o['OD'], o['OB'], o['OA'], o['VA'], o['VB']], hl=2, size=9.5, rh=6 * mm)
    y -= 2 * mm
    y = bullets(c, M, y, [T('lube_b1'), T('lube_b2'), T('lube_b3')], CW, 9.3, 4.4 * mm)
    y -= 4 * mm
    y = sec_title(c, y, T('hss_title'))
    bullets(c, M, y, [T('hss1'), T('hss2'), T('hss3'), T('hss4')], CW, 9.3, 4.4 * mm)
    footer(c, size, 4)
    c.showPage()


def item(c, y, title, text, img, row_title, heads, vals, imgw=52 * mm, imgh=44 * mm, hl=None, note=None):
    """An option block: crop at left, title/text/table at right. Returns the new y."""
    yb, _ = pic(c, img, M, y, w=imgw, h=imgh)
    xt = M + imgw + 6 * mm
    tw = W - M - xt
    yy = sub_title(c, y - 1 * mm, title, xt)
    yy = para(c, xt, yy, text, tw, 9, 4.2 * mm)
    yy -= 1 * mm
    if heads:
        c.setFillColor(GREY)
        c.setFont(FB, 8.5)
        c.drawString(xt, yy, row_title)
        yy -= 4 * mm
        if len(heads) > 9:
            half = (len(heads) + 1) // 2
            yy = dtable(c, xt, yy, tw, heads[:half], vals[:half], size=8, rh=5 * mm)
            yy = dtable(c, xt, yy, tw, heads[half:], vals[half:], size=8, rh=5 * mm)
        else:
            yy = dtable(c, xt, yy, tw, heads, vals, size=8, rh=5 * mm, hl=hl)
    if note:
        yy = para(c, xt, yy, note, tw, 8.5, 4 * mm, GREY)
    return min(yb, yy) - 5 * mm


def page5(c, size):
    top = header(c, size, False, T('pg_options'))
    y = H - top - 8 * mm
    y = sec_title(c, y, T('pg_options'), T('opt_sub'))
    sd = row_of('shrink_disc', size)
    y = item(c, y, T('sd_title'), T('sd_p'), 'shrink-disc', T('rowt', size=size),
             ['\u00d8D H7', 'L', 'N', 'A', 'B', 'C', T('sd_screws'), '\u00d8E h8', 'F', '\u00d8G', 'H', 'Type', T('sd_st'), T('sd_t'), T('sd_ax'), 'kg'],
             [sd['D_hollow_H7'], sd['L'], sd['N'], sd['A'], sd['B'], sd['C'], sd['screws'], sd['E_h8'], sd['F'], sd['G'], sd['H'], sd['type'],
              sd['screw_torque_Nm'], grp(sd['transmissible_torque_Nm']), grp(sd['axial_force_N']), sd['weight_kg']],
             imgw=50 * mm, imgh=46 * mm)
    ss = row_of('special_seals', size)
    y = item(c, y, T('ss_title'), T('ss_p'), 'special-seals', T('rowt_mm', size=size),
             ['\u00d8D H7', 'L', 'N', 'A', 'B', 'C', T('ss_in'), T('ss_out')],
             [ss['D_hollow_H7'], ss['L'], ss['N'], ss['A'], ss['B'], ss['C'], ss['vring_input'], ss['vring_output']],
             imgw=50 * mm, imgh=46 * mm)
    rb = row_of('reduction_bushing', size)
    y = item(c, y, T('rb_title'), T('rb_p'), 'reduction-bushing', T('rowt_mm', size=size),
             [T('rb_od'), T('rb_bore'), 'C', 'B', 'E'],
             [rb['D_outer_H7'], ', '.join(rb['A_bores_H7']), rb['C'], rb['B'], rb['E']],
             imgw=50 * mm, imgh=42 * mm)
    hb = row_of('hollow_shaft_bores', size)
    y = item(c, y, T('hb_title'), T('hb_p'), 'hollow-shaft', T('rowt_hb', size=size),
             [T('hb_cat'), T('hb_max'), T('hb_spec')],
             [hb['catalogue'], hb['maximum'], ', '.join(hb['special'])],
             imgw=56 * mm, imgh=40 * mm)
    footer(c, size, 5)
    c.showPage()


def page6(c, size):
    top = header(c, size, False, T('pg_hardware'))
    y = H - top - 8 * mm
    y = sec_title(c, y, T('pg_hardware'), T('hw_sub'))
    y = para(c, M, y, T('hw_p', size=size), CW, 9.3)
    y -= 2 * mm
    ta = row_of('torque_arm_without_brackets', size)
    y = item(c, y, T('ta1_title'), T('ta1_p'), 'torque-arm-plain', T('rowt_mm', size=size), ['A', 'B', 'M', 'W', 'K'],
             [ta['A'], ta['B'], ta['M'], ta['W'], ta['K']], imgw=70 * mm, imgh=32 * mm)
    tp = row_of('torque_arm_with_plate', size)
    y = item(c, y, T('ta2_title'), T('ta2_p'), 'torque-arm-plate', T('rowt_mm', size=size), ['A', 'G', 'M', 'Q', 'W', 'K'],
             [tp['A'], tp['G'], tp['M'], tp['Q'], tp['W'], tp['K']], imgw=70 * mm, imgh=32 * mm)
    mt = row_of('motor_mount', size)
    y = item(c, y, T('mm_title'), T('mm_p'), 'motor-mount', T('rowt_mm', size=size),
             [T('mm_max'), 'A', 'B', 'C', 'D', 'E', 'F', 'G', T('mm_w')],
             [mt['max_motor_B3'], mt['A'], mt['B'], mt['C'], mt['D'], mt['E'], mt['F'], mt['G'], mt['weight_kg']],
             imgw=64 * mm, imgh=42 * mm)
    bs = OPT['backstop_M1_Nm']['rows'][size]
    max_ov = float(bs) * OPT['backstop_M1_Nm']['overload_factor']
    y = item(c, y, T('bs_title'), T('bs_p'), 'backstop', T('rowt_bs', size=size), [T('bs_m1'), T('bs_ov')],
             ['%s Nm' % bs, '%g Nm' % round(max_ov, 1)], imgw=44 * mm, imgh=42 * mm, note=T('bs_note'))
    footer(c, size, 6)
    c.showPage()


def page7(c, size):
    top = header(c, size, False, T('pg_apps'))
    y = H - top - 8 * mm
    y = sec_title(c, y, T('pg_apps'), T('ap_sub'))
    y = para(c, M, y, T('ap_p'), CW, 9.8)
    y -= 1 * mm
    y = bullets(c, M, y, [T('ap_b1'), T('ap_b2'), T('ap_b3'), T('ap_b4')], CW, 9.8, 4.8 * mm)
    y -= 3 * mm
    gap = 5 * mm
    w3 = (CW - gap) / 2
    ph = 50 * mm
    pic_cover(c, 'photo-3', M, y, w3, ph)
    pic_cover(c, 'photo-2', M + w3 + gap, y, w3, ph)
    y -= ph + gap
    pic_cover(c, 'photo-1', M, y, w3, ph)
    pic_cover(c, 'photo-4', M + w3 + gap, y, w3, ph)
    y -= ph + 7 * mm
    y = sec_title(c, y, T('sp_title'))
    y = bullets(c, M, y, [T('sp1'), T('sp2'), T('sp3'), T('sp4')], CW, 9.5, 4.6 * mm)
    y -= 4 * mm
    y = sec_title(c, y, T('ord_title'))
    para(c, M, y, T('ord_p'), CW, 9.5)
    footer(c, size, 7)
    c.showPage()


def out_name(size, lang):
    return 'Q2M-OCR-RP-%s-data-sheet%s.pdf' % (size, '' if lang == 'en' else '-' + lang)


def build(size, lang, pts, weight, eff, spd):
    global LANG
    LANG = lang
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, out_name(size, lang))
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle('Q\u00b2 Machines | OCR RP %s | %s' % (size, T('hdr_title').title()))
    c.setAuthor('Q\u00b2 Machines')
    c.setSubject('OCR RP Series, size %s' % size)
    page1(c, size, pts, weight)
    page2(c, size, pts, eff, spd)
    for pg in (page3, page4, page5, page6, page7):
        pg(c, size)
    c.save()
    return path


def main():
    langs = sys.argv[1:] or LANGS
    weights, eff, spd = load()
    data = ratings()
    for lang in langs:
        for size in sorted(data, key=int):
            p = build(size, lang, data[size], weights[size], eff, spd)
            print('ok', os.path.relpath(p, ROOT))


if __name__ == '__main__':
    main()
