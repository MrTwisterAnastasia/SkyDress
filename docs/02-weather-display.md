# 02 — Main Weather Display & Metrics Panels

## Purpose

This document covers the **two places in the app** where weather information is shown, distinguished by scope and visibility:

1. **Hero section** — condition badge + temperature + intuitive icon set. Always visible on both desktop and mobile; no user interaction needed. Shows the selected hour's condition when the Hourly tab is active, or the selected day's condition when the 10-day tab is active. The Hourly tab only ever shows **today's** hourly data — there is no hourly data for future days. The tab itself is never disabled; switching to it from any selected day automatically redirects to today's "Now" hour (`state.activeHour = 15`).
2. **Metrics area** — numerical weather data (UV, rain, feels like, humidity, wind, pressure, visibility, sun cycle, etc.). *How and where* this is shown differs completely between desktop and mobile:
  - **Desktop (≥ 600 px):** A compact metrics row lives directly below the hero section, and a side "STATS" tab expands to a full "Environment & Conditions" panel for the complete dataset.
  - **Mobile (< 600 px):** A swipeable bottom sheet provides a collapsed preview (Rain + Feels Like) and a fully scrollable expanded view for all metrics.

---

## Visual Reference in Mocks


| Layout / State                       | HTML file                                                                     | Notes                                         |
| ------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------- |
| Desktop — main page                  | `visily-design-mocks/visily-static-mainpage-html/index.html`                  | Hero + mini metrics row + closed STATS tab    |
| Desktop — STATS panel open           | `visily-design-mocks/visily-static-openstatpanel_web-html/index.html`         | Full "Environment & Conditions" overlay       |
| Mobile — main page (panel collapsed) | `visily-design-mocks/visily-static-mainpage_mobile-html/index.html`           | Hero + collapsed bottom panel                 |
| Mobile — main page (panel expanded)  | `visily-design-mocks/visily-static-mainpage_openpanel_mobile-html/index.html` | Shows the panel fully open over the main page |
| Mobile — full panel content          | `visily-design-mocks/visily-static-openstatpanel_mobile-html/index.html`      | All cards in the expanded panel               |


---

## Responsive Design Philosophy

The HTML mocks are fixed-canvas Visily exports (1440 px desktop, 393 px mobile). They use absolute pixel positioning, which is a Visily artifact — **not** an instruction to hard-code those positions in the implementation.

Build the app as a fluid, resizable prototype:

- Extract **design tokens** from the mocks as exact values: colors, font sizes, font weights, border-radius, box shadows, gap/padding sizes.
- For **layout**: use flexible CSS — flexbox, percentage widths, `max-width`, viewport units — so the UI scales smoothly between 393 px and 1440 px and beyond.
- The **600 px breakpoint** is the dividing line: below it use mobile token sizes; at or above it use desktop token sizes. Both sets of tokens come from their respective mock canvases.
- Absolute pixel positions in the mock HTML (e.g. `left-[285px]`, `top-[60px]`) are reference points that show the intended visual relationship between elements, not hard constraints.
- Container dimensions tied to the canvas (e.g. the `1410 px` STATS panel on a 1440 px canvas, or the `393 px` mobile bottom bar on a 393 px canvas) should be expressed as `100%` or `calc(100% − xpx)` so they fill the actual viewport at any width.

---

## Section A — Hero Weather Display (Both Viewports)

The hero section shows the same three elements on desktop and mobile. Only sizes change.

> **Reference checkpoints, not pixel-perfect constraints.** The measurements below come from the fixed-canvas Visily exports. Font sizes, border-radius, shadows, and colors are exact design tokens — use them as given. Layout widths, heights, and positions are proportional references — implement with flexible CSS (e.g. `min-height`, `em`/`rem` units, or `clamp()`) so the hero scales gracefully across any screen width or height.

```
[Hero]
  ├── [Condition badge]        — "Mostly Sunny" / "Heavy Rain" / etc.
  └── [Temp + icon zone]
        ├── [Temperature]      — "16°"
        └── [Icon pair zone]
              ├── [Primary icon]   — always present
              └── [Secondary icon] — only for paired conditions (Partly Cloudy, Blizzard)
```

### A1. Condition Badge

Same styling on both desktop and mobile.


