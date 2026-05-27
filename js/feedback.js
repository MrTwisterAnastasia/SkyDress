/* SkyDress extended — Outfit feedback widget + success toast.
   Visible on the main page for the currently active hourly/day card unless
   the user has dismissed it (X) or submitted feedback for that key. */
(function () {
  "use strict";

  window.SkyDress = window.SkyDress || {};

  function H() {
    return window.SkyDress.app;
  }
  function S() {
    return window.SkyDress.state;
  }

  function currentKey() {
    const state = S();
    return state.activeTab === "hourly"
      ? "hourly:" + state.activeHour
      : "10day:" + state.activeDay;
  }

  function mountWidget() {
    const state = S();
    /* Only render in main view, for authenticated users, when not in
       loading/error/no-city/expanded-sheet state. */
    if (state.view !== "main") return;
    if (!state.auth.loggedIn) return;
    if (state.feedbackSessionHidden) return;
    if (state.loading || state.error || state.city === null) return;
    if (state.sheetExpanded) return;
    /* Notifications panel's "Outfit check-in reminders" toggle hides the
       widget globally when off. */
    if (!state.userPrefs.notifications.outfitFeedback) return;

    const key = currentKey();
    if (state.feedback.hidden.has(key)) return;

    /* Two placements:
       - Mobile (< 600 px): widget sits inside .sd-hero, anchored to the
         top-right corner with 14 px gap from .sd-hero text (item #11).
       - Desktop (>= 600 px): widget is appended after .sd-mascot-zone in the
         right column, centered horizontally under the mascot body (item #12).
       Either way it never overlaps mascot/clothing/forecast pills. */
    const zone = document.querySelector(".sd-mascot-zone");
    if (!zone) return;
    /* Clean up any stale widget + shadow from a previous render */
    document
      .querySelectorAll(
        ".sd-feedback-widget, .sd-feedback-shadow, .sd-feedback-wrap",
      )
      .forEach((n) => n.remove());

    const { el } = H();

    const onSubmit = (direction) => {
      /* Nudge sensitivityOffset within the slider's [-2, +2] range.
         "warmer" = user wants heavier outfit = offset toward +2.
         "cooler" = user wants lighter outfit = offset toward -2.
         "good"   = no change.
         At the slider extremes the click is a silent no-op; the toast
         still appears so the user knows the input was received. */
      const prev = state.userPrefs.sensitivityOffset;
      if (direction === "warmer") {
        state.userPrefs.sensitivityOffset = Math.min(prev + 1, 2);
      } else if (direction === "cooler") {
        state.userPrefs.sensitivityOffset = Math.max(prev - 1, -2);
      }
      state.feedback.hidden.add(currentKey());
      showFeedbackToast();
      /* Full re-render so the mascot PNG and clothing icons resolve to the
         new effective outfit. Toast (appended to document.body) survives the
         render — render() only clears $app and a fixed set of overlays. */
      if (state.userPrefs.sensitivityOffset !== prev) {
        H().render();
      } else {
        /* Offset unchanged ("good", or click at the slider extreme) — just
           drop the widget without a full re-render to save work. */
        const w = document.querySelector(".sd-feedback-widget");
        if (w) w.remove();
      }
    };
    const onDismiss = () => {
      state.feedback.hidden.add(currentKey());
      const w = document.querySelector(".sd-feedback-widget");
      if (w) w.remove();
    };

    const widget = el(
      "div",
      { class: "sd-feedback-widget" },
      el(
        "button",
        {
          class: "sd-feedback-close",
          onclick: onDismiss,
          "aria-label": "Dismiss feedback widget",
        },
        el("i", { class: "fa-solid fa-xmark" }),
      ),
      el(
        "div",
        { class: "sd-feedback-header" },
        el("i", { class: "fa-solid fa-comment-dots" }),
        el(
          "span",
          { class: "sd-feedback-label" },
          "Adjust next outfit suggestion?",
        ),
      ),
      el(
        "div",
        { class: "sd-feedback-actions" },
        el(
          "button",
          {
            class: "sd-fb-btn sd-fb-cooler",
            onclick: () => onSubmit("cooler"),
          },
          el("i", { class: "fa-solid fa-temperature-arrow-down" }),
          el("span", { class: "sd-fb-label" }, "Cooler"),
        ),
        el(
          "button",
          {
            class: "sd-fb-btn sd-fb-good",
            onclick: () => onSubmit("good"),
          },
          el("i", { class: "fa-solid fa-check" }),
          el("span", { class: "sd-fb-label sd-fb-label-good" }, "Looks good"),
        ),
        el(
          "button",
          {
            class: "sd-fb-btn sd-fb-warmer",
            onclick: () => onSubmit("warmer"),
          },
          el("i", { class: "fa-solid fa-temperature-arrow-up" }),
          el("span", { class: "sd-fb-label" }, "Warmer"),
        ),
      ),
    );

    const hero = document.querySelector(".sd-mascot-img-wrapper");
    if (!hero) return;
    const wrap = el("div", { class: "sd-feedback-wrap is-mobile" }, widget);
    hero.appendChild(wrap);
  }

  /* === Success toast === */

  let feedbackToastTimer = null;
  function showFeedbackToast() {
    const { el } = H();
    let toast = document.querySelector(".sd-feedback-toast");
    if (toast) {
      /* Reset existing timer rather than stacking */
      if (feedbackToastTimer) clearTimeout(feedbackToastTimer);
    } else {
      toast = el(
        "div",
        { class: "sd-feedback-toast" },
        el("i", {
          class: "fa-solid fa-circle-check sd-feedback-toast-icon",
        }),
        el(
          "div",
          { class: "sd-feedback-toast-text" },
          el(
            "div",
            { class: "sd-feedback-toast-title" },
            "Your outfits just got more personal.",
          ),
          el(
            "div",
            { class: "sd-feedback-toast-sub" },
            "Thanks for the feedback — we'll keep fine-tuning your suggestions.",
          ),
        ),
      );
      document.body.appendChild(toast);
    }
    feedbackToastTimer = setTimeout(() => {
      const t = document.querySelector(".sd-feedback-toast");
      if (t) {
        t.classList.add("is-leaving");
        setTimeout(() => t.remove(), 220);
      }
      feedbackToastTimer = null;
    }, 5000);
  }

  window.SkyDress.feedback = {
    mountWidget,
    showFeedbackToast,
  };
})();
