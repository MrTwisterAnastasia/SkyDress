# 01 — Search & Location Component

## Purpose

The search area lets the user see and switch the active city. It consists of two parts:

1. **Location input-select** — an interactive dropdown input. When a city is selected it displays the active city name; when no city has been selected it shows the placeholder "Enter your location". Clicking the field opens a searchable list of cities.
2. **City quick-switch pills** — three underlined pill buttons for Lviv, Kyiv, and Odesa. Clicking one instantly selects that city without opening the dropdown.

This is a **prototype only** — no real geocoding, no API calls. Selecting any city triggers an 800 ms fake loading state using these mocks:

- `>= 600 px`: `visily-design-mocks/visily-static-loadind_web-html` ⚠️ typo in folder name: `loadind` not `loading`
- `< 600 px`: `visily-design-mocks/visily-static-loading_mobile-html`

All weather data stays identical regardless of city.

---

## App-Level State: Two Modes

### Mode A — No City Selected (initial / no permission)

Triggered when the user has not granted location permission **and** has not manually selected a city.

- Input shows placeholder text: `Enter your location`
- Instead of the main weather page, show the **no-selected-city screen** (see section below).
- The city pills (Lviv / Kyiv / Odesa) are still visible and clickable.

Visual reference:

| Layout | File |
|---|---|
| Desktop (≥ 600 px) | `visily-design-mocks/visily-static-noselectedcity_web-html/index.html` |
| Mobile (< 600 px) | `visily-design-mocks/visily-static-noselectedcity_mobile-html/index.html` |

### Mode B — City Selected (normal / active)

Triggered once the user has selected any city (via pill or dropdown).

- Input shows the active city name (default: `Kharkiv` — see CLAUDE.md for mock cities).
- The main weather page is shown.

---

## Responsive Design Philosophy

The HTML mocks are fixed-canvas Visily exports (1440 px desktop, 393 px mobile). They use absolute pixel positioning, which is a Visily artifact — **not** an instruction to hard-code those positions in the implementation.

Build the app as a fluid, resizable prototype:

- Extract **design tokens** from the mocks as exact values: colors, font sizes, font weights, border-radius, box shadows, gap/padding sizes.
- For **layout**: use flexible CSS — flexbox, percentage widths, `max-width`, viewport units — so the UI scales smoothly between 393 px and 1440 px and beyond.
- The **600 px breakpoint** is the dividing line: below it use mobile token sizes; at or above it use desktop token sizes. Both sets of tokens come from their respective mock canvases.
- Absolute pixel positions in the mock HTML (e.g. `left-[285px]`, `top-[60px]`) are reference points that show the intended visual relationship between elements, not hard constraints.

---

## Map Icon — Do Not Render

The earlier Visily mocks included a right-side map icon (`Lucide_map_Outlined`) inside the input bar. The **updated mocks no longer contain it** — and it must not be rendered in the implementation either. There is no flow where a user adds a city by clicking a map icon.

The input bar has only:
- map-pin icon on the **left**
- text input / city name in the **middle**

No icon on the right.

---

## Structure

```
[Search Area]
  ├── [Input bar container]
  │     ├── map-pin icon (left, 20×20 px desktop / 16×16 px mobile)
  │     └── <input> — shows active city name OR placeholder "Enter your location"
  │          └── [Dropdown] (opens on click — see dropdown spec below)
  └── [City quick-switch pills row]
        ├── [Pill: slot 0]
        ├── [Pill: slot 1]
        └── [Pill: slot 2]
```

Pills start as **Lviv · Kyiv · Odesa**. When the user clicks a pill, that city becomes active and its slot is replaced with a randomly chosen city from the pool of cities not currently shown in any pill and not the newly active city. The other two pill slots are unchanged.

---

## Desktop Spec (≥ 600 px)

### Header alignment

The header is a 3-column grid (`1fr | minmax(0, 445px) | 1fr`) with the logo justified to the left of column 1, the search area centred in column 2, and column 3 left empty.

