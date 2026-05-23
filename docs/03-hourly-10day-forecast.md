# 03 — Hourly & 10-Day Forecast Toggle

## Purpose

A two-tab segment control with a shared scrollable slider below it. The **Hourly** tab shows 24 hour cards; the **10-day** tab shows 10 day cards. Both tabs use the same card size and layout — only the label and temperature source differ. Clicking any card updates the active data source for the hero section and all metrics panels.

**Both tabs are always enabled.** There is no disabled state for either tab at any time. The Hourly tab only shows today's hourly data — no hourly breakdown exists for future days. Switching to it from any selected day automatically redirects to today's "Now" hour (`state.activeHour = 15`); the user never needs to navigate back to today manually.

---

## Visual Reference in Mocks

| Layout | HTML file | Notes |
|---|---|---|
| Desktop (≥ 600 px) | `visily-design-mocks/visily-static-mainpage-html/index.html` | Toggle + slider shown in hourly mode |
| Mobile (< 600 px) | `visily-design-mocks/visily-static-mainpage_mobile-html/index.html` | Toggle + slider shown in hourly mode |

The mocks only show the Hourly tab active. The 10-day slider uses the same card anatomy — the only differences are the label text (day name instead of time) and the data source.

---

## Responsive Design Philosophy

The HTML mocks are fixed-canvas Visily exports (1440 px desktop, 393 px mobile). They use absolute pixel positioning, which is a Visily artifact — **not** an instruction to hard-code those positions in the implementation.

- Extract **design tokens** from the mocks as exact values: colors, font sizes, font weights, border-radius, box shadows, gap/padding sizes.
- For **layout**: use flexible CSS — flexbox, percentage widths, `max-width`, viewport units — so the UI scales smoothly.
- The **600 px breakpoint** divides mobile from desktop token sets.
- Absolute pixel positions are reference points showing intended visual relationships, not hard constraints.

---

## Section A — Toggle Pill

A `248×50 px` pill container centered horizontally above the slider. Contains the two tab buttons.

### Container

| Property | Value |
|---|---|
| Size | `248 × 50 px` |
| Border-radius | `9999px` |
| Background | `rgba(255,255,255,0.4)` |
| Backdrop filter | `blur(12px)` |
| Border | `1px solid rgba(254,215,170,0.5)` |

The two buttons sit inside with `5 px` from the container top and `4 px` from the left edge.

### Active tab button

| Property | Value |
|---|---|
| Size | `119 × 40 px` |
| Border-radius | `9999px` |
| Background | `#EA580C` |
| Shadow | `0px 8px 17px 0px rgba(23,26,31,0.15), 0px 0px 2px 0px rgba(23,26,31,0.12)` |
| Icon size | `16 × 16 px` |
| Icon color | `#ffffff` |
| Text | Inter 700, 14px, line-height 22px, `#ffffff` |

### Inactive tab button

| Property | Value |
|---|---|
| Size | `119 × 40 px` |
| Background | `transparent` |
| Icon size | `16 × 16 px` |
| Icon color | `#7C2D12` at 60% opacity |
| Text | Inter 600, 14px, line-height 22px, `#7C2D12` at 60% opacity |

### Icons

| Tab | Icon | Asset (desktop) | Asset (mobile) |
|---|---|---|---|
| Hourly | `Lucide_clock_Outlined` | `assets/IMG_20.svg` | `assets/IMG_12.svg` |
| 10-day | `Lucide_calendar_Outlined` | `assets/IMG_21.svg` | `assets/IMG_13.svg` |

---

## Section B — Shared Slider

One horizontal scrollable row of cards, positioned `74 px` below the toggle container top. The same component renders for both tabs — only the card content changes.

### Slider container

| Property | Value |
|---|---|
| Height | `143 px` |
| Width | Full available forecast area width |
| Overflow | `overflow-x: auto`, scrollbar hidden |
| Card gap | `16 px` (cards spaced `100 px` apart; `84 px` wide + `16 px` gap) |

