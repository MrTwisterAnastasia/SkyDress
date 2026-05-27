# SkyDress Extended — Project Context for AI Agents

## Project Lineage

This is **skyDress-extended** — a direct extension of the original `skyDress` prototype. The original project lives at `/Users/anastasiia/Documents/pet project/skyDress` and was the source for all files copied here.

**What stays the same:** All existing mock data, design tokens, Visily mocks, assets, and component behavior defined in docs 01–04 remain canonical and unchanged. The main page (weather display, mascot, forecast, city search) is the foundation.

**What is new:** This project adds an authentication layer, user profile and preferences, and an outfit feedback system on top of that foundation. New screens and flows are being designed and implemented in this repo; existing screens are not to be modified unless a new feature explicitly requires it.

When an AI agent is asked to implement anything, it must first determine whether the task touches existing components (docs 01–04) or new extended features (docs 05–07), and read the relevant doc before writing any code.

---

## Detailed Component Specs

Per-component implementation specs live in `docs/`. Read the relevant file before implementing any component.

| File | Component |
|---|---|
| `docs/01-search-location.md` | Location input bar + city quick-switch pills, loading screen, no-city-selected screen, JS state & behavior |
| `docs/02-weather-display.md` | Hero section, condition badge, temperature, icon pair, desktop STATS panel, mobile bottom sheet, all metric cards |
| `docs/03-hourly-10day-forecast.md` | Forecast toggle pill, shared slider, hourly & 10-day card specs, tab interaction, JS state |
| `docs/04-mascot-outfits.md` | Outfit selection logic, floating clothing icons, connector lines, umbrella, loading/error mascot states |
| `docs/05-auth-signin-signup.md` | Public landing page, sign-in flow, sign-up flow, mock auth state & routing |
| `docs/06-settings-profile.md` | Profile icon in header, profile settings page, avatar & name customisation, weather metric display toggles, weather sensitivity preferences |
| `docs/07-outfit-feedback.md` | Post-outfit feedback widget, thumbs up / thumbs down flow, preference nudge logic |

> Topics covered directly in this file (no separate doc): design tokens, responsive layout rules, mock data, asset map, weather icon map.
> Docs 05–07 are the specs for the new extended features. They will be authored as the features are designed — reference them here but do not assume they are fully written yet. If a doc is missing or incomplete, report it before implementing.

---

## What This Project Is

SkyDress Extended is a **design prototype only** — not a real app. It has no backend, no API calls, no external services. All state is simulated with mock data and in-memory JS.

**Core concept (unchanged from original):** Standard weather apps show raw data (16°C, 70% humidity, 5 m/s wind). SkyDress converts those numbers into one clear answer: *"Here's what to wear today."* The mascot character wears the appropriate outfit for the current temperature level, and clothing/accessory icons float around it as a visual recommendation.

**Extended concept:** The prototype now demonstrates a personalised experience. Users have an account (mocked), a profile with a custom avatar and name, configurable weather metric preferences, and the ability to give feedback on outfit recommendations. That feedback nudges the user's personal weather sensitivity — making future outfit suggestions run warmer or cooler to match how that individual actually dresses.

---

## Extended Features Overview

These are the new flows added on top of the original main page. Each has its own spec doc.

### 1. Authentication — `docs/05-auth-signin-signup.md`
The app now has a **public landing page** as its entry point. Unauthenticated users land here and can either sign in or sign up. Both flows are distinct screens with their own form layouts and mock state transitions. After successful sign-in or sign-up, the user is routed to the main weather page.

- Public landing page with sign-in and sign-up entry points
- Sign-in screen: email + password form, mock validation, mock success/error states
- Sign-up screen: name, email, password fields, mock validation, mock success state
- Mock auth state stored in JS (`state.auth`): `{ loggedIn: false, user: null }` on load
- No real sessions, cookies, or tokens — purely simulated

### 2. Profile & Settings — `docs/06-settings-profile.md`
When logged in, the **header** gains a profile icon on the right side. Tapping/clicking it opens a profile settings page (or overlay — exact layout TBD in the doc). Settings are divided into two areas:

**Profile:**
- Display name (editable text field)
- Avatar (selection from a set of preset avatar images — no file upload)

**Weather metric display preferences:**
- Toggles for which metric cards are shown on the main page stats panel
- Toggleable metrics include: Sunrise/Sunset, Moon Phase, Allergy Outlook, Air Quality, Visibility, Pressure, UV Index
- Default state: all metrics visible
- Preferences are stored in mock JS state (`state.userPrefs.visibleMetrics`)

**Weather sensitivity (outfit preference):**
- A slider with 5 positions describing how the user *feels* in the weather: **Always cold · Usually cold · Average · Usually warm · Always warm**
- Each position maps to an **outfit-level shift** (not a temperature shift) — the slider moves the suggested outfit up or down the 7-level scale (Very Hot ↔ Very Cold). It does **not** modify the Feels Like reading.
- Mapping (`state.userPrefs.sensitivityOffset`):
  - Always cold → `+2` (suggest an outfit **two levels heavier** than the raw Feels Like reading — user feels cold, so dress warmer)
  - Usually cold → `+1`
  - Average → `0` (default — outfit matches the raw Feels Like reading)
  - Usually warm → `−1`
  - Always warm → `−2` (suggest an outfit **two levels lighter** — user feels warm, so dress cooler)