Header horizontal padding is kept in sync with `.sd-main` so the logo's left edge always aligns with the main column's content edge:
- Below 1100 px viewports both use `clamp(20px, 6vw, 96px)`.
- At ≥ 1100 px both override to `padding-left: 64px; padding-right: 96px`.
- Header is also capped at `max-width: 1440px; margin: 0 auto` so on ultra-wide screens it tracks `.sd-main` rather than spreading edge-to-edge.

### Input bar

| Property | Value |
|---|---|
| Size | `445 × 48 px` |
| Border-radius | `14px` |
| Background | `rgba(255,255,255,0.3)` |
| Backdrop filter | `blur(16px)` |
| Box shadow | `0px 4px 12px 0px rgba(0,0,0,0.05)` |
| Border | `1px solid rgba(255,255,255,0.4)` |

**Left icon** — map-pin (`assets/IMG_4.svg` in desktop mock = `Lucide_map-pin_Outlined`)
- Size: `20 × 20 px`
- Color: `#C2410C`
- Position: `left: 16px`, vertically centered

**Input element**
- `background: transparent`, `border: none`, `outline: none`
- 8px gap after left icon

| State | Font | Color |
|---|---|---|
| Active city (city selected) | Inter 500, 16px, line-height 26px | `#EA916E` |
| Placeholder (no city selected) | Inter 400, 16px, line-height 26px | `#bcc1ca` |

**Right icon — hidden.** Do not render `Lucide_map_Outlined` even if present in mock HTML.

### City pills (desktop)

Rendered as a horizontal row, `12px` below the input bar.

| Property | Value |
|---|---|
| Height | `36px` |
| Padding | `0 20px` |
| Border-radius | `9999px` |
| Background | `rgba(255,255,255,0.5)` |
| Box shadow | `0px 0px 2px 0px rgba(23,26,31,0.12), 0px 0px 1px 0px rgba(23,26,31,0.07)` |
| Gap between pills | ~85px left offsets (0 → 85 → 171 px) |
| Font | Inter 600, 14px, line-height 22px |
| Text color | `#EA916E` |
| Text decoration | `underline` |

Initial cities: **Lviv · Kyiv · Odesa**. Updates dynamically when a pill is clicked — see Structure section.

---

## Mobile Spec (< 600 px)

### Header layout (mobile)

On mobile the header collapses to a **single row** so it doesn't dominate the viewport:

| Element | Behaviour |
|---|---|
| `.sd-logo-icon` | Visible on the left of the row (36 × 36 px sun-disc icon) |
| `.sd-logo-text` | **Hidden** (`display: none`) — `"SkyDress"` text is not shown on mobile |
| `.sd-search-area` | Sits in the same row as the logo icon, `flex: 1` so it fills the remaining width |
| Container | `.sd-header { display: flex; flex-direction: row; align-items: center; gap: 12px }` |

The search input + quick-switch pills still stack vertically inside `.sd-search-area`; only the header itself is row-oriented on mobile. On desktop both logo icon and logo text stay visible and align with `.sd-main`'s left edge (header padding is kept in sync with main padding).

### Input bar (mobile)

| Property | Value |
|---|---|
| Width | Fluid — fills the row's remaining width after the logo icon (via `flex: 1` on `.sd-search-area`); the 272 px width in the mock canvas is a reference value, not a hard constraint |
| Height | `30px` |
| Border-radius | `14px` |
| Background | `rgba(255,255,255,0.3)` |
| Border | `1px solid rgba(255,255,255,0.4)` |
| Backdrop filter | `blur(16px)` |
| Box shadow | `0px 4px 12px 0px rgba(0,0,0,0.05)` |
| Padding | `0 8px` |
| Gap (icon to text) | `4px` |

**Left icon** — map-pin (`Lucide_map-pin_Outlined`)
- Size: `16 × 16 px`
- Color: `#C2410C`

**Input element (mobile)**

| State | Font | Color |
|---|---|---|
| Active city | Inter 500, 11px, line-height 18px | `#EA916E` |
| Placeholder | Inter 400, 11px, line-height 18px | `#bcc1ca` |

