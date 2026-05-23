# 05 — Authentication: Sign In & Sign Up

## Overview

This is a **mock-only** authentication layer. There are no real accounts, no network calls, and no session persistence. All state lives in the JS `state.auth` object, which resets on page reload.

The prototype now has a **public landing page** as its entry point. All users start there. Two distinct flows branch from it:

- **Sign In flow** → 1 screen → main page
- **Sign Up flow** → 2 screens (provider choice → profile form) → main page

After authentication, the main weather page behaves exactly as in the original prototype, with the addition of a profile icon in the header (specified in `docs/06-settings-profile.md`).

---

## Navigation Flow

```
App load
  └─► Public Landing Page
        ├─► [SIGN IN button] ──► Sign In Screen
        │                            └─► [Google or Facebook button] ──► index.html (main page)
        │
        └─► [SIGN UP button] ──► Sign Up Screen
                                     └─► [Google or Facebook button] ──► Sign Up Form
                                                                             └─► [Finish Registration — valid] ──► index.html (main page)
```

**URL-based error notification:** If the Sign In or Sign Up screen loads with `?error=true` in the URL (e.g. `?view=signin&error=true`), an error toast appears in the top-right corner. See [Error Notification](#error-notification) below.

---

## Mock State

```js
state.auth = {
  loggedIn: false,
  user: null
};

// After sign-in (via Google/Facebook on sign-in screen):
state.auth = {
  loggedIn: true,
  user: {
    name: 'User',          // default display name for sign-in path
    avatar: null,          // no avatar for sign-in path
    sensitivityOffset: 0   // default: "Average"
  }
};

// After sign-up (via Finish Registration):
state.auth = {
  loggedIn: true,
  user: {
    name: '<value from name field>',
    avatar: '<data URL of uploaded image, or null if skipped>',
    sensitivityOffset: <integer, see slider table below>
  }
};
```

`sensitivityOffset` value mapping from the sign-up slider:

| Slider position | Label | sensitivityOffset |
|---|---|---|
| 1 (leftmost) | Always cold | −4 |
| 2 | Usually cold | −2 |
| 3 (default) | Average | 0 |
| 4 | Usually warm | +2 |
| 5 (rightmost) | Always warm | +4 |

The offset is stored but **does not affect outfit display** in this prototype. It will be used in the settings screen (doc 06).

---

## Multi-page Routing

All screens are implemented as JS-controlled view containers inside a single `index.html`. The `state.view` field controls which container is visible. Values:

| `state.view` | Screen shown |
|---|---|
| `'public'` | Public landing page |
| `'signin'` | Sign In screen |
| `'signup'` | Sign Up provider screen |
| `'signupform'` | Sign Up form |
| `'main'` | Main weather page (original app) |

On app load, `state.view = 'public'` (unless `state.auth.loggedIn` is true from a prior in-session sign-in, in which case jump straight to `'main'`).

Navigation is plain JS: hide all containers, show the target one, update `state.view`. No page reload occurs between views except for the Reload button in the error toast.

---

## Responsive Rules (all auth screens)

Auth screens share the same responsive breakpoint as the rest of the app: **600 px**.

- `< 600px` — **mobile layout**: single-column, full-width elements, stacked buttons, smaller type
- `≥ 600px` — **desktop layout**: multi-column, centred content blocks, side-by-side buttons

Mocks are fixed-canvas exports (1440×900 desktop, 393×852 mobile). Extract design tokens (colours, font sizes, border-radius, shadows) as exact values. Use `max-width`, flexbox, and percentage widths so the layout fills any viewport width smoothly. Do not hard-code absolute pixel positions from the mocks.

---

## Screen 1 — Public Landing Page

**Mocks:**
- Desktop: `visily-design-mocks/extended-version/visily-static-publickpage_web-html/index.html`
- Mobile: `visily-design-mocks/extended-version/visily-static-publickpage_mobile-html/index.html`

### Background & Shell

Full-viewport gradient background (same as the main app):
```
background: linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%);
```

### Header

Sticky header strip at the top. Left-aligned logo:
- 32×32 px circle, `background: #673F31`, `border-radius: 50px`
- Inside: sun icon (22×22 px, white) — use `fa-solid fa-sun` (FA6) or the existing `IMG_1.svg` from mock assets
- "SkyDress" wordmark: Inter 20 px, weight 700, `#673F31`, vertically centred beside the icon

No navigation links in the header on this page.

### Hero Section

Centred on the page, vertically middle-ish:

**Headline:** "Your closet, weather-approved"
- Font: Archivo, 56 px desktop / 32 px mobile, weight 900, `#673F31`
- `text-align: center`
- `letter-spacing: -1px` (mobile)
- Desktop: single line; mobile: wraps onto two lines ("Your closet," / "weather-approved")

**Subheadline:** "Create a free account and start every morning knowing exactly what to put on."
- Font: Archivo 30 px desktop / Inter 14 px mobile, weight 700 desktop / 600 mobile, `#673F31` at 80% opacity
- `text-align: center`
- Desktop: max-width ~743 px; mobile: full width with 43 px side padding

### Feature Cards

Three cards presenting app benefits.

**Desktop:** cards in a horizontal row, equal width (~342 px each), 12 px gap between them.
**Mobile:** cards stacked vertically, full width (342 px), 12 px vertical gap.

Each card:
- `background: rgba(255,255,255,0.3)`
- `border-radius: 16px`
- `border: 1px solid rgba(103,63,49,0.1)`
- `backdrop-filter: blur(4px)`
- Height: 97 px
- Padding: 16–17 px all sides
- Icon container: 40×40 px, `border-radius: 16px`, `background: rgba(103,63,49,0.05)`
  - Icon inside: 20×20 px, `#673F31`
- Title: Inter 15 px, weight 700, `#673F31`
- Description: Inter 13 px, weight 400, `#673F31` at 70% opacity, `line-height: 21px`

| # | Icon | Title | Description |
|---|---|---|---|
| 1 | `fa-cloud-sun` | Daily outfit picks | Personalized based on real-time local weather data. |
| 2 | `fa-location-dot` | Your city, saved | Hyper-local forecasts for your exact neighborhood. |
| 3 | `fa-clock` | Morning reminder | Push notifications so you never overthink it again. |

### Decorative Mascot Illustrations

Two mascot images are placed decoratively near the edges of the page. They are purely visual, not interactive.

- **Warm-weather mascot** (bottom-right on desktop, behind CTA area on mobile): rotated ~12°, 85–95% opacity
- **Cold-weather mascot** (bottom-left on desktop, below buttons on mobile): rotated ~21°, horizontally flipped (`transform: scaleX(-1)`), 85% opacity

Both use existing mascot PNG assets. On mobile, they sit below the buttons to fill vertical space; on desktop, they flank the CTA group at the bottom.

### Call-to-Action Buttons

The two primary action buttons are grouped together, centred below the mascot illustration area.

**Desktop:** buttons are side by side with ~24 px gap.
**Mobile:** buttons are stacked vertically, each full-width (342 px), with ~12 px vertical gap between them.

**SIGN UP button** (primary):
- Background: `#ED702D`
- `border-radius: 9999px` (pill)
- `box-shadow: 0px 10px 20px 0px rgba(237,112,45,0.4)`
- Text: "SIGN UP", Inter 18 px, weight 600 desktop / 700 mobile, white
- Desktop size: ~192×52 px; mobile: full-width × 56 px
- Action: navigate to Sign Up screen (`state.view = 'signup'`)

**SIGN IN button** (secondary):
- Background: `#EA916E`
- Same pill shape and shadow pattern as SIGN UP (using `#EA916E` shadow colour)
- Text: "SIGN IN", same typography, white
- Desktop size: ~178×52 px; mobile: full-width × 56 px
- Action: navigate to Sign In screen (`state.view = 'signin'`)

**Caption below buttons:** "Free forever · No credit card · Cancel anytime"
- Inter 14 px desktop / 13 px mobile, weight 400 desktop / 500 mobile, `#673F31` at 60% opacity
- `text-align: center`

### Decorative Bottom Card

A frosted card sits at the very bottom of the viewport, partially visible, hinting at the app's output.

- `background: rgba(255,255,255,0.4)`
- `border-radius: 32px 32px 0 0` (rounded top only)
- `backdrop-filter: blur(24px)`
- `box-shadow: 0px -10px 40px 0px rgba(0,0,0,0.05)`
- Desktop: ~600 px wide, centred; mobile: ~342 px, centred with 24 px side margin
- Content (purely decorative, not interactive):
  - Heart icon in a small rounded square (48×48 px, `#673F31` at 10% opacity background)
  - "🧥 Today's pick: light jacket + jeans" — Archivo 18 px desktop / 17 px mobile, weight 800–900, `#673F31`
  - "14°C and breezy in Kyiv" — Inter 14 px desktop / 12 px mobile, `#673F31` at 60–70% opacity
  - Two skeleton pill shapes at the bottom (80×8 px and 48×8 px rectangles, `#673F31` at 10% opacity, fully rounded) — represent loading placeholders visually

---

## Screen 2 — Sign In

**Mocks:**
- Desktop: `visily-design-mocks/extended-version/visily-static-signin_web-html/index.html`
- Mobile: `visily-design-mocks/extended-version/visily-static-signin_mobile-html/index.html`

### Background & Shell

Same full-viewport gradient background. Same header logo as the landing page.

### Decorative Mascot Illustrations

Same two mascot images as the landing page, positioned similarly near the edges. On desktop, the warm-weather mascot sits top-right with a sun icon overlay (48 px, `#ED702D`), and the cold-weather mascot sits bottom-left with a snowflake overlay (52 px, orange-amber tone). On mobile, the warm mascot is visible at top-right; the cold mascot appears below the buttons.

### Content Block (centred)

**Desktop:** content block is centred horizontally in the left-to-centre region (not full width, approximately 498 px wide), positioned roughly in the vertical centre of the viewport.

**Mobile:** content block is centred, starting at roughly 45% down the viewport.

**Headline:** "Welcome back!"
- Font: Archivo, 56 px desktop / 44 px mobile, weight 900 desktop / 800 mobile, `#673F31`
- `letter-spacing: -1.1px` (mobile)
- `text-align: center`

**Subheadline:** "Your personalized weather-based wardrobe awaits."
- Inter 18 px, weight 500, `#673F31` at 80% opacity
- `text-align: center`
- Desktop: max-width ~446 px; mobile: ~294 px

### OAuth Buttons

Two buttons, separated by ~12 px gap.

**Desktop:** side by side.
**Mobile:** stacked vertically, each full-width (342 px), 12 px gap.

**Sign in with Google:**
- Border: `1px solid #ED702D`; no background fill
- Text: "Sign in with Google", Inter 16 px, weight 400 desktop / 600 mobile, `#ED702D`
- Google icon (coloured Google "G" logo, 20×16 px) left of text, 6–12 px gap
- Desktop: ~210×44 px, `border-radius: 6px`; mobile: 342×56 px, `border-radius: 16px`
- **Action:** immediately navigate to main page (`state.view = 'main'`, `state.auth.loggedIn = true`, `state.auth.user = { name: 'User', avatar: null, sensitivityOffset: 0 }`)

**Sign in with Facebook:**
- Border: `1px solid #455EA9`; no background fill
- Text: "Sign in with Facebook", Inter 16 px, weight 400 desktop / 600 mobile, `#455EA9`
- Facebook icon (20×20 px) left of text
- Desktop: ~231×44 px, `border-radius: 6px`; mobile: 342×56 px, `border-radius: 16px`
- **Action:** same as Google button — immediately navigate to main page with the same default user state

Both buttons produce identical behaviour regardless of which is clicked. Neither opens any external URL or dialog.

---

## Screen 3 — Sign Up (Provider Choice)

**Mocks:**
- Desktop: `visily-design-mocks/extended-version/visily-static-signup_web-html/index.html`
- Mobile: `visily-design-mocks/extended-version/visily-static-signup_mobile-html/index.html`

This screen is visually identical to the Sign In screen with two differences:

1. **Headline:** "Get started now!" instead of "Welcome back!"
   - Archivo 56 px desktop / 44 px mobile, same weight and colour

2. **Button action:** clicking Google or Facebook navigates to the **Sign Up Form** (`state.view = 'signupform'`), not the main page.

Everything else — layout, mascots, button styles, sizes, footer text, error notification behaviour — is the same as the Sign In screen.

---

## Screen 4 — Sign Up Form

**Mocks:**
- Desktop: `visily-design-mocks/extended-version/visily-static-signupform_web-html/index.html`
- Mobile: `visily-design-mocks/extended-version/visily-static-signupform_mobile-html/index.html`
- Error state reference: `visily-design-mocks/extended-version/visily-static-signupformerror_web-html/index.html`

### Background & Shell

Same gradient background. Same header logo (Inter 20 px 700 `#673F31`).

### Form Card

A centred card containing all form controls.

**Desktop:**
- Size: ~1053×590 px, expressed as `max-width: 1053px; width: calc(100% - 388px)` (194 px each side at 1440 px canvas)
- `background: rgba(255,255,255,0.4)`
- `border-radius: 32px`
- `box-shadow: 0px 4px 20px 0px rgba(23,26,31,0.09)`
- `backdrop-filter: blur(12px)`
- `border: 1px solid rgba(103,63,49,0.1)`
- Internal layout: two columns split by a vertical divider (`1px solid rgba(103,63,49,0.1)`)
  - Left column: avatar upload + name field (~487 px wide)
  - Right column: sensitivity slider (~520 px wide)

**Mobile:**
- Single-column card, width ~354 px (full width minus 20 px each side)
- `border-radius: 32px`; same shadow and backdrop blur
- Sections stack vertically: avatar → name → horizontal divider → slider

### Left Column — Avatar Upload

**Avatar circle:**
- 100×100 px desktop / 97×97 px mobile
- `background: rgba(103,63,49,0.05)`
- `border-radius: 9999px`
- `border: 2px dashed rgba(103,63,49,0.3)`
- Camera icon centred inside: 28×28 px, `#673F31` (use `fa-solid fa-camera`)
- When an image is uploaded: replace the camera placeholder with the uploaded image scaled and cropped to fill the circle (`object-fit: cover`)

**Labels beside avatar (desktop) / below avatar (mobile):**
- "Add a photo" — Inter 16 px desktop / 14 px mobile, weight 600, `#673F31`
- "(optional)" — Inter 14 px desktop / 12 px mobile, weight 400, italic, `#673F31` at 80% opacity

**Avatar upload behaviour:**
- The entire circle (and the label beside/below it) is a click target that triggers a hidden `<input type="file" accept=".jpg,.jpeg,.png" style="display:none">` element
- Accepted types: `image/jpeg`, `image/png` only — specified via the `accept` attribute so the OS file picker enforces it
- No custom error needed for invalid file types; the OS file picker physically prevents selecting other types
- The field is optional — form can be submitted without an avatar

### Left Column — Name Field

**Label:** "Your Name"
- Inter 15 px desktop / 12 px mobile, weight 600, `#673F31` at 80% opacity

**Input:**
- Width: 445 px desktop / 313 px mobile; height: 52 px desktop / 44 px mobile
- `background: rgba(255,255,255,0.6)`
- `border-radius: 14px`
- `box-shadow: 0px 2px 5px 0px rgba(23,26,31,0.09), 0px 0px 2px 0px rgba(23,26,31,0.12)`
- Default border: `1px solid rgba(237,112,45,0.2)` (very faint orange)
- Error state border: `1px solid #ea290b` (solid red)
- Placeholder: "e.g. Julianne Smith" — Inter 16 px desktop / 14 px mobile, `#9CA3AF`
- Typed text: Inter 16 px desktop / 14 px mobile, `#171A1F`

**Error message** (shown below the input when a validation error is active):
- Inter 11 px, weight 400, `#de3b40`
- Appears immediately below the input with ~4 px top margin
- Disappears when the error condition is resolved

#### Name Field Validation Rules

Validation triggers **on blur** (when the user leaves the field) and **on submit** (Finish Registration click with an empty field).

| Trigger | Condition | Error message |
|---|---|---|
| on blur | value length < 3 (and not empty) | "Name is too short — enter at least 3 characters." |
| on blur | value length > 50 | "Name is too long — maximum 50 characters allowed." |
| on blur | value (trimmed, lowercase) === `"test"` | "This name is already taken. Please choose another." |
| on submit | field is empty | "Please enter your name." |

Only one error message is shown at a time. Priority order when multiple could apply: required → min → max → taken.

On blur, if the field value passes all rules, hide any existing error. Clear the error also when the user starts typing again (on input event).

The mock shows "Enter a name that contains more then 1 symbol" as the minimal-length error text — the spec above supersedes that mock text.

### Right Column (Desktop) / Below Divider (Mobile) — Sensitivity Slider

**Section heading:** "How do you usually feel?"
- Inter 32 px desktop / 14 px mobile, weight 600, `#673F31`
- `text-align: center`
- `letter-spacing: -0.64px`

**Section subtext:** "We'll use this to calibrate your outfit suggestion from day one"
- Inter 15 px desktop / 12 px mobile, weight 500, `#673F31` at 70% opacity
- `text-align: center`

**Slider:**
- Track: full column width (434 px desktop / 318 px mobile), height 4 px, `background: #FEF4EC`, `border-radius: 2px`
- Progress fill: `background: #F48525`, from track start to current handle position
- Handle: 14×14 px white circle, `border: 2px solid #F48525`, `box-shadow: 0px 4px 9px rgba(23,26,31,0.11), 0px 0px 2px rgba(23,26,31,0.12)`
- The slider has **exactly 5 snap positions** (indices 0–4). The handle always snaps to one of the 5 evenly-spaced positions — never between them.
- Default: position 2 ("Average", the middle)

Snap positions are evenly spaced as percentages across the track:

| Index | Track % | Label | Icon | Active colour |
|---|---|---|---|---|
| 0 | 0% | Always cold | snowflake | `#673F31` at 60% opacity |
| 1 | 25% | Usually cold | cloud-sun | `#a4897c` |
| 2 | 50% | Average | thermometer | `#F48525` |
| 3 | 75% | Usually warm | sun | `#a4897c` |
| 4 | 100% | Always warm | flame | `#a4897c` |

The currently selected label is highlighted: weight 700, its full active colour. All other labels: weight 500, muted.

**Labels row** (below the track):
- Icons: 18 px desktop / 16 px mobile, centred above each label
- Label text: Open Sans 11 px desktop / 12 px mobile
- Each label is centred above its snap position on the track

**Interaction:** The user can drag the handle or click anywhere on the track. On pointer release, snap to the nearest position index. Clicking a label text or icon also snaps to that position.

**Stored value:** `state.auth.user.sensitivityOffset` — from the sensitivityOffset column in the Mock State section.

### Horizontal Divider (Mobile only)

Between the name field section and the slider section on mobile:
- `border-top: 1px solid rgba(237,111,44,0.1)`
- Full card inner width

### Finish Registration Button

**Desktop:** ~440×60 px, centred horizontally at the bottom of the card.
**Mobile:** full card width (~350 px) × 44 px, below the slider section.

- `background: #ED702D`
- Desktop: `border-radius: 18px` / Mobile: `border-radius: 16px`
- Desktop: `box-shadow: 0px 8px 16px 0px rgba(237,112,45,0.15)` / Mobile: `box-shadow: 0px 4px 9px rgba(237,111,44,0.2), 0px 0px 2px rgba(237,111,44,0.2)`
- Text: "Finish Registration", Open Sans 18 px desktop / 14 px mobile, weight 700, white
- Chevron-right icon (22 px desktop / 16 px mobile, white) to the right of the text, with ~11 px desktop / 8 px mobile gap

**Action on click:**
1. Validate the name field (run all rules; show error if any fail)
2. If validation passes:
   - Set `state.auth = { loggedIn: true, user: { name: trimmed field value, avatar: data URL or null, sensitivityOffset: from slider } }`
   - Navigate to main page (`state.view = 'main'`)
3. If validation fails: do not navigate, show the error message on the name field

### Legal Caption

Below the card (outside it, at the bottom of the viewport or scroll area):
- "By continuing, you agree to SkyDress's commitment to personalized comfort and thoughtful style."
- Inter 14 px desktop / 11 px mobile, weight 400, `#7C2D12` at 75% opacity
- `text-align: center`
- Decorative only — not a link

---

## Error Notification

Shown on the **Sign In screen** (screen 2) and the **Sign Up provider screen** (screen 3) when `?error=true` is present in the URL at the time the view loads.

### Layout

- Fixed to the **top-right** corner of the viewport, with 16 px margin from edges
- `background: rgba(255,255,255,0.95)`
- `border-radius: 12px`
- `box-shadow: 0px 4px 16px rgba(0,0,0,0.12)`
- `border: 1px solid rgba(234,41,11,0.25)`
- Padding: 14–16 px horizontally, 12–14 px vertically
- Max-width: 320 px desktop; full viewport width minus 32 px on mobile

### Content

**Message text:** "Something went wrong. Please reload the page to continue."
- Inter 14 px, weight 500, `#431407`

**Reload button** (below the message or inline on the same line):
- `fa-solid fa-rotate-right` icon (14 px) + "Reload" text
- Inter 14 px, weight 600, `#ED702D`
- Transparent background, no border
- **Action:** `window.location.reload()`

### Auto-dismiss

The notification auto-removes from the DOM after **5 seconds** if the Reload button is not clicked. Use `setTimeout`. No visible countdown needed.

---

## Sign-In User Defaults

When a user signs in via the Sign In screen (not sign-up), these defaults are applied immediately:

| Field | Default value |
|---|---|
| `state.auth.user.name` | `'User'` |
| `state.auth.user.avatar` | `null` |
| `state.auth.user.sensitivityOffset` | `0` (Average) |

These defaults can be changed via the Profile settings (doc 06).

---

## States to Cover

All of the following must be demonstrable:

| State | How to trigger |
|---|---|
| Public landing page | App load (unauthenticated) |
| Sign In screen | Click SIGN IN on landing page |
| Sign In → main page | Click Google or Facebook on Sign In screen |
| Sign Up screen | Click SIGN UP on landing page |
| Sign Up → form | Click Google or Facebook on Sign Up screen |
| Form — default empty state | Navigate to Sign Up Form |
| Form — avatar uploaded | Click avatar circle, select a JPEG or PNG |
| Form — name valid | Enter 3–50 characters (not "test") |
| Form — name too short (error) | Enter 1–2 characters, then blur the field |
| Form — name too long (error) | Enter 51+ characters, then blur the field |
| Form — name taken (error) | Enter "test" (any case), then blur the field |
| Form — name empty on submit | Click Finish Registration with the name field empty |
| Form — slider all 5 positions | Drag or click to each snap point |
| Form — successful submission | Valid name + click Finish Registration → main page |
| Error notification — sign-in | Load the sign-in screen with `?error=true` in the URL |
| Error notification — sign-up | Load the sign-up screen with `?error=true` in the URL |
| Error notification — auto-dismiss | Wait 5 seconds without clicking Reload |
| Error notification — reload | Click the Reload button |