- Effective outfit = `clamp(baseOutfitIndex + sensitivityOffset, 0, 6)` where the index order is `[Very Hot, Hot, Warm, Cool, Cold, Freezing, Very Cold]` (light → heavy)
- Saving the slider re-renders the main page immediately: mascot PNG and clothing-icon cards refresh to the new outfit level

### 3. Outfit Feedback — `docs/07-outfit-feedback.md`
On the main weather page, after the mascot and clothing icons are shown, a compact **feedback widget** appears next to the mascot. It has three buttons: **Dress cooler · Looks good · Dress warmer**. Each click both records the feedback *and* immediately re-renders the displayed outfit so the user sees the adjusted suggestion right away.

- **Dress warmer** → `sensitivityOffset += 1` (clamped to `+2`). The mascot + clothing cards immediately re-render to the heavier outfit one level up (e.g. Hot → Warm → Cool → … → Very Cold).
- **Dress cooler** → `sensitivityOffset -= 1` (clamped to `-2`). The mascot + clothing cards immediately re-render to the lighter outfit one level down (e.g. Cool → Warm → Hot → Very Hot).
- **Looks good** → no change to `sensitivityOffset` or to the displayed outfit.
- **Edges (silent no-op):** if the offset is already at its slider extreme (`+2` or `-2`), further presses in that direction do not change the offset and the visible outfit stays the same. The success toast still appears so the user knows the input was received.
- **Persistence:** the feedback writes through to the same `state.userPrefs.sensitivityOffset` that the slider in Preferences reads — so opening Preferences after giving feedback shows the slider in its new position (single source of truth).
- **Dismissal:** the widget hides for that specific hour/day key after either submitting feedback or clicking the X (per-card hiding, not session-wide).

---

## Prototype Rules (Critical — Read Before Touching Anything)

1. **No real data, no external services.** All weather values are hardcoded mock data. Auth state, user profiles, and feedback are all simulated in-memory JS — no fetch calls, no localStorage persistence required.
2. **Do not modify existing screens without an explicit task that requires it.** The main weather page, mascot, forecast slider, and metric cards are locked — extend them only when a new feature (e.g. adding the profile icon to the header) explicitly calls for it. For truly new screens (auth, settings), new components and layouts are expected and do not need separate approval.
3. **Design fidelity is law for screens that have Visily mocks.** Sizes, colors, fonts, shadows, spacing must match the relevant Visily HTML mock exactly. New screens (auth, settings, feedback) do not yet have Visily mocks — implement them using the existing design tokens (colors, fonts, border-radius) to stay visually consistent, then await design approval before refining.
4. **Cover every edge case with mock data** — all 7 temperature levels, all weather conditions, all accessory combinations, all icon states, loading and error mascot states, plus all new states: logged-out / logged-in, feedback submitted / not submitted, all sensitivity offset levels, all metric visibility toggle combinations.

Responsive Design Philosophy

The HTML mocks are fixed-canvas Visily exports (1440 px desktop, 393 px mobile). They use absolute pixel positioning, which is a Visily artifact — not an instruction to hard-code those positions in the implementation.

Build the app as a fluid, resizable prototype:





Extract design tokens from the mocks as exact values: colors, font sizes, font weights, border-radius, box shadows, gap/padding sizes.



For layout: use flexible CSS — flexbox, percentage widths, max-width, viewport units — so the UI scales smoothly between 393 px and 1440 px and beyond.



The 600 px breakpoint is the dividing line: below it use mobile token sizes; at or above it use desktop token sizes. Both sets of tokens come from their respective mock canvases.



Absolute pixel positions in the mock HTML (e.g. left-[285px], top-[60px]) are reference points that show the intended visual relationship between elements, not hard constraints.



Container dimensions tied to the canvas (e.g. the 1410 px STATS panel on a 1440 px canvas, or the 393 px mobile bottom bar on a 393 px canvas) should be expressed as 100% or calc(100% − xpx) so they fill the actual viewport at any width.

---

## Responsive Layout

| Viewport width | Layout to use |
|---|---|
| `< 600px` | Mobile — based on `visily-design-mocks/visily-static-mainpage_mobile-html/index.html` (designed at 393×852 px, iPhone 15 Pro) |
| `>= 600px` | Desktop/Web — based on `visily-design-mocks/visily-static-mainpage-html/index.html` (designed at 1440×900 px) |

**Breakpoint rationale:** 393 px is the phone canvas; 1440 px is the desktop canvas. 600 px is a safe dividing line — no real content exists between 393 px and 600 px in the designs, and tablets/small desktops start at 600 px+.

---

## Design Tokens (from Visily HTML)

### Colors
| Role | Value |
|---|---|
| Background gradient | `linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)` |
| Primary text / dark | `#431407` |
| Brown accent text | `#673F31` |
| Salmon / input text | `#EA916E` |
| Orange CTA / icons | `#EA580C` |
| Dark orange | `#C2410C` |
| Muted label text | `#7C2D12` at 60% opacity |
| Hour/detail gray | `#565D6D` |
| Card background active | `rgba(255,255,255,0.6)` |
| Card background inactive | `rgba(255,255,255,0.2)` |
| Bottom bar (mobile) | `rgba(255,255,255,0.9)` |
| Dashed card bg | `rgba(243,244,246,0.5)` |

### Fonts
- **Inter** — primary UI font (all weights 100–900)
- **Archivo** — secondary (loaded but used sparingly)
- Both loaded from Google Fonts

