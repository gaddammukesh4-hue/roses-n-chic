/**
 * Roses N Chic: hero scroll engine
 *
 * Framework free. GSAP, ScrollTrigger and Lenis are passed in, so the same file
 * works in a plain page (globals) and in Next.js (npm imports).
 *
 * Scroll plan (p = scroll progress of the whole hero, 0 to 1):
 *   0 to scrubEnd     the frame sequence plays (stitching, dress, model, glow-up)
 *   scrubEnd to 1     the video fades out, the cut-out woman shrinks and walks
 *                     to her place next to the logo
 */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const DEFAULTS = {
  baseUrl: 'frames/',        // folder with desktop/, mobile/ and cutout.webp
  frames: 211,
  pad: 4,                    // f_0001.webp
  ext: 'webp',
  frameW: 1600,
  frameH: 900,
  // The woman in the LAST frame, in frame pixels (measured from the cut-out).
  subject: { x0: 784, x1: 1381, y0: 35, y1: 899 },
  scrollVh: 640,             // length of the hero in screen heights
  scrubEnd: 0.84,            // the frames end here, the docking starts
  mobileQuery: '(max-width: 768px)',
  // Horizontal focus of the picture on narrow screens: [progress, 0..1]
  focusKeys: [[0, 0.5], [0.45, 0.5], [0.8, 0.677]],
  mouse: { frames: 2.5, parallaxPx: 8 },
  // The logo fades down while the woman is in the middle of the picture, so it
  // never covers her face. It comes back when the plain panel slides in.
  logoDip: { min: 0.1, fadeOut: [0.28, 0.4], fadeIn: [0.62, 0.72] },
  // On phones the plain panel is cropped away, so the logo returns later.
  logoDipMobile: { min: 0.1, fadeOut: [0.28, 0.4], fadeIn: [0.86, 0.98] },
  dock: {
    heightOverLogo: 2.7,     // her height = logo height x this number (desktop)
    maxHeightRatio: 0.97,    // but never more than this part of the free height
    gapPx: 80,               // space between logo and woman (desktop)
    mobileHeightRatio: 0.5,  // her height on phones, part of the screen height
    mobileX: 0.64,           // her centre on phones, part of the screen width
  },
  follow: 0.14,              // how fast the picture follows the scroll (0 to 1)
  tourSeconds: 26,           // length of the ambient tour
  chapters: [
    [0.0, '01', 'The Needle'],
    [0.28, '02', 'The Dress'],
    [0.43, '03', 'The Muse'],
    [0.6, '04', 'Roses N Chic'],
  ],
};

function merge(base, extra) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const k of Object.keys(extra || {})) {
    const v = extra[k];
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && base[k] ? merge(base[k], v) : v;
  }
  return out;
}

