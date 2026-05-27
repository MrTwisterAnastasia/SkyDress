# 04 — Mascot Outfits

## Overview

The mascot area is the centrepiece of SkyDress. It shows:
1. A **mascot PNG** wearing an outfit appropriate for the current temperature.
2. **Floating clothing-icon cards** positioned around the mascot near the body part they cover.
3. An optional **umbrella accessory** to the right of the mascot when rain chance > 30%.

The section occupies the vertically dominant centre area of both layouts.

> **No connector lines.** Earlier iterations drew a thin SVG line from each card to a target point on the mascot. The lines were removed because they read as noise rather than clarity — the body-relative positions of the cards (hat near the head, jeans near the legs, etc.) already communicate the association. Section 4 below covers card placement only; there is no connector-line implementation in the current prototype.

> **No decorative sunburst/umbrella overlay.** Earlier iterations used a clipped `IMG_19.png` overlay (`.sd-sunburst`) that always rendered regardless of weather. That has been removed — the umbrella appears only when `rainChance > 30` via the conditional `.sd-umbrella` element.

---

## 1. Temperature-to-Outfit Mapping

Selection happens in two steps:

1. **Base outfit from Feels Like.** Look up the 7-level table below using the wind-chill corrected `feelsLike` value.
2. **Apply the user's sensitivity offset.** The outfit level array, light → heavy, is:

   ```
   ['very-hot', 'hot', 'warm', 'cool', 'cold', 'freezing', 'very-cold']
       0          1       2        3        4        5            6
   ```

   `effectiveIndex = clamp(baseIndex + state.userPrefs.sensitivityOffset, 0, 6)`.

   The offset is set by the slider in the Preferences panel (`docs/06`) and nudged by ±1 every time the user clicks **Dress warmer** / **Dress cooler** in the feedback widget (`docs/07`). Default = `0`, so a fresh session shows the base outfit unchanged.

The table below lists what asset to load for each level. The actual *displayed* level is the level at `effectiveIndex`, not the level at `baseIndex` — i.e. the mascot PNG and the clothing icons both come from the *effective* outfit.

| Index | Level | Feels Like (base only) | Mascot PNG | Clothing icons (from `assets/icons/clothing/`) |
|---|---|---|---|---|
| 0 | **Very Hot** | > 35 °C | `assets/mascot_outfits/very-hot-weather.png` | `very-hot_waistcoat.svg` · `very-hot_briefs.svg` |
| 1 | **Hot** | 25–35 °C | `assets/mascot_outfits/hot-weather.png` | `hot_cap.svg` · `hot_blouse.svg` · `hot_shorts.svg` |
| 2 | **Warm** | 18–25 °C | `assets/mascot_outfits/warm-weather.png` | `warm_hoodie.svg` · `warm_baggy-jeans.svg` |
| 3 | **Cool** | 10–18 °C | `assets/mascot_outfits/cool-weather.png` | `cool_beanie.svg` · `cool_turtleneck-sweater.svg` · `cool_boyfriend-jeans.svg` |
| 4 | **Cold** | 0–10 °C | `assets/mascot_outfits/cold-weather.png` | `cold_beanie.svg` · `cold_turtleneck-sweater.svg` · `cold_down-jacket.svg` · `cold_boyfriend-jeans.svg` |
| 5 | **Freezing** | −10–0 °C | `assets/mascot_outfits/freezing-weather.png` | `freezing_beanie.svg` · `freezing_turtleneck-sweater.svg` · `freezing_coat.svg` · `freezing_boyfriend-jeans.svg` |
| 6 | **Very Cold** | < −10 °C | `assets/mascot_outfits/ver-cold-weather.png` ⚠️ | `very-cold_beanie.svg` · `very-cold_coat.svg` · `very-cold_jeans.svg` |

> ⚠️ **Filename typo:** The very-cold mascot file is `ver-cold-weather.png` (missing the "y") — use exactly that name.

### Worked examples

| Feels Like | Base level | Offset | Effective level | Mascot shown |
|---|---|---|---|---|
| 14 °C | Cool (3) | 0 | Cool (3) | `cool-weather.png` |
| 14 °C | Cool (3) | +1 | Cold (4) | `cold-weather.png` |
| 14 °C | Cool (3) | +2 | Freezing (5) | `freezing-weather.png` |
| 14 °C | Cool (3) | −2 | Warm (2)→Hot (1)? No: `3−2 = 1` → Hot | `hot-weather.png` |
| 38 °C | Very Hot (0) | −1 | clamp(0−1, 0, 6) = 0 → Very Hot | `very-hot-weather.png` (clamped — already lightest) |
| −15 °C | Very Cold (6) | +2 | clamp(6+2, 0, 6) = 6 → Very Cold | `ver-cold-weather.png` (clamped — already heaviest) |

