# Doc 07 — Outfit Feedback Widget

## Purpose

After the mascot and outfit suggestion are displayed on the main page, a compact **feedback widget** appears. It lets the user signal whether the suggested outfit matched how they actually feel. Each press both **records the feedback** and **immediately re-renders the displayed outfit** so the user sees their adjustment applied right away.

The widget writes through to the same `state.userPrefs.sensitivityOffset` that the slider in the Preferences panel reads — the slider and the widget are two faces of the same preference (see `docs/06-settings-profile.md` for the slider, `docs/04-mascot-outfits.md` for the outfit-selection algorithm).

---

## Visily Mock References

| Viewport | File |
|---|---|
| Desktop (1440 px) | `visily-design-mocks/extended-version/visily-static-mainpagewithprofileclosedse...opdown_web-html/index.html` |
| Mobile (393 px) | `visily-design-mocks/extended-version/visily-static-mainpagewithprofileclosedse...own_mobile-html/index.html` |

---

## Widget Anatomy

> **Positioning principle — no overlap, always.**
> The pixel coordinates in the Visily mocks are a starting reference only. The single non-negotiable rule when placing the widget in the live app is: **the feedback widget must never cover any content** — not the mascot image, not the clothing icon cards, not the connector lines, not the temperature block, not the condition badge, not the weather metric mini-row. If the widget would overlap any of those elements at the current viewport width, move it until it sits in genuinely empty space. The mocks show one valid arrangement at fixed canvas sizes (1440 px / 393 px); at any other width the implementation must recalculate a clear gap and place the widget there instead.

### Desktop

| Property | Value |
|---|---|
| Size | `286 × 56 px` |
| Position | Place in the empty horizontal space to the right of the mascot group (between the rightmost clothing icon card and the STATS panel edge) or below the mascot group if that band is clear. The mock shows approximately `y = 504 px` on the 900 px canvas as a reference. At narrower viewports recalculate: if no horizontal gap exists, drop the widget to below the entire mascot+clothing block. Never let it sit on top of the mascot image, any clothing icon card, or any part of the temperature/condition group. |
| Background | `rgba(255, 255, 255, 0.4)` with `backdrop-filter: blur(12px)` |
| Border | `1px solid rgba(103, 63, 49, 0.1)` |
| Border-radius | `6px` |
| Shadow | `0px 4px 20px 0px rgba(23, 26, 31, 0.09)` |
| Floating shadow below (decorative oval) | `128 × 24 px` ellipse, `background: rgba(0,0,0,0.05)`, `blur(24px)`, centred under the widget |

#### Desktop close button (X)

| Property | Value |
|---|---|
| Size | `15 × 15 px` |
| Position | Top-right corner of the widget, offset `top: -4px; right: -2px` |
| Background | `#FDF4EA` |
| Border | `1px solid rgba(103, 63, 49, 0.18)` |
| Border-radius | `9999px` |
| Shadow | `0px 4px 9px rgba(23,26,31,0.11), 0px 0px 2px rgba(23,26,31,0.12)` |
| Icon | `fa-solid fa-xmark`, `8 × 8 px`, colour `rgba(103,63,49,0.6)` |

#### Desktop widget content

**Header row** (top, inside widget padding `8px 12px`):
- Feedback icon — use `fa-solid fa-comment-dots`, `16 × 16 px`, colour `#856457`
- Label text: **"Adjust next outfit suggestion?"** — `11px`, `font-weight: 500`, `font-family: Inter`, colour `#856457`, left of the three action buttons

**Action buttons row** (below header, same padding):

| Button | Label | Background | Border | Icon | Text colour |
|---|---|---|---|---|---|
| Dress cooler | `Dress cooler` | `rgba(14,165,233,0.1)` | `1px solid rgba(14,165,233,0.2)` | `fa-solid fa-temperature-arrow-down`, `8 × 8 px` | `#0369A1` |
| Looks good | `Looks good` | `rgba(16,185,129,0.1)` | `1px solid rgba(16,185,129,0.2)` | `fa-solid fa-check`, `8 × 8 px` | `#047857` |
| Dress warmer | `Dress warmer` | `rgba(249,115,22,0.1)` | `1px solid rgba(249,115,22,0.2)` | `fa-solid fa-temperature-arrow-up`, `8 × 8 px` | `#C2410C` |