export function initHero({ gsap, ScrollTrigger, Lenis, root, config = {} }) {
  const cfg = merge(DEFAULTS, config);
  const N = cfg.frames;
  const $ = (name) => root.querySelector(`[data-hero="${name}"]`);
  const stage = $('stage'), canvas = $('canvas'), cutout = $('cutout');
  const logo = $('logo'), loader = $('loader'), tourBtn = $('tour'), hint = $('hint');
  const counterNum = $('counter-num'), counterLabel = $('counter-label');
  const lateEls = Array.from(root.querySelectorAll('[data-hero-late]'));
  const nav = document.querySelector('[data-hero="nav"]');
  const ctx = canvas.getContext('2d', { alpha: false });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileSet = window.matchMedia(cfg.mobileQuery).matches;
  const set = isMobileSet ? 'mobile' : 'desktop';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = isMobileSet ? 'low' : 'high';

  let W = 0, H = 0, dpr = 1, dock = null, lenis = null, destroyed = false;
  const state = { target: 0, p: 0, mx: 0, mxT: 0, my: 0, myT: 0, lastKey: '' };
  const imgs = new Array(N);
  let loadedCount = 0;
  const cleanups = [];
  const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); cleanups.push(() => el.removeEventListener(ev, fn, opt)); };

  /* ---------- geometry ---------- */
  function focusAt(p) {
    const k = cfg.focusKeys;
    if (p <= k[0][0]) return k[0][1];
    for (let i = 1; i < k.length; i++) {
      if (p <= k[i][0]) return lerp(k[i - 1][1], k[i][1], smooth(k[i - 1][0], k[i][0], p));
    }
    return k[k.length - 1][1];
  }
  function geo(fx) {
    const s = Math.max(W / cfg.frameW, H / cfg.frameH);
    const dw = cfg.frameW * s, dh = cfg.frameH * s;
    const dx = clamp(W / 2 - fx * dw, W - dw, 0);
    const dy = Math.min(0, -(dh - H) * 0.2);       // wide screens: crop more at the bottom
    return { s, dw, dh, dx, dy };
  }

  function layout() {
    const r = stage.getBoundingClientRect();
    W = Math.round(r.width); H = Math.round(r.height);
    dpr = Math.min(window.devicePixelRatio || 1, isMobileSet ? 1.5 : 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    state.lastKey = '';
    // dock target
    const g = geo(cfg.focusKeys[cfg.focusKeys.length - 1][1]);
    const sb = cfg.subject;
    const bx = ((sb.x0 + sb.x1) / 2) * g.s, by = sb.y1 * g.s;
    const hs = (sb.y1 - sb.y0) * g.s;
    const navH = nav ? nav.getBoundingClientRect().height : 0;
    const mobile = W <= 768;
    let Ht, Xf;
    if (!mobile) {
      const lr = logo.getBoundingClientRect();
      Ht = Math.min(lr.height * cfg.dock.heightOverLogo, (H - navH) * cfg.dock.maxHeightRatio);
      const wS = (sb.x1 - sb.x0) * g.s * (Ht / hs);
      Xf = Math.min(lr.right + cfg.dock.gapPx + wS / 2, W - wS / 2 - 24);
    } else {
      Ht = H * cfg.dock.mobileHeightRatio;
      Xf = W * cfg.dock.mobileX;
    }
    dock = { S: Ht / hs, tx: Xf - (g.dx + bx), ty: H - (g.dy + by) };
    Object.assign(cutout.style, {
      left: g.dx + 'px', top: g.dy + 'px', width: g.dw + 'px', height: g.dh + 'px',
      transformOrigin: `${bx}px ${by}px`,
    });
    state.dockBox = { Ht, Xf };
    render(state.p, true);
  }

  /* ---------- frames ---------- */
  const url = (i) => `${cfg.baseUrl}${set}/f_${String(i + 1).padStart(cfg.pad, '0')}.${cfg.ext}`;
  function loadOne(i) {
    return new Promise((resolve) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => { imgs[i] = im; loadedCount++; if (loader) loader.style.transform = `scaleX(${loadedCount / N})`; resolve(); };
      im.onerror = () => resolve();
      im.src = url(i);
    });
  }
  async function loadAll() {
    // 1: first frame. 2: last frame. 3: every 6th frame. 4: all the rest.
    const order = [0, N - 1];
    for (let i = 6; i < N - 1; i += 6) order.push(i);
    for (let i = 1; i < N - 1; i++) if (i % 6) order.push(i);
    let k = 0;
    const worker = async () => { while (k < order.length && !destroyed) await loadOne(order[k++]); };
    await Promise.all(Array.from({ length: 6 }, worker));
    root.dataset.framesLoaded = 'true';
    if (loader) loader.style.opacity = '0';
  }
  function nearest(i) {
    for (let d = 0; d < N; d++) {
      if (imgs[i - d]) return imgs[i - d];
      if (imgs[i + d]) return imgs[i + d];
    }
    return null;
  }

  /* ---------- render ---------- */
  let chapterIdx = -1;
  function render(p, force) {
    if (!W) return;
    if (reduced) p = 1;                 // reduced motion: always show the finished layout
    const scrub = clamp(p / cfg.scrubEnd, 0, 1);
    const d = p > cfg.scrubEnd ? (p - cfg.scrubEnd) / (1 - cfg.scrubEnd) : 0;
    const mouseFade = smooth(0.0, 0.02, p) * (1 - smooth(cfg.scrubEnd - 0.1, cfg.scrubEnd - 0.02, p));
    const f = clamp(scrub * (N - 1) + state.mx * cfg.mouse.frames * mouseFade, 0, N - 1);
    const fx = focusAt(p);
    const key = `${f.toFixed(2)}|${fx.toFixed(3)}|${W}x${H}|${loadedCount}`;
    if (force || key !== state.lastKey) {
      state.lastKey = key;
      const im = nearest(Math.round(f));
      if (im) {
        const g = geo(fx);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.drawImage(im, g.dx, g.dy, g.dw, g.dh);
      }
    }
    // mouse parallax (only while the frames play)
    const px = -state.mx * cfg.mouse.parallaxPx * mouseFade, py = -state.my * cfg.mouse.parallaxPx * mouseFade;
    canvas.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0) scale(${1 + (cfg.mouse.parallaxPx * 2.2) / Math.max(W, 1) * mouseFade})`;
    // docking
    canvas.style.opacity = String(1 - smooth(0, 0.4, d));
    cutout.style.opacity = d > 0.0005 ? '1' : '0';
    const e = easeInOut(smooth(0.18, 1, d));
    cutout.style.transform = `translate3d(${(dock.tx * e).toFixed(2)}px, ${(dock.ty * e).toFixed(2)}px, 0) scale(${(1 + (dock.S - 1) * e).toFixed(4)})`;
    const a = smooth(0.55, 1, d);
    for (const el of lateEls) { el.style.opacity = a.toFixed(3); el.style.transform = `translateY(${((1 - a) * 12).toFixed(1)}px)`; el.style.pointerEvents = a > 0.6 ? 'auto' : 'none'; }
    if (hint) hint.style.opacity = String(1 - smooth(0, 0.03, p));
    {
      const L = W <= 768 ? cfg.logoDipMobile : cfg.logoDip;
      const dip = smooth(L.fadeOut[0], L.fadeOut[1], p) * (1 - smooth(L.fadeIn[0], L.fadeIn[1], p));
      logo.style.opacity = (1 - (1 - L.min) * dip).toFixed(3);
    }
    // chapters
    let idx = 0;
    for (let i = 0; i < cfg.chapters.length; i++) if (p >= cfg.chapters[i][0]) idx = i;
    if (idx !== chapterIdx) {
      chapterIdx = idx;
      if (counterNum) counterNum.textContent = cfg.chapters[idx][1];
      if (counterLabel) counterLabel.textContent = cfg.chapters[idx][2];
    }
    root.dataset.progress = p.toFixed(3);
  }

  /* ---------- static fallback (reduced motion) ---------- */
  if (reduced) {
    root.classList.add('is-static');
    layout();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout());
    canvas.style.display = 'none';
    lateEls.forEach((el) => { el.style.pointerEvents = 'auto'; });
    if (loader) loader.style.display = 'none';
    if (hint) hint.style.display = 'none';
    if (tourBtn) tourBtn.style.display = 'none';
    const onResize = () => layout();
    on(window, 'resize', onResize);
    return { destroy() { cleanups.forEach((fn) => fn()); }, static: true };
  }

  /* ---------- live mode ---------- */
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!destroyed) layout(); });
  loadAll();

  const st = ScrollTrigger.create({
    trigger: root, start: 'top top', end: 'bottom bottom',
    onUpdate: (self) => { state.target = self.progress; },
    onRefresh: (self) => { state.target = self.progress; },
  });

  const frameTick = () => {
    const k = 1 - Math.pow(1 - cfg.follow, gsap.ticker.deltaRatio(60));
    state.p += (state.target - state.p) * k;
    if (Math.abs(state.target - state.p) < 0.00005) state.p = state.target;
    state.mx += (state.mxT - state.mx) * 0.08;
    state.my += (state.myT - state.my) * 0.08;
    render(state.p, false);
  };
  gsap.ticker.add(frameTick);

  on(window, 'mousemove', (e) => {
    state.mxT = (e.clientX / window.innerWidth - 0.5) * 2;
    state.myT = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let rz = 0;
  on(window, 'resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { layout(); ScrollTrigger.refresh(); }, 120);
  });

  /* ---------- ambient tour ---------- */
  let touring = false;
  const heroTop = () => root.getBoundingClientRect().top + window.scrollY;
  const maxScroll = () => heroTop() + root.offsetHeight - window.innerHeight;
  const setTourLabel = () => {
    if (!tourBtn) return;
    tourBtn.dataset.state = touring ? 'playing' : 'idle';
    tourBtn.querySelector('[data-hero="tour-label"]').textContent = touring ? 'Pause tour' : 'Ambient tour';
    tourBtn.setAttribute('aria-pressed', touring ? 'true' : 'false');
  };
  function stopTour() {
    if (!touring) return;
    touring = false;
    // stop() cancels the running animation, start() lets the user scroll again
    lenis.stop();
    lenis.start();
    setTourLabel();
  }
  function startTour() {
    const max = maxScroll();
    if (lenis.scroll >= max - 4) lenis.scrollTo(heroTop(), { immediate: true, force: true });
    const remaining = (max - lenis.scroll) / Math.max(1, max - heroTop());
    touring = true; setTourLabel();
    lenis.scrollTo(max, {
      duration: Math.max(2, cfg.tourSeconds * remaining), easing: (t) => t, force: true, lock: false,
      onComplete: () => { touring = false; setTourLabel(); },
    });
  }
  if (tourBtn) on(tourBtn, 'click', () => (touring ? stopTour() : startTour()));
  ['wheel', 'touchstart', 'keydown'].forEach((ev) =>
    on(window, ev, () => { if (touring) stopTour(); }, { passive: true }));
  setTourLabel();

  /* ---------- debug and test API ---------- */
  const api = {
    lenis, state, config: cfg,
    /** jump to a progress value at once (used by the browser test) */
    jump(p) {
      const y = heroTop() + p * (root.offsetHeight - window.innerHeight);
      lenis.scrollTo(y, { immediate: true, force: true });
      state.target = state.p = p; state.mx = state.mxT = 0; state.my = state.myT = 0;
      render(p, true);
    },
    destroy() {
      destroyed = true;
      cleanups.forEach((fn) => fn());
      gsap.ticker.remove(frameTick); gsap.ticker.remove(tick);
      st.kill(); lenis.destroy();
    },
  };
  return api;
}
