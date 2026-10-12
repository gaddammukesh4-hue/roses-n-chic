# Roses N Chic: Flow Prompt Pack, Version 3

Plan: 2 clips, 10 seconds each. Total: 20 seconds.

- **Clip 1:** The stitching. It ends on the finished dress.
- **Clip 2:** The model comes to the front, then the glow-up.
- **After clip 2:** The website code makes her stand next to the logo.

Yes, this works. The last step is done by code, not by video. See section 7.

---

## 1. How we keep the model the same

Two clips are made separately. So the model must not change between them. We use three rules:

1. **Make the model image first.** All other images come from this one image.
2. **Clip 1 never shows her face.** Only the dress shows. So the face cannot change.
3. **Clip 2 starts on the last frame of clip 1.** The last frame of clip 2 is a key image of the model. Flow bridges the two frames.

Make the images in this order: **K3, then K2, then K1.**

| Image | What it shows | Used for |
|---|---|---|
| K3 | The model, front view. The final pose. | Last frame of clip 2 |
| K2 | Same woman, same dress. Close view, chin to waist. | Last frame of clip 1 and first frame of clip 2 |
| K1 | Macro of the cloth, before stitching. | First frame of clip 1 |

**Important:** Make all images **16:9, full frame, no black bars.** Your first video had black bars. They probably came from the input image.

---

## 2. Shared text blocks

Paste these blocks into every prompt. Do not change the words.

### LOOK block

```
High-key bright luxury fashion photography. Airy, clean, and radiant. Ivory-white and soft blush-pink colors with small touches of pale champagne gold. Large soft white window light. Cool-neutral white balance. Bright exposure. Soft creamy background. Gentle bokeh. Photorealistic. No text. No logo. No watermark.
```

### AVOID block

```
Avoid: brown tones, sepia, amber, orange light, golden-hour light, tan skin, dark shadows, dark background, smoke, fog, dirty haze, black bars, letterbox, text, letters, logo, extra fingers, flower in the mouth.
```

### MODEL block

```
A beautiful young woman with an angelic, gentle face. Fair, porcelain, milky-white skin with a soft pink glow on the cheeks. Even skin tone. Soft natural highlights, not oily. Soft dark-brown eyes. Rose-pink lips. Hair in a soft low updo with a few loose strands. A calm, warm smile.
```

### DRESS block

```
Blush-pink sleeveless wrap dress made of handloom cotton and fluid viscose rayon. Deep V-neckline. Soft ruched pleats across the bodice. Slim waistband with fine beading. Light blush-pink floral vine embroidery with small leaves and rosebuds, in tone-on-tone blush thread with small champagne-gold seed beads. The embroidery covers the right bodice panel and the waistband. A handcrafted 3D fabric rose rosette in blush-pink sits on the shoulder on the left side of the image. Soft flowing skirt.
```

### EMBROIDERY block

```
Light blush-pink handloom cotton cloth with a visible soft weave. Fine floral vine embroidery in blush-pink thread with small leaves and rosebuds. Small champagne-gold seed beads in the flower centers. The cloth is bright and light, not dark.
```

---

## 3. Key images (Flow image tool)

### K3: The model, front view (make this first)

```
[LOOK block]
[MODEL block]
[DRESS block]
Shot from the head to the mid-thigh. She stands on the right third of the image, and faces the camera. Her hands rest gently by her sides. The left half of the image is empty: a soft, smooth ivory-white and blush-pink gradient with a few blurred rose petals. A few white feathers float near her. Nothing is in her mouth.
[AVOID block]
```

Check this image with care. It is the source for all other images. Make it again until the skin, the face, and the dress are correct.

### K2: Close view of the same dress

Use K3 as an ingredient. Add this line at the start: "Same woman, same dress, same light as the reference image."

```
[LOOK block]
Same woman and same dress as the reference image. The camera is closer. The frame starts below her lips and ends at her waist, so her face is not visible. The finished floral embroidery on the bodice is clear and sharp. The 3D fabric rose is on the shoulder. Soft blush petals float in front of the camera, out of focus. The background is soft ivory-white and blush-pink.
[AVOID block]
```

