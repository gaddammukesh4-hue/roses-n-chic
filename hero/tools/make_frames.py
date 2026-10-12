# Helper scripts for the hero frames. Paths are relative to a work folder that holds:
#   hero/src/s_0001.png ...   every video frame (ffmpeg -i video.mov -map 0:v:0 -vsync 0 hero/src/s_%04d.png)
#   hero/model/u2net_human_seg.onnx   github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx
# The DIP range in make_frames.py is for THIS video (dark dip at 7.3 s). Check yours with a luminance scan.
import glob, json, os, sys
import numpy as np
from PIL import Image
from concurrent.futures import ProcessPoolExecutor

SRC = 'hero/src'
OUT = 'hero/out'
W, H = 1600, 900
DIP = range(218, 233)          # fade-through-black frames (7.27 s to 7.73 s)
BLEND = 6                      # frames of cross-fade that replace the dip
STEP = 2                       # keep every 2nd frame (30 fps -> 15 fps)

def bars(a):
    rows = a.mean(axis=(1, 2))
    top = 0
    while top < 130 and rows[top] < 6: top += 1
    bot = 0
    while bot < 130 and rows[-1 - bot] < 6: bot += 1
    return top, bot

def norm(i):
    im = Image.open(f'{SRC}/s_{i+1:04d}.png').convert('RGB')
    a = np.asarray(im)
    top, bot = bars(a)
    pic = im.crop((0, top, im.width, im.height - bot))
    pw, ph = pic.size
    cw = int(round(ph * 16 / 9))
    if cw < pw:                         # cover-fit: crop the sides, centre
        x0 = (pw - cw) // 2
        pic = pic.crop((x0, 0, x0 + cw, ph))
    elif cw > pw:                       # picture too narrow: crop top and bottom
        ch = int(round(pw * 9 / 16)); y0 = (ph - ch) // 2
        pic = pic.crop((0, y0, pw, y0 + ch))
    return pic.resize((W, H), Image.LANCZOS), (top, bot)

if __name__ == '__main__':
    os.makedirs(f'{OUT}/desktop', exist_ok=True)
    os.makedirs(f'{OUT}/mobile', exist_ok=True)
    n = len(glob.glob(f'{SRC}/s_*.png'))
    keep = [i for i in range(n) if i not in DIP]
    with ProcessPoolExecutor() as ex:
        res = dict(zip(keep, ex.map(norm, keep, chunksize=8)))
    seq = []
    for i in keep:
        seq.append(res[i][0])
        if i == DIP.start - 1:                         # insert the cross-fade
            a, b = np.asarray(res[i][0], float), np.asarray(res[DIP.stop][0], float)
            for k in range(1, BLEND + 1):
                t = k / (BLEND + 1)
                seq.append(Image.fromarray(((1 - t) * a + t * b).astype(np.uint8)))
    out = seq[::STEP]
    if out[-1] is not seq[-1]:
        out.append(seq[-1])                             # always keep the true last frame
    for k, im in enumerate(out, 1):
        im.save(f'{OUT}/desktop/f_{k:04d}.webp', quality=72, method=5)
        im.resize((1280, 720), Image.LANCZOS).save(f'{OUT}/mobile/f_{k:04d}.webp', quality=68, method=5)
    seq[-1].save(f'{OUT}/last_full.png')
    json.dump({'frames': len(out), 'w': W, 'h': H,
               'fps_source': 30 / STEP}, open(f'{OUT}/meta.json', 'w'))
    print('frames', len(out), 'bars sample', [res[i][1] for i in (0, 217, 233, 300, 428)])
