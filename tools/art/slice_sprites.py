#!/usr/bin/env python3
"""Turn a Gemini pixel-art image (4 growth stages in a row on a magenta background)
into a clean Little Egg sprite strip: egg/art/<id>.png, 4 frames of 40x40 pixels
(baby, child, teen, adult), transparent background, bottom-aligned and centred.

Usage:  python3 tools/art/slice_sprites.py <image.png|jpg> <species_id> [--preview out.png]

How it works: finds the magenta band, measures the size of one "pixel" in the picture,
samples the middle of every pixel cell (so blur / JPEG noise disappears), removes the
magenta, and snaps colours to a small palette so the art stays crisp."""
import sys, numpy as np
from PIL import Image

FW = FH = 40

def is_mag(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (r > 160) & (g < 120) & (b > 160) & (r - g > 90) & (b - g > 90)

def period(sig, lo=6.0, hi=48.0):
    sig = sig - sig.mean(); k = np.arange(len(sig)); best = (0, lo)
    for p in np.arange(lo, hi, 0.05):
        c = abs((sig * np.exp(-2j * np.pi * k / p)).sum())
        if c > best[0]: best = (c, p)
    return best[1]

def phase(sig, P):
    best = (-1, 0.0)
    for o in np.arange(0, P, 0.1):
        idx = np.round(np.arange(o, len(sig) - 1, P)).astype(int)
        v = sig[idx].sum()
        if v > best[0]: best = (v, o)
    return best[1]

def main():
    src, sid = sys.argv[1], sys.argv[2]
    prev = sys.argv[sys.argv.index('--preview') + 1] if '--preview' in sys.argv else None
    im = np.asarray(Image.open(src).convert('RGB')).astype(float)
    mag = is_mag(im)
    rows = np.where(mag.mean(1) > 0.25)[0]; y0, y1 = rows.min(), rows.max()
    cols = np.where(mag[y0:y1 + 1].mean(0) > 0.25)[0]; x0, x1 = cols.min(), cols.max()
    band = im[y0:y1 + 1, x0:x1 + 1]
    gx = np.abs(np.diff(band, axis=1)).sum(2).sum(0); gy = np.abs(np.diff(band, axis=0)).sum(2).sum(1)
    P = (period(gx) + period(gy)) / 2
    ox, oy = phase(gx, P), phase(gy, P)
    nr, nc = int((band.shape[0] - oy - 1) // P), int((band.shape[1] - ox - 1) // P)
    grid = np.zeros((nr, nc, 3))
    for j in range(nr):
        for i in range(nc):
            xs, ys = ox + 1 + i * P, oy + 1 + j * P
            cell = band[int(ys + P * .3):int(ys + P * .7) + 1, int(xs + P * .3):int(xs + P * .7) + 1]
            grid[j, i] = np.median(cell.reshape(-1, 3), axis=0)
    m = is_mag(grid)
    occ = ~m
    # 4 characters = 4 runs of occupied columns
    runs, s = [], None
    for x, v in enumerate(occ.any(0)):
        if v and s is None: s = x
        if not v and s is not None: runs.append((s, x - 1)); s = None
    if s is not None: runs.append((s, nc - 1))
    runs = sorted(sorted(runs, key=lambda r: r[1] - r[0], reverse=True)[:4])
    if len(runs) != 4: sys.exit(f'expected 4 characters, found {len(runs)}')
    # palette: k-means on the character pixels
    pix = grid[occ]; k = min(14, max(4, len(np.unique(np.round(pix / 24), axis=0))))
    order = np.argsort(pix.sum(1)); C = pix[order[np.linspace(0, len(pix) - 1, k).astype(int)]].copy()
    for _ in range(40):
        a = ((pix[:, None] - C[None]) ** 2).sum(2).argmin(1)
        for j in range(k):
            if (a == j).any(): C[j] = pix[a == j].mean(0)
    C = np.round(C).astype(int)
    # edge pixels next to the magenta blend into purple-tinted dark colours: turn them into the plain dark outline
    tint = (C[:, 0] > C[:, 1] + 30) & (C[:, 2] > C[:, 1] + 30) & (C.sum(1) < 330)
    if tint.any() and (~tint).any():
        ok = np.where(~tint)[0]; dark = ok[C[ok].sum(1).argmin()]
        C[tint] = C[dark]
    sizes = []
    for a, c in runs:
        rr = np.where((~m[:, a:c + 1]).any(1))[0]; sizes.append((c - a + 1, rr.max() - rr.min() + 1))
    print('stage sizes (w x h):', sizes, f'(frame is {FW}x{FH}; up to 2 over is trimmed)')
    sheet = Image.new('RGBA', (FW * 4, FH), (0, 0, 0, 0))
    for n, (a, c) in enumerate(runs):
        sub, sm = grid[:, a:c + 1], m[:, a:c + 1]
        rr = np.where((~sm).any(1))[0]; sub, sm = sub[rr.min():rr.max() + 1], sm[rr.min():rr.max() + 1]
        # one or two pixels too big: trim the outer row/column that has the fewest drawn cells
        while FH < sm.shape[0] <= FH + 2:
            t, b = (~sm[0]).sum(), (~sm[-1]).sum()
            sub, sm = (sub[1:], sm[1:]) if t <= b else (sub[:-1], sm[:-1])
        while FW < sm.shape[1] <= FW + 2:
            l, r = (~sm[:, 0]).sum(), (~sm[:, -1]).sum()
            sub, sm = (sub[:, 1:], sm[:, 1:]) if l <= r else (sub[:, :-1], sm[:, :-1])
        h, w = sm.shape
        if (h > FH or w > FW) and '--fit' in sys.argv:
            # too big: shrink the whole stage to fit (area average, then snap back to the palette)
            im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); ip = im.load()
            for y in range(h):
                for x in range(w):
                    if not sm[y, x]:
                        j = ((C - sub[y, x]) ** 2).sum(1).argmin(); ip[x, y] = tuple(int(v) for v in C[j]) + (255,)
            sc = min(FW / w, FH / h); nw, nh = max(1, round(w * sc)), max(1, round(h * sc))
            im = im.resize((nw, nh), Image.BOX); a = np.array(im).astype(int)
            sub = a[:, :, :3]; sm = a[:, :, 3] < 128; h, w = sm.shape
            print(f'stage {n+1} shrunk to {w}x{h}')
        if h > FH or w > FW: sys.exit(f'stage {n+1} is {w}x{h}, bigger than {FW}x{FH}')
        fr = Image.new('RGBA', (FW, FH), (0, 0, 0, 0)); px = fr.load()
        fx, fy = (FW - w) // 2, FH - h
        for y in range(h):
            for x in range(w):
                if sm[y, x]: continue
                j = ((C - sub[y, x]) ** 2).sum(1).argmin()
                px[fx + x, fy + y] = tuple(int(v) for v in C[j]) + (255,)
        sheet.paste(fr, (n * FW, 0))
    out = f'egg/art/{sid}.png'
    sheet.save(out, optimize=True)
    print(f'{out}: pixel size {P:.2f}, palette {k} colours, stages', [(c - a + 1) for a, c in runs])
    if prev: sheet.resize((FW * 4 * 6, FH * 6), Image.NEAREST).save(prev)

if __name__ == '__main__':
    main()
