# 06 — Profile & Settings

Profile pill, dropdown, three settings panels (My Profile, Preferences, Notifications), and the Discard dialog.

Each section lists the Visily mock(s) it was measured from. All mocks are in `visily-design-mocks/extended-version/` — open the referenced file alongside this doc and treat its pixel values as ground truth.

---

## Responsive Design Philosophy

The HTML mocks are fixed-canvas Visily exports (1440 px desktop, 393 px mobile). They use absolute pixel positioning, which is a Visily artifact — **not** an instruction to hard-code those positions in the implementation.

Build the app as a fluid, resizable prototype:

- Extract **design tokens** from the mocks as exact values: colors, font sizes, font weights, border-radius, box shadows, gap/padding sizes.
- For **layout**: use flexible CSS — flexbox, percentage widths, `max-width`, viewport units — so the UI scales smoothly between 393 px and 1440 px and beyond.
- The **600 px breakpoint** is the dividing line: below it use mobile token sizes; at or above it use desktop token sizes. Both sets of tokens come from their respective mock canvases.
- Absolute pixel positions in the mock HTML (e.g. `left-[285px]`, `top-[60px]`) are reference points that show the intended visual relationship between elements, not hard constraints.
- Container dimensions tied to the canvas (e.g. the `389 px` panel on a 1440 px canvas, or the full-width mobile panel on a 393 px canvas) should be expressed as fixed widths on desktop (`width: 389px; right: 0`) and `width: 100%` on mobile — not as hard-coded `left` positions.

**Settings-specific layout rules:**
- The settings panel is `389 px` wide and anchored to the right edge at `≥ 600 px`. At `< 600 px` it takes the full viewport width.
- The dropdown is `182 px` wide at all breakpoints — it does not stretch.
- The inner usable width of every panel card is `352 px` on desktop. On mobile the same `352 px` fits within the full-screen panel with 20 px padding on each side — no token changes needed.
- The confirmation dialogs (Discard, Log Out) are centered in the **remaining viewport area** to the left of the open panel on desktop. On mobile they are centered in the full viewport.

---

## Table of Contents