| Property        | Value                                                            |
| --------------- | ---------------------------------------------------------------- |
| Width           | `fit-content` (sizes to its text — `HAIL` is short, `THUNDERSTORM` is long) |
| Height          | `39 px`                                                          |
| Padding         | `0 17px`                                                         |
| Border-radius   | `22px`                                                           |
| Background      | `rgba(237,112,45,0.2)`                                           |
| Backdrop filter | `blur(12px)`                                                     |
| Border          | `1px solid rgba(255,255,255,0.4)`                                |
| Text            | Inter 700, 14px, line-height 21px, tracking 1.4px, **uppercase** |
| Text color      | `#7C2D12`                                                        |
| Display         | `inline-flex` with `white-space: nowrap` so the badge hugs the text without clipping |


All three hero elements — badge text, temperature, and icon set — are driven by the active data source, which depends on two state variables:

- `state.activeTab`: `"hourly"` | `"10day"`
- `state.activeHour`: `0`–`23` (used when tab is `"hourly"`)
- `state.activeDay`: `0`–`9` (used when tab is `"10day"`)


| `state.activeTab` | Active data source                  |
| ----------------- | ----------------------------------- |
| `"hourly"`        | `mockData.hourly[state.activeHour]` |
| `"10day"`         | `mockData.daily[state.activeDay]`   |


**Both tabs are always enabled.** There is no disabled state for either tab. Clicking any card or switching tabs always updates all three hero elements immediately.

See `docs/03-hourly-10day-forecast.md` for the full tab toggle spec, card anatomy, and state transition behavior.

The badge text is always uppercase via CSS `text-transform: uppercase`.

#### Quick Descriptions — All Condition Strings from Mock Data


| Condition String           | Mock data hours (hourly)   | Mock data days (10-day)    |
| -------------------------- | -------------------------- | -------------------------- |
| Mostly Sunny               | 11:00                      | +0 Mon (Today)             |
| Sunny                      | 12:00, 14:00               | +2 Wed                     |
| Partly Cloudy              | 10:00, 13:00, 18:00        | +1 Tue                     |
| Overcast                   | 06:00                      | +9 Wed                     |
| Drizzle                    | 08:00                      | +6 Sun                     |
| Heavy Rain                 | 17:00                      | +4 Fri                     |
| Thunderstorm               | 15:00                      | +3 Thu (PM only, via ²)    |
| Sunny AM · Thunderstorm PM | — ¹                        | +3 Thu                     |
| Fog                        | 05:00                      | +5 Sat                     |
| Snow                       | 03:00, 22:00               | +7 Mon                     |
| Blizzard                   | 02:00                      | +8 Tue                     |
| Cloudy                     | 09:00                      | — (hourly only) ³          |
| Hail                       | 16:00                      | — (hourly only) ³          |
| Sleet                      | 04:00                      | — (hourly only) ³          |
| Windy                      | 07:00                      | — (hourly only) ³          |
| Clear Night                | 00:00, 20:00, 21:00, 23:00 | — (hourly only) ³          |
| Partly Cloudy Night        | 01:00, 19:00               | — (hourly only) ³          |


¹ "Sunny AM · Thunderstorm PM" is a composite day-summary label that only exists in the 10-day view. The hourly data already covers that day hour-by-hour (sunny AM hours, thunderstorm at 15:00). Render the badge text verbatim on 10-day cards; use the thunderstorm icon set since PM conditions dominate.

² Thunderstorm appears as a standalone badge string in the hourly view (15:00) but not as a standalone day in the 10-day view — it is the PM half of the composite label on +3 Thu.

³ The 10-day forecast has exactly 10 days (+0 through +9). These conditions are fully covered in the hourly data and do not need a 10-day entry. The hero badge, temperature, and icon set render them correctly when any of these hourly slots is the active selection.

---

### A2. Temperature Number


| Property       | Desktop   | Mobile    |
| -------------- | --------- | --------- |
| Font size      | `120px`   | `80px`    |
| Font weight    | `800`     | `800`     |
| Line height    | `90px`    | `80px`    |
| Letter spacing | `-2px`    | `-2px`    |
| Color          | `#431407` | `#431407` |


Format: integer + degree sign, no space (e.g. `"16°"`). Negative values use the proper minus sign `−` (U+2212), not a hyphen.

The source field depends on the active data source (see A1 state table):

