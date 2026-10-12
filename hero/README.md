# Roses N Chic: Hero Scroll Section

The hero for the Roses N Chic site. The video plays when the user scrolls. At the end, the woman stands next to the logo.

## What is in this folder

| Folder | What it is | Tested here? |
|---|---|---|
| `standalone/` | A plain web page (HTML, CSS, JS). Runs with any static server. | Yes. Tested in a headless Chromium browser. |
| `nextjs/` | The same hero as files for a Next.js (App Router) project. | **No.** My workspace blocked npm, so I could not install Next.js. |
| `tools/` | Python scripts that made the frames and the cut-out. | Yes. |

The motion code is one file: `standalone/hero-engine.js` (the same file is in `nextjs/lib/`). The Next.js part is only a thin wrapper around it.

## Run it

```bash
cd standalone
python3 -m http.server 8080      # or: npx serve .
```

Open `http://localhost:8080`. Scroll, or press **Ambient tour**.

Do not open `index.html` by double-click. The page uses ES modules, and a browser blocks them on `file://`.

## Use it in Next.js

1. Make a Next.js app: `npx create-next-app@latest roses-n-chic` (TypeScript, App Router, `@/*` alias).
2. Install the libraries: `npm i gsap lenis`
3. Copy the files:
   - `nextjs/components/*` to `components/`
   - `nextjs/lib/hero-engine.js` to `lib/`
   - `nextjs/styles/hero.css` to `styles/`
   - `nextjs/app/layout.tsx` and `page.tsx` to `app/` (or merge them into yours)
   - `standalone/frames/` to `public/hero/frames/`
4. Remove the default page styles that `create-next-app` adds to `body` in `globals.css`. They can fight with `hero.css`.
5. Run `npm run dev`.

If the build gives a type error for `@/lib/hero-engine`, make sure `"allowJs": true` is in `tsconfig.json`.

## How the scroll works

`p` is the scroll progress of the whole hero (0 to 1). The hero is 640 screen heights long.

| Scroll | What happens |
|---|---|
| 0 to 84% | The 211 frames play: stitching, dress, model, glow-up. |
| 84% to 100% | The video fades out. The cut-out woman gets smaller and moves next to the logo. The tagline and the button appear. |

Other parts:
- **Mouse:** The cursor moves the frame number by a small amount and moves the picture a few pixels.
- **Ambient tour:** The button scrolls the page by itself in about 26 seconds. A wheel, touch, or key press stops it.
- **Logo:** It fades down while the model is in the middle of the picture, so it does not cover her face. It comes back when the plain panel slides in.
- **Reduced motion:** If the visitor asks for less motion, the page shows the finished layout and nothing moves.
- **Loading:** The page loads the first frame, then the last frame, then every 6th frame, then the rest. The page works before all frames load.

## Settings

All settings are at the top of `hero-engine.js` (`DEFAULTS`). You can also pass a `config` object to `initHero`.

| Setting | What it does |
|---|---|
| `scrollVh` | Length of the hero. Smaller is faster. |
| `scrubEnd` | Where the frames end and the docking starts. |
| `dock.heightOverLogo` | Her height compared to the logo height. Make it bigger for a bigger woman. |
| `dock.gapPx` | Space between the logo and the woman. |
| `subject` | Her box in the last frame (in frame pixels). Change it if you use a new video. |
| `logoDip` | When the logo fades. |
| `mouse` | How strong the mouse effect is. |

## What I did to your video

| Problem in the video | What I did |
|---|---|
| Dark dip at 7.3 s (the two clips join) | Removed 15 dark frames. Made a 6-frame cross-fade. |
| Black bars from 7.5 s | Cropped them on every frame and filled the screen. |
| Hard edge at about 9.5 s (a plain panel slides in) | Kept it. It looks like a split-screen layout, and the logo sits on the plain panel. |
| Gray wall and big lotus at the end | The woman is cut out of the last frame. The video fades to the page gradient, and the wall and lotus go away. |
| 30 frames per second | Kept every 2nd frame (15 per second). 211 frames. |

## Things to know

1. **Veo mark.** A small "Veo" mark shows at the bottom right in the first part of the video (the stitching and the dress). In the second part it was in the black bar, so the crop removed it. Export from Flow with a plan that gives no visible mark, or check Google's terms before you cut it out. I did not remove it.
2. **Gray wall.** The end of the video is grayer than the rest. If you make the last clip again, ask for a bright ivory-pink background.
3. **Weight.** Desktop frames are about 15 MB in total. Mobile frames are about 11 MB. The page loads them in the background. For a faster first visit, lower the quality in `tools/make_frames.py` or use fewer frames.
4. **Cut-out edges.** The cut-out came from a model that finds people in images. Check the hair and the skirt edge at full size. If you see a rough edge, make the cut-out again with a better model.
5. **Font.** The page uses Cormorant Garamond and Montserrat (Google Fonts). My test screenshots used a plain fallback font, because my workspace could not reach Google Fonts. The logo will look finer on your computer.
6. **Licenses.** GSAP is free to use under the GSAP "no charge" license. Lenis is MIT. Check both again before you sell.

## Next steps

1. Run the page on your computer. Scroll slowly through all parts. Tell me what you want to change.
2. Make the Next.js app (Phase 0 of `plan.md`) and add this hero.
3. Continue with Phase 1: design system, then the catalog.