### K1: Macro of the cloth before stitching

Use K2 as an ingredient. Add this line at the start: "Same cloth and same embroidery style as the reference image."

```
[LOOK block]
Extreme macro photo of plain blush-pink handloom cotton cloth. A faint pencil outline of a floral vine is on the cloth. No embroidery yet. A fine gold needle with pale blush thread rests at the cloth. No hand is visible. A few rose petals are in the soft blurred background.
[EMBROIDERY block]
[AVOID block]
```

---

## 4. Clip 1: Stitching (10 seconds)

**Mode:** Frames to Video
**First frame:** K1
**Last frame:** K2
**Format:** 16:9

```
[LOOK block]
Seconds 0 to 2: Extreme macro. A fine gold needle with pale blush thread enters the light blush-pink cotton cloth. No hand is visible. The needle moves by itself with smooth, slow strokes.
Seconds 2 to 7: Stitch by stitch, a floral vine grows across the cloth. Petals, leaves, and rosebuds form in blush thread. A small gold seed bead drops into place at the center of each flower. Rose petals float in the soft blurred background.
Seconds 7 to 10: The last stitch ties off. The needle lifts away. The camera pulls back and rises. The cloth is now the bodice of a blush-pink dress, worn by a woman. The frame starts below her lips. Her face is not visible. The finished embroidery is sharp. The 3D fabric rose is on the shoulder.
The light stays bright and ivory-white. The motion is slow and smooth.
[AVOID block]
```

**Check this clip:**
- [ ] No hand
- [ ] The cloth is light pink, not dark
- [ ] The embroidery in the last second matches the embroidery on the dress in K2
- [ ] No face in the last frame

---

## 5. Clip 2: She comes to the front, then the glow-up (10 seconds)

**Mode:** Frames to Video
**First frame:** K2 (or the real last frame of clip 1, if it is better)
**Last frame:** K3
**Format:** 16:9

```
[LOOK block]
Seconds 0 to 3: The camera rises slowly. White and blush rose petals and soft white feathers swirl across the frame. The woman's face comes into view behind the petals. Her face is soft and angelic. Her skin is fair and milky white. She looks at the camera.
Seconds 3 to 7: The camera pulls back. She steps forward gently and moves to the right third of the frame. The dress skirt moves softly. The left half of the frame stays open and empty, with a smooth ivory-white and blush-pink gradient.
Seconds 7 to 10: She stops. A soft wave of bright light moves across her. Her skin glows. Her eyes brighten. Her smile grows. A soft light bloom grows behind her. Tiny pale-gold sparkles rise in the air. A loose strand of hair moves in a light breeze. She holds still for the last second.
Same woman and same dress as the reference. Nothing is in her mouth. The light stays bright and ivory-white.
[AVOID block]
```

**Check this clip:**
- [ ] Same dress as clip 1
- [ ] Her face matches K3
- [ ] Skin is milky white. The background is not brown.
- [ ] The rose is on the shoulder
- [ ] Nothing is in her mouth
- [ ] She ends on the right third. The left half is empty.
- [ ] The glow-up is clear in the last 3 seconds
- [ ] The last frame looks like K3

---

## 6. If it does not work

- **The embroidery looks different between K2 and clip 1:** Make clip 1 again. Add this sentence: "The embroidery must match the reference image exactly."
- **She does not move to the right third:** Remove the timecodes. Write one short sentence: "She steps forward and stops on the right third of the frame."
- **The glow-up is weak:** Make the light in K3 a little brighter and the face a little softer. Then make clip 2 again.
- **The skin is brown:** Add "white balance 6500K, neutral, no color cast" to the prompt.
- **The face changes:** Use K3 as the last frame and add the face description from the MODEL block again.
- **Test first:** Use the Fast model to test the motion. Use the best model for the final clips.

---

## 7. Joining the clips and making the frames

Remove the audio. Join the two clips.