| Active data source            | Temperature field    | Example |
| ----------------------------- | -------------------- | ------- |
| Hourly (today)                | `hourData.temp`      | `16°`   |
| 10-day — today (Day 0)        | `dailyData.high`     | `16°`   |
| 10-day — other day            | `dailyData.high`     | `29°`   |

For 10-day mode the hero always shows the day's **high** temperature; the low is shown only inside the 10-day forecast list rows, not in the hero.

---

### A3. Weather Icon Pair Zone

One or two overlapping icons that visually echo the condition badge.

#### Icon pair dimensions and position


| Property                | Desktop                                            | Mobile                             |
| ----------------------- | -------------------------------------------------- | ---------------------------------- |
| Pair zone size          | `~90 × 91 px`                                      | `64 × 69 px`                       |
| Primary icon size       | `54 × 54 px`                                       | `48 × 48 px`                       |
| Secondary icon size     | `46 × 46 px`                                       | `40 × 40 px`                       |
| Primary icon position   | top-right of zone                                  | top-right (`left: 16px, top: 0`)   |
| Secondary icon position | bottom-left, ~20px left and 37px down from primary | bottom-left (`left: 0, top: 29px`) |


The secondary icon renders on **top** of (higher z-index than) the primary at reduced opacity, partially masking it (e.g. cloud over sun for "Partly Cloudy").

#### Main Page Intuitive Icon Sets — All Conditions


| Condition           | Type   | Primary icon                      | Primary color | Secondary icon      | Secondary color | Secondary opacity |
| ------------------- | ------ | --------------------------------- | ------------- | ------------------- | --------------- | ----------------- |
| Sunny               | Single | `fa-solid fa-sun`                 | `#F97316`     | —                   | —               | —                 |
| Mostly Sunny        | Pair   | `fa-solid fa-sun`                 | `#F97316`     | `fa-solid fa-cloud` | `#FB923C`       | `0.6`             |
| Partly Cloudy       | Pair   | `fa-solid fa-sun`                 | `#F97316`     | `fa-solid fa-cloud` | `#FB923C`       | `0.6`             |
| Cloudy / Overcast   | Single | `fa-solid fa-cloud`               | `#FB923C`     | —                   | —               | —                 |
| Clear Night         | Single | `fa-solid fa-moon`                | `#A78BFA`     | —                   | —               | —                 |
| Partly Cloudy Night | Pair   | `fa-solid fa-moon`                | `#A78BFA`     | `fa-solid fa-cloud` | `#94A3B8`       | `0.6`             |
| Drizzle             | Single | `fa-solid fa-cloud-rain`          | `#60A5FA`     | —                   | —               | —                 |
| Heavy Rain          | Single | `fa-solid fa-cloud-showers-heavy` | `#60A5FA`     | —                   | —               | —                 |
| Thunderstorm        | Single | `fa-solid fa-cloud-bolt`          | `#FB923C`     | —                   | —               | —                 |
| Hail                | Single | `fa-solid fa-cloud-meatball`      | `#60A5FA`     | —                   | —               | —                 |
| Fog                 | Single | `fa-solid fa-smog`                | `#94A3B8`     | —                   | —               | —                 |
| Snow                | Single | `fa-solid fa-snowflake`           | `#BAE6FD`     | —                   | —               | —                 |
| Blizzard            | Pair   | `fa-solid fa-snowflake`           | `#BAE6FD`     | `fa-solid fa-wind`  | `#94A3B8`       | `0.8`             |
| Sleet               | Single | `fa-solid fa-cloud-rain`          | `#93C5FD` ¹   | —                   | —               | —                 |
| Windy               | Single | `fa-solid fa-wind`                | `#94A3B8`     | —                   | —               | —                 |


¹ Sleet uses the same icon as drizzle (`fa-cloud-rain`) but with a **blue tint** color `#93C5FD` to visually distinguish it.

For Blizzard the snowflake is primary (top-right) and wind is secondary (bottom-left) — reversed from the sun/cloud pattern because wind reads as background.

---

## Section B — Metrics Area

### B1. Desktop Mini Metrics Row (≥ 600 px only)

Positioned directly below the hero section, below the temperature + icon group. **Not rendered on mobile.**

> Measurements below are from the 1440 px desktop mock canvas. Item heights and icon sizes are design tokens; the overall row should lay out with flexbox and expand naturally with the available space rather than relying on fixed pixel positions.