All three buttons: `height: 20px`, `border-radius: 9999px`, `padding: 0 10px`, `font-size: 8px`, `font-weight: 600`, `font-family: Inter`, `gap: 6px`.

---

### Mobile

| Property | Value |
|---|---|
| Size | `151 × 48 px` |
| Position | The mock places the widget to the right of the temperature/condition block (approximately `top: 133 px, left: 221 px` on the 393 px canvas) because that gap is empty at that fixed size. In the live app, use that as the preferred slot but verify at render time that the widget does not overlap the mascot image below or any clothing icon card. If a clothing icon occupies that space at the current height, shift the widget downward until it clears all content. Never render it on top of the mascot, any clothing tile, the umbrella, the temperature text, or the condition badge. |
| Background | `rgba(255, 255, 255, 0.4)` with `backdrop-filter: blur(12px)` |
| Border | `1px solid rgba(103, 63, 49, 0.1)` |
| Border-radius | `6px` |
| Shadow | `0px 4px 20px 0px rgba(23, 26, 31, 0.09)` |

#### Mobile close button (X)

| Property | Value |
|---|---|
| Size | `14 × 14 px` |
| Position | Top-right corner of the widget, offset `top: -5px; right: -5px` |
| Background | `#FDF4EA` |
| Border | `1px solid #DEE1E6` |
| Border-radius | `9999px` |
| Shadow | `0px 2px 5px rgba(23,26,31,0.09), 0px 0px 2px rgba(23,26,31,0.12)` |
| Icon | `fa-solid fa-xmark`, `8 × 8 px`, colour `#171a1f` at 60% opacity |

#### Mobile widget content

**Header row** (padding `5px 6px 0`):
- Feedback icon — `fa-solid fa-comment-dots`, `12 × 12 px`, colour `#856457`
- Label: **"Adjust next outfit suggestion?"** — `8px`, `font-weight: 500`, colour `#856457`

**Action buttons row** (below header, `padding: 0 1px`):

| Button | Label (mobile) | Background | Border | Icon | Text colour |
|---|---|---|---|---|---|
| Dress cooler | `Cooler` | `rgba(14,165,233,0.1)` | `1px solid rgba(14,165,233,0.2)` | thermometer-arrow-down, `8 × 8 px` | `#0369A1` |
| Looks good | *(icon only — no label)* | `rgba(16,185,129,0.1)` | `1px solid rgba(16,185,129,0.2)` | check, `10 × 10 px` | `#047857` |
| Dress warmer | `Warmer` | `rgba(249,115,22,0.1)` | `1px solid rgba(249,115,22,0.2)` | thermometer-arrow-up, `8 × 8 px` | `#C2410C` |

All mobile buttons: `height: 20px`, `border-radius: 9999px`, `padding: 0 10px`, `font-size: 6px`, `font-weight: 600`. The "Looks good" check-only button has `width: 20px` with no horizontal padding.

---

## State Model

```js
state.feedback = {
  // Key format: "hourly:15" or "10day:0"
  // A key is added to this Set when the user either submits feedback or dismisses
  // (clicks X) for that specific hour/day card.
  hidden: new Set()
};
```

The widget is **visible** when `!state.feedback.hidden.has(currentKey)`.

`currentKey` = `` `${state.tab}:${state.activeIndex}` `` where `state.tab` is `"hourly"` or `"10day"` and `state.activeIndex` is the currently active hour (0–23) or day (0–9).

---

## Visibility Rules