---

## 2. Umbrella Accessory

| Condition | Asset |
|---|---|
| Rain chance > 30 % | Show `assets/icons/accessories/umbrella.png` |
| Rain chance ≤ 30 % | Hidden |

The umbrella floats at the bottom-right of the mascot zone, sized so it reads clearly without overlapping any clothing card.

| Viewport | Width | Aspect ratio | Position |
|---|---|---|---|
| Desktop (≥ 600 px) | `14%` of the zone (~76 px in the 546-wide canonical zone) | `2 / 3` (chunkier than the mock's 72/154 crop so the umbrella reads as a recognisable shape, not a thin sliver) | `top: 60%, left: 85%` |
| Mobile (< 600 px) | `16%` of the zone (~54 px in the 337-wide canonical zone) | `2 / 3` | `top: 60%, left: 82%` |

The PNG source (`umbrella.png`) is 1024×1024 with the umbrella centred inside. `object-fit: contain` keeps it from being stretched even though the rendered box has a different aspect ratio.

---

## 3. Design Mock Reference Files

Each temperature level has its own pair of Visily HTML mocks (desktop + mobile). **Cool** is the default main page and uses the main page mocks instead.

| Level | Desktop mock | Mobile mock |
|---|---|---|
| Very Hot | `visily-design-mocks/outfits/visily-static-veryhotweatheroutfit_web-html/index.html` | `visily-design-mocks/outfits/visily-static-veryhotweatheroutfit_mobile-html/index.html` |
| Hot | `visily-design-mocks/outfits/visily-static-hotweatheroutfit_web-html/index.html` | `visily-design-mocks/outfits/visily-static-hotweatheroutfit_mobile-html/index.html` |
| Warm | `visily-design-mocks/outfits/visily-static-warmweatheroutfit_web-html/index.html` | `visily-design-mocks/outfits/visily-static-warmweatheroutfit_mobile-html/index.html` |
| Cool | `visily-design-mocks/visily-static-mainpage-html/index.html` | `visily-design-mocks/visily-static-mainpage_mobile-html/index.html` |
| Cold | `visily-design-mocks/outfits/visily-static-coldweatheroutfit_web-html/index.html` | `visily-design-mocks/outfits/visily-static-coldweatheroutfit_mobile-html/index.html` |
| Freezing | `visily-design-mocks/outfits/visily-static-freezingweatheroutfit_web-html/index.html` | `visily-design-mocks/outfits/visily-static-freezingweatheroutfit_mobile-html/index.html` |
| Very Cold | `visily-design-mocks/outfits/visily-static-verycoldweatheroutfit_web-html/index.html` | `visily-design-mocks/outfits/visily-static-verycoldweatheroutfit_mobile-html/index.html` |

### What to extract from the mocks — and what to ignore

**Extract (design fidelity required):**
- Mascot image dimensions and position within the outfit zone.
- Clothing-icon card size, style tokens, and position relative to the mascot.
- Connector-line angle and attachment point for each card.

**Do not use literally — but do read for positional context:**
- All weather data values hardcoded in the HTML (temperature text like "16°", condition labels like "Mostly Sunny", metric values) are static fill values for the design canvas. The real values come from the mock data defined in `CLAUDE.md → ## Mock Data`.
- However, you still need to understand how the layout and dimensions of the outfit zone relate to these mock data fields. For example: which zone element holds the temperature label, how much vertical space the condition badge takes above the mascot, and how the mascot zone shifts when a longer city name or a multi-line metric value is present. Use those observations to ensure the real UI elements — driven by the state object — occupy the same proportional positions as the mock values do in the HTML. The goal is visual continuity between the static design and the live prototype — but all positions and sizes must be expressed in flexible units (`%`, `rem`, `em`, `vw/vh`, or `flex`/`grid` fractions), not hard pixel values. The mock pixel coordinates are reference points for understanding proportions, not constraints to copy verbatim.
- The `src` paths in the mocks — they reference local assets inside each mock folder. The implementation uses the canonical asset paths listed in section 1.

---

## 4. Clothing-Icon Card — Visual Spec

Each card is a frosted-glass chip that floats around the mascot. It contains a single clothing icon centred inside it. Its position is determined by **the body part the clothing belongs to**, not by the outfit — so a beanie always sits in the head slot whether the outfit is Cool, Cold, Freezing or Very Cold.

### Card tokens

| Property | Mobile (< 600 px) | Desktop (≥ 600 px) |
|---|---|---|
| Width × Height (as % of zone) | `25.22% × aspect-ratio 85/40` | `23.81% × aspect-ratio 130/50` |
| Equivalent in mock px | `85 × 40 px` (in 337-wide zone) | `130 × 50 px` (in 546-wide zone) |
| Border-radius | `10 px` | `10 px` |
| Background | `rgba(243,244,246,0.5)` | `rgba(243,244,246,0.5)` |
| Border | `1 px dashed rgba(144,149,160,0.4)` | `1 px dashed rgba(144,149,160,0.4)` |
| Shadow | `0 2px 5px rgba(23,26,31,0.09), 0 0 2px rgba(23,26,31,0.12)` | same |
| Backdrop blur | `10 px` | `10 px` |
| Icon size (relative to card) | `35.29% wide × 75% tall` | `34.6% wide × 70% tall` |
| Icon fit | `object-fit: contain` | `object-fit: contain` |

All measurements are expressed as percentages of the canonical zone so the layout scales fluidly between mobile and large desktops. The mock pixel values are kept in the table as a reference for what the percentages resolve to at the mock canvas size.

---

## 5. Outfit Zone & Card Positions

### Canonical zone

To avoid the zone reshaping every time the user switches outfits, **all seven outfits share the same canonical zone size** per breakpoint. Each outfit's mock had a slightly different zone (478–546 wide for desktop) — those are reference data; the implementation picks one canonical size per breakpoint and reuses it.

| Breakpoint | Zone aspect-ratio | Reference px (matches mock) |
|---|---|---|
| Mobile (< 600 px) | `337 / 333` | `337 × 333` |
| Desktop (≥ 600 px) | `546 / 371` | `546 × 371` |

The zone has `position: relative` and is centred via `max-width: 546px; margin: 0 auto` (desktop) / `max-width: 100%` (mobile). All children — mascot image wrapper, clothing cards, umbrella — are absolutely positioned **as percentages of the zone** so the layout scales smoothly.

### Mascot image placement (constant across outfits)

| Property | Mobile | Desktop |
|---|---|---|
| Wrapper `left` (% of zone) | `12.17%` (41/337) | `14.29%` (78/546) |
| Wrapper `width` (% of zone) | `81.90%` (276/337) | `78.39%` (428/546) |
| Wrapper aspect-ratio | `276 / 333` | `428 / 371` |
| Inner `<img>` `top` | `0` | `-7.55%` (-28/371) |
| Inner `<img>` `width` | `100%` of wrapper | `100%` of wrapper |
| `overflow` | `hidden` on the wrapper | `hidden` on the wrapper |

Switching outfits **only** swaps the `<img src>` — the wrapper stays put, so the mascot doesn't appear to jump when the user moves between hours/days.

### Card positions per body part

`CARD_POSITIONS[tier]` maps each `body` value to a `{ top, left }` percentage inside the zone. Card width/height come from the tokens in section 4.

**Desktop (546 × 371 zone):**

| Body part | `top` | `left` | Notes |
|---|---|---|---|
| `head` | `0%` | `71.25%` | Top-right corner — sits to the right of the mascot's head |
| `torso` | `33.69%` | `1.28%` | Mid-left — chest level |
| `legs` | `74.39%` | `0%` | Bottom-left — hip/leg level |
| `torso-right` | `63.34%` | `60%` | Mid-right — for jacket/coat in 4-card outfits. **Shifted left from the mock's `76.19%` so the umbrella has clear space on the right edge.** |

**Mobile (337 × 333 zone):**

| Body part | `top` | `left` | Notes |
|---|---|---|---|
| `head` | `3.60%` | `74.78%` | Top-right |
| `torso` | `23.42%` | `0.89%` | Mid-left |
| `legs` | `60%` | `0%` | **Nudged up from the mock's `70.87%` so the collapsed bottom sheet doesn't clip the card** |
| `torso-right` | `45%` | `74.78%` | Mid-right — also nudged up from `55.56%` for the same reason |

### `OUTFIT_CLOTHING` — items per outfit

Each entry lists which clothing icons appear and which body part they belong to. The renderer looks up the (top, left) percentage from `CARD_POSITIONS[tier][body]`.

| Outfit | Items | Body parts |
|---|---|---|
| Very Hot | waistcoat, briefs | torso, legs |
| Hot | cap, blouse, shorts | head, torso, legs |
| Warm | hoodie, baggy-jeans | torso, legs |
| Cool | beanie, turtleneck-sweater, boyfriend-jeans | head, torso, legs |
| Cold | beanie, turtleneck-sweater, down-jacket, boyfriend-jeans | head, torso, **torso-right**, legs |
| Freezing | beanie, turtleneck-sweater, coat, boyfriend-jeans | head, torso, **torso-right**, legs |
| Very Cold | beanie, coat, jeans | head, torso, legs |

This unified layout is why earlier per-outfit pixel positions (an older version of this doc) are no longer needed — each item lives in the same slot regardless of outfit, and slots that aren't used are simply not rendered.

---

## 6. HTML Implementation Guide

### Outfit zone structure

```html
<div class="sd-mascot-zone">
  <!-- Soft drop-shadow oval at the mascot's feet (decorative) -->
  <div class="sd-mascot-oval"></div>

  <!-- Mascot image — fixed position inside the zone, only the src changes per outfit -->
  <div class="sd-mascot-img-wrapper">
    <img src="assets/mascot_outfits/{level}-weather.png" alt="{level} outfit mascot">
  </div>

  <!-- Umbrella — conditionally shown when rainChance > 30 -->
  <img class="sd-umbrella" src="assets/icons/accessories/umbrella.png" alt="umbrella accessory">

  <!-- One clothing card per item in OUTFIT_CLOTHING[level]; top/left come from CARD_POSITIONS[tier][body] -->
  <div class="sd-clothing-card" data-body="head" style="top: 0%; left: 71.25%;">
    <img src="assets/icons/clothing/{level}_{item}.svg" alt="{item}">
  </div>
  <!-- … one per item … -->
</div>
```

There is no `<svg>` connector, no per-position card-modifier classes, and no per-outfit container. The same `.sd-clothing-card` element is reused for every item; the `data-body` attribute is informational and `top`/`left` come from the body-part table in section 5.

### Switching outfits

The effective outfit can change for **three** reasons in the extended prototype:

1. The user navigates to a different hour or day whose `feelsLike` falls into a different temperature band → `baseIndex` changes.
2. The user saves the sensitivity slider in Preferences → `sensitivityOffset` changes.
3. The user clicks **Dress warmer** / **Dress cooler** on the feedback widget → `sensitivityOffset` changes by ±1.

In all three cases the renderer runs the same routine:

1. Compute `effectiveIndex = clamp(baseIndex + state.userPrefs.sensitivityOffset, 0, 6)` and resolve it to the outfit level string.
2. Swap the `src` on `.sd-mascot-img-wrapper > img` to the new mascot PNG.
3. Re-render the clothing cards — the new set of `(body, file)` pairs comes from `OUTFIT_CLOTHING[level]`; positions come from `CARD_POSITIONS[tier][body]`.
4. Re-evaluate umbrella visibility from the active record's `rainChance` (the umbrella is tied to weather, not to the offset).

Because mascot wrapper position is identical across outfits, the mascot stays still while only its clothing PNG fades to the new outfit. No transition animation is required for the prototype — the loading state covers any perceptible delay from a city switch.

---

## 7. Loading and Error States

These states replace the mascot outfit section entirely — no clothing cards or connector lines are shown.

| State | Asset | Trigger |
|---|---|---|
| Loading | `assets/mascot_states/loading.png` | While mock data is "loading" (e.g. during a city-switch transition) |
| Error | `assets/mascot_states/error.png` | Error state — for future use |

The loading/error image occupies the same zone as the mascot (same dimensions). 

---

## 8. Quick-Reference Asset Map

```
assets/
├── mascot_outfits/
│   ├── very-hot-weather.png
│   ├── hot-weather.png
│   ├── warm-weather.png
│   ├── cool-weather.png
│   ├── cold-weather.png
│   ├── freezing-weather.png
│   └── ver-cold-weather.png        ← filename typo (no "y"), use as-is
├── mascot_states/
│   ├── loading.png
│   └── error.png
└── icons/
    ├── accessories/
    │   └── umbrella.png
    └── clothing/
        ├── very-hot_waistcoat.svg
        ├── very-hot_briefs.svg
        ├── hot_cap.svg
        ├── hot_blouse.svg
        ├── hot_shorts.svg
        ├── warm_hoodie.svg
        ├── warm_baggy-jeans.svg
        ├── cool_beanie.svg
        ├── cool_turtleneck-sweater.svg
        ├── cool_boyfriend-jeans.svg
        ├── cold_beanie.svg
        ├── cold_turtleneck-sweater.svg
        ├── cold_down-jacket.svg
        ├── cold_boyfriend-jeans.svg
        ├── freezing_beanie.svg
        ├── freezing_turtleneck-sweater.svg
        ├── freezing_coat.svg
        ├── freezing_boyfriend-jeans.svg
        ├── very-cold_beanie.svg
        ├── very-cold_coat.svg
        └── very-cold_jeans.svg
```