```bash
ffmpeg -i clip1.mp4 -an -c:v libx264 -crf 14 c1.mp4
ffmpeg -i clip2.mp4 -an -c:v libx264 -crf 14 c2.mp4
printf "file 'c1.mp4'\nfile 'c2.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c:v libx264 -crf 14 hero.mp4
```

If the clips have black bars, find the crop value first:

```bash
ffmpeg -i clip1.mp4 -vf cropdetect -f null - 2>&1 | grep crop | tail -1
```

Make the frames. 20 seconds at 10 frames per second gives about 200 frames.

```bash
mkdir frames_desktop frames_mobile
ffmpeg -i hero.mp4 -vf "fps=10,scale=1920:-2" -c:v libwebp -quality 78 frames_desktop/f_%04d.webp
ffmpeg -i hero.mp4 -vf "fps=10,scale=960:-2"  -c:v libwebp -quality 75 frames_mobile/f_%04d.webp
```

---

## 8. Website handoff: she stands next to the logo

Yes, the coding agent can do this. The video ends with her on the right third. The code then moves her next to the logo.

### How it works

1. The logo "Roses N Chic" is HTML text. It is **not** in the video.
2. The video frames draw on a `<canvas>`. Scroll controls the frame number.
3. In the last part of the scroll, GSAP shrinks the canvas and moves it next to the logo.
4. The final layout is like your mockup: the logo on the left, the woman on the right. Her height matches the logo height.

### Why the video must have a clean background

The canvas is a rectangle. If the video background and the page background do not match, you will see a box. To avoid this:

- The video background is a smooth ivory-white and blush-pink gradient (set in the prompts).
- The agent reads the colors at the edges of the last frame. It sets the hero background to match.
- The agent adds a soft feathered mask on the canvas edges (`mask-image` with a gradient).

**Better option:** The agent can cut her out from the last 40 frames with a background-removal tool (for example `rembg`). The result is a transparent image sequence. The woman then looks like she stands on the page. This takes more work and more file weight. Try the feathered mask first.

### Text for the coding agent (Phase 3)

Copy this into Antigravity or Claude Code:

```
Build the HeroScrub component for Roses N Chic.

Assets:
- /public/frames/desktop/f_0001.webp ... (about 200 frames, 1920 px wide)
- /public/frames/mobile/f_0001.webp ... (960 px wide)
- The video has 2 parts: frames 1 to 100 are the stitching, frames 101 to 200 are the model.
- In the last frame, the woman stands on the right third of the image. The left half is a plain gradient.

Rules:
1. Draw the frames on a <canvas>. Use GSAP ScrollTrigger and Lenis. Use scrub with a small smoothing value.
2. Show frame 1 at once. Load other frames in order, in groups of 20. Show the page before all frames load.
3. The Roses N Chic logo is an HTML element. Do not draw it in the canvas.
4. Scroll plan, for a pinned section of about 500vh:
   - 0% to 85%: scrub frame 1 to frame 200.
   - 85% to 100%: shrink the canvas and move it next to the logo.
5. For the last step, use a config object:
   subjectBox = { x, y, w, h } as fractions of the last frame (the woman's box).
   The agent measures the box from the last frame and writes it in the config.
6. At the end, the woman's box height in pixels must equal the logo height in pixels.
   Compute the canvas scale from: logoHeight / (subjectBox.h * canvasHeight).
   Place the canvas so that the woman stands to the right of the logo, with a small gap.
7. Match the hero background color to the edge color of the last frame. Add a soft feathered mask on the canvas edge.
8. Add mouse-move control: the cursor moves the frame number by a small amount.
9. Add an "ambient tour" button. It plays frames 1 to 200 by itself.
10. Support prefers-reduced-motion: show the last frame only.
11. Use the mobile frames under 768 px.
12. Test on a small phone. Keep the animation smooth.
Show me the result at each step.
```

### One thing to check after the video is ready

Send the last frame to the agent. Ask it to measure the woman's box. Then check the final layout in the browser. Small changes to the gap and the scale are normal.