**Right icon — hidden.** Mobile mock does not include it at all; keep it absent.

### City pills (mobile)

Positioned `36px` below the input bar top within the location container.

| Property | Value |
|---|---|
| Height | `20px` |
| Padding | `0 8px` |
| Border-radius | `9999px` |
| Background | `rgba(255,255,255,0.5)` |
| Box shadow | `0px 0px 2px 0px rgba(23,26,31,0.12), 0px 0px 1px 0px rgba(23,26,31,0.07)` |
| Font | Inter 600, 11px, line-height 18px |
| Text color | `#EA916E` |
| Text decoration | `underline` |
| Left offsets | `0 → 85 → 171 px` |

Initial cities: **Lviv · Kyiv · Odesa**. Updates dynamically when a pill is clicked — see Structure section.

---

## Dropdown City List

Opens when the user clicks the input bar. Positioned below the input. Contains:

1. A search `<input>` above the list
2. A scrollable list of the 10 most populated cities of Ukraine:

| # | City |
|---|---|
| 1 | Kyiv |
| 2 | Kharkiv |
| 3 | Odesa |
| 4 | Dnipro |
| 5 | Zaporizhzhia |
| 6 | Lviv |
| 7 | Kryvyi Rih |
| 8 | Mykolaiv |
| 9 | Poltava |
| 10 | Vinnytsia |

### Search behavior

- Filtering activates only when the user has typed **3 or more characters**.
- Filter is case-insensitive, matches anywhere in the city name.
- If no city matches the search query, show the message:
  > "No cities found — try a different spelling"
- Before 3 characters are typed, show the full unfiltered list.

### Closing the dropdown

- Click on a city → selects it, closes dropdown, triggers loading state.
- Click outside the dropdown → closes without selecting.
- Press `Escape` → closes without selecting.

---

## No-Selected-City Screen

Shown instead of the main weather page when `state.city === null`.

### Desktop (≥ 600 px)

Visual reference: `visily-design-mocks/visily-static-noselectedcity_web-html/index.html`

| Element | Spec |
|---|---|
| Heading "Oops!" | Archivo 900, 96px, line-height 96px, tracking -4.8px, color `#673F31`, centered |
| Subtitle "Your location is a mystery to us 🕵️" | Archivo 700, 30px, line-height 36px, tracking -0.75px, color `#673F31`, centered |
| Body text | Inter 500, 18px, line-height 29px, color `#673F31`, centered, 578px wide |
| Body copy | "No worries — just type your city below and we'll sort out the skies for you. Find your perfect weather spot in seconds." |
| Mascot image | `visily-static-noselectedcity_web-html/assets/IMG_3.png`, 600×600 px rendered in 600×450 container, offset top -75px |
| Drop shadow oval | `128×24 px`, `rgba(0,0,0,0.05)`, blur 24px, positioned below mascot |

The header bar (SkyDress logo + search area) remains visible and functional in this state.

### Mobile (< 600 px)

Visual reference: `visily-design-mocks/visily-static-noselectedcity_mobile-html/index.html`

| Element | Spec |
|---|---|
| Heading "Oops!" | Inter 900, 40px, line-height 40px, tracking -0.8px, color `#431407`, centered, opacity 0.9 |
| Subtitle "Your location is a mystery to us 🕵️" | Inter 600, 20px, line-height 26px, color `#431407`, centered |
| Body text | Inter 400, 14px, line-height 22px, color `#431407`, centered, 320px wide |
| Body copy | "No worries — just type your city below and we'll sort out the skies for you" |
| Mascot image | `visily-static-noselectedcity_mobile-html/assets/IMG_3.png`, 393×393 px in 393×299 container, top offset -35px |

The header bar (SkyDress logo + search area) remains visible in this state.

---

## Loading Screen

Shown after the user selects a city (pill click or dropdown selection), for **800 ms**, simulating real data fetch.

Visual reference:

| Layout | File |
|---|---|
| Desktop (≥ 600 px) | `visily-design-mocks/visily-static-loadind_web-html/index.html` ⚠️ typo in folder name: `loadind` not `loading` |
| Mobile (< 600 px) | `visily-design-mocks/visily-static-loading_mobile-html/index.html` |

### Desktop loading

| Element | Spec |
|---|---|
| Spinner icon | `IMG_3.svg` (`Nucleo_Loading 2_outlined`), 70×70 px, color `#ed702d` |
| Text | "Loading..." — Archivo 700; "Loading" at 48px, "..." at 64px; line-height 84px; color `#673F31`; centered in 443px wide container |
| Mascot image | `visily-static-loadind_web-html/assets/IMG_4.png`, 573×573 px in 573×492 container, top offset -40px |

### Mobile loading

| Element | Spec |
|---|---|
| Spinner icon | `IMG_3.svg` (`Nucleo_Loading 2_outlined`), 36×36 px, color `#ed702d` |
| Text | "Loading..." — Archivo 700, 32px, line-height 48px, color `#673F31`, centered |
| Mascot image | `visily-static-loading_mobile-html/assets/IMG_4.png`, 412×412 px in 393×412 container, left offset -9px |

The header bar (logo + search area) remains visible during loading. The spinner icon should animate (CSS rotation or equivalent). After 800 ms the loading screen is replaced by the main weather page for the selected city.

---

## JS Behavior

```js
const CITIES_LIST = ['Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Zaporizhzhia',
                     'Lviv', 'Kryvyi Rih', 'Mykolaiv', 'Poltava', 'Vinnytsia']

state.city = null                        // no city selected initially
state.pills = ['Lviv', 'Kyiv', 'Odesa'] // quick-switch pill cities
state.loading = false
state.dropdownOpen = false
state.searchQuery = ''

function selectCity(cityName, pillIndex = null) {
  state.dropdownOpen = false
  state.city = cityName
  state.loading = true

  if (pillIndex !== null) {
    // Replace the clicked pill slot with a random city not already in any pill
    // and not the newly active city
    const taken = new Set([...state.pills, cityName])
    const pool = CITIES_LIST.filter(c => !taken.has(c))
    state.pills[pillIndex] = pool[Math.floor(Math.random() * pool.length)]
  }

  renderUI()               // shows loading screen
  setTimeout(() => {
    state.loading = false
    renderUI()             // shows main weather page
  }, 800)
}

function getFilteredCities() {
  if (state.searchQuery.length < 3) return CITIES_LIST
  const q = state.searchQuery.toLowerCase()
  return CITIES_LIST.filter(c => c.toLowerCase().includes(q))
}
```

Render rules:
- `state.city === null && !state.loading` → show no-selected-city screen
- `state.loading === true` → show loading screen
- `state.city !== null && !state.loading` → show main weather page
- Pills are disabled (pointer-events: none, reduced opacity) while `state.loading === true`

Transition timing details are covered inline in this document (800 ms loading delay).
See `CLAUDE.md → ## Mock Data` for the full mock dataset and `CLAUDE.md → ## Mock Cities` for the city pool.

---

## Edge Cases

| Case | Behavior |
|---|---|
| Initial load | `state.city = null`, pills show Lviv / Kyiv / Odesa, no-selected-city screen shown |
| Click Lviv pill (slot 0) | `selectCity('Lviv', 0)` → slot 0 replaced with random city from pool → 800 ms loading → main page |
| Click Kyiv pill while loading | Ignore — pills disabled during `state.loading === true` |
| Dropdown selects a city | `selectCity(cityName)` — no `pillIndex`, pills unchanged |
| Open dropdown, type < 3 chars | Show full city list, no filtering |
| Open dropdown, type ≥ 3 chars, match found | Show filtered list |
| Open dropdown, type ≥ 3 chars, no match | Show "No cities found — try a different spelling" |
| Select same city that is already active | Still triggers 800 ms loading (consistent UX), pill slot still replaced |
| Kharkiv | Not an initial quick-switch pill. Can be selected from the dropdown or appear in pills after random replacement. |