| Event | Widget behaviour | Outfit / offset behaviour |
|---|---|---|
| Page load / city selected (initial) | Widget visible (using default `currentKey` — `"hourly:15"`) | — |
| User clicks a different hour card | Widget becomes visible for the new key (if not already hidden) | — |
| User clicks a different day card (10-day tab) | Widget becomes visible for the new key (if not already hidden) | — |
| User clicks the X (close) button | Add `currentKey` to `state.feedback.hidden`; hide the widget. **No** success notification. | — (offset unchanged) |
| **Dress cooler** | Add `currentKey` to `state.feedback.hidden`; hide the widget. Show the success toast. | `sensitivityOffset = clamp(sensitivityOffset − 1, −2, +2)`. Main page re-renders → mascot + clothing cards shift one level lighter (or stay the same if clamped). |
| **Looks good** | Add `currentKey` to `state.feedback.hidden`; hide the widget. Show the success toast. | No change to offset. No outfit re-render needed. |
| **Dress warmer** | Add `currentKey` to `state.feedback.hidden`; hide the widget. Show the success toast. | `sensitivityOffset = clamp(sensitivityOffset + 1, −2, +2)`. Main page re-renders → mascot + clothing cards shift one level heavier (or stay the same if clamped). |
| User returns to a key already in `hidden` | Widget stays hidden. | — |

---

## Logic — Effect of Each Button

The widget's three action buttons are all wired to the same `state.userPrefs.sensitivityOffset` that the Preferences slider writes to. The button click updates the offset (within the slider's range), then a single main-page render swaps the mascot and clothing icons to the new effective outfit.

### Pseudo-code

```js
function onSubmit(direction) {
  const state = window.SkyDress.state;
  if (direction === "warmer") {
    state.userPrefs.sensitivityOffset = Math.min(
      state.userPrefs.sensitivityOffset + 1,
      +2,
    );
  } else if (direction === "cooler") {
    state.userPrefs.sensitivityOffset = Math.max(
      state.userPrefs.sensitivityOffset - 1,
      -2,
    );
  }
  // "good" leaves the offset unchanged.

  state.feedback.hidden.add(currentKey());
  showFeedbackToast();
  window.SkyDress.app.render(); // re-renders mascot + clothing for the new effective outfit
}
```

### Direction reference

| Button | Direction | Offset change | Outfit direction |
|---|---|---|---|
| Dress cooler | "cooler" | `−1` (clamped at `−2`) | Lighter outfit (toward Very Hot) |
| Looks good | "good" | none | Unchanged |
| Dress warmer | "warmer" | `+1` (clamped at `+2`) | Heavier outfit (toward Very Cold) |

### Edge cases

- **Offset already at the slider extreme.** If `sensitivityOffset === +2` and the user clicks Dress warmer, the offset stays at `+2` (silent no-op). Same for `−2` + Dress cooler. The success toast still appears so the user gets feedback that their input was received.
- **Effective outfit clamps at the array bounds.** The effective outfit is `clamp(baseIndex + sensitivityOffset, 0, 6)`. So if the current hour's base outfit is Very Hot (index 0) and the user clicks Dress cooler, the offset may decrement (e.g. `0 → −1`), but the displayed outfit stays Very Hot because `clamp(0 + (−1), 0, 6) = 0`. The cooler preference becomes visible only on hours/days whose base outfit is heavier and where `baseIndex + offset` lands inside the array.
- **Persistence to the slider.** Because the widget writes to the same `state.userPrefs.sensitivityOffset` that the Preferences slider reads, opening Preferences after giving "Dress warmer" feedback shows the slider visibly moved one notch toward "Always cold". This is intentional — one preference, two surfaces.
- **Log out.** `doLogout()` resets `sensitivityOffset` to `0` along with the other prefs. Any feedback applied during the session is lost.

---

## Success Notification

### Copy

> **"Your outfits just got more personal."**
> Thanks for the feedback — we'll keep fine-tuning your suggestions.

Two-line layout: the first line is the primary message (bold), the second is the supporting detail (lighter weight). Use the same copy for all three action buttons.

### Visual spec

