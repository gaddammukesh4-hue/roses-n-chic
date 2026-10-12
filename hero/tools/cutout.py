import json, numpy as np, cv2, onnxruntime as ort
from PIL import Image
im = cv2.cvtColor(cv2.imread('hero/out/last_full.png'), cv2.COLOR_BGR2RGB)   # 1600x900
H, W = im.shape[:2]
X0 = 560                                   # crop around the woman, keep full height
crop = im[:, X0:]
sess = ort.InferenceSession('hero/model/u2net_human_seg.onnx', providers=['CPUExecutionProvider'])
def run(img):
    x = cv2.resize(img, (320, 320), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    y = sess.run(None, {sess.get_inputs()[0].name: x})[0][0, 0]
    y = (y - y.min()) / (y.max() - y.min() + 1e-8)
    return cv2.resize(y, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC)
m = run(crop)
# second pass on a mirrored copy, average (cheap test-time augmentation)
m = 0.5 * (m + run(crop[:, ::-1])[:, ::-1])
m = np.clip(m, 0, 1).astype(np.float32)
guide = cv2.cvtColor(crop, cv2.COLOR_RGB2GRAY)
def guided(I, p, r, eps):
    I = I.astype(np.float32) / 255.0
    box = lambda x: cv2.boxFilter(x, -1, (2 * r + 1, 2 * r + 1))
    mI, mp = box(I), box(p)
    cov = box(I * p) - mI * mp
    var = box(I * I) - mI * mI
    a = cov / (var + eps); b = mp - a * mI
    return box(a) * I + box(b)
m = guided(guide, m, 10, 1e-3)
a = np.clip((m - 0.30) / 0.45, 0, 1)
a = a * a * (3 - 2 * a)                    # smoothstep
a = cv2.GaussianBlur(a, (0, 0), 0.8)
alpha = np.zeros((H, W), np.float32); alpha[:, X0:] = a
cv2.imwrite('hero/out/alpha_debug.png', (alpha * 255).astype(np.uint8))
rgba = np.dstack([im, (alpha * 255).astype(np.uint8)])
Image.fromarray(rgba, 'RGBA').save('hero/out/cutout_full.png')
ys, xs = np.where(alpha > 0.5)
box = dict(x0=int(xs.min()), x1=int(xs.max()), y0=int(ys.min()), y1=int(ys.max()))
print(box)
json.dump(box, open('hero/out/subject_box.json', 'w'))
# preview on page-like gradient
g = np.zeros((H, W, 3), np.float32)
c0 = np.array([251, 243, 232], np.float32); c1 = np.array([240, 203, 193], np.float32)
t = (np.linspace(0, 1, W)[None, :] * 0.5 + np.linspace(0, 1, H)[:, None] * 0.5)[..., None]
g = c0 * (1 - t) + c1 * t
out = im * alpha[..., None] + g * (1 - alpha[..., None])
Image.fromarray(out.astype(np.uint8)).save('hero/out/cutout_preview.jpg', quality=88)
