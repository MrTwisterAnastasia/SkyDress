# SkyDress — Simplification Analysis

SkyDress is a personalised weather prototype: it converts raw weather data into one clear answer — *what to wear today* — and lets users tune that answer to their own cold/warm sensitivity through preferences and per-recommendation feedback. This document looks at SkyDress in its current form and explains how it can be reduced to a leaner single-screen version when the personalisation layer is not needed.

Source material:
- `CLAUDE.md` and `docs/01–07` (current SkyDress)
- `../skyDress/` (reference for the reduced single-screen variant)

---

## 1. Current Structure Overview

SkyDress is a multi-page client-side prototype (plain HTML/CSS/JS, no build step, all data mocked). It has four functional areas — a weather screen, an authentication flow, a profile/settings page, and an inline outfit-feedback widget — wired together by a small in-memory state.

| Area | What it contains | Key points |
|---|---|---|
| **Weather screen** ([docs/01](docs/01-search-location.md)–[04](docs/04-mascot-outfits.md)) | Location search + city quick-switch pills, no-city / loading states, hero weather display (condition, temperature, Feels Like), 7 stats cards (Sun, Moon, Allergy, AQI, Visibility, Pressure, UV), Hourly / 10-day forecast slider, mascot with floating clothing icons and connector lines, umbrella accessory | Core deliverable of the product — converts Feels Like into 1 of 7 outfit levels and renders the matching mascot PNG + clothing icons. Umbrella shown when rain > 30 %. Responsive: mobile < 600 px, desktop ≥ 600 px |
| **Authentication** ([docs/05](docs/05-auth-signin-signup.md)) | Public landing page, sign-in screen, sign-up screen, mock `state.auth = { loggedIn, user }` | Gates access to personalisation. Pure mock — no backend, no tokens, no persistence. Successful sign-in/up routes to the weather screen |
| **Profile & Settings** ([docs/06](docs/06-settings-profile.md)) | Header profile icon (logged-in only), display name + preset avatar picker, per-metric visibility toggles for the 7 stats cards, 5-position weather sensitivity slider | Slider maps to `sensitivityOffset ∈ [−2..+2]` and shifts the displayed outfit up/down the 7-level scale (not the temperature). Saving re-renders the mascot immediately |
| **Outfit Feedback** ([docs/07](docs/07-outfit-feedback.md)) | Inline widget on the active hour/day card with three buttons — Dress cooler · Looks good · Dress warmer — and a per-key dismiss | Writes through to the same `sensitivityOffset` the slider reads (single source of truth); Dress warmer/cooler nudges ± 1 (clamped to ± 2) and re-renders the outfit instantly |

---

## 2. Prioritization

Decisions made against the **product premise**: "convert weather numbers into one clear answer — what to wear today." Anything that directly delivers that answer is core; anything that personalises or accounts for that answer is secondary; anything that gates access to the answer is removable for a prototype with no real users.

### Core — must keep

These are the elements that *are* the product. Without any one of them, the prototype no longer demonstrates the central idea.

- **Mascot + outfit logic** (docs/04) — the punchline of the entire app.
- **Hero weather display** (docs/02) — provides the Feels Like value that drives outfit selection.
- **Hourly / 10-day forecast** (docs/03) — proves the recommendation works across time, not just "now."
- **Location search + city pills + no-city / loading states** (docs/01) — required to bootstrap any weather view at all.
- **Stats panel / mobile bottom sheet with all 7 metric cards** (docs/02) — secondary information density that supports the recommendation; small enough that pruning individual cards adds complexity without saving real estate.
- **Umbrella accessory trigger** (docs/04) — the only accessory in the prototype and a key demonstration that recommendations adapt to conditions, not just temperature.
- **Responsive mobile/desktop layouts** (CLAUDE.md "Responsive Layout") — both Visily mocks were designed; dropping one would halve coverage of the design.

### Secondary — optional, can be deferred

These add personalisation polish but the prototype still tells its full story without them. They are reasonable v2 candidates once the core is validated.

- **Weather sensitivity slider** (docs/06) — useful but the default `sensitivityOffset = 0` already produces correct recommendations. Adds value only after real users disagree with the suggestion.
- **Outfit feedback widget** (docs/07) — same rationale: a faster path to the same offset the slider controls. Defer with the slider.
- **Weather metric visibility toggles** (docs/06) — all 7 cards already render correctly by default; hiding them is a power-user nicety.
- **Profile customisation** (display name + avatar picker, docs/06) — pure cosmetic, no impact on the weather/outfit flow.

### Removable — safe to drop entirely for the simplified version

These exist purely to *support* personalisation. With personalisation deferred, they have no remaining purpose.

- **Public landing page** (docs/05).
- **Sign-in screen + mock auth flow** (docs/05).
- **Sign-up screen + mock validation** (docs/05).
- **Mock `state.auth` and routing logic** (docs/05).
- **Header profile icon** (docs/06) — entry point to a page that no longer exists.

---

## 3. Simplified Design — single-screen SkyDress

The simplified prototype is a **single page** that opens directly on the weather screen — no auth gate, no settings page, no feedback widget.