### Key measurements (desktop)
- Page canvas: 1440×900 px
- Left sidebar strip: 20 px wide (blur panel) + 35 px tab
- Header area top offset: 24 px
- Location search bar: 445×48 px, `border-radius: 14px`
- Main temperature text: 120 px, `font-weight: 800`, `letter-spacing: -2px`
- Hourly card: 84×143 px, `border-radius: 22px`
- Toggle pill: 248×50 px, `border-radius: 9999px`

### Key measurements (mobile)
- Page canvas: 393×852 px
- Location bar: full-width minus 42 px margin, 28 px height
- Temperature text: 80 px, `font-weight: 800`
- Hourly cards: same 84×143 px as desktop
- Bottom bar: 393×104 px, `border-radius: 40px 40px 0 0`

---

## Asset Map

### Mascot Outfits (`assets/mascot_outfits/`)
Maps directly to the 7 temperature levels (wind-chill corrected "feels like" temperature):

| Level | Feels Like Range | PNG filename |
|---|---|---|
| Very Hot | > 35°C | `very-hot-weather.png` |
| Hot | 25–35°C | `hot-weather.png` |
| Warm | 18–25°C | `warm-weather.png` |
| Cool | 10–18°C | `cool-weather.png` |
| Cold | 0–10°C | `cold-weather.png` |
| Freezing | -10–0°C | `freezing-weather.png` |
| Very Cold | < -10°C | `ver-cold-weather.png` ⚠️ typo in filename — missing 'y', use as-is |

### Mascot States (`assets/mascot_states/`)
- `loading.png` — shown while mock data is "loading" (e.g., on city switch)
- `error.png` — shown in error state

### Accessories (`assets/icons/accessories/`)
- `umbrella.png` — shown when rain chance > 30%

### Clothing Icons (`assets/icons/clothing/`)
All 7 levels are populated. See `docs/04-mascot-outfits.md` for the per-level layout spec and connector-line angles.

| Level | Icons |
|---|---|
| Very Hot | `very-hot_waistcoat.svg` · `very-hot_briefs.svg` |
| Hot | `hot_cap.svg` · `hot_blouse.svg` · `hot_shorts.svg` |
| Warm | `warm_hoodie.svg` · `warm_baggy-jeans.svg` |
| Cool | `cool_beanie.svg` · `cool_turtleneck-sweater.svg` · `cool_boyfriend-jeans.svg` |
| Cold | `cold_beanie.svg` · `cold_turtleneck-sweater.svg` · `cold_down-jacket.svg` · `cold_boyfriend-jeans.svg` |
| Freezing | `freezing_beanie.svg` · `freezing_turtleneck-sweater.svg` · `freezing_coat.svg` · `freezing_boyfriend-jeans.svg` |
| Very Cold | `very-cold_beanie.svg` · `very-cold_coat.svg` · `very-cold_jeans.svg` |

---

## Weather Icons

Use **FontAwesome 6 Free** for all weather icons (replaces Lucide SVG files for conditions not yet in mocks).

**CDN:**
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
```

**Usage:** `<i class="fa-solid fa-sun"></i>`

| Condition | FA6 class | Free? | Visily mock SVG (existing) |
|---|---|---|---|
| Clear / Sunny (day) | `fa-solid fa-sun` | ✓ Free | `IMG_3.svg` (mobile) |
| Partly Cloudy (day) | `fa-solid fa-cloud-sun` | ✓ Free | `IMG_23.svg` (desktop) / `IMG_15.svg` (mobile) |
| Cloudy / Overcast | `fa-solid fa-cloud` | ✓ Free | `IMG_14.svg` (desktop) / `IMG_4.svg` (mobile) |
| Drizzle / Light Rain | `fa-solid fa-cloud-rain` | ✓ Free | — |
| Rain | `fa-solid fa-cloud-showers-heavy` | ✓ Free | `IMG_24.svg` (desktop) / `IMG_16.svg` (mobile) |
| Thunderstorm | `fa-solid fa-cloud-bolt` | ✓ Free | `IMG_25.svg` (desktop) |
| Snow | `fa-solid fa-snowflake` | ✓ Free | — |
| Blizzard / Snow + Wind | `fa-solid fa-wind` + `fa-solid fa-snowflake` (pair) | ✓ Free | — |
| Fog / Mist | `fa-solid fa-smog` | ✓ Free | — |
| Clear Night | `fa-solid fa-moon` | ✓ Free | — |
| Partly Cloudy Night | `fa-solid fa-cloud-moon` | ✓ Free | — |
| Windy | `fa-solid fa-wind` | ✓ Free | `IMG_19.svg` (mobile mainpage) |
| Hail | `fa-solid fa-cloud-meatball` | ✓ Free | — |
| Sleet / Freezing Rain | `fa-solid fa-cloud-rain` + blue tint | ✓ Free | — |
| Tornado | `fa-solid fa-tornado` | ✓ Free | — |

**Notes:**
- `fa-cloud-drizzle` and `fa-cloud-hail` and `fa-cloud-snow` exist but are **FA6 Pro only** — use the free alternatives above.
- `fa-cloud-meatball` is the closest free FA6 icon for hail (mixed precipitation visual).
- Where a Visily mock SVG already exists, prefer using it for pixel-perfect fidelity with the existing design; use FA6 for any condition not covered by the mock assets.
- Icon color follows the design token: orange `#EA580C` for active/current, slate `#475569` for forecast cards.

### FA family — regular vs solid

The implementation picks the FA family per-icon via a helper (`faFamily(name)`). Icons that have a free **Regular** variant render with `fa-regular`; everything else stays `fa-solid`. The set of icons rendered as `fa-regular` is:

`fa-sun · fa-moon · fa-snowflake · fa-clock · fa-calendar · fa-eye`

Every other icon used in the app — `fa-cloud`, `fa-cloud-sun`, `fa-cloud-moon`, `fa-cloud-rain`, `fa-cloud-showers-heavy`, `fa-cloud-bolt`, `fa-cloud-meatball`, `fa-smog`, `fa-wind`, `fa-bolt`, `fa-droplet`, `fa-temperature-half`, `fa-gauge`, `fa-chart-simple`, `fa-compass`, `fa-feather`, `fa-tree`, `fa-seedling`, `fa-umbrella`, `fa-chevron-left`, `fa-chevron-right`, `fa-location-dot`, `fa-spinner` — stays `fa-solid` because the free Regular set doesn't include it.

When tables in this file or in `docs/` write `fa-solid fa-X`, treat that as the icon **name**. The renderer prepends the right family automatically — don't hardcode `fa-solid` in templates.

---

## Weather Metrics to Mock

Every hour and every day in the mock dataset must include all of these:

| Metric | Unit / Format |
|---|---|
| Temperature | °C integer |
| Feels Like (wind chill corrected) | °C integer |
| Chance of Rain | % (0–100) |
| Wind Speed | km/h |
| Wind Direction | text label — fixed `"NW"` for all rows (mobile panel only) |
| Wind Bearing | degrees — fixed `315` for all rows (mobile panel only) |
| Humidity | % (0–100) |
| UV Index | integer + label (0–2 Low, 3–5 Moderate, 6–7 High, 8–10 Very High, 11+ Extreme) |
| Air Quality Index | integer + label (Good / Fair / Moderate / Poor / Very Poor) |
| Visibility | km |
| Pressure | hPa |
| Sunrise | HH:MM |
| Sunset | HH:MM |
| Moon Phase | label (New Moon / Waxing Crescent / First Quarter / Waxing Gibbous / Full Moon / Waning Gibbous / Last Quarter / Waning Crescent) |
| Tree Pollen | Low / Medium / High |
| Ragweed Pollen | Low / Medium / High |
| Grass Pollen | Low / Medium / High |
| Dust & Dander | Low / Medium / High |

---

## Clothing Recommendation Logic

The mascot outfit is selected in two steps:

1. **Base outfit from Feels Like** — look up the 7-level mapping above using the wind-chill corrected `feelsLike` value to get a base outfit index in the array `['very-hot', 'hot', 'warm', 'cool', 'cold', 'freezing', 'very-cold']` (light → heavy, indices `0..6`).
2. **Apply the user's sensitivity offset** — `effectiveIndex = clamp(baseIndex + state.userPrefs.sensitivityOffset, 0, 6)`. The offset comes from the Preferences slider (`-2 .. +2`) and is nudged by ±1 each time the user clicks Dress warmer / Dress cooler on the feedback widget. A logged-out / fresh-session user has `sensitivityOffset = 0`, so the effective outfit equals the base outfit.

The outfit returned at `effectiveIndex` drives both the mascot PNG and the floating clothing-icon cards. See `docs/04-mascot-outfits.md` for the per-level asset list and `docs/06` / `docs/07` for the slider and feedback flows.

The only accessory shown in the current prototype is the **umbrella**, triggered when rain chance > 30%.
Use `assets/icons/accessories/umbrella.png` as the umbrella image source.

---

## Mock Cities

On initial load `state.city = null` — no city is selected and the no-city-selected screen is shown. See `docs/01-search-location.md` for the full initial state and city-selection flow.

**Initial quick-switch pills:** Lviv · Kyiv · Odesa

**Full city pool** (searchable from dropdown — 10 cities):
Kyiv, Kharkiv, Odesa, Dnipro, Zaporizhzhia, Lviv, Kryvyi Rih, Mykolaiv, Poltava, Vinnytsia

All cities share **exactly the same mock weather data**. Switching cities only updates the city name shown in the search input — all metrics, forecast, mascot, and umbrella state remain unchanged.

---

## Views / Tabs

Two forecast tabs share the same scrollable slider component. Both are always enabled — neither tab is ever disabled or grayed out.

- **Hourly** (active by default) — slider shows 24 hour cards, each with: time label (or "Now" for the active hour), weather icon in a circular container, temperature. Default active card: hour 15 ("Now").
- **10-day** — same slider shows 10 day cards, each with: day name (or "Today" for day 0), weather icon, day's high temperature. Default active card: day 0 (Today).

**Tab switch behavior:**
- Switching to Hourly always resets active card to hour 15 ("Now").
- Switching to 10-day always resets active card to day 0 (Today).

See `docs/03-hourly-10day-forecast.md` for full spec.

---

## Screens / States to Cover

All of the following must be demonstrable by switching mock data or navigating the prototype.

### Inherited from original (unchanged)
- [ ] All 7 mascot outfit levels (very-hot through very-cold)
- [ ] Loading state (mascot = `loading.png`)
- [ ] Error state (mascot = `error.png`)
- [ ] All weather icon conditions (sunny, partly cloudy, cloudy, rain, thunderstorm, snow, fog, drizzle, clear night, partly cloudy night)
- [ ] Umbrella accessory (shown when rain > 30%)
- [ ] Hourly forecast view
- [ ] 10-day forecast view
- [ ] Mobile layout (< 600px)
- [ ] Desktop layout (>= 600px)
- [ ] City switching (Kharkiv / Lviv / Kyiv / Odesa) — only city name in search input changes, data stays the same
- [ ] UV index all levels (Low / Moderate / High / Very High / Extreme)
- [ ] Allergy outlook all severity levels
- [ ] Air Quality all levels