Reflects the active data source (see A1 state table): `mockData.hourly[state.activeHour]` when today's Hourly tab is active, or `mockData.daily[state.activeDay]` when any day is selected in the 10-day tab (today or otherwise).

Two rows of three metric items each:

- **Row 1:** UV Index · Rain · Feels Like
- **Row 2:** Humidity · Wind

#### Each metric item spec

```
[metric item]
  ├── [icon]   — 16×16 px, orange
  ├── [label]  — uppercase, small, muted  (top: 0)
  └── [value]  — bold, larger             (top: 15px)
```


| Sub-element | Font                                                         | Color                 |
| ----------- | ------------------------------------------------------------ | --------------------- |
| Label       | Inter 700, 10px, line-height 15px, tracking 0.5px, uppercase | `rgba(124,45,18,0.6)` |
| Icon        | 16 × 16 px, `top: 11px left: 0`                              | `#EA580C`             |
| Value       | Inter 900, 16px, line-height 24px                            | `#673F31`             |


Item total height ≈ 39px. Label and value both at `left: 24px` (right of icon).

#### Icon and value format per metric


| Metric     | Icon (FA6)                     | Mock asset             | Value format          | Example   |
| ---------- | ------------------------------ | ---------------------- | --------------------- | --------- |
| UV Index   | `fa-solid fa-bolt`             | `IMG_14.svg` (desktop) | `{uvIndex} {uvLabel}` | `2 Low`   |
| Rain       | `fa-solid fa-umbrella`         | `IMG_15.svg` (desktop) | `{rainChance}%`       | `0%`      |
| Feels Like | `fa-solid fa-thermometer-half` | `IMG_16.svg` (desktop) | `{feelsLike}°`        | `14°`     |
| Humidity   | `fa-solid fa-droplets`         | `IMG_17.svg` (desktop) | `{humidity}%`         | `45%`     |
| Wind       | `fa-solid fa-wind`             | `IMG_18.svg` (desktop) | `{windSpeed} km/h`    | `12 km/h` |


---

### B2. Desktop STATS Panel (≥ 600 px)

A collapsible side panel for the full "Environment & Conditions" dataset. Sits on the **left edge** of the screen. In its closed state two elements are always visible at the left edge: the **panel strip** and the **STATS tab**. Clicking either one slides the panel open to the right.

> Measurements below are from the 1440 px desktop mock canvas. The `1410 px` open-panel width spans from the left edge to near the right edge — implement as `calc(100% − 30px)` or equivalent so it fills any viewport. The 3-column card grid should use equal flexible columns (e.g. `grid-template-columns: repeat(3, 1fr)`) rather than fixed `428 px` column widths.

#### Terminology

| Term | What it is |
| --- | --- |
| **Panel strip** | The thin `20 px wide` frosted-glass vertical bar anchored at `left: 0`. Always visible at the left edge of the screen regardless of panel state. It has a `4px 0 16px rgba(31,41,55,0.1)` right-cast shadow so the edge reads clearly against the page gradient (matches the STATS tab). Clicking it opens the panel. |
| **STATS tab** | The `35 × 130 px` protruding block that sits immediately to the right of the panel strip (`left: 20px`). Contains, in three stacked rows: two decorative mini weather icons at the top, the rotated `"STATS"` label in the middle, and a chevron icon on its own row at the bottom. Always visible in the closed state. Clicking it opens the panel. |

#### Closed state (default)

Two elements are always visible when the panel is closed: the **panel strip** and the **STATS tab**. Clicking either one opens the panel.

**Panel strip:**

| Property        | Value                                                            |
| --------------- | ---------------------------------------------------------------- |
| Size            | `20px wide × 100vh tall` (full viewport height)                  |
| Position        | `left: 0, top: 0`                                                |
| Background      | `rgba(255,255,255,0.3)`                                          |
| Border-radius   | `0 24px 24px 0` (left flat against viewport edge; right rounded) |
| Shadow          | `4px 0 16px rgba(31,41,55,0.1)` (matches the STATS tab so the edge is visible against the page gradient) |
| Backdrop filter | `blur(24px)`                                                     |

**STATS tab:**