1. [Profile Pill — Header Trigger](#1-profile-pill--header-trigger)
2. [Dropdown Menu](#2-dropdown-menu)
3. [Panel Shell — Shared Anatomy](#3-panel-shell--shared-anatomy)
4. [My Profile Panel](#4-my-profile-panel)
5. [Preferences Panel](#5-preferences-panel)
6. [Notifications Panel](#6-notifications-panel)
7. [Discard Unsaved Changes Dialog](#7-discard-unsaved-changes-dialog)
8. [Navigation & Routing Behavior](#8-navigation--routing-behavior)
9. [Mock State Model](#9-mock-state-model)
10. [States to Cover](#10-states-to-cover)

---

## 1. Profile Pill — Header Trigger

**Visily references:**
- Desktop: `visily-static-mainpagewithprofile_web-html/index.html`
- Mobile: `visily-static-mainpagewithprofile_mobile-html/index.html`

The profile pill is **always visible** in the top-right corner of the header. Its appearance and the dropdown it opens differ based on auth state.

Clicking or tapping the pill opens the dropdown. Clicking it again (or clicking outside) closes it.

### Logged-out state

A gray guest icon — no initials, no orange fill. Clicking it opens a minimal dropdown with only Sign In and Sign Up options (see [Section 2 — Logged-out dropdown](#logged-out-dropdown)).

| Property | Desktop | Mobile |
|---|---|---|
| Circle size | 40 × 40 px | 30 × 30 px |
| Circle background | `#E5E7EB` (gray-200) | same |
| Icon | `Lucide_user` centered, `#9CA3AF` (gray-400) | same |
| Pill background | `rgba(243,244,246,0.5)` | — |
| Pill size | 80 × 40 px | 71 × 30 px |

### Logged-in state

Orange circle with the user's initial. Clicking opens the full settings dropdown (see [Section 2 — Logged-in dropdown](#logged-in-dropdown)).

| Property | Desktop | Mobile |
|---|---|---|
| Circle size | 40 × 40 px | 30 × 30 px |
| Circle background | `#ED702D` | same |
| Initials | Inter 14px 700 white — first letter of `state.auth.user.name` | Inter 12px 700 white |
| Pill background | `rgba(243,244,246,0.5)` | — |
| Pill border | `1px solid rgba(234,145,110,0.4)` | — |
| Pill size | 80 × 40 px | 71 × 30 px |

---

## 2. Dropdown Menu

**Visily references:**
- Desktop: `visily-static-mainpagewithprofile_web-html/index.html`
- Mobile: `visily-static-mainpagewithprofile_mobile-html/index.html`

Appears directly below the profile pill when clicked. Closes on outside click or item selection.

### Shared container

| Property | Value |
|---|---|
| Size | 182 × auto (height varies by variant) |
| Background | `rgba(255,255,255,0.4)` + `backdrop-filter: blur(12px)` |
| Border | `1px solid rgba(243,204,188,0.61)` |
| Border-radius | 6 px |
| Box-shadow | `0px 4px 20px rgba(23,26,31,0.09)` |
| Position | Anchored to bottom-right of the profile pill |

### Logged-out dropdown

Shown when `state.auth.loggedIn === false`. Contains only two action buttons — no identity row, no settings nav.

| Element | Spec |
|---|---|
| "Sign In" button | Full-width, `#ED702D` fill, `border-radius: 9999px`, Inter 14px 600 white, navigates to sign-in screen (see `docs/05-auth-signin-signup.md`) |
| "Sign Up" button | Full-width, transparent bg, `border: 1px solid #ED702D`, `border-radius: 9999px`, Inter 14px 600 `#ED702D`, navigates to sign-up screen (see `docs/05-auth-signin-signup.md`) |
| Padding | 12px on all sides, 8px gap between buttons |

### Logged-in dropdown

Shown when `state.auth.loggedIn === true`. Full height: ~272 px.

**User identity row** (top of dropdown):

| Property | Value |
|---|---|
| Row size | 163 × 52 px |
| Background | `rgba(103,63,49,0.04)`, `border-radius: 10px` |
| Avatar | 32 × 32 px circle, `#ED702D` fill, initials Inter 12px 700 white |
| Name text | Inter 14px 600 `#431407` — `state.auth.user.name` |
| Margin | 12px from dropdown edges |

**"SETTINGS" section label:** Inter 11px 700 uppercase `#673F31` 50% opacity, letter-spacing 1px, 12px below identity row.

**Navigation rows** — My Profile · Preferences · Notifications:

| Property | Value |
|---|---|
| Row size | 158 × 36 px |
| Active background | `#F8F3F1`, `border-radius: 6px` |
| Icon | 16 × 16 px Lucide — `Lucide_user` · `Lucide_sliders-vertical` · `Lucide_bell` |
| Icon color | `#673F31` 70% opacity (inactive) / 100% (active) |
| Text | Inter 14px 500 `#673F31` |
| Padding | 10px horizontal |

**Log Out row** — separated by `1px solid #FFEDD5` divider:

| Property | Value |
|---|---|
| Icon | `Lucide_log-out` 16 × 16 px `#EA580C` |
| Text | Inter 14px 500 `#EA580C` |
| Action | Shows the Log Out confirmation dialog (see [Section 7 — Log Out Dialog](#log-out-confirmation-dialog)) |

---

## 3. Panel Shell — Shared Anatomy

**Visily references** (shared shell — consistent across all six panel mocks):
- Desktop baseline: `visily-static-profilesettings_web-html/index.html`
- Mobile baseline: `visily-static-profilesettings_mobile-html/index.html`
- Toggle tokens: `visily-static-preferencessettings_web-html/index.html`
- Section/divider tokens: `visily-static-notificationsettings_web-html/index.html`
- Shell behind dialog: `visily-static-deactivatedialogsettings_web-html/index.html`

All three panels share the same container and header. They slide in from the right over the main weather page.

### Overlay

When a panel is open, the area behind the panel receives a semi-transparent dimming layer:

| Property | Value |
|---|---|
| Background | `rgba(0,0,0,0.2)` |
| Covers | Full viewport |
| Click action | Triggers the "Discard unsaved changes?" dialog if there are pending changes; otherwise closes the panel |

### Panel Container

| Property | Value |
|---|---|
| Width (desktop) | 389 px — expressed as a fixed right-side drawer (anchored `right: 0`) |
| Width (mobile) | 100% of viewport (full-screen) |
| Height | 100vh |
| Background | `rgba(255,255,255,0.7)` + `backdrop-filter: blur(12px)` |
| Box-shadow | `0px 4px 20px rgba(23,26,31,0.09)` |
| Border-left | `1px solid rgba(103,63,49,0.1)` |
| Position | `position: fixed; top: 0; right: 0` — slides in from right |
| Transition | `transform: translateX(0)` when open; `transform: translateX(100%)` when closed |
| Z-index | above the overlay |

**Desktop:** on the 1440 px canvas the left edge sits at 1051px (= 1440 − 389). Implement as `right: 0; width: 389px` — do not hard-code the left position.

### Panel Header

| Property | Value |
|---|---|
| Height | 56 px |
| Background | `rgba(255,255,255,0.4)` + `backdrop-filter: blur(12px)` |
| Bottom border | `1px solid #FFEDD5` |
| Layout | `display: flex; align-items: center; justify-content: space-between; padding: 0 18px` |

#### Close (X) Button

| Property | Value |
|---|---|
| Size | 28 × 28 px |
| Background | `#FDF5F1` |
| Border-radius | 14 px (circle) |
| Icon | `Lucide_x` 12 × 12 px `#EA916E` |
| Action | If unsaved changes exist → show Discard dialog. Otherwise close panel. |

#### Panel Title

| Property | Value |
|---|---|
| Font | Inter 17px 700 |
| Color | `#673F31` |
| Content | "My Profile" / "Preferences" / "Notifications" per panel |

#### Save Changes Button

| Property | Value |
|---|---|
| Size | 113 × 28 px |
| Border-radius | 9999px |
| Font | Open Sans 11px 700 white |
| Text | "Save changes" |

**Enabled state** (`state.panelDirty === true`): background `#ED702D`, cursor pointer. Clicking commits changes, closes panel, shows success notification (see [Section 8 — Saving Changes](#saving-changes)).

**Disabled state** (`state.panelDirty === false`): background `#ED702D` at 40% opacity, `cursor: not-allowed`, `pointer-events: none`. Shows a tooltip on hover:

| Tooltip property | Value |
|---|---|
| Text | "No changes have been made yet." |
| Background | `rgba(67,20,7,0.85)` (`#431407` dark brown at 85%) |
| Color | white |
| Font | Inter 12px 400 |
| Border-radius | 6 px |
| Padding | 6px 10px |
| Position | Below the button, centered |
| Trigger | `mouseenter` on the button wrapper (not the button itself, since it has `pointer-events: none`) |

### Panel Scroll Area

Content below the header scrolls vertically. Padding: 20px horizontal inside the 389 px container (usable inner width: ~352 px on both desktop and mobile).

### Section Labels (above each card group)

| Property | Value |
|---|---|
| Font | Inter 14px 600 |
| Color | `#7C2D12` |
| Text transform | uppercase |
| Letter-spacing | 1.4 px |
| Margin-top | ~24 px from previous element |

### Card Container

| Property | Value |
|---|---|
| Width | 352 px |
| Background | `rgba(255,255,255,1)` |
| Border-radius | 24 px |
| Box-shadow | `0px 2px 5px rgba(23,26,31,0.09), 0px 0px 2px rgba(23,26,31,0.12)` |
| Border | `1px solid #FFEDD5` |
| Padding | 20px internal |

### Row Divider (inside cards)

`1px solid #FFF7ED` — used between rows within a single card.

### Section Divider (between cards / sections)

`1px solid #FFEDD5` — used between card groups or major sections in the scroll area.

### Toggle Component

Used in Preferences and Notifications panels.

| State | Background | Circle position |
|---|---|---|
| ON | `#EA580C` | `left: 19px` |
| OFF | `rgba(103,63,49,0.15)` | `left: 2px` |

Shared props:

| Property | Value |
|---|---|
| Pill size | 36 × 20 px |
| Border-radius | 9999px |
| Circle size | 16 × 16 px |
| Circle color | `#FFFFFF` |
| Circle border-radius | 9999px |
| Transition | `left` 150ms ease |

---

## 4. My Profile Panel

Opened when the user clicks "My Profile" in the dropdown.

**Visily references:**
- Desktop: `visily-static-profilesettings_web-html/index.html`
- Mobile: `visily-static-profilesettings_mobile-html/index.html`

### Avatar

| Property | Value |
|---|---|
| Container | 100 × 100 px circle |
| Default background | `rgba(103,63,49,0.05)` |
| Default border | `2px dashed rgba(103,63,49,0.3)` |
| Center icon (empty state) | `Lucide_camera` 28 × 28 px `#673F31` |
| Layout | Centered horizontally, 32px below header |

**Both the empty state and the filled state open the same image upload flow** (full spec in `docs/05-auth-signin-signup.md`):

- **Empty state** — clicking anywhere on the dashed circle opens the upload flow.
- **Filled state** — the circle shows the uploaded image with no dashed border. A pencil edit button appears at the bottom-right: 28 × 28 px circle, background `#FDF5F1`, icon `Lucide_pencil` 12 × 12 px `#EA916E`. Clicking the pencil (or the image itself) re-opens the upload flow.

The uploaded image is stored as a pending change in `state.pendingAvatar` (a data URL or object URL). It is not applied to `state.auth.user.avatar` until the user clicks "Save changes". On save, the profile pill on the main page switches from the initials circle to the uploaded photo.

### Name Field

| Property | Value |
|---|---|
| Label | "Your Name" Inter 15px 600 `#673F31` at 80% opacity |
| Input size | 318 × 52 px |
| Input background | `rgba(255,255,255,0.6)` |
| Input border-radius | 14 px |
| Input border | `1px solid rgba(237,112,45,0.2)` |
| Input box-shadow | `0px 2px 5px rgba(23,26,31,0.09), 0px 0px 2px rgba(23,26,31,0.12)` |
| Input font | Inter 15px 400 `#431407` |
| Placeholder | `state.auth.user.name` (current name prefilled) |

Changes to the name field are pending until "Save changes" is clicked. On save, `state.auth.user.name` is updated and the profile pill initials re-render.

### Log Out Button

Positioned near the bottom of the panel, separated from the name field by a section divider (`1px solid #FFEDD5`).

| Property | Value |
|---|---|
| Size | 353 × 48 px |
| Background | transparent |
| Border | `1px solid #EA580C` |
| Border-radius | 14 px |
| Icon | `Lucide_log-out` 16 × 16 px `#EA580C` |
| Text | Inter 15px 600 `#EA580C` "Log Out" |
| Action | Shows the Log Out confirmation dialog (see [Section 7 — Log Out Dialog](#log-out-confirmation-dialog)) |

> Log Out is always active. If there are unsaved changes, the Discard dialog appears first — "Leave any way" then shows the Log Out confirmation dialog.

---

## 5. Preferences Panel

Opened when the user clicks "Preferences" in the dropdown.

**Visily references:**
- Desktop: `visily-static-preferencessettings_web-html/index.html`
- Mobile: `visily-static-preferencessettings_mobile-html/index.html`

### Section 1 — Sensitivity Slider

**Section label:** "HOW DO YOU USUALLY FEEL?"

#### Sensitivity Card (352 × 217 px)

| Property | Value |
|---|---|
| Card heading | "How do you usually feel?" Inter 20px 600 `#673F31` center, `letter-spacing: -0.4px` |
| Subtitle | "We'll use this to calibrate your outfit suggestion" Open Sans 13px 500 `#673F31` at 70% opacity, center |

#### Slider Track

| Property | Value |
|---|---|
| Width | 294 px (from ~29px to ~323px within card) |
| Height | 4 px |
| Background (unfilled) | `#FEF4EC` |
| Background (filled portion) | `#F48525` (fills from left to current handle position) |
| 5 snap dots | 6 × 6 px circles at equal intervals (x ≈ 29, 101, 173, 245, 317) |
| Dot color — filled | `#F48525` |
| Dot color — unfilled | `#FEF4EC` |

#### Handle

| Property | Value |
|---|---|
| Size | 18 × 18 px |
| Background | `#FFFFFF` |
| Border | `3px solid #F48525` |
| Border-radius | 9999px |
| Snap positions | Snaps to the 5 dot x-positions on release |

#### Icons (below track)

5 icons spaced below the snap positions (18 × 18 px each, `y ≈ 146` within card):

| Position | Icon | Key |
|---|---|---|
| 1 (leftmost) | `fa-snowflake` | Always cold |
| 2 | `fa-cloud-sun` | Usually cold |
| 3 (center) | `fa-temperature-half` | Average |
| 4 | `fa-sun` | Usually warm |
| 5 (rightmost) | `fa-fire` (flame) | Always warm |

- **Active icon** (current position): `#F48525`, full opacity
- **Inactive icons**: `#673F31` at 60% opacity

#### Labels (below icons)

Open Sans 10px center. Active label: 700 weight `#F48525`. Inactive labels: 500 weight `#673F31` at 60% opacity.

| Position | Label |
|---|---|
| 1 | "Always cold" |
| 2 | "Usually cold" |
| 3 | "Average" |
| 4 | "Usually warm" |
| 5 | "Always warm" |

#### Sensitivity → `sensitivityOffset` Mapping

`sensitivityOffset` is an **outfit-level shift** (number of steps along the 7-level outfit array, light → heavy), not a temperature offset. A positive value moves the suggested outfit toward heavier clothing; a negative value moves it toward lighter clothing.

| Slider position | Label | `sensitivityOffset` | Effect on the suggested outfit |
|---|---|---|---|
| 1 (leftmost) | Always cold | `+2` | Two levels heavier than the raw Feels Like reading (user feels cold → dress warmer) |
| 2 | Usually cold | `+1` | One level heavier |
| 3 (center) | Average | `0` | Outfit matches the raw Feels Like reading (default) |
| 4 | Usually warm | `−1` | One level lighter |
| 5 (rightmost) | Always warm | `−2` | Two levels lighter (user feels warm → dress cooler) |

**Default state:** position 3 (Average, offset = 0).

**Effect on the main page (on Save):**
1. Write the new value to `state.userPrefs.sensitivityOffset`.
2. Re-render the main page. The mascot zone re-computes the effective outfit as `clamp(baseIndex + sensitivityOffset, 0, 6)` against the active hour/day's Feels Like.
3. The mascot PNG and the floating clothing-icon cards update to the new outfit; the umbrella (rain-based, not offset-based) is unaffected.

The offset is also nudged by ±1 each time the user clicks Dress warmer / Dress cooler in the feedback widget (`docs/07`), so the slider is the **shared source of truth** between the Preferences panel and the feedback widget — opening Preferences after giving feedback shows the slider in its new position.

**Clamping:** the effective outfit index is always clamped to `[0, 6]`. If `baseIndex + offset` would land outside the range (e.g. a Very Hot base with offset `−2`), the displayed outfit stays pinned at the bound (`Very Hot`). The offset itself is clamped to the slider's range `[−2, +2]`.

---

### Section Divider

`1px solid #FFEDD5` between the two sections.

---

### Section 2 — Metric Visibility Toggles

**Section label:** "WHAT TO SHOW ON YOUR WEATHER PANEL"

#### Metrics Card (352 × 406 px)

Each metric row is 310 × 52 px with a `1px solid #FFF7ED` divider between rows (not after the last row).

Row layout:

| Element | Spec |
|---|---|
| Icon | 20 × 20 px `#7C2D12` at 70% opacity, left edge |
| Label | Open Sans 13px 500 `#673F31`, 32px from left edge |
| Toggle | 36 × 20 px pill, right-aligned at x = 274 within card |

Metrics — in display order, with default ON/OFF state per the Visily mock:

| # | Metric | Icon | Default |
|---|---|---|---|
| 1 | Sunrise & Sunset | `Lucide_sunrise` | **ON** |
| 2 | Moon Phase | `Lucide_moon` | **ON** |
| 3 | UV Index | `Lucide_zap` | **ON** |
| 4 | Air Quality | `Lucide_leaf` | **ON** |
| 5 | Visibility | `Lucide_eye` | **OFF** |
| 6 | Pressure | `Lucide_gauge` | **OFF** |
| 7 | Allergy Outlook | `Lucide_trees` | **ON** |

Each toggle maps to a key in `state.userPrefs.visibleMetrics`:

```js
state.userPrefs.visibleMetrics = {
  sunriseSunset: true,
  moonPhase: true,
  uvIndex: true,
  airQuality: true,
  visibility: false,
  pressure: false,
  allergyOutlook: true
}
```

On save, the main page stats panel re-renders, hiding any card whose key is `false`.

---

## 6. Notifications Panel

Opened when the user clicks "Notifications" in the dropdown.

**Visily references:**
- Desktop: `visily-static-notificationsettings_web-html/index.html`
- Mobile: `visily-static-notificationsettings_mobile-html/index.html`

> All notifications are mock-only — no real push notifications are sent. Toggles are stored in `state.userPrefs.notifications` and affect no real system behavior.

### Section 1 — Morning Reminder

**Section label:** "MORNING REMINDER"

#### Morning Reminder Card (352 × 172 px)

**Top row (toggle row):**

| Element | Spec |
|---|---|
| Icon container | 38 × 40 px, background `#FFEDD5`, `border-radius: 9999px` |
| Icon | `Lucide_bell` 20 × 20 px `#EA580C` centered in container |
| Title | "Morning outfit reminder" Inter 15px 600 `#431407` |
| Subtitle | "Get your daily outfit pick before you get dressed." Inter 12px 400 `#7C2D12` at 70% opacity |
| Toggle | 36 × 20 px, default **ON** (`#EA580C`) |

Toggle key: `state.userPrefs.notifications.morningReminder` (default: `true`).

Row divider: `1px solid #FFEDD5` between top row and time picker row.

**Time picker row:**

| Element | Spec |
|---|---|
| Clock icon | `Lucide_clock` 16 × 16 px `#7C2D12` at 70% opacity |
| "Remind me at" label | Open Sans 13px 500 `#673F31` |
| Time chip | 100 × 30 px, background `rgba(237,112,45,0.1)`, border `1px solid rgba(237,112,45,0.2)`, `border-radius: 9999px` |
| Time value | Inter 13px 600 `#ED702D` — default "7:00 AM" |
| Chevron icon | `Lucide_chevron-down` 12 × 12 px `#ED702D` |

The time chip is tappable. In this prototype, clicking it cycles through a small set of mock times (e.g. 6:00 AM → 7:00 AM → 8:00 AM → 9:00 AM → loop). The selected time is stored in `state.userPrefs.notifications.reminderTime` (default: `"7:00 AM"`).

The time picker row is visually dimmed (`opacity: 0.4`, `pointer-events: none`) when the Morning Reminder toggle is OFF.

---

### Section Divider

`1px solid #FFEDD5` between sections.

---

### Section 2 — Outfit Feedback

**Section label:** "OUTFIT FEEDBACK"

#### Outfit Feedback Card (352 × 117 px)

| Element | Spec |
|---|---|
| Icon container | 38 × 40 px, background `#FFEDD5`, `border-radius: 9999px` |
| Icon | `Lucide_message-circle-warning` 20 × 20 px `#EA580C`, mirrored horizontally (`transform: scaleX(-1)`) |
| Title | "Outfit check-in reminders" Inter 15px 600 `#431407` |
| Subtitle | "A daily nudge to rate how your outfit felt. Each answer fine-tunes your personal suggestions." Inter 12px 400 `#7C2D12` at 70% opacity |
| Toggle | 36 × 20 px, default **ON** (`#EA580C`) |

Toggle key: `state.userPrefs.notifications.outfitFeedback` (default: `true`).

> This toggle controls the notification reminder only (mock). The feedback widget on the main page (`docs/07-outfit-feedback.md`) is independent — it has its own dismiss and is not controlled from here.

---

## 7. Confirmation Dialogs

Two modal dialogs share the same visual style. Both appear over a dimmed backdrop; the panel behind remains visible.

**Visily references (Discard dialog — use as the visual baseline for both):**
- Desktop: `visily-static-deactivatedialogsettings_web-html/index.html`
- Mobile: `visily-static-deactivatedialogsettings_mobile-html/index.html`

### Shared container

| Property | Desktop | Mobile |
|---|---|---|
| Size | 560 × 220 px | 350 × 196 px |
| Background | `rgba(255,255,255,1)` | same |
| Border-radius | 10 px | same |
| Border | `1px solid rgba(103,63,49,0.1)` | same |
| Box-shadow | `0px 0px 2px rgba(23,26,31,0.12), 0px 4px 9px rgba(23,26,31,0.11)` | same |
| Backdrop-filter | `blur(12px)` | same |
| Title font | Inter 24px 700 `#673F31` center | Inter 20px 700 |
| Body font | Inter 16px 400 `#7C2D12` 80% opacity center | same |
| Button divider | `1px solid #FFEDD5` above button row | same |
| Button radius | 9999px | same |
| Button font | Open Sans 14px 700 | Open Sans 11px 700 |

**Desktop position:** centered in the main content area (left of the open panel). `position: fixed; top: 50%; left: calc((100vw - 389px) / 2); transform: translate(-50%, -50%)`. Mobile: centered in viewport.

---

### Discard Unsaved Changes Dialog

Triggered when the user tries to close a panel (X button, overlay click, or Log Out tap) while `state.panelDirty === true`.

| | Text |
|---|---|
| **Title** | "Discard unsaved changes?" |
| **Subtitle** | "You have unsaved changes. If you leave now, they will be lost." |

| Button | Desktop size | Mobile size | Style | Action |
|---|---|---|---|---|
| "Leave any way" | 127 × 36 px | 113 × 28 px | White bg, `1px solid #ED702D` border, `#ED702D` text | Discard changes, close panel |
| "Cancel" | 113 × 36 px | 71 × 28 px | `#ED702D` bg, white text | Dismiss dialog, return to panel |

---

### Log Out Confirmation Dialog

Triggered when the user taps Log Out (from the dropdown or My Profile panel Log Out button). If `state.panelDirty === true`, the Discard dialog fires first — "Leave any way" then triggers this dialog.

| | Text |
|---|---|
| **Title** | "Log out?" |
| **Subtitle** | "Your preferences will be reset to defaults. Outfit suggestions and metric visibility will return to standard settings." |

| Button | Desktop size | Mobile size | Style | Action |
|---|---|---|---|---|
| "Log Out" | 127 × 36 px | 113 × 28 px | White bg, `1px solid #ED702D` border, `#ED702D` text | Calls `logout()` |
| "Cancel" | 113 × 36 px | 71 × 28 px | `#ED702D` bg, white text | Dismiss dialog, no action |

**`logout()` does the following — no navigation away from the main page:**
1. `state.auth = { loggedIn: false, user: null }`
2. Reset `state.userPrefs` to defaults (all `visibleMetrics` back to their defaults, `sensitivityOffset = 0`, notification toggles reset)
3. Hide the outfit feedback widget for this session
4. Profile pill reverts to the gray guest icon; clicking it now shows the Sign In / Sign Up dropdown
5. The main weather page remains visible and functional — city, weather data, mascot, and forecast are unchanged

---

## 8. Navigation & Routing Behavior

### Opening a panel

Pill click → dropdown. Nav item click → dropdown closes, panel slides in from the right, overlay appears. Only one panel open at a time.

### Unsaved changes

Track with `state.panelDirty`. Set to `true` when any field in the open panel differs from its saved value (name, avatar, metric toggles, slider position, notification toggles, reminder time). Reset to `false` on open and on save.

### Closing a panel

- `panelDirty === false` → close immediately.
- `panelDirty === true` → show Discard dialog. "Leave any way" discards and closes; "Cancel" returns to the panel.

### Saving changes

1. Write pending values to `state.userPrefs` (and `state.auth.user` for profile fields).
2. `panelDirty = false`, close panel and overlay.
3. Re-render affected main-page components: pill initials, stats panel cards (metric visibility), **and the mascot zone** — because `state.userPrefs.sensitivityOffset` is now part of the outfit-selection input, any change to the slider re-resolves the effective outfit (`clamp(baseIndex + sensitivityOffset, 0, 6)`) and swaps the mascot PNG + clothing icon cards accordingly.
4. Show the success notification in the top-right corner (see below).

#### Success notification

Appears in the top-right corner of the viewport immediately after the panel closes. Auto-dismisses after 3 seconds. Can also be dismissed by clicking it.

| Property | Value |
|---|---|
| Position | `position: fixed; top: 24px; right: 24px` |
| Size | ~280 px wide, height auto |
| Background | `rgba(255,255,255,0.95)` + `backdrop-filter: blur(12px)` |
| Border | `1px solid rgba(103,63,49,0.12)` |
| Border-radius | 14 px |
| Box-shadow | `0px 4px 20px rgba(23,26,31,0.12)` |
| Icon | `Lucide_circle-check` 20 × 20 px `#EA580C` |
| Title | "Settings saved" — Inter 15px 600 `#431407` |
| Subtitle | "Your changes have been applied." — Inter 13px 400 `#7C2D12` 70% opacity |
| Padding | 14px 16px |
| Layout | Icon left, text right, flex row aligned center |
| Entry animation | Slide in from the right (`translateX(110%)` → `translateX(0)`), 200ms ease-out |
| Exit animation | Fade out + slide right, 200ms ease-in |

### Log Out

1. If `state.panelDirty === true`: show Discard dialog first. "Leave any way" then proceeds to step 2.
2. Show Log Out confirmation dialog (Section 7). "Cancel" dismisses; "Log Out" calls `logout()`.
3. `logout()` resets auth and prefs, hides feedback widget, reverts pill to gray guest icon. **The app stays on the main weather page** — no navigation to an auth screen.

---

## 9. Mock State Model

### `state.auth`

```js
state.auth = {
  loggedIn: false,        // true after sign-in / sign-up
  user: null              // null when logged out
  // When logged in:
  // user: { name: "Anastasiia", avatar: null }
  //   avatar: null = show initials; string = preset avatar key
}
```

`logout()` sets `state.auth = { loggedIn: false, user: null }` and resets `state.userPrefs` to defaults (see below).

### `state.userPrefs`

```js
state.userPrefs = {
  // Outfit-level shift applied on top of the Feels-Like-based base outfit.
  // Range: -2 .. +2 (5 slider positions). Positive = heavier outfit.
  sensitivityOffset: 0,   // integer: -2 / -1 / 0 / +1 / +2

  // Stat panel card visibility
  visibleMetrics: {
    sunriseSunset:   true,
    moonPhase:       true,
    uvIndex:         true,
    airQuality:      true,
    visibility:      false,
    pressure:        false,
    allergyOutlook:  true
  },

  // Notifications (mock only)
  notifications: {
    morningReminder: true,
    reminderTime:    "7:00 AM",
    outfitFeedback:  true
  }
}
```

### `state.panelDirty`

```js
state.panelDirty = false;  // true when open panel has unsaved changes
```

### `sensitivityOffset` scope

`state.userPrefs.sensitivityOffset` is the **single source of truth** for the outfit-level shift across the prototype:

- Set via the slider in the Preferences panel (this doc).
- Nudged ±1 by the **Dress warmer** / **Dress cooler** buttons on the feedback widget (`docs/07`).
- Read every render by the mascot zone to resolve the displayed outfit (`docs/04`, section 1).
- Reset to `0` on log out (see Section 7 — Log Out Dialog).
- Persists for the session only — no localStorage; a page refresh restores `0`.

The slider's range is `[−2, +2]`. The feedback widget enforces the same clamp so the offset never escapes the slider's visible range.

---

## 10. States to Cover

All of the following must be demonstrable in the prototype:

### Profile Pill & Dropdown

- [ ] Logged-out: pill shows gray circle with guest icon
- [ ] Logged-out dropdown: Sign In and Sign Up buttons only
- [ ] Sign In button navigates to sign-in screen (`docs/05`)
- [ ] Sign Up button navigates to sign-up screen (`docs/05`)
- [ ] Logged-in: pill shows orange circle with correct initial
- [ ] Logged-in dropdown: identity row, 3 nav items, Log Out
- [ ] Dropdown closes on outside click
- [ ] Log Out → shows Log Out confirmation dialog (not the Discard dialog)
- [ ] "Cancel" in Log Out dialog dismisses without action
- [ ] "Log Out" in dialog: stays on main page, pill reverts to gray, feedback widget hidden, all metric toggles reset to defaults

### My Profile Panel

- [ ] Empty avatar state: dashed circle with camera icon
- [ ] Clicking empty avatar opens image upload flow (spec in `docs/05`)
- [ ] Filled avatar state: image displayed, pencil button at bottom-right
- [ ] Clicking pencil (or image) re-opens upload flow
- [ ] Uploaded image shown as preview inside the circle before saving
- [ ] "Save changes" writes image to `state.auth.user.avatar`; profile pill switches from initials to photo
- [ ] Name field prefilled with current name
- [ ] Pending change detected when name is edited
- [ ] "Save changes" updates `state.auth.user.name` and refreshes pill
- [ ] Log Out button shows Log Out confirmation dialog

### Preferences Panel

- [ ] Slider at each of the 5 positions (Always cold / Usually cold / Average / Usually warm / Always warm)
- [ ] Active icon and label highlighted at current position
- [ ] Filled track segment updates as slider moves
- [ ] All 7 metric toggles showing correct ON/OFF default
- [ ] Each metric toggle individually flippable
- [ ] Saving metric toggles hides/shows cards on main stats panel
- [ ] **Saving the sensitivity slider shifts the displayed outfit on the main page** — e.g. with Feels Like = 14 °C (base Cool), saving "Always cold (+2)" must switch the mascot to Freezing; saving "Always warm (−2)" must switch it to Warm
- [ ] Outfit shift clamps at the array bounds — e.g. on a Very Hot day, "Always warm (−2)" still shows Very Hot (clamped at index 0); on a Very Cold day, "Always cold (+2)" still shows Very Cold (clamped at index 6)
- [ ] Slider position reflects the current `sensitivityOffset` when the panel opens, including any nudges from the feedback widget since the last open

### Notifications Panel

- [ ] Morning Reminder toggle ON (default)
- [ ] Morning Reminder toggle OFF → time picker row dimmed
- [ ] Time chip cycles through mock times on click
- [ ] Outfit Feedback toggle ON (default)
- [ ] Outfit Feedback toggle OFF

### Discard Dialog

- [ ] Appears when closing panel with unsaved changes (X button or overlay click)
- [ ] Appears before Log Out confirmation if panel has unsaved changes
- [ ] "Cancel" returns to panel without losing changes
- [ ] "Leave any way" discards changes, then proceeds (close panel or show Log Out dialog)
- [ ] Does NOT appear when closing with no pending changes
- [ ] Desktop: centered in main content area (left of panel), not full-viewport center
- [ ] Mobile: centered in viewport

### Log Out Dialog

- [ ] Appears after Log Out is tapped (and after Discard dialog if applicable)
- [ ] "Cancel" dismisses with no changes
- [ ] "Log Out" stays on main weather page — no redirect
- [ ] After logout: `visibleMetrics` reset to defaults (Allergy Outlook, UV Index etc. all back on)
- [ ] After logout: `sensitivityOffset` reset to 0
- [ ] After logout: feedback widget hidden for remainder of session

### Save Button & Notification

- [ ] "Save changes" disabled (40% opacity) on panel open with no edits
- [ ] Hovering the disabled button shows tooltip "No changes have been made yet."
- [ ] "Save changes" enabled (full orange) as soon as any field changes
- [ ] Clicking enabled button closes panel, shows success notification top-right
- [ ] Notification reads "Settings saved" / "Your changes have been applied."
- [ ] Notification auto-dismisses after 3 seconds
- [ ] Notification dismisses immediately on click

### Responsive Layout

- [ ] Desktop: 389 px right-side drawer panel
- [ ] Mobile: full-screen panel
- [ ] Desktop: dropdown anchored to pill, correct 182 × 272 px size
- [ ] Mobile: dropdown same size but pill is 71 × 30 px
