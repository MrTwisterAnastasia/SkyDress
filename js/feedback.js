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
      .querySelectorAll(".sd-feedback-widget, .sd-feedback-shadow, .sd-feedback-wrap")
      .forEach((n) => n.remove());

    const { el } = H();

    const onSubmit = (direction) => {
      state.feedback.hidden.add(currentKey());
      showFeedbackToast();
      /* Drop the widget without a full re-render */
      const w = document.querySelector(".sd-feedback-widget");
      if (w) w.remove();
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

    /* Decorative shadow ellipse beneath the widget (desktop only). */
    const shadow = el("div", { class: "sd-feedback-shadow" });
    const isMobile = window.matchMedia("(max-width: 599px)").matches;
    if (isMobile) {
      /* Mobile: anchor inside .sd-hero so the widget sits to the right of
         the temperature block, above the mascot, with 14 px gap. */
      const hero = document.querySelector(".sd-hero");
      if (!hero) return;
      const wrap = el("div", { class: "sd-feedback-wrap is-mobile" }, widget);
      hero.appendChild(wrap);
    } else {
      /* Desktop: sibling after .sd-mascot-zone in the right column, centered
         under the mascot body. */
      const wrap = el(
        "div",
        { class: "sd-feedback-wrap is-desktop" },
        widget,
        shadow,
      );
      zone.parentNode.insertBefore(wrap, zone.nextSibling);
    }
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