### Layout (top → bottom, mobile; left → right, desktop)

```
┌───────────────────────────────────────────────────────────┐
│  [ 📍  Location search bar ]    pill  pill  pill          │   ← Location row
├───────────────────────────────────────────────────────────┤
│                                                            │
│   Condition badge                          🌤              │
│   37°                                                      │
│   Feels like 36°                                           │
│                                                            │
│         ╲   ╱                                              │
│       ┌─ Mascot ─┐    ← outfit PNG + floating clothing     │   ← Recommendation
│         ╱   ╲          icons + connector lines + umbrella  │
│                                                            │
├───────────────────────────────────────────────────────────┤
│   [ Hourly ●  10-day ○ ]                                   │   ← Forecast
│   ◀  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐  ▶                │
│      │14│ │Now│ │16│ │17│ │18│ │19│ │20│                   │
│      └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘                   │
├───────────────────────────────────────────────────────────┤
│   STATS                                                    │   ← Supporting metrics
│   ┌─Sun──┐ ┌─Moon─┐ ┌─Allergy┐ ┌─AQI──┐                   │
│   ┌─Vis──┐ ┌─Press┐ ┌─UV─────┐                            │
└───────────────────────────────────────────────────────────┘
```

### Grouping & hierarchy

Four horizontal bands, ordered by how directly each answers *"what should I wear?"*:

1. **Location row** — *context.* Smallest visual weight; the user only touches it when switching cities.
2. **Recommendation band** — *the answer.* Hero temperature + mascot + clothing icons; takes the largest share of the viewport because it is the product.
3. **Forecast band** — *the answer over time.* Single shared slider with a tab toggle so Hourly and 10-day occupy the same screen space (zero extra navigation).
4. **Stats band** — *the supporting evidence.* Bottom of the page on mobile (collapsible sheet), right-hand panel on desktop. Always present, never gates the recommendation.

### Flow

1. User opens the page → no-city-selected screen.
2. Picks a city via search or quick-switch pill → loading mascot briefly → full weather screen.
3. Sees the recommendation immediately (no login, no profile setup, no consent).
4. Optionally scrolls the forecast slider or toggles Hourly ↔ 10-day to see what to wear later.
5. Optionally glances at the Stats band for raw numbers.

Total interactive surface: **one search input, one set of city pills, one forecast toggle, one forecast slider.** Nothing else is required to use the app end-to-end.

---

## 4. Removal Justification

| Removed / deferred | Why it is safe |
|---|---|
| **Public landing page, sign-in, sign-up, mock auth state** | The prototype has no backend, no real users, no persisted data, and nothing in the weather flow that varies by user identity. Auth exists only to gate access to *personalisation* features. Once those features are deferred, there is no user-specific state to gate, so the entire auth layer becomes dead weight. Removing it also reclaims the entry point — the user now lands directly on the value (the weather screen) instead of on a form. |
| **Header profile icon** | It is the entry point to the profile settings page. With the settings page removed, the icon would lead nowhere. |
| **Profile settings page (display name + avatar picker)** | Pure cosmetic personalisation. None of it affects the recommendation, the forecast, or the metric cards. Zero functional loss. |
| **Weather metric visibility toggles** | The default state of these toggles is "all metrics visible," which is exactly what the simplified screen shows. The toggles only add value if a user wants to hide cards — a preference that is meaningless without persistence (no localStorage requirement in the prototype rules) and without repeated sessions. |
| **Weather sensitivity slider (Preferences)** | Default `sensitivityOffset = 0` means the displayed outfit equals the base outfit derived from Feels Like — which is the correct, design-intended behavior shown in every Visily mock. The slider only *shifts away* from that default. Deferring it loses no demonstrable state; the prototype still shows all 7 outfit levels via the existing 24-hour mock data (which already spans Very Cold → Very Hot in a single day). |
| **Outfit feedback widget** | The widget is an alternate UI on top of the same `sensitivityOffset` the slider writes to. With the slider deferred, the widget has no underlying state to mutate. The recommendation logic without an offset is already complete and correct. |
| **Doc 04's `sensitivityOffset` clamp hook** | This is the only line in the foundation docs that the personalisation layer added. With both the slider and the feedback widget gone, the clamp is unreachable — the base outfit index is the effective outfit index. Removing the hook collapses the logic back to a direct Feels Like → outfit lookup with no behavior change. |

### What the simplified prototype still proves

Even after every removal above, the simplified screen still demonstrates the full weather-screen coverage checklist from `CLAUDE.md`:

- All 7 mascot outfit levels (the 24-hour mock data hits every one).
- All weather icons, all UV / AQI / pollen levels.
- Umbrella accessory trigger (rain > 30%).
- Hourly and 10-day forecast views.
- Mobile and desktop layouts.
- City switching across all 10 mock cities.
- Loading state, error state, no-city-selected state.

In other words: every state that *demonstrates the product idea* is still reachable from a single screen with no authentication, no settings, and no feedback loop. The authentication, profile/settings, and feedback areas are additive — they personalise an experience that already works — so deferring them collapses SkyDress cleanly to its single-screen variant without breaking any core demo path.