### New — Authentication (docs/05-auth-signin-signup.md)
- [ ] Public landing page (unauthenticated entry point)
- [ ] Sign-in screen with form
- [ ] Sign-in mock error state (wrong credentials)
- [ ] Sign-in mock success → redirect to main page
- [ ] Sign-up screen with form
- [ ] Sign-up mock validation error (e.g. email already taken)
- [ ] Sign-up mock success → redirect to main page

### New — Profile & Settings (docs/06-settings-profile.md)
- [ ] Header profile icon visible when logged in, hidden when logged out
- [ ] Profile settings page — avatar selection
- [ ] Profile settings page — display name edit
- [ ] Weather metric toggles — all metrics visible (default)
- [ ] Weather metric toggles — each metric individually hidden
- [ ] Weather sensitivity slider — all 5 positions (Always cold / Usually cold / Average / Usually warm / Always warm)
- [ ] **Saving the slider shifts the displayed outfit on the main page** — e.g. with Feels Like = 14 °C (base outfit Cool), saving "Always cold (+2)" must visibly switch the mascot to Freezing; saving "Always warm (−2)" must visibly switch it to Warm
- [ ] Outfit clamps at the bounds — e.g. a base outfit of Very Hot (index 0) plus offset −2 still shows Very Hot (clamped at 0)

### New — Outfit Feedback (docs/07-outfit-feedback.md)
- [ ] Feedback widget visible on the active hour/day card
- [ ] "Looks good" → widget hidden for that key, toast shown, no offset / outfit change
- [ ] "Dress warmer" → `sensitivityOffset += 1` (clamped to `+2`), main-page mascot + clothing cards immediately switch to the heavier outfit, toast shown
- [ ] "Dress cooler" → `sensitivityOffset -= 1` (clamped to `-2`), main-page mascot + clothing cards immediately switch to the lighter outfit, toast shown
- [ ] **Extremes silent no-op:** offset already at `+2` and user clicks Dress warmer → offset stays at `+2`, outfit unchanged, toast still appears. Same for `-2` + Dress cooler.
- [ ] Visible outfit also clamps at the outfit-array bounds (e.g. on a Very Hot day, Dress cooler may bump the offset but the displayed outfit stays Very Hot until the user encounters a colder hour/day)
- [ ] **Feedback persists to slider:** after clicking Dress warmer, opening Preferences shows the slider one notch toward "Always cold"
- [ ] X (close) hides the widget for that key without changing the offset
- [ ] Widget reappears on a different hour/day card unless that key is also dismissed

---

## Tech Stack

- Plain HTML/CSS/JS — no framework, no build step
- Tailwind CSS via CDN `https://cdn.tailwindcss.com`
- Fonts: Inter + Archivo via Google Fonts
- FontAwesome 6 Free via CDN (weather icons)
- Lucide icons as inline SVG files (already exported into mock `/assets/` folders)
- **No build step required** — prototype must be openable by double-clicking `index.html`

**Multi-page routing (extended):** The prototype now has multiple pages. Navigation between them is handled by swapping a top-level `<div id="app">` view via JS (`state.view`), or by separate HTML files — exact approach TBD in `docs/05-auth-signin-signup.md`. No hash router or SPA framework is required; simple JS show/hide of page containers is acceptable.

---

## Mock Data

> This data is intentionally unrealistic for one city or one day. Its only purpose is to hit every possible UI state — all 7 outfit levels, all weather icons, all accessory triggers, all UV / AQI / pollen levels — in a single 24-hour loop and a single 10-day block. Once all states are covered, data repeats.

**This is the canonical mock dataset.** All component spec docs (`docs/02` through `docs/04`) reference the field values defined here — do not duplicate them in other files.

**All cities share this data.** Switching between Kharkiv, Lviv, Kyiv, Odesa, or any other city selected from the dropdown only updates the city name displayed in the search input. Every metric, forecast row, mascot state, and accessory remains exactly the same.

### 24-Hour Hourly Forecast

**Prototype starts at 15:00** — this is the current hour (`state.activeHour = 15`). The hourly scroll row should open with the 15:00 card visible and marked as "Now". Hours 00:00–14:00 are in the past (scrollable left); hours 16:00–23:00 are in the future (scrollable right).

Every metric in a single row. Day-level fields (Sunrise, Sunset, Moon Phase, Pollen) are constant for today and repeated inline so each row is self-contained.

¹ Sleet: `fa-cloud-rain` with color `#93C5FD` (blue tint) to distinguish visually from drizzle.
★ Current hour — the prototype's starting "now" state.