| Property           | Value                                                                    |
| ------------------ | ------------------------------------------------------------------------ |
| Size               | `35px wide × 130px tall` (tall enough to give each row its own band)     |
| Position           | `top: 44%, left: 20px` (immediately right of the panel strip)            |
| Background         | `rgba(255,255,255,0.3)`                                                  |
| Border-radius      | `0 24px 24px 0` (left flat against panel strip; right rounded)           |
| Shadow             | `4px 0px 16px 0px rgba(31,41,55,0.1)` (shadow cast to the right)         |
| Backdrop filter    | `blur(24px)`                                                             |
| Mini weather icons | Two 12px icons (`fa-cloud-sun` + `fa-chart-simple`) at the top, positioned `top: 10px, left: 7px`. Decorative. |
| "STATS" label      | Inter 700, 11px, tracking 3.4px, `#673f31` at 75% opacity, rotated 270°, positioned `top: 56px, left: -9px`. Sits in the middle row. |
| Chevron icon       | `fa-chevron-right` (closed) / `fa-chevron-left` (open), 16×16px, `#673F31` at 70% opacity, positioned `bottom: 12px, left: 9px`. **Sits on its own row at the bottom — not inline with the label.** |

#### Open state

The panel **slides from left to right** over `0.4s` with `transition: width 0.4s ease-in-out`, expanding from `width: 0` until it reaches `calc(100% − 30px)` of the viewport width. It layers above the main content (does not push it).

Once fully open, the **STATS tab** updates: the chevron switches from `fa-chevron-right` to `fa-chevron-left`, signalling that clicking it will close the panel. A **close tab** also appears at the right edge of the open panel, **mirroring the STATS tab** so the two read as a matched pair:

| Property           | Value                                                                     |
| ------------------ | ------------------------------------------------------------------------- |
| Close tab size     | `35px wide × 130px tall` (same as the STATS tab — symmetric layout)       |
| Position           | `top: 44%, right: 0`                                                      |
| Background         | `rgba(255,255,255,0.3)`                                                   |
| Border-radius      | `24px 0 0 24px` (flat right; rounded left)                                |
| Shadow             | `-4px 0 16px rgba(31,41,55,0.1)` (cast leftward, mirrored from open tab)  |
| Mini weather icons | Same two `fa-cloud-sun` + `fa-chart-simple` icons, mirrored to `top: 10px, right: 7px` |
| "STATS" label      | Same rotated label, mirrored to `top: 56px, right: -9px`                  |
| Chevron icon       | `fa-chevron-left`, 16×16px, `bottom: 12px, right: 9px` — own row at bottom |
| Visibility         | Hidden (`opacity: 0; pointer-events: none`) when the panel is closed; CSS `~` sibling rule fades it in once `.sd-stats-panel.open` exists |

**To close the panel:**
- Click the STATS tab (now showing chevron-left), **or**
- Click the close tab on the right, **or**
- Click anywhere outside `.sd-stats-panel-inner` (including the panel strip).

The panel **slides back from right to left** over the same `0.4s`, contracting until only the panel strip and STATS tab are visible at the left edge. Clicks on any of the three close-affordances (STATS tab, close tab, outside) bubble to a single document-level handler that checks `state.statsOpen` and `e.target.closest('.sd-stats-panel-inner | .sd-stats-tab | .sd-stats-close-tab | .sd-stats-strip')`.

**Panel container:**

- Width: `1410px` (fills most of 1440px canvas)
- Background: `rgba(255,255,255,0.3)`, `backdrop-blur-[24px]`, `rounded-r-[24px]`

**Panel title:** "Environment & Conditions" — Roboto 700, 32px, `#431407`

**Card grid** (3-column, 2 rows) — `display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); row-gap: 24px; column-gap: 26px`. Row gap is intentionally 2px tighter than the column gap so the two rows feel like one block while the columns stay clearly separated.