**Mobile width fix.** On mobile (`< 600 px`), `.sd-main` is `display: flex; flex-direction: column`. Without intervention, flex items default to `min-width: auto` (their content's intrinsic min-content), which lets `.sd-forecast` grow to the `1200 px` `max-width` of `.sd-slider-wrapper` — pushing the toggle pill and the start of the slider off the right edge of the viewport. The fix is to add `min-width: 0; width: 100%` to both `.sd-forecast` and `.sd-slider-wrapper` inside the mobile media query so they're constrained back to the actual viewport width.

### Navigation arrows

Left and right chevron buttons float over the slider, vertically centered at `53 px` from the slider top.

**Visibility rules — each arrow is shown or hidden independently:**

| Arrow | Show condition | Hide condition |
|---|---|---|
| Left `‹` | There are cards scrolled out of view to the left | Slider is at the very start — nothing further left |
| Right `›` | There are cards scrolled out of view to the right | Slider is at the very end — nothing further right |

Examples:
- Hourly slider on load (scrolled to "Now" / hour 15): both arrows visible — hours 00–14 are to the left, hours 16–23 to the right.
- 10-day slider on load (day 0 = Today is first): **left arrow hidden** — Today is the first card, nothing before it. Right arrow visible if remaining days extend past the viewport.
- Scrolled all the way right (last card fully visible): right arrow hidden, left arrow visible.
- All cards fit on screen without any overflow: both arrows hidden.

| Property | Value |
|---|---|
| Size | `36 × 36 px` |
| Border-radius | `9999px` |
| Background | `rgba(255,255,255,0.4)` |
| Shadow | `0px 2px 5px 0px rgba(23,26,31,0.09), 0px 0px 2px 0px rgba(23,26,31,0.12)` |
| Backdrop filter | `blur(12px)` |
| Left chevron icon | `Lucide_chevron-left_Outlined`, `20×20 px`, `#673F31` |
| Right chevron icon | `Lucide_chevron-right_Outlined`, `20×20 px`, `#7C2D12` |

Arrows advance the scroll by one card width. Native touch/mouse drag also scrolls. Re-evaluate arrow visibility after every scroll or tab switch.

### Scroll animation

Scrolling must be visually smooth — no instant jumps. The implementation uses `scroll-behavior: smooth` + `scroll-snap-type: x mandatory` directly on the slider; no third-party carousel library is needed for this prototype.

**Constraint:** whatever approach is used, the rendered output must match the mocks exactly — card dimensions (`84×143 px`), border-radius (`22 px`), active/inactive background and shadow values, icon circle, gap between cards, and arrow button styles must all be preserved.

### Centering when the cards fit

The slider uses `justify-content: safe center`. When the row of cards is **narrower than the slider's content area** (e.g. the 10 daily cards on a wide screen — ~984 px of content in a ~1100 px slider), the cards centre as a group with equal margin on both sides. When the row **overflows** (e.g. the 24 hourly cards, ~2384 px in a ~1100 px slider), the `safe` keyword falls back to `flex-start` so the leftmost card is always reachable at `scrollLeft = 0`.

This avoids the classic flexbox bug where `justify-content: center` traps the start of overflowing content offscreen.

### Scroll-position preservation

The slider is rebuilt on every state change (a full re-render). Without intervention this would reset `scrollLeft` to 0 on every card click — the user clicks an hour, the slider snaps back to the left, the active card disappears. To avoid that:

- The render function captures the current `slider.scrollLeft` **before** tearing down the DOM and stashes it in a module-scope `savedScrollLeft`.
- After re-rendering, `slider.scrollLeft` is restored from `savedScrollLeft` (wrapped in `scrollBehavior = 'auto'` so the restore is instant, never animated).
- A flag `resetScrollOnNextRender` is set to `true` only in two situations: (1) the user switches tabs, (2) a city change has finished loading. In those cases the slider deliberately scrolls to put the new active card at the start (hour 15 or day 0).
- The slider's `onscroll` handler updates `savedScrollLeft` continuously so user-initiated scrolling (arrows, wheel, drag) is preserved across the next render.

Net behaviour: clicking a visible card never moves the slider; clicking an arrow scrolls smoothly; switching tabs always snaps to the new active card.

---

## Section C — Card Anatomy (Both Tabs)

All cards are the same physical size and share the same three-element layout. Active vs inactive visual state differs; tab-specific content is covered in Sections D and E.

### Card size

| Property | Value |
|---|---|
| Width × Height | `84 × 143 px` |
| Border-radius | `22 px` |

### Active card style

| Property | Value |
|---|---|
| Background | `rgba(255,255,255,0.6)` |
| Shadow | `0px 4px 9px 0px rgba(23,26,31,0.11), 0px 0px 2px 0px rgba(23,26,31,0.12)` |
| Border | `1px solid rgba(255,255,255,0.4)` |

### Inactive card style

| Property | Value |
|---|---|
| Background | `rgba(255,255,255,0.2)` |
| Shadow | none |
| Border | none |

### Card interior structure

```
[card 84×143]
  ├── [label]         top: 11px · centered horizontally
  ├── [icon circle]   top: 41px · left: 16px
  │     └── [icon]    24×24 px · centered in circle
  └── [temperature]   top: 105px · centered horizontally
```

**Label:**

| Property | Value |
|---|---|
| Font | Inter 500, 12px, line-height 18px |
| Color | `#565D6D` |
| Transform | `uppercase` |

**Icon circle:**

| Property | Value |
|---|---|
| Size | `52 × 52 px` |
| Border-radius | `9999px` |
| Background | `rgba(255,255,255,1)` |
| Shadow | `0px 2px 5px 0px rgba(23,26,31,0.09), 0px 0px 2px 0px rgba(23,26,31,0.12)` |

**Weather icon inside circle:**

| Card state | Icon color |
|---|---|
| Active card | Condition-specific color (e.g. `#F97316` sun, `#60A5FA` rain, `#BAE6FD` snow) — see `docs/02-weather-display.md` Section A3 for the full condition → color table |
| Inactive card | `#475569` (slate gray) for all conditions |

**Temperature text:**

| Property | Value |
|---|---|
| Font | Inter 700, 18px, line-height 27px |
| Color | `#171a1f` |
| Position | `top: 105px`, centered horizontally |
| Format | Integer + `°`, e.g. `23°`. Negative: `−12°` using U+2212 minus sign, not a hyphen |

---

## Section D — Hourly Tab Card Content

### Label

| Card | Label text |
|---|---|
| Hour index `15` | **Always `"Now"`** — regardless of whether it's the active card |
| All other hours (`0–14`, `16–23`) | `"HH:00"` — e.g. `"14:00"`, `"22:00"` |

The `"Now"` label is tied to the **clock hour** (15:00 = the prototype's "now"), not to `state.activeHour`. When the user selects a different hour card (say `12:00`), that card becomes active but its label stays `"12:00"`; the `15:00` card stays labelled `"Now"` and becomes inactive. This means the user can always see at a glance which card represents the present moment — without scanning all 24 labels.

### Temperature source

`mockData.hourly[hour].temp` for each card's hour index.

### Icon source

`mockData.hourly[hour].condition` → mapped to a FontAwesome 6 icon via the condition table in `docs/02-weather-display.md` Section A3.

### Scroll-to on load

On initial load and whenever the Hourly tab is activated, scroll the slider so the "Now" card (hour 15) is visible. Past hours (00–14) are scrollable to the left; future hours (16–23) to the right.

---

## Section E — 10-Day Tab Card Content

### Label

| Card | Label text |
|---|---|
| Day index 0 (today) | `"Today"` |
| Day index 1–9 | Abbreviated day name: `"Mon"`, `"Tue"`, `"Wed"`, `"Thu"`, `"Fri"`, `"Sat"`, `"Sun"` — uppercase |

Day names are derived from the relative offset (+1 = tomorrow, +2 = day after, etc.) starting from today (Monday in the mock dataset).

### Temperature source

`mockData.daily[day].high` — each card shows the day's high temperature.

### Icon source

`mockData.daily[day].condition` → mapped to the primary icon for that condition via `docs/02-weather-display.md` Section A3. For composite conditions like "Sunny AM · Thunderstorm PM", use the thunderstorm icon (PM dominates).

### Scroll-to on activation

When the 10-day tab activates, scroll to show the "Today" card (day 0). On wide screens where all 10 cards fit without scrolling, no scroll is needed and arrows are hidden.

---

## Section F — Tab Interaction & State Transitions

### Default state (app load)

`state.activeTab = "hourly"`, `state.activeHour = 15`, `state.activeDay = 0`. The Hourly tab is active with "Now" (hour 15) selected.

### Switching Hourly → 10-day

1. `state.activeTab` becomes `"10day"`
2. `state.activeDay` resets to `0` (today becomes the active card)
3. Slider re-renders with day cards; "Today" card is active and scrolled into view
4. Hero section and all metrics immediately update to `mockData.daily[0]`
5. Toggle pill: "10-day" button becomes orange/active, "Hourly" becomes muted

### Switching 10-day → Hourly

Regardless of which day was selected before switching, the view always lands on today's "Now" hour. This is intentional — hourly data only exists for today.

1. `state.activeTab` becomes `"hourly"`
2. `state.activeHour` resets to `15` ("Now" becomes the active card)
3. Slider re-renders with hour cards; "Now" card is active and scrolled into view
4. Hero section and all metrics immediately update to `mockData.hourly[15]`
5. Toggle pill: "Hourly" button becomes orange/active, "10-day" becomes muted

### Clicking a card (Hourly tab)

- `state.activeHour = clickedHour`
- Clicked card becomes active; previous active card becomes inactive
- Hero + all metrics update to `mockData.hourly[state.activeHour]`

### Clicking a card (10-day tab)

- `state.activeDay = clickedDay`
- Clicked card becomes active; previous active card becomes inactive
- Hero + all metrics update to `mockData.daily[state.activeDay]`

---

## Section G — JS State & Active Record

```js
// State variables
state.activeTab  = "hourly"   // "hourly" | "10day"
state.activeHour = 15         // 0–23
state.activeDay  = 0          // 0–9

function switchTab(tab) {
  state.activeTab = tab
  if (tab === "hourly") {
    state.activeHour = 15     // always snap back to "Now"
  } else {
    state.activeDay = 0       // always snap back to today
  }
  renderUI()
}

function selectHour(hour) {
  state.activeHour = hour
  renderUI()
}

function selectDay(day) {
  state.activeDay = day
  renderUI()
}

// Active data record — used by hero, metrics, mascot, and accessories
const activeRecord = state.activeTab === "hourly"
  ? mockData.hourly[state.activeHour]
  : mockData.daily[state.activeDay]
```

---

## Mock Data

All 24 hourly slots and all 10 daily slots are defined in `CLAUDE.md → ## Mock Data`. Every card in both sliders must use real values from that dataset.

**All cities share the same mock data.** Switching city only changes the city name in the search input — all forecast slider content stays identical regardless of which city is selected.

---

## Edge Cases

| Case | Behavior |
|---|---|
| Slider is at its leftmost position (start) | Hide left arrow — no content to the left |
| Slider is at its rightmost position (end) | Hide right arrow — no content to the right |
| All cards fit in the visible area with no overflow | Hide both arrows |
| Hourly on load: scrolled to "Now" (hour 15) | Both arrows visible — past hours left, future hours right |
| 10-day on load: day 0 (Today) is first card | Left arrow hidden, right arrow visible (if days extend past viewport) |
| Rapidly switching tabs | Each switch resets the active card (hour 15 for hourly, day 0 for 10-day) |
| UV Index is `null` / `—` (night hours) | Show `—` in metrics; card itself only shows time, icon, and temperature — no UV on the card |
| Negative temperature on card | Format as `−12°` using U+2212 minus sign |
| "Sunny AM · Thunderstorm PM" (10-day day +3) | Day card shows thunderstorm icon since PM dominates; composite string only in hero badge |
| City switch while in 10-day tab, day 3 active | After the 800 ms loading state resolves, reset to default: `activeTab = "hourly"`, `activeHour = 15`, `activeDay = 0` |
