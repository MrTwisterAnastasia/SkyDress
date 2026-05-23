/* SkyDress extended — Profile pill, dropdown, settings panels, dialogs, success toast. */
(function () {
  "use strict";

  window.SkyDress = window.SkyDress || {};

  function H() {
    return window.SkyDress.app;
  }
  function S() {
    return window.SkyDress.state;
  }

  /* Defaults — used both for initial state and after logout. */
  const DEFAULT_VISIBLE_METRICS = {
    sunriseSunset: true,
    moonPhase: true,
    uvIndex: true,
    airQuality: true,
    visibility: true,
    pressure: true,
    allergyOutlook: true,
  };
  const DEFAULT_NOTIFICATIONS = {
    morningReminder: true,
    reminderTime: "7:00 AM",
    outfitFeedback: true,
  };
  /* Reminder time popover state — open/closed for the time picker dropdown */
  let timePickerOpen = false;

  /* Doc/06 §5 mapping — preferences slider: leftmost (Always cold) = +4.
     Note this is the INVERSE of the sign-up slider mapping in doc/05. */
  const PREF_OFFSETS = [4, 2, 0, -2, -4];
  function prefSliderPosFromOffset(offset) {
    const i = PREF_OFFSETS.indexOf(offset);
    return i === -1 ? 2 : i;
  }
  const PREF_SLIDER_LABELS = [
    { label: "Always cold", icon: "fa-snowflake" },
    { label: "Usually cold", icon: "fa-cloud-sun" },
    { label: "Average", icon: "fa-temperature-half" },
    { label: "Usually warm", icon: "fa-sun" },
    { label: "Always warm", icon: "fa-fire" },
  ];

  const METRIC_ROWS = [
    { key: "sunriseSunset", label: "Sunrise & Sunset", icon: "fa-sun" },
    { key: "moonPhase", label: "Moon Phase", icon: "fa-moon" },
    { key: "uvIndex", label: "UV Index", icon: "fa-bolt" },
    { key: "airQuality", label: "Air Quality", icon: "fa-leaf" },
    { key: "visibility", label: "Visibility", icon: "fa-eye" },
    { key: "pressure", label: "Pressure", icon: "fa-gauge" },
    { key: "allergyOutlook", label: "Allergy Outlook", icon: "fa-tree" },
  ];

  /* === Profile pill === */

  function renderProfilePill() {
    const { el } = H();
    const state = S();
    if (state.auth.loggedIn) {
      const initial = (state.auth.user.name || "U")[0].toUpperCase();
      const inner = state.auth.user.avatar
        ? el("img", { src: state.auth.user.avatar, alt: "avatar" })
        : el("span", { class: "sd-pill-initial" }, initial);
      return el(
        "div",
        {
          class: "sd-profile-pill sd-profile-pill-in",
          onclick: (e) => {
            e.stopPropagation();
            state.profileDropdownOpen = !state.profileDropdownOpen;
            H().render();
          },
        },
        el("div", { class: "sd-profile-circle" }, inner),
        el(
          "div",
          { class: "sd-profile-pill-dots" },
          el("i", { class: "fa-solid fa-ellipsis-vertical" }),
        ),
      );
    }
    /* Logged-out — gray guest icon */
    return el(
      "div",
      {
        class: "sd-profile-pill sd-profile-pill-out",
        onclick: (e) => {
          e.stopPropagation();
          state.profileDropdownOpen = !state.profileDropdownOpen;
          H().render();
        },
      },
      el(
        "div",
        { class: "sd-profile-circle sd-profile-circle-guest" },
        el("i", { class: "fa-solid fa-user" }),
      ),
      el(
        "div",
        { class: "sd-profile-pill-dots" },
        el("i", { class: "fa-solid fa-ellipsis-vertical" }),
      ),
    );
  }

  /* === Overlay mounting === */

  function mountOverlays() {
    const state = S();
    cleanupOverlays();
    if (state.profileDropdownOpen) mountDropdown();
    if (state.panelOpen) mountPanel();
    if (state.dialog) mountDialog();
    if (state.savedToastUntil && state.savedToastUntil > Date.now())
      mountSavedToast();
  }

  function cleanupOverlays() {
    document
      .querySelectorAll(
        ".sd-profile-dropdown, .sd-panel-overlay, .sd-panel, .sd-dialog-backdrop",
      )
      .forEach((n) => n.remove());
  }

  /* === Dropdown === */

  function mountDropdown() {
    const { el, iconEl } = H();
    const state = S();
    const dropdown = el("div", {
      class: "sd-profile-dropdown",
      onclick: (e) => e.stopPropagation(),
    });

    if (state.auth.loggedIn) {
      const initial = (state.auth.user.name || "U")[0].toUpperCase();
      const avatarInner = state.auth.user.avatar
        ? el("img", { src: state.auth.user.avatar, alt: "avatar" })
        : el("span", { class: "sd-dropdown-initial" }, initial);
      dropdown.appendChild(
        el(
          "div",
          { class: "sd-dropdown-identity" },
          el("div", { class: "sd-dropdown-avatar" }, avatarInner),
          el(
            "span",
            { class: "sd-dropdown-name" },
            state.auth.user.name || "User",
          ),
        ),
      );
      dropdown.appendChild(
        el("div", { class: "sd-dropdown-section-label" }, "Settings"),
      );
      const navRow = (icon, label, panel) =>
        el(
          "button",
          {
            class: "sd-dropdown-nav",
            onclick: () => {
              state.profileDropdownOpen = false;
              openPanel(panel);
            },
          },
          el("i", { class: "fa-solid " + icon }),
          el("span", null, label),
        );
      dropdown.appendChild(navRow("fa-user", "My Profile", "profile"));
      dropdown.appendChild(
        navRow("fa-sliders", "Preferences", "preferences"),
      );
      dropdown.appendChild(
        navRow("fa-bell", "Notifications", "notifications"),
      );
      dropdown.appendChild(el("div", { class: "sd-dropdown-divider" }));
      dropdown.appendChild(
        el(
          "button",
          {
            class: "sd-dropdown-logout",
            onclick: () => {
              state.profileDropdownOpen = false;
              openLogoutDialog();
            },
          },
          el("i", { class: "fa-solid fa-right-from-bracket" }),
          el("span", null, "Log Out"),
        ),
      );
    } else {
      dropdown.appendChild(
        el(
          "button",
          {
            class: "sd-dropdown-cta sd-dropdown-cta-primary",
            onclick: () => {
              state.profileDropdownOpen = false;
              window.SkyDress.auth.go("signin");
            },
          },
          "Sign In",
        ),
      );
      dropdown.appendChild(
        el(
          "button",
          {
            class: "sd-dropdown-cta sd-dropdown-cta-secondary",
            onclick: () => {
              state.profileDropdownOpen = false;
              window.SkyDress.auth.go("signup");
            },
          },
          "Sign Up",
        ),
      );
    }

    document.body.appendChild(dropdown);
    positionDropdown(dropdown);
  }

  function positionDropdown(dropdown) {
    const pill = document.querySelector(".sd-profile-pill");
    if (!pill) return;
    const rect = pill.getBoundingClientRect();
    dropdown.style.position = "fixed";
    /* Anchor to bottom-right of the pill, 182 px wide. */
    dropdown.style.top = rect.bottom + 8 + "px";
    dropdown.style.left = Math.max(8, rect.right - 182) + "px";
  }

  /* === Open panel — clone current values into panelPending === */

  function openPanel(panel) {
    const state = S();
    state.panelOpen = panel;
    state.panelDirty = false;
    state.panelPending = clonePending();
    H().render();
  }

  function clonePending() {
    const state = S();
    return {
      name: state.auth.user ? state.auth.user.name : "",
      avatar: state.auth.user ? state.auth.user.avatar : null,
      sensitivityOffset: state.userPrefs.sensitivityOffset,
      visibleMetrics: Object.assign({}, state.userPrefs.visibleMetrics),
      notifications: Object.assign({}, state.userPrefs.notifications),
    };
  }

  function markDirty() {
    const state = S();
    const orig = {
      name: state.auth.user ? state.auth.user.name : "",
      avatar: state.auth.user ? state.auth.user.avatar : null,
      sensitivityOffset: state.userPrefs.sensitivityOffset,
      visibleMetrics: state.userPrefs.visibleMetrics,
      notifications: state.userPrefs.notifications,
    };
    const p = state.panelPending;
    const dirty =
      p.name !== orig.name ||
      p.avatar !== orig.avatar ||
      p.sensitivityOffset !== orig.sensitivityOffset ||
      JSON.stringify(p.visibleMetrics) !==
        JSON.stringify(orig.visibleMetrics) ||
      JSON.stringify(p.notifications) !== JSON.stringify(orig.notifications);
    state.panelDirty = dirty;
  }

  function tryClosePanel(action) {
    const state = S();
    if (state.panelDirty) {
      state.dialog = "discard";
      state.dialogContext = action || "close";
      H().render();
      return;
    }
    finishClosePanel();
  }

  function finishClosePanel() {
    const state = S();
    state.panelOpen = null;
    state.panelDirty = false;
    state.panelPending = null;
    timePickerOpen = false;
    H().render();
  }

  function saveAndClose() {
    const state = S();
    const p = state.panelPending;
    if (state.auth.user) {
      state.auth.user.name = p.name;
      state.auth.user.avatar = p.avatar;
    }
    state.userPrefs.sensitivityOffset = p.sensitivityOffset;
    state.userPrefs.visibleMetrics = Object.assign({}, p.visibleMetrics);
    state.userPrefs.notifications = Object.assign({}, p.notifications);
    finishClosePanel();
    showSavedToast();
  }

  /* === Panel render === */

  function mountPanel() {
    const { el } = H();
    const state = S();
    /* Backdrop dim */
    const overlay = el("div", {
      class: "sd-panel-overlay",
      onclick: () => tryClosePanel("close"),
    });
    document.body.appendChild(overlay);

    const titles = {
      profile: "My Profile",
      preferences: "Preferences",
      notifications: "Notifications",
    };

    /* Save Changes button (with disabled-state tooltip wrapper) */
    const saveBtn = el(
      "button",
      {
        class: "sd-panel-save" + (state.panelDirty ? "" : " is-disabled"),
        onclick: () => {
          if (state.panelDirty) saveAndClose();
        },
      },
      "Save changes",
    );
    const saveWrap = el(
      "div",
      { class: "sd-panel-save-wrap" },
      saveBtn,
      !state.panelDirty &&
        el(
          "div",
          { class: "sd-panel-save-tooltip" },
          "No changes have been made yet.",
        ),
    );

    const header = el(
      "div",
      { class: "sd-panel-header" },
      el(
        "button",
        {
          class: "sd-panel-close",
          onclick: () => tryClosePanel("close"),
          "aria-label": "Close panel",
        },
        el("i", { class: "fa-solid fa-xmark" }),
      ),
      el("div", { class: "sd-panel-title" }, titles[state.panelOpen]),
      saveWrap,
    );

    let body;
    if (state.panelOpen === "profile") body = renderProfileBody();
    else if (state.panelOpen === "preferences") body = renderPreferencesBody();
    else body = renderNotificationsBody();

    const panel = el(
      "div",
      { class: "sd-panel sd-panel-open" },
      header,
      el("div", { class: "sd-panel-body" }, body),
    );
    document.body.appendChild(panel);
  }

  /* === My Profile body === */

  function renderProfileBody() {
    const { el } = H();
    const state = S();
    const p = state.panelPending;

    const fileInput = el("input", {
      type: "file",
      accept: ".jpg,.jpeg,.png,image/jpeg,image/png",
      style: { display: "none" },
      onchange: (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          p.avatar = ev.target.result;
          markDirty();
          H().render();
        };
        reader.readAsDataURL(file);
      },
    });

    const avatarCircle = el(
      "div",
      {
        class:
          "sd-profile-panel-avatar" +
          (p.avatar ? " is-filled" : " is-empty"),
        onclick: () => fileInput.click(),
        role: "button",
        tabindex: "0",
      },
      p.avatar
        ? [
            el("img", { src: p.avatar, alt: "avatar" }),
            el(
              "button",
              {
                class: "sd-profile-panel-edit",
                onclick: (e) => {
                  e.stopPropagation();
                  fileInput.click();
                },
                "aria-label": "Change avatar",
              },
              el("i", { class: "fa-solid fa-pencil" }),
            ),
          ]
        : el("i", { class: "fa-solid fa-camera" }),
    );

    const nameInput = el("input", {
      type: "text",
      class: "sd-profile-panel-name-input",
      value: p.name || "",
      placeholder: state.auth.user ? state.auth.user.name : "",
      oninput: (e) => {
        p.name = e.target.value;
        markDirty();
        /* Live update save button enabled state */
        const save = document.querySelector(".sd-panel-save");
        const wrap = document.querySelector(".sd-panel-save-wrap");
        if (save && wrap) {
          if (S().panelDirty) {
            save.classList.remove("is-disabled");
            const tip = wrap.querySelector(".sd-panel-save-tooltip");
            if (tip) tip.remove();
          } else {
            save.classList.add("is-disabled");
          }
        }
      },
    });

    return el(
      "div",
      { class: "sd-profile-panel-body" },
      fileInput,
      el(
        "div",
        { class: "sd-profile-panel-top" },
        el("div", { class: "sd-profile-panel-avatar-wrap" }, avatarCircle),
        el(
          "div",
          { class: "sd-profile-panel-name-block" },
          el(
            "label",
            { class: "sd-profile-panel-name-label" },
            "Your Name",
          ),
          nameInput,
        ),
      ),
      /* Bottom-anchored section: divider + logout button. */
      el(
        "div",
        { class: "sd-profile-panel-bottom" },
        el("div", { class: "sd-panel-section-divider is-strong" }),
        el(
          "button",
          {
            class: "sd-profile-panel-logout",
            onclick: openLogoutFromPanel,
          },
          el("i", { class: "fa-solid fa-right-from-bracket" }),
          el("span", null, "Log Out"),
        ),
      ),
    );
  }

  /* === Preferences body === */

  function renderPreferencesBody() {
    const { el } = H();
    const state = S();
    const p = state.panelPending;

    /* Sensitivity slider */
    const pos = prefSliderPosFromOffset(p.sensitivityOffset);
    const track = el("div", { class: "sd-pref-slider-track" });
    const fill = el("div", {
      class: "sd-pref-slider-fill",
      style: { width: (pos / 4) * 100 + "%" },
    });
    const handle = el("div", {
      class: "sd-pref-slider-handle",
      style: { left: (pos / 4) * 100 + "%" },
    });
    /* 5 dots */
    const dots = [];
    for (let i = 0; i < 5; i++) {
      dots.push(
        el("div", {
          class:
            "sd-pref-slider-dot" + (i <= pos ? " is-filled" : ""),
          style: { left: (i / 4) * 100 + "%" },
        }),
      );
    }
    track.appendChild(fill);
    dots.forEach((d) => track.appendChild(d));
    track.appendChild(handle);

    function snapFromClientX(x) {
      const rect = track.getBoundingClientRect();
      const r = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
      return Math.round(r * 4);
    }
    track.addEventListener("pointerdown", function (downEvt) {
      downEvt.preventDefault();
      const onMove = (ev) => {
        const i = snapFromClientX(ev.clientX);
        handle.style.left = (i / 4) * 100 + "%";
        fill.style.width = (i / 4) * 100 + "%";
      };
      const onUp = (ev) => {
        const i = snapFromClientX(ev.clientX);
        p.sensitivityOffset = PREF_OFFSETS[i];
        markDirty();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        H().render();
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });

    const labelsRow = el(
      "div",
      { class: "sd-pref-slider-labels" },
      PREF_SLIDER_LABELS.map((spec, i) => {
        const active = i === pos;
        return el(
          "button",
          {
            type: "button",
            class:
              "sd-pref-slider-label" + (active ? " active" : ""),
            onclick: () => {
              p.sensitivityOffset = PREF_OFFSETS[i];
              markDirty();
              H().render();
            },
          },
          el("i", { class: "fa-solid " + spec.icon }),
          el("span", null, spec.label),
        );
      }),
    );

    const sensitivityCard = el(
      "div",
      { class: "sd-panel-card" },
      el(
        "h3",
        { class: "sd-pref-slider-heading" },
        "How do you usually feel?",
      ),
      el(
        "p",
        { class: "sd-pref-slider-sub" },
        "We'll use this to calibrate your outfit suggestion",
      ),
      el(
        "div",
        { class: "sd-pref-slider-wrap" },
        track,
        labelsRow,
      ),
    );

    /* Metric toggle rows */
    const metricRows = METRIC_ROWS.map((m, i) =>
      el(
        "div",
        {
          class:
            "sd-pref-metric-row" +
            (i < METRIC_ROWS.length - 1 ? " has-divider" : ""),
        },
        el("i", {
          class: "sd-pref-metric-icon fa-solid " + m.icon,
        }),
        el("div", { class: "sd-pref-metric-label" }, m.label),
        renderToggle(p.visibleMetrics[m.key], (val) => {
          p.visibleMetrics[m.key] = val;
          markDirty();
          H().render();
        }),
      ),
    );

    return el(
      "div",
      null,
      el(
        "div",
        { class: "sd-panel-section-label" },
        "How do you usually feel?",
      ),
      sensitivityCard,
      el("div", { class: "sd-panel-section-divider" }),
      el(
        "div",
        { class: "sd-panel-section-label" },
        "What to show on your weather panel",
      ),
      el("div", { class: "sd-panel-card" }, metricRows),
    );
  }

  /* === Notifications body === */

  function renderNotificationsBody() {
    const { el } = H();
    const state = S();
    const p = state.panelPending;
    const n = p.notifications;

    const morningCard = el(
      "div",
      { class: "sd-panel-card" },
      el(
        "div",
        { class: "sd-notif-row sd-notif-row-top" },
        el(
          "div",
          { class: "sd-notif-icon-box" },
          el("i", { class: "fa-solid fa-bell" }),
        ),
        el(
          "div",
          { class: "sd-notif-text" },
          el(
            "div",
            { class: "sd-notif-title" },
            "Morning outfit reminder",
          ),
          el(
            "div",
            { class: "sd-notif-sub" },
            "Get your daily outfit pick before you get dressed.",
          ),
        ),
        renderToggle(n.morningReminder, (val) => {
          n.morningReminder = val;
          markDirty();
          H().render();
        }),
      ),
      el("div", { class: "sd-panel-row-divider" }),
      el(
        "div",
        {
          class:
            "sd-notif-time-row" +
            (n.morningReminder ? "" : " is-disabled"),
        },
        el("i", { class: "fa-solid fa-clock" }),
        el("span", { class: "sd-notif-time-label" }, "Remind me at"),
        renderTimeChip(n),
      ),
    );

    const feedbackCard = el(
      "div",
      { class: "sd-panel-card" },
      el(
        "div",
        { class: "sd-notif-row" },
        el(
          "div",
          { class: "sd-notif-icon-box" },
          el("i", {
            class: "fa-solid fa-comment-dots",
            style: { transform: "scaleX(-1)" },
          }),
        ),
        el(
          "div",
          { class: "sd-notif-text" },
          el(
            "div",
            { class: "sd-notif-title" },
            "Outfit check-in reminders",
          ),
          el(
            "div",
            { class: "sd-notif-sub" },
            "A daily nudge to rate how your outfit felt. Each answer fine-tunes your personal suggestions.",
          ),
        ),
        renderToggle(n.outfitFeedback, (val) => {
          n.outfitFeedback = val;
          markDirty();
          H().render();
        }),
      ),
    );

    return el(
      "div",
      null,
      el("div", { class: "sd-panel-section-label" }, "Morning Reminder"),
      morningCard,
      el("div", { class: "sd-panel-section-divider" }),
      el("div", { class: "sd-panel-section-label" }, "Outfit Feedback"),
      feedbackCard,
    );
  }

  /* === Time picker chip + dropdown ===
     Parses "H:MM AM/PM" into { h12, m, ampm } and writes back in the same
     format. Hour and minute become two <input type="number"> fields rendered
     inside an anchored popover below the chip. */
  function parseTime(str) {
    const m = (str || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return { h12: 7, m: 0, ampm: "AM" };
    return { h12: parseInt(m[1], 10), m: parseInt(m[2], 10), ampm: m[3].toUpperCase() };
  }
  function formatTime(t) {
    return `${t.h12}:${String(t.m).padStart(2, "0")} ${t.ampm}`;
  }
  function clampHour(n) { return Math.max(1, Math.min(12, n | 0)); }
  function clampMin(n) { return Math.max(0, Math.min(59, n | 0)); }

  function renderTimeChip(n) {
    const { el } = H();
    const chip = el(
      "button",
      {
        class: "sd-notif-time-chip",
        onclick: (e) => {
          if (!n.morningReminder) return;
          e.stopPropagation();
          timePickerOpen = !timePickerOpen;
          H().render();
        },
      },
      n.reminderTime,
      el("i", { class: "fa-solid fa-chevron-down" }),
    );
    /* Wrap so we can anchor the popover relative to the chip. */
    const wrap = el("div", { class: "sd-notif-time-wrap" }, chip);
    if (timePickerOpen && n.morningReminder) {
      const t = parseTime(n.reminderTime);
      const hourInput = el("input", {
        type: "number",
        min: "1",
        max: "12",
        value: t.h12,
        class: "sd-notif-time-input",
        onclick: (e) => e.stopPropagation(),
        onchange: (e) => {
          t.h12 = clampHour(parseInt(e.target.value, 10));
          n.reminderTime = formatTime(t);
          markDirty();
          H().render();
        },
      });
      const minInput = el("input", {
        type: "number",
        min: "0",
        max: "59",
        value: String(t.m).padStart(2, "0"),
        class: "sd-notif-time-input",
        onclick: (e) => e.stopPropagation(),
        onchange: (e) => {
          t.m = clampMin(parseInt(e.target.value, 10));
          n.reminderTime = formatTime(t);
          markDirty();
          H().render();
        },
      });
      const ampmBtn = (label) =>
        el(
          "button",
          {
            type: "button",
            class:
              "sd-notif-time-ampm" + (t.ampm === label ? " active" : ""),
            onclick: (e) => {
              e.stopPropagation();
              t.ampm = label;
              n.reminderTime = formatTime(t);
              markDirty();
              H().render();
            },
          },
          label,
        );
      wrap.appendChild(
        el(
          "div",
          {
            class: "sd-notif-time-picker",
            onclick: (e) => e.stopPropagation(),
          },
          el(
            "div",
            { class: "sd-notif-time-fields" },
            hourInput,
            el("span", { class: "sd-notif-time-sep" }, ":"),
            minInput,
          ),
          el(
            "div",
            { class: "sd-notif-time-ampm-row" },
            ampmBtn("AM"),
            ampmBtn("PM"),
          ),
        ),
      );
    }
    return wrap;
  }

  function renderToggle(isOn, onChange) {
    const { el } = H();
    return el(
      "button",
      {
        type: "button",
        class: "sd-toggle-switch" + (isOn ? " is-on" : ""),
        role: "switch",
        "aria-checked": isOn ? "true" : "false",
        onclick: () => onChange(!isOn),
      },
      el("span", { class: "sd-toggle-circle" }),
    );
  }

  /* === Dialogs === */

  function openLogoutFromPanel() {
    const state = S();
    if (state.panelDirty) {
      state.dialog = "discard";
      state.dialogContext = "logout";
      H().render();
      return;
    }
    openLogoutDialog();
  }

  function openLogoutDialog() {
    const state = S();
    state.dialog = "logout";
    state.dialogContext = null;
    H().render();
  }

  function mountDialog() {
    const { el } = H();
    const state = S();
    if (state.dialog === "discard") {
      mountDialogBox({
        title: "Discard unsaved changes?",
        body: "You have unsaved changes. If you leave now, they will be lost.",
        leftLabel: "Leave any way",
        rightLabel: "Cancel",
        onLeft: () => {
          const ctx = state.dialogContext;
          state.dialog = null;
          state.dialogContext = null;
          state.panelDirty = false;
          if (ctx === "logout") {
            finishClosePanel();
            openLogoutDialog();
          } else {
            finishClosePanel();
          }
        },
        onRight: () => {
          state.dialog = null;
          state.dialogContext = null;
          H().render();
        },
      });
    } else if (state.dialog === "logout") {
      mountDialogBox({
        title: "Log out?",
        body: "Your preferences will be reset to defaults. Outfit suggestions and metric visibility will return to standard settings.",
        leftLabel: "Log Out",
        rightLabel: "Cancel",
        onLeft: () => {
          state.dialog = null;
          state.dialogContext = null;
          doLogout();
        },
        onRight: () => {
          state.dialog = null;
          state.dialogContext = null;
          H().render();
        },
      });
    }
  }

  function mountDialogBox(opts) {
    const { el } = H();
    const backdrop = el(
      "div",
      {
        class: "sd-dialog-backdrop",
        onclick: () => opts.onRight(),
      },
      el(
        "div",
        {
          class: "sd-dialog",
          onclick: (e) => e.stopPropagation(),
        },
        el("div", { class: "sd-dialog-title" }, opts.title),
        el("div", { class: "sd-dialog-body" }, opts.body),
        el(
          "div",
          { class: "sd-dialog-actions" },
          el(
            "button",
            {
              class: "sd-dialog-btn sd-dialog-btn-secondary",
              onclick: () => opts.onLeft(),
            },
            opts.leftLabel,
          ),
          el(
            "button",
            {
              class: "sd-dialog-btn sd-dialog-btn-primary",
              onclick: () => opts.onRight(),
            },
            opts.rightLabel,
          ),
        ),
      ),
    );
    document.body.appendChild(backdrop);
  }

  function doLogout() {
    const state = S();
    state.auth = { loggedIn: false, user: null };
    state.userPrefs.sensitivityOffset = 0;
    state.userPrefs.visibleMetrics = Object.assign({}, DEFAULT_VISIBLE_METRICS);
    state.userPrefs.notifications = Object.assign({}, DEFAULT_NOTIFICATIONS);
    state.feedbackSessionHidden = true;
    state.feedback.hidden = new Set();
    state.panelOpen = null;
    state.panelDirty = false;
    state.panelPending = null;
    state.profileDropdownOpen = false;
    H().render();
  }

  /* === Saved toast === */

  let savedToastTimer = null;
  function showSavedToast() {
    const state = S();
    state.savedToastUntil = Date.now() + 3000;
    mountSavedToast();
    if (savedToastTimer) clearTimeout(savedToastTimer);
    savedToastTimer = setTimeout(() => {
      const t = document.querySelector(".sd-saved-toast");
      if (t) {
        t.classList.add("is-leaving");
        setTimeout(() => t.remove(), 220);
      }
      state.savedToastUntil = 0;
    }, 3000);
  }

  function mountSavedToast() {
    const { el } = H();
    const existing = document.querySelector(".sd-saved-toast");
    if (existing) return;
    const toast = el(
      "div",
      {
        class: "sd-saved-toast",
        onclick: () => {
          toast.classList.add("is-leaving");
          setTimeout(() => toast.remove(), 200);
          if (savedToastTimer) {
            clearTimeout(savedToastTimer);
            savedToastTimer = null;
          }
          S().savedToastUntil = 0;
        },
      },
      el("i", { class: "fa-solid fa-circle-check sd-saved-toast-icon" }),
      el(
        "div",
        { class: "sd-saved-toast-text" },
        el(
          "div",
          { class: "sd-saved-toast-title" },
          "Settings saved",
        ),
        el(
          "div",
          { class: "sd-saved-toast-sub" },
          "Your changes have been applied.",
        ),
      ),
    );
    document.body.appendChild(toast);
  }

  /* === Outside-click handling — close dropdown only === */

  document.addEventListener("click", function (e) {
    const state = S();
    if (state.profileDropdownOpen) {
      const inDropdown = e.target.closest(".sd-profile-dropdown");
      const inPill = e.target.closest(".sd-profile-pill");
      if (!inDropdown && !inPill) {
        state.profileDropdownOpen = false;
        H().render();
        return;
      }
    }
    /* Close the time-picker on any click outside it (chip handler stops
       propagation, so opening doesn't trigger this). */
    if (timePickerOpen) {
      const inPicker =
        e.target.closest(".sd-notif-time-picker") ||
        e.target.closest(".sd-notif-time-chip");
      if (!inPicker) {
        timePickerOpen = false;
        H().render();
      }
    }
  });

  /* Reposition the dropdown on resize while it's open. */
  window.addEventListener("resize", function () {
    const dd = document.querySelector(".sd-profile-dropdown");
    if (dd) positionDropdown(dd);
  });

  window.SkyDress.settings = {
    renderProfilePill,
    mountOverlays,
    openPanel,
  };
})();