| Position     | Card            | Size                                    | Key content                                                                                                                   |
| ------------ | --------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Col 1, Row 1 | Sun Cycle       | `428 × 224 px`, white                   | Sunrise time + elapsed ("4h ago"); Sunset time + remaining ("In 12h")                                                         |
| Col 1, Row 2 | Moon Phase      | `428 × 172 px`, white                   | Phase name ("Waxing Gibbous"), illumination %, "Next Full Moon" + countdown                                                   |
| Col 2, Row 1 | Visibility      | `428 × 276 px`, white                   | Value in km (large 48px); description label ("Perfectly Clear") + tip text                                                    |
| Col 2, Row 2 | Pressure        | `428 × 240 px`, white                   | Value in hPa (large 48px); horizontal progress bar; trend label ("Stable")                                                    |
| Col 3, Row 1 | Air Quality     | `428 × 217 px`, `**#EA580C` orange bg** | AQI label (white); "Good" in 36px white; AQI number; progress bar; description                                                |
| Col 3, Row 2 | Allergy Outlook | `428 × 270 px`, white                   | 4 rows: Tree Pollen / Ragweed Pollen / Grass Pollen / Dust & Dander — each shows Low/Medium/High with a colored bar indicator |


**Card common styles:** `rounded-[24px]`, `shadow-[0px_2px_5px_0px_...]`, border `1px #FFEDD5`

**Allergy bar indicator colors:**

- Low → `#22C55E` (green)
- Medium → `#22C55E` (green) — same as low in current mocks
- High → `#EA580C` (orange)

**Section labels inside cards:** Inter 600, 14px, tracking 1.4px, uppercase, `#7C2D12`

---

### B3. Mobile Bottom Stats Panel (< 600 px)

A bottom sheet fixed to the bottom of the viewport. Two states: **collapsed** (preview) and **expanded** (full scroll).

> Measurements below are from the 393 px mobile mock canvas. The `393 px` container width should be `100vw`; the `104 px` collapsed height and `1155 px` expanded height are reference checkpoints — use flexible layout, `dvh` units, and scroll behavior so the panel works on real devices at any screen height.

#### Collapsed state

The panel peeks from the bottom, showing the drag handle and the first two metric cards.


| Property        | Value                                                          |
| --------------- | -------------------------------------------------------------- |
| Container width | `100vw` — fixed to the bottom edge (`position: fixed; left: 0; right: 0; bottom: 0`) |
| Collapsed height | `104 px`                                                      |
| Background      | `rgba(255,255,255,0.9)`                                        |
| Border-radius   | `40px 40px 0 0`                                                |
| Shadow          | `0px -10px 25px 0px rgba(0,0,0,0.05)`                          |
| Backdrop filter | `blur(40px)`                                                   |
| Drag handle     | `100%` wide × **`32 px tall`** clickable strip; a `40 × 4 px` `#FED7AA` pill is centred inside as a `::before` pseudo-element. The 32 px hit area is intentionally large so the handle is comfortable to tap, while the visual pill stays the small mock-faithful indicator. |
| Content padding | `0 16px 32px` (no top padding — the sheet content sits flush under the 32 px handle area so the first row of cards visually meets the handle) |


**Two visible metric cards** (Rain on left, Feels Like on right):


| Property            | Value                    |
| ------------------- | ------------------------ |
| Card size           | `173 × 72 px`            |
| Card background     | `rgba(255,247,237,0.5)`  |
| Card border-radius  | `20px`                   |
| Card border         | `1px solid #FFEDD5`      |
| Left card position  | `top: 20px, left: 17px`  |
| Right card position | `top: 20px, left: 202px` |


Card interior layout:

```
[icon]  16×16px, #EA580C, top:13px left:13px
[label] 10px Inter 700 uppercase, rgba(124,45,18,0.6), top:13px left:37px
[value] 20px Inter 900, #673F31, top:35px left:13px
```


| Card  | Icon                           | Label      | Value format    | Example |
| ----- | ------------------------------ | ---------- | --------------- | ------- |
| Left  | `fa-solid fa-umbrella`         | RAIN       | `{rainChance}%` | `0%`    |
| Right | `fa-solid fa-thermometer-half` | FEELS LIKE | `{feelsLike}°`  | `14°`   |


**Interaction (three ways to toggle):**
- **Tap the handle** — the `.sd-sheet-handle` element has an `onclick` that calls `toggleSheet()`. The 32 px hit area makes this comfortable on touch and works as a plain click in the browser preview.
- **Swipe up** anywhere on the sheet → expand. **Swipe down** → collapse, but only when the sheet is scrolled to top (`sheet.scrollTop === 0`), so scrolling expanded content never accidentally closes it.
- Swipe is implemented with **pointer events** (`onpointerdown` / `onpointerup` on `.sd-mobile-sheet`), not touch events. Pointer events cover touch + mouse + pen in one path, so the browser preview can drag-test the same code that runs on a real device. Threshold is ±40 px of vertical delta.