| Property | Value |
|---|---|
| Position | Fixed, top-right corner of the viewport: `position: fixed; top: 24px; right: 24px` (desktop) / `top: 16px; right: 16px` (mobile) |
| z-index | Above all page content (`z-index: 9999`) |
| Width | `max-width: 280px` (desktop); `max-width: 240px` (mobile) |
| Background | `rgba(255, 255, 255, 0.92)` with `backdrop-filter: blur(16px)` |
| Border | `1px solid rgba(103, 63, 49, 0.15)` |
| Border-radius | `14px` |
| Shadow | `0px 8px 24px rgba(23,26,31,0.14), 0px 0px 2px rgba(23,26,31,0.08)` |
| Padding | `12px 16px` |
| Icon | `fa-solid fa-circle-check`, `20 × 20 px`, colour `#10B981` (green), displayed left of text |
| Primary text | `"Your outfits just got more personal."` — `13px`, `font-weight: 700`, colour `#431407` |
| Secondary text | `"Thanks for the feedback — we'll keep fine-tuning your suggestions."` — `11px`, `font-weight: 400`, colour `rgba(103,63,49,0.75)` |
| Gap between icon and text block | `10px` |
| Appearance animation | Slide in from the right: `translateX(calc(100% + 24px)) → translateX(0)`, duration `250ms`, easing `ease-out` |
| Dismiss animation | Fade out + slide right: `opacity 1 → 0` + `translateX(0 → 20px)`, duration `200ms` |
| Auto-dismiss | 5 000 ms after the notification appears, trigger the dismiss animation then remove from DOM |

Only one notification is shown at a time. If the user triggers feedback again before the previous notification has dismissed, reset the 5-second timer on the existing notification (do not stack multiple toasts).

---

## Implementation Notes

- The widget is rendered inside the **main content area**, not as a fixed overlay, so it scrolls with the page on mobile if the page is taller than the viewport.
- On desktop the widget uses `position: absolute` within the mascot/hero wrapper. The decorative oval shadow sits beneath it at the same horizontal centre. The governing rule is that it must occupy **empty space only** — if the intended slot is occupied by a clothing icon card or any other element, shift the widget (right, left, or below the mascot group) until it is clear of all content.
- On mobile the widget sits inside the hero group in the first available gap near the temperature display. It must **not** overlap the mascot image, any clothing tile, the umbrella, or any metric text. If the available gap is too narrow, render the widget as a full-width bar directly below the mascot image instead.
- The widget is only rendered for authenticated users (`state.auth.loggedIn === true`). Logged-out users on the landing page do not see the feedback widget.
- The `state.feedback.hidden` Set is reset on page load (not persisted between sessions). This means the widget reappears every time the user refreshes the page, matching the "once per session" intent described in the project overview.

---

## States to Cover

| State | Description |
|---|---|
| Widget visible | Default on page load for the active hour/day |
| Widget dismissed (X) | User clicked X — widget hidden, no notification, offset unchanged |
| **Submitted — Dress cooler (mid-range)** | Widget hidden, toast shown, `sensitivityOffset` decremented by 1, **mascot + clothing cards visibly shift one level lighter on the main page** |
| **Submitted — Dress cooler (already at `−2`)** | Widget hidden, toast shown, offset stays `−2`, displayed outfit unchanged (silent no-op) |
| **Submitted — Dress cooler (already on Very Hot)** | Offset may decrement, but displayed outfit stays Very Hot (array clamp) — verifiable by opening Preferences and seeing the slider moved |
| Submitted — Looks good | Widget hidden, toast shown, offset & outfit unchanged |
| **Submitted — Dress warmer (mid-range)** | Widget hidden, toast shown, `sensitivityOffset` incremented by 1, **mascot + clothing cards visibly shift one level heavier on the main page** |
| **Submitted — Dress warmer (already at `+2`)** | Widget hidden, toast shown, offset stays `+2`, displayed outfit unchanged (silent no-op) |
| **Submitted — Dress warmer (already on Very Cold)** | Offset may increment, but displayed outfit stays Very Cold (array clamp) — verifiable by opening Preferences and seeing the slider moved |
| Toast auto-dismiss | Toast slides out after 5 s |
| Switch to new hour | Widget re-appears if that hour's key is not in `hidden`. **Effective outfit for that hour reflects the cumulative `sensitivityOffset`** from prior feedback/slider changes. |
| Switch to new day | Widget re-appears if that day's key is not in `hidden`. Same offset-aware outfit selection applies. |
| Previously dismissed hour | Widget stays hidden when returning to a key already in `hidden` |
| **Feedback → Preferences round-trip** | After clicking Dress warmer, opening Preferences shows the slider one notch toward "Always cold"; after clicking Dress cooler, one notch toward "Always warm" |
| Logged-out user | Widget is not rendered at all |
| **Log out resets offset** | After logout, `sensitivityOffset` returns to `0` (per `docs/06`); any prior feedback is lost |