| Hour  | Temp | Feels | Condition           | Outfit    | Icon                          | Rain% | Wind km/h | Hum% | UV           | AQI      | Vis km | hPa  | ☂ | Sunrise | Sunset | Moon      | Tree | Ragweed | Grass | Dust |
|-------|------|-------|---------------------|-----------|-------------------------------|-------|-----------|------|--------------|----------|--------|------|---|---------|--------|-----------|------|---------|-------|------|
| 00:00 | −12° | −18°  | Clear Night         | Very Cold | `fa-moon`                     | 0     | 25        | 55   | —            | Good     | 15     | 1028 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 01:00 | −13° | −20°  | Partly Cloudy Night | Very Cold | `fa-cloud-moon`               | 5     | 22        | 58   | —            | Good     | 13     | 1027 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 02:00 | −14° | −23°  | Blizzard            | Very Cold | `fa-wind` + `fa-snowflake`    | 70    | 55        | 80   | —            | Fair     | 1      | 1015 | ☂ | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 03:00 | −5°  | −8°   | Snow                | Freezing  | `fa-snowflake`                | 65    | 18        | 88   | —            | Good     | 3      | 1018 | ☂ | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 04:00 | −3°  | −7°   | Sleet               | Freezing  | `fa-cloud-rain` ¹             | 75    | 25        | 92   | —            | Good     | 4      | 1016 | ☂ | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 05:00 | 4°   | 2°    | Fog                 | Cold      | `fa-smog`                     | 10    | 5         | 95   | —            | Moderate | 0.5    | 1020 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 06:00 | 5°   | 3°    | Overcast            | Cold      | `fa-cloud`                    | 20    | 12        | 80   | 1 Low        | Good     | 8      | 1021 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 07:00 | 6°   | 2°    | Windy               | Cold      | `fa-wind`                     | 15    | 42        | 72   | 1 Low        | Good     | 10     | 1019 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 08:00 | 12°  | 10°   | Drizzle             | Cool      | `fa-cloud-rain`               | 55    | 18        | 85   | 2 Low        | Good     | 6      | 1017 | ☂ | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 09:00 | 14°  | 12°   | Cloudy              | Cool      | `fa-cloud`                    | 25    | 15        | 78   | 2 Low        | Good     | 9      | 1018 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 10:00 | 21°  | 20°   | Partly Cloudy       | Warm      | `fa-cloud-sun`                | 10    | 14        | 60   | 4 Moderate   | Good     | 15     | 1020 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 11:00 | 23°  | 22°   | Mostly Sunny        | Warm      | `fa-cloud-sun`                | 5     | 10        | 50   | 5 Moderate   | Good     | 20     | 1021 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 12:00 | 28°  | 27°   | Sunny               | Hot       | `fa-sun`                      | 0     | 12        | 40   | 7 High       | Good     | 25     | 1019 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 13:00 | 30°  | 29°   | Partly Cloudy       | Hot       | `fa-cloud-sun`                | 5     | 15        | 38   | 8 Very High  | Good     | 22     | 1018 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 14:00 | 38°  | 40°   | Sunny               | Very Hot  | `fa-sun`                      | 0     | 8         | 25   | 11 Extreme   | Poor     | 20     | 1016 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| **15:00 ★** | 37°  | 36°   | Thunderstorm        | Very Hot  | `fa-cloud-bolt`               | 85    | 35        | 70   | 2 Low        | Poor     | 5      | 1008 | ☂ | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 16:00 | 29°  | 26°   | Hail                | Hot       | `fa-cloud-meatball`           | 65    | 28        | 75   | 1 Low        | Moderate | 7      | 1012 | ☂ | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 17:00 | 27°  | 25°   | Heavy Rain          | Hot       | `fa-cloud-showers-heavy`      | 88    | 22        | 82   | —            | Good     | 8      | 1014 | ☂ | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 18:00 | 22°  | 21°   | Partly Cloudy       | Warm      | `fa-cloud-sun`                | 15    | 12        | 65   | 3 Moderate   | Good     | 18     | 1017 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 19:00 | 20°  | 19°   | Partly Cloudy Night | Warm      | `fa-cloud-moon`               | 10    | 10        | 68   | —            | Good     | 17     | 1018 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 20:00 | 15°  | 13°   | Clear Night         | Cool      | `fa-moon`                     | 5     | 14        | 70   | —            | Good     | 16     | 1020 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 21:00 | 8°   | 5°    | Clear Night         | Cold      | `fa-moon`                     | 0     | 18        | 65   | —            | Good     | 14     | 1022 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 22:00 | −4°  | −7°   | Snow                | Freezing  | `fa-snowflake`                | 60    | 20        | 88   | —            | Good     | 3      | 1024 | ☂ | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |
| 23:00 | −11° | −16°  | Clear Night         | Very Cold | `fa-moon`                     | 0     | 22        | 58   | —            | Good     | 12     | 1026 | — | 06:45   | 18:30  | Full Moon | Low  | Low     | Low   | Low  |

#### Hourly coverage summary

| Category | Values hit |
|---|---|
| Outfit levels | Very Cold (00–02, 23) · Freezing (03–04, 22) · Cold (05–07, 21) · Cool (08–09, 20) · Warm (10–11, 18–19) · Hot (12–13, 16–17) · Very Hot (14–15) |
| Weather icons | `fa-moon` · `fa-cloud-moon` · `fa-wind+snowflake` · `fa-snowflake` · `fa-cloud-rain` (sleet+drizzle) · `fa-smog` · `fa-cloud` · `fa-wind` · `fa-cloud-sun` · `fa-sun` · `fa-cloud-bolt` · `fa-cloud-meatball` · `fa-cloud-showers-heavy` |
| Umbrella shown | 02 03 04 08 15 16 17 22 (rain > 30%) |
| UV levels | — (night) · Low · Moderate · High · Very High · Extreme |
| AQI levels | Good · Fair · Moderate · Poor *(Very Poor covered in 10-day)* |

---

### 10-Day Forecast

Same data applies to every city — only the city name in the search input changes. Day labels use `+N` = days from today (`+0` = today, `+1` = tomorrow, etc.). Every metric in a single row.