#### Expanded state

The panel takes over the **full viewport** — `height: 100dvh` (with `100vh` fallback) and `border-radius: 0`. When expanded:

- `sd-main` is **not rendered** at all (the render function skips `renderMain()` if `state.sheetExpanded === true`). The sheet covers everything behind it; there's no need to keep stale DOM under the takeover.
- The sheet's content area scrolls vertically (`overflow-y: auto`).
- The header is technically still in the DOM above the sheet but is fully covered because the sheet now reaches `top: 0`.

This replaces the earlier "slides up near the top of the viewport, header remains visible" behaviour described in older mocks — that intermediate height felt awkward on small phones and left no clear way for the user to "get back" to the main page without scrolling. Tapping the handle, clicking outside the visible content rows, or swiping down (from `scrollTop === 0`) collapses it back to the 104 px peek state.

**Full panel content (top to bottom, scrollable):**

1. **Drag handle** — same as collapsed, top of panel
2. **Row 1 (always visible):** Rain | Feels Like — same as collapsed preview
3. **Row 2:** Wind | UV Index
4. **Row 3:** Humidity | Pressure

Each of rows 1–3 uses the same `173 × 72 px` card spec as the collapsed state. All 6 cards are the same size and style.


| Card       | Icon                                | Label      | Value format                                   | Example           |
| ---------- | ----------------------------------- | ---------- | ---------------------------------------------- | ----------------- |
| Rain       | `fa-solid fa-umbrella`              | RAIN       | `{rainChance}%`                                | `0%`              |
| Feels Like | `fa-solid fa-thermometer-half`      | FEELS LIKE | `{feelsLike}°`                                 | `14°`             |
| Wind       | `Lucide_navigation` (arrow/compass) | WIND       | `{windDir}` + `{windDeg}°` (small, right)      | `NW` + `315°`     |
| UV Index   | `fa-solid fa-thermometer-half`      | UV INDEX   | `{uvLabel}` + `Level {uvIndex}` (small, right) | `Low` + `Level 2` |
| Humidity   | `fa-solid fa-droplets`              | HUMIDITY   | `{humidity}%`                                  | `12%`             |
| Pressure   | `fa-solid fa-gauge`                 | PRESSURE   | `{pressure} hPa`                               | `1013 hPa`        |


> **Note — mobile vs desktop value formats differ:**
>
> - UV Index: desktop shows `"2 Low"` (number first); mobile shows `"Low"` with `"Level 2"` as small secondary text to the right.
> - Wind: desktop shows `"12 km/h"` (speed only); mobile shows direction `"NW"` with bearing `"315°"` as small secondary text.

1. **Sun Cycle card** — `358 × 184 px`, `rgba(255,255,255,0.8)`, `rounded-[20px]`
  - Section label: "SUN CYCLE" — Inter 600, 12px, tracking 1.2px, `#7C2D12`
  - Sunrise row: 40px circle icon (`#FFEDD5` bg, `fa-solid fa-sun-rising`), "Sunrise" label (Inter 500 11px), time "04:52 AM" (Inter 700 16px), "4h ago" (right-aligned, muted)
  - Divider `#FFEDD5`
  - Sunset row: same structure with `fa-solid fa-sun-setting` icon, "Sunset", "08:34 PM", "In 12h"
2. **Moon Phase card** — `358 × 111 px`, `rgba(255,255,255,0.8)`, `rounded-[20px]`
  - Section label: "MOON PHASE"
  - 40px circle icon, phase name ("Waxing Gibbous") Inter 700 16px, illumination % (11px muted)
  - "Next Full Moon" (muted, 10px) + "In 3 days" (Inter 600 11px, right-aligned)
3. **Visibility card** — `358 × 118 px`, white, `rounded-[24px]`
  - Eye icon with "VISIBILITY" label (left side)
  - Large value: `10` in Open Sans 700 28px + `km`
  - Description box (right side, `#FFF7ED` bg, `rounded-[12px]`): "Perfectly Clear" (13px bold) + tip text (11px muted orange)