¹ Sleet: `fa-cloud-rain` with color `#93C5FD` (blue tint).
² "Sunny AM · Thunderstorm PM" is a composite day-summary label rendered verbatim on 10-day cards; use thunderstorm icon since PM dominates.

| Day              | Hi / Lo     | Feels Hi | Condition                     | Outfit    | Icon                         | Rain% | Wind km/h | Hum% | UV          | AQI       | ☂ | Sunrise | Sunset | Moon             | Tree   | Ragweed | Grass  | Dust   |
|------------------|-------------|----------|-------------------------------|-----------|------------------------------|-------|-----------|------|-------------|-----------|---|---------|--------|------------------|--------|---------|--------|--------|
| +0 Mon (Today)   | 16° / 8°    | 14°      | Mostly Sunny                  | Cool      | `fa-cloud-sun`               | 0     | 12        | 65   | 2 Low       | Good      | — | 06:45   | 18:30  | Full Moon        | Low    | Low     | Low    | Low    |
| +1 Tue           | 22° / 13°   | 21°      | Partly Cloudy                 | Warm      | `fa-cloud-sun`               | 10    | 14        | 58   | 4 Moderate  | Good      | — | 06:15   | 19:45  | Waning Gibbous   | Low    | Low     | Medium | Low    |
| +2 Wed           | 29° / 18°   | 28°      | Sunny                         | Hot       | `fa-sun`                     | 0     | 10        | 40   | 7 High      | Good      | — | 05:45   | 20:20  | Last Quarter     | Medium | Low     | Medium | Low    |
| +3 Thu           | 38° / 25°   | 40°      | Sunny AM · Thunderstorm PM ²  | Very Hot  | `fa-sun` / `fa-cloud-bolt`   | 65    | 30        | 55   | 11 Extreme  | Very Poor | ☂ | 05:35   | 20:35  | Waning Crescent  | High   | Medium  | High   | Low    |
| +4 Fri           | 27° / 19°   | 26°      | Heavy Rain                    | Hot       | `fa-cloud-showers-heavy`     | 85    | 25        | 80   | 1 Low       | Poor      | ☂ | 05:45   | 20:20  | New Moon         | Low    | Low     | Medium | Low    |
| +5 Sat           | 14° / 7°    | 12°      | Fog                           | Cool      | `fa-smog`                    | 15    | 8         | 92   | 1 Low       | Moderate  | — | 07:00   | 18:00  | Waxing Crescent  | Medium | Low     | Low    | Medium |
| +6 Sun           | 7° / 2°     | 4°       | Drizzle                       | Cold      | `fa-cloud-rain`              | 55    | 20        | 88   | 1 Low       | Good      | ☂ | 07:30   | 17:15  | First Quarter    | Low    | Low     | Low    | Low    |
| +7 Mon           | −4° / −9°   | −7°      | Snow                          | Freezing  | `fa-snowflake`               | 70    | 15        | 90   | —           | Good      | ☂ | 08:00   | 16:30  | Waxing Gibbous   | Low    | Low     | Low    | Low    |
| +8 Tue           | −15° / −20° | −22°     | Blizzard                      | Very Cold | `fa-wind` + `fa-snowflake`   | 75    | 60        | 78   | —           | Fair      | ☂ | 08:15   | 16:15  | Full Moon        | Low    | Low     | Low    | Low    |
| +9 Wed           | 3° / −2°    | 1°       | Overcast                      | Cold      | `fa-cloud`                   | 20    | 18        | 75   | 1 Low       | Good      | — | 08:10   | 16:20  | Waning Gibbous   | Low    | Low     | Low    | Low    |

#### 10-day coverage summary

| Category | Values hit |
|---|---|
| Outfit levels | Very Hot (+3) · Hot (+2, +4) · Warm (+1) · Cool (+0, +5) · Cold (+6, +9) · Freezing (+7) · Very Cold (+8) — **all 7 levels covered** |
| Weather icons | `fa-cloud-sun` · `fa-sun` · `fa-cloud-bolt` · `fa-cloud-showers-heavy` · `fa-smog` · `fa-cloud-rain` · `fa-snowflake` · `fa-wind+snowflake` · `fa-cloud` *(remaining icons covered in hourly)* |
| Moon phases | Full Moon (+0, +8) · Waning Gibbous (+1, +9) · Last Quarter (+2) · Waning Crescent (+3) · New Moon (+4) · Waxing Crescent (+5) · First Quarter (+6) · Waxing Gibbous (+7) — **all 8 phases covered** |
| Pollen | Tree Low/Medium/High · Ragweed Low/Medium · Grass Low/Medium/High · Dust Low/Medium |
| AQI levels | Good · Fair · Moderate · Poor · Very Poor — **all 5 levels covered** |

---

### Derived Display Values

These values are computed at render time from raw mock data fields. They are not stored in the mock tables — derive them as described here.

**AQI Numeric Value** (shown alongside the label in the Air Quality card, e.g. `"22 AQI"`):

| AQI Label | Numeric |
|---|---|
| Good | 22 |
| Fair | 51 |
| Moderate | 101 |
| Poor | 151 |
| Very Poor | 201 |

**Moon Phase Illumination %** (shown in the Moon Phase card):

| Phase | Illumination |
|---|---|
| Full Moon | 100% |
| Waning Gibbous | 80% |
| Last Quarter | 50% |
| Waning Crescent | 20% |
| New Moon | 0% |
| Waxing Crescent | 20% |
| First Quarter | 50% |
| Waxing Gibbous | 80% |

**Visibility Description Labels** (shown in the Visibility card):