4. **Air Quality card** — `358 × 155 px`, `**#EA580C` orange bg**, `rounded-[24px]`
  - "AIR QUALITY" label (Inter 600, 12px, `#FFEDD5`)
  - AQI number `22 AQI` (right-aligned, 14px `#FFEDD5`)
  - Quality label "Good" (Open Sans 700, 20px, white)
  - Progress bar (`rgba(154,52,18,0.3)` track, white fill)
  - Description text (10px `#FFEDD5`)
5. **Allergy Outlook card** — `358 × 222 px`, white, `rounded-[24px]`
  - Section label: "ALLERGY OUTLOOK"
  - 4 rows: Tree Pollen / Ragweed Pollen / Grass Pollen / Dust & Dander
  - Row anatomy: icon (18×18px, `#7C2D12` at 70%) + name (Open Sans 500 12px) + value bold right-aligned + colored bar indicator (16px tall, rotated 90°)
  - Bar colors: Low/Medium → `#22C55E` (green); High → `#EA580C` (orange)

---

## Data Binding

> **Mock values live in `CLAUDE.md → ## Mock Data`.** The tables there define every field for all 24 hourly slots and all 10 daily slots. This document specifies *how* to display those values; `CLAUDE.md` specifies *what* they are. Do not duplicate the data here.

**Prototype starting state:** `state.activeTab = "hourly"`, `state.activeHour = 15`, `state.activeDay = 0`. The hero and all metrics show the 15:00 row on load. All cities load this same data — switching city only changes the city name in the search input.

The active data source is resolved by the state model in A1. Call it `activeRecord` — it points to either `mockData.hourly[state.activeHour]` or `mockData.daily[state.activeDay]` depending on the active tab.

All hero and metrics values are read from `activeRecord`:


| UI element                    | Data field                                                   |
| ----------------------------- | ------------------------------------------------------------ |
| Condition badge text          | `condition`                                                  |
| Temperature                   | `temp` (hourly) · `high` (10-day, hero shows day's high)     |
| Icon set                      | `condition` → map to icon pair via the table in A3 |
| UV Index                      | `uvIndex`, `uvLabel`                               |
| Rain %                        | `rainChance`                                       |
| Feels Like                    | `feelsLike`                                        |
| Humidity                      | `humidity`                                         |
| Wind speed                    | `windSpeed`                                        |
| Wind direction                | `windDir`, `windDeg` (mobile panel only)           |
| Pressure                      | `pressure`                                         |
| Visibility                    | `visibility`, `visibilityLabel`                    |
| Sunrise / Sunset              | `sunrise`, `sunset` (day-level constants)          |
| Moon Phase                    | `moonPhase` (day-level)                            |
| AQI                           | `aqi`, `aqiLabel`                                  |
| Tree / Ragweed / Grass Pollen | `treePollen`, `ragweedPollen`, `grassPollen`       |
| Dust & Dander                 | `dustDander`                                       |


---

## Edge Cases


| Case                                      | Behavior                                                                                                                    |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Night condition (hour 19:00–06:00)        | Use moon-based icon pair: `fa-moon` primary; `fa-cloud` secondary for "Partly Cloudy Night"                                 |
| UV Index is `null` or `"— (night)"`       | Display `"—"` in UV value field; mini metrics icon still renders                                                            |
| Blizzard                                  | Two-icon pair: snowflake primary (top-right) + wind secondary (bottom-left) at 0.8 opacity                                  |
| Sleet                                     | Single `fa-cloud-rain` icon with color `#93C5FD` (blue tint) instead of standard blue                                       |
| Temperature is negative                   | Format as `"−12°"` using the proper minus sign `−` (U+2212), not a hyphen                                                   |
| Very long condition string                | Badge uses `width: fit-content` so it grows to fit (`THUNDERSTORM` ~172 px, `HAIL` ~80 px). `white-space: nowrap` prevents wrapping. |
| "Sunny AM · Thunderstorm PM" (10-day Thu) | Badge shows full string; icon set uses thunderstorm icons                                                                   |
| Visibility description labels             | Derive from value: ≥ 20 km → "Perfectly Clear"; 10–20 km → "Clear"; 5–10 km → "Hazy"; 1–5 km → "Poor"; < 1 km → "Very Poor" |
| Pressure trend label                      | Derive from pressure value relative to previous hour: rising → "Rising"; falling → "Falling"; stable (±2 hPa) → "Stable"    |