| Visibility | Label |
|---|---|
| ≥ 20 km | "Perfectly Clear" |
| 10–20 km | "Clear" |
| 5–10 km | "Hazy" |
| 1–5 km | "Poor" |
| < 1 km | "Very Poor" |

**Sun Cycle Elapsed / Remaining** (shown in Sun Cycle card — computed dynamically):
- Elapsed since sunrise: `state.activeHour − sunrise_hour` → display as `"Xh Ym ago"`
- Remaining to sunset: `sunset_hour − state.activeHour` → display as `"In Xh Ym"`
- If `activeHour < sunrise_hour`: show `"Before sunrise"` for the elapsed slot
- If `activeHour > sunset_hour`: show `"After sunset"` for the remaining slot
- Use the `sunrise` / `sunset` values from the currently active data record

**Pressure Trend Label** (shown in Pressure card):
- Compare `activeRecord.pressure` vs. the previous period's pressure (previous hour for hourly; always "Stable" for 10-day since no prior daily value exists)
- Increased > 2 hPa → `"Rising"`; decreased > 2 hPa → `"Falling"`; within ±2 hPa → `"Stable"`

---

## File Structure

```
skyDress-extended/
├── CLAUDE.md
├── docs/
│   ├── 01-search-location.md          ← existing, canonical
│   ├── 02-weather-display.md          ← existing, canonical
│   ├── 03-hourly-10day-forecast.md    ← existing, canonical
│   ├── 04-mascot-outfits.md           ← existing, canonical
│   ├── 05-auth-signin-signup.md       ← NEW — auth flows spec (to be authored)
│   ├── 06-settings-profile.md         ← NEW — profile & preferences spec (to be authored)
│   └── 07-outfit-feedback.md          ← NEW — feedback widget spec (to be authored)
├── assets/
│   ├── icons/
│   │   ├── accessories/
│   │   │   └── umbrella.png
│   │   └── clothing/
│   │       ├── very-hot_waistcoat.svg · very-hot_briefs.svg
│   │       ├── hot_cap.svg · hot_blouse.svg · hot_shorts.svg
│   │       ├── warm_hoodie.svg · warm_baggy-jeans.svg
│   │       ├── cool_beanie.svg · cool_turtleneck-sweater.svg · cool_boyfriend-jeans.svg
│   │       ├── cold_beanie.svg · cold_turtleneck-sweater.svg · cold_down-jacket.svg · cold_boyfriend-jeans.svg
│   │       ├── freezing_beanie.svg · freezing_turtleneck-sweater.svg · freezing_coat.svg · freezing_boyfriend-jeans.svg
│   │       └── very-cold_beanie.svg · very-cold_coat.svg · very-cold_jeans.svg
│   ├── mascot_outfits/
│   │   ├── very-hot-weather.png
│   │   ├── hot-weather.png
│   │   ├── warm-weather.png
│   │   ├── cool-weather.png
│   │   ├── cold-weather.png
│   │   ├── freezing-weather.png
│   │   └── ver-cold-weather.png   ← filename typo, use as-is
│   └── mascot_states/
│       ├── loading.png
│       └── error.png
└── visily-design-mocks/
    │
    │  ── Main page references ──
    ├── visily-static-mainpage-html/              ← desktop main page, cool outfit (1440px)
    │   └── assets/  (IMG_1.svg–IMG_5.svg, IMG_6.png ← mascot PNG, IMG_7.svg–IMG_18.svg,
    │                  IMG_19.png, IMG_20.svg–IMG_25.svg)
    ├── visily-static-mainpage_mobile-html/       ← mobile main page, cool outfit (393px)
    │   └── assets/  (IMG_1.svg–IMG_3.svg, IMG_4.png ← mascot PNG, IMG_5.svg–IMG_10.svg,
    │                  IMG_11.png, IMG_12.svg–IMG_19.svg)
    │
    │  ── Stats panels ──
    ├── visily-static-openstatpanel_web-html/     ← desktop STATS panel fully open
    ├── visily-static-openstatpanel_mobile-html/  ← mobile full stats panel (all cards)
    ├── visily-static-mainpage_openpanel_mobile-html/ ← mobile panel partially open (overlay)
    │
    │  ── Special states ──
    ├── visily-static-noselectedcity_web-html/    ← desktop no-city-selected screen
    ├── visily-static-noselectedcity_mobile-html/ ← mobile no-city-selected screen
    ├── visily-static-loadind_web-html/           ← desktop loading screen ⚠️ typo: 'loadind'
    ├── visily-static-loading_mobile-html/        ← mobile loading screen
    │
    │  ── Per-outfit mocks (desktop + mobile; cool uses main page mocks above) ──
    └── outfits/
        ├── visily-static-veryhotweatheroutfit_web-html/
        ├── visily-static-veryhotweatheroutfit_mobile-html/
        ├── visily-static-hotweatheroutfit_web-html/
        ├── visily-static-hotweatheroutfit_mobile-html/
        ├── visily-static-warmweatheroutfit_web-html/
        ├── visily-static-warmweatheroutfit_mobile-html/
        ├── visily-static-coldweatheroutfit_web-html/
        ├── visily-static-coldweatheroutfit_mobile-html/
        ├── visily-static-freezingweatheroutfit_web-html/
        ├── visily-static-freezingweatheroutfit_mobile-html/
        ├── visily-static-verycoldweatheroutfit_web-html/
        └── visily-static-verycoldweatheroutfit_mobile-html/
```
