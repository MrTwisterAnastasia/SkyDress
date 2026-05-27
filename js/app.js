/* SkyDress prototype — state, render, event handling. Vanilla JS, no build step. */
(function () {
  "use strict";

  const D = window.SkyDress.data;
  const $app = document.getElementById("app");

  /* === State === */
  const state = {
    city: null,
    pills: D.INITIAL_PILLS.slice(),
    loading: false,
    dropdownOpen: false,
    searchQuery: "",
    activeTab: "hourly",
    activeHour: 15,
    activeDay: 0,
    statsOpen: false,
    sheetExpanded: false,
    error: false,

    /* === Extended-features state (auth, settings, feedback) === */
    view: "public", // 'public' | 'signin' | 'signup' | 'signupform' | 'main'
    auth: { loggedIn: false, user: null },
    userPrefs: {
      sensitivityOffset: 0,
      visibleMetrics: {
        sunriseSunset: true,
        moonPhase: true,
        uvIndex: true,
        airQuality: true,
        visibility: true,
        pressure: true,
        allergyOutlook: true,
      },
      notifications: {
        morningReminder: true,
        reminderTime: "7:00 AM",
        outfitFeedback: true,
      },
    },
    profileDropdownOpen: false,
    panelOpen: null, // 'profile' | 'preferences' | 'notifications' | null
    panelDirty: false,
    panelPending: null,
    dialog: null, // 'discard' | 'logout' | null
    dialogContext: null, // 'close' | 'logout' (what to do after Leave-any-way)
    feedback: { hidden: new Set() },
    feedbackSessionHidden: false,
    authErrorToast: false,
    signupForm: null,
  };
  window.SkyDress.state = state;

  /* Slider scroll position is preserved across renders so that clicking a card
     doesn't snap the slider back. It is reset only on tab switch / city change. */
  let savedScrollLeft = 0;
  let resetScrollOnNextRender = true;

  function activeRecord() {
    return state.activeTab === "hourly"
      ? D.hourly[state.activeHour]
      : D.daily[state.activeDay];
  }

  /* === Actions === */
  function selectCity(cityName, pillIndex = null) {
    state.dropdownOpen = false;
    state.city = cityName;
    state.loading = true;
    state.searchQuery = "";
    if (pillIndex !== null) {
      const taken = new Set([...state.pills, cityName]);
      const pool = D.CITIES_LIST.filter((c) => !taken.has(c));
      if (pool.length > 0) {
        state.pills[pillIndex] = pool[Math.floor(Math.random() * pool.length)];
      }
    }
    render();
    setTimeout(() => {
      state.loading = false;
      state.activeTab = "hourly";
      state.activeHour = 15;
      state.activeDay = 0;
      state.statsOpen = false;
      state.sheetExpanded = false;
      resetScrollOnNextRender = true;
      render();
    }, 800);
  }
  function switchTab(tab) {
    if (state.activeTab === tab) return;
    state.activeTab = tab;
    if (tab === "hourly") state.activeHour = 15;
    else state.activeDay = 0;
    resetScrollOnNextRender = true;
    render();
  }
  function selectHour(hour) {
    state.activeHour = hour;
    render();
  }
  function selectDay(day) {
    state.activeDay = day;
    render();
  }
  function toggleStats(open) {
    state.statsOpen = open === undefined ? !state.statsOpen : open;
    render();
  }
  function toggleSheet(expanded) {
    state.sheetExpanded =
      expanded === undefined ? !state.sheetExpanded : expanded;
    render();
  }

  /* === Helpers === */
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "style" && typeof v === "object")
          Object.assign(node.style, v);
        else if (k.startsWith("on") && typeof v === "function")
          node.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === "html") node.innerHTML = v;
        else if (k in node && typeof node[k] !== "object") node[k] = v;
        else node.setAttribute(k, v);
      }
    }
    for (const c of children.flat(Infinity)) {
      if (c == null || c === false) continue;
      node.appendChild(
        typeof c === "string" || typeof c === "number"
          ? document.createTextNode(c)
          : c,
      );
    }
    return node;
  }

  /* FontAwesome 6 Free regular set is limited — these are the icons we use
     that have a free regular variant. Everything else stays fa-solid. */
  const FA_REGULAR = new Set([
    "fa-sun",
    "fa-moon",
    "fa-snowflake",
    "fa-clock",
    "fa-calendar",
    "fa-eye",
  ]);
  function faFamily(name) {
    return FA_REGULAR.has(name) ? "fa-regular" : "fa-solid";
  }
  function iconEl(faClass, extraClass, color) {
    return el("i", {
      class:
        faFamily(faClass) +
        " " +
        faClass +
        (extraClass ? " " + extraClass : ""),
      style: color ? { color } : null,
    });
  }

  /* === Renderers === */
  function render() {
    // Capture the slider's current scrollLeft BEFORE we tear down the DOM so
    // a stale scroll event isn't relied upon to update savedScrollLeft.
    const existingSlider = document.querySelector(".sd-slider");
    if (existingSlider) savedScrollLeft = existingSlider.scrollLeft;

    $app.innerHTML = "";

    /* On every render, clear any settings overlays from the previous view —
       they live on document.body, not inside $app, so $app.innerHTML="" alone
       doesn't reach them. Toasts (saved / feedback) are intentionally kept. */
    document
      .querySelectorAll(
        ".sd-profile-dropdown, .sd-panel-overlay, .sd-panel, .sd-dialog-backdrop, .sd-auth-error-toast",
      )
      .forEach((n) => n.remove());

    /* Dispatch on state.view for non-main screens (public/auth) */
    if (state.view !== "main") {
      const A = window.SkyDress.auth;
      let view;
      if (state.view === "public") view = A.renderPublicPage();
      else if (state.view === "signin") view = A.renderSignInPage();
      else if (state.view === "signup") view = A.renderSignUpPage();
      else if (state.view === "signupform") view = A.renderSignUpForm();
      if (view) {
        const page = el("div", { class: "sd-page sd-auth-page" });
        page.appendChild(view);
        $app.appendChild(page);
        A.maybeMountAuthErrorToast();
      }
      return;
    }

    /* Main view (existing flow) */
    const url = new URL(location.href);
    if (url.searchParams.get("state") === "error") state.error = true;

    const page = el("div", { class: "sd-page" });

    page.appendChild(renderHeader());

    if (state.error) {
      page.appendChild(renderErrorState());
    } else if (state.loading) {
      page.appendChild(renderLoadingScreen());
    } else if (state.city === null) {
      page.appendChild(renderNoSelectedCity());
    } else {
      /* When the mobile bottom sheet is expanded it takes the full viewport,
         so skip the main column entirely to avoid wasted work and stale DOM. */
      if (!state.sheetExpanded) page.appendChild(renderMain());
      page.appendChild(renderStatsPanel());
      page.appendChild(renderMobileSheet());
    }

    $app.appendChild(page);

    /* Mount overlays/dropdown/panels/dialogs, then feedback widget. */
    if (window.SkyDress.settings) window.SkyDress.settings.mountOverlays();
    if (window.SkyDress.feedback) window.SkyDress.feedback.mountWidget();

    // Post-render: preserve user's scroll position. Only re-scroll when a tab
    // switch / city change reset has been requested. The scrollLeft assignment
    // is wrapped in scroll-behavior: auto so it is instant, never animated.
    if (state.city !== null && !state.loading && !state.error) {
      const slider = document.querySelector(".sd-slider");
      if (slider) {
        const prevBehavior = slider.style.scrollBehavior;
        slider.style.scrollBehavior = "auto";
        if (resetScrollOnNextRender) {
          const targetIndex =
            state.activeTab === "hourly" ? state.activeHour : state.activeDay;
          const card = slider.children[targetIndex];
          slider.scrollLeft = card ? Math.max(0, card.offsetLeft - 4) : 0;
          resetScrollOnNextRender = false;
        } else {
          slider.scrollLeft = savedScrollLeft;
        }
        savedScrollLeft = slider.scrollLeft;
        slider.style.scrollBehavior = prevBehavior;
        updateArrows();
      }
    }
  }

  function renderHeader() {
    const pill =
      window.SkyDress.settings && window.SkyDress.settings.renderProfilePill
        ? window.SkyDress.settings.renderProfilePill()
        : null;
    const onLogo =
      window.SkyDress.auth && window.SkyDress.auth.goHome
        ? window.SkyDress.auth.goHome
        : null;
    return el(
      "header",
      { class: "sd-header" },
      el(
        "div",
        { class: "sd-logo", onclick: onLogo, role: "button", tabindex: "0" },
        el("div", { class: "sd-logo-icon" }, iconEl("fa-sun")),
        el("span", { class: "sd-logo-text" }, "SkyDress"),
      ),
      renderSearchArea(),
      pill,
    );
  }

  function renderSearchArea() {
    return el(
      "div",
      { class: "sd-search-area" },
      el(
        "div",
        {
          class: "sd-search-bar",
          onclick: () => {
            state.dropdownOpen = !state.dropdownOpen;
            render();
          },
        },
        iconEl("fa-location-dot"),
        el("input", {
          type: "text",
          value: state.city || "",
          placeholder: "Enter your location",
          readonly: true,
          tabindex: -1,
        }),
      ),
      el(
        "div",
        { class: "sd-pills" },
        state.pills.map((pillCity, i) =>
          el(
            "button",
            {
              class: "sd-pill",
              disabled: state.loading,
              onclick: () => selectCity(pillCity, i),
            },
            pillCity,
          ),
        ),
      ),
      state.dropdownOpen && renderDropdown(),
    );
  }

  function renderDropdown() {
    const q = state.searchQuery.trim().toLowerCase();
    const showFiltered = q.length >= 3;
    const filtered = showFiltered
      ? D.CITIES_LIST.filter((c) => c.toLowerCase().includes(q))
      : D.CITIES_LIST;
    return el(
      "div",
      { class: "sd-dropdown", onclick: (e) => e.stopPropagation() },
      el("input", {
        type: "text",
        class: "sd-dropdown-search",
        placeholder: "Search city",
        value: state.searchQuery,
        oninput: (e) => {
          state.searchQuery = e.target.value;
          rerenderDropdownOnly();
        },
      }),
      el(
        "div",
        { class: "sd-dropdown-list" },
        filtered.length === 0
          ? el(
              "div",
              { class: "sd-dropdown-empty" },
              "No cities found — try a different spelling",
            )
          : filtered.map((c) =>
              el(
                "button",
                { class: "sd-dropdown-item", onclick: () => selectCity(c) },
                c,
              ),
            ),
      ),
    );
  }

  /* Re-render only the dropdown list without losing input focus. */
  function rerenderDropdownOnly() {
    const dd = document.querySelector(".sd-dropdown");
    if (!dd) return;
    const input = dd.querySelector(".sd-dropdown-search");
    const focused = document.activeElement === input;
    const caret = input.selectionStart;
    const q = state.searchQuery.trim().toLowerCase();
    const showFiltered = q.length >= 3;
    const filtered = showFiltered
      ? D.CITIES_LIST.filter((c) => c.toLowerCase().includes(q))
      : D.CITIES_LIST;
    const list = dd.querySelector(".sd-dropdown-list");
    list.innerHTML = "";
    if (filtered.length === 0) {
      list.appendChild(
        el(
          "div",
          { class: "sd-dropdown-empty" },
          "No cities found — try a different spelling",
        ),
      );
    } else {
      filtered.forEach((c) =>
        list.appendChild(
          el(
            "button",
            { class: "sd-dropdown-item", onclick: () => selectCity(c) },
            c,
          ),
        ),
      );
    }
    if (focused) {
      input.focus();
      try {
        input.setSelectionRange(caret, caret);
      } catch (e) {}
    }
  }

  function renderNoSelectedCity() {
    const isMobile = window.matchMedia("(max-width: 599px)").matches;
    const mascotSrc = isMobile
      ? "assets/mascot_states/no-city-selected-mobile.png"
      : "assets/mascot_states/no-city-selected-desktop.png";
    const body = isMobile
      ? "No worries — just type your city below and we'll sort out the skies for you"
      : "No worries — just type your city below and we'll sort out the skies for you. Find your perfect weather spot in seconds.";
    return el(
      "div",
      { class: "sd-noselected" },
      el("h1", { class: "sd-noselected-oops" }, "Oops!"),
      el(
        "p",
        { class: "sd-noselected-subtitle" },
        "Your location is a mystery to us 🕵️",
      ),
      el("p", { class: "sd-noselected-body" }, body),
      el(
        "div",
        { class: "sd-noselected-mascot" },
        el("img", { src: mascotSrc, alt: "SkyDress mascot" }),
        el("div", { class: "sd-noselected-oval" }),
      ),
    );
  }

  function renderLoadingScreen() {
    const isMobile = window.matchMedia("(max-width: 599px)").matches;
    const mascotSrc = isMobile
      ? "assets/mascot_states/loading-mobile.png"
      : "assets/mascot_states/loading-desktop.png";
    return el(
      "div",
      { class: "sd-loading" },
      iconEl("fa-spinner", "sd-loading-spinner"),
      el(
        "div",
        { class: "sd-loading-text" },
        "Loading",
        el("span", { class: "dots" }, "..."),
      ),
      el(
        "div",
        { class: "sd-loading-mascot" },
        el("img", { src: mascotSrc, alt: "Loading mascot" }),
      ),
    );
  }

  function renderErrorState() {
    return el(
      "div",
      { class: "sd-loading" },
      el(
        "div",
        { class: "sd-loading-text", style: { color: "var(--c-text-deep)" } },
        "Something went wrong",
      ),
      el(
        "div",
        { class: "sd-loading-mascot" },
        el("img", {
          src: "assets/mascot_states/error.png",
          alt: "Error mascot",
        }),
      ),
      el(
        "button",
        {
          class: "sd-pill",
          style: { marginTop: "24px" },
          onclick: () => {
            state.error = false;
            history.replaceState({}, "", location.pathname);
            render();
          },
        },
        "Try again",
      ),
    );
  }

  function renderMain() {
    const rec = activeRecord();
    return el(
      "main",
      { class: "sd-main" },
      renderHero(rec),
      renderMascotZone(rec),
      renderForecast(),
    );
  }

  function renderHero(rec) {
    const icon =
      D.CONDITION_ICON[rec.outfitCondition || rec.condition] ||
      D.CONDITION_ICON["Sunny"];
    const tempValue = state.activeTab === "hourly" ? rec.temp : rec.high;
    /* Wrap badge + temp-row in .sd-hero-text so the mobile layout can lay
       out [text-block, feedback-widget] as a flex row with 14 px gap. On
       desktop the wrapper is just a passthrough flex column. */
    const hero = el(
      "div",
      { class: "sd-hero" },
      el(
        "div",
        { class: "sd-hero-text" },
        el("div", { class: "sd-condition-badge" }, rec.condition),
        el(
          "div",
          { class: "sd-temp-row" },
          el("span", { class: "sd-temp" }, D.formatTemp(tempValue)),
          renderIconPair(icon),
        ),
      ),
      renderMiniMetrics(rec),
    );
    return hero;
  }

  function renderIconPair(icon) {
    const wrapClass =
      "sd-icon-pair" +
      (icon.isPair && icon.primary === "fa-snowflake" ? " sd-blizzard" : "");
    const nodes = [
      el("i", {
        class: faFamily(icon.primary) + " " + icon.primary + " sd-icon-primary",
        style: { color: icon.primaryColor },
      }),
    ];
    if (icon.isPair) {
      nodes.push(
        el("i", {
          class:
            faFamily(icon.secondary) +
            " " +
            icon.secondary +
            " sd-icon-secondary",
          style: { color: icon.secondaryColor, opacity: icon.pairOpacity },
        }),
      );
    }
    return el("div", { class: wrapClass }, nodes);
  }

  function renderMiniMetrics(rec) {
    const uvText = rec.uvIndex == null ? "—" : rec.uvIndex + " " + rec.uvLabel;
    return el(
      "div",
      { class: "sd-mini-metrics" },
      miniMetric("fa-bolt", "UV Index", uvText),
      miniMetric("fa-umbrella", "Rain", rec.rainChance + "%"),
      miniMetric(
        "fa-temperature-half",
        "Feels Like",
        D.formatTemp(rec.feelsLike),
      ),
      miniMetric("fa-droplet", "Humidity", rec.humidity + "%"),
      miniMetric("fa-wind", "Wind", rec.windSpeed + " km/h"),
    );
  }
  function miniMetric(iconCls, label, value) {
    return el(
      "div",
      { class: "sd-mini-metric" },
      iconEl(iconCls),
      el("div", { class: "sd-mini-label" }, label),
      el("div", { class: "sd-mini-value" }, value),
    );
  }

  /* Card positions per body part, in zone-relative percentages.
     Derived pixel-for-pixel from the Visily mocks (desktop 546×371, mobile
     337×333). All cards are 130×50 (desktop) / 85×40 (mobile) which means a
     card width of 23.81% / 25.22% and height 13.48% / 12.01% respectively. */
  const CARD_POSITIONS = {
    desktop: {
      head: { top: 0, left: 71.25 } /* 0/371,   389/546 */,
      torso: { top: 33.69, left: 1.28 } /* 125/371, 7/546   */,
      legs: { top: 74.39, left: 0 } /* 276/371, 0       */,
      /* torso-right shifted left from 76.19% so the umbrella has room on the
         right edge in 4-card outfits without overlapping the jacket. */
      "torso-right": { top: 63.34, left: 75 },
    },
    mobile: {
      head: { top: 3.6, left: 74.78 } /* 12/333,  252/337 */,
      torso: { top: 23.42, left: 0.89 } /* 78/333,  3/337   */,
      /* Bottom cards nudged up so the collapsed mobile sheet doesn't clip them. */
      legs: { top: 60, left: 0 },
      "torso-right": { top: 65, left: 74.78 },
    },
  };

  function renderMascotZone(rec) {
    const outfitLevel = D.outfitByFeelsLikeWithOffset(
      rec.feelsLike,
      state.userPrefs.sensitivityOffset,
    );
    const mascotFile = D.MASCOT_FILENAME[outfitLevel];
    const clothing = D.OUTFIT_CLOTHING[outfitLevel] || [];
    const showUmbrella = rec.rainChance > 30;
    const isMobile = window.matchMedia("(max-width: 599px)").matches;
    const tier = isMobile ? "mobile" : "desktop";
    const positions = CARD_POSITIONS[tier];

    const zone = el(
      "div",
      { class: "sd-mascot-zone" },
      el("div", { class: "sd-mascot-oval" }),
      el(
        "div",
        { class: "sd-mascot-img-wrapper" },
        el("img", {
          src: "assets/mascot_outfits/" + mascotFile,
          alt: outfitLevel + " outfit mascot",
        }),
      ),
      showUmbrella &&
        el("img", {
          class: "sd-umbrella",
          src: "assets/icons/accessories/umbrella.png",
          alt: "umbrella accessory",
        }),
    );

    clothing.forEach((item) => {
      const pos = positions[item.body];
      if (!pos) return;
      const card = el(
        "div",
        {
          class: "sd-clothing-card",
          style: { top: pos.top + "%", left: pos.left + "%" },
          "data-body": item.body,
        },
        el("img", {
          src: "assets/icons/clothing/" + item.file,
          alt: item.file.replace(/.*_|\.svg/g, ""),
        }),
      );
      zone.appendChild(card);
    });

    return zone;
  }

  function renderForecast() {
    const isHourly = state.activeTab === "hourly";
    const records = isHourly ? D.hourly : D.daily;

    const slider = el(
      "div",
      { class: "sd-slider no-scrollbar", onscroll: onSliderScroll },
      records.map((r, i) => renderSliderCard(r, i, isHourly)),
    );

    return el(
      "section",
      { class: "sd-forecast" },
      el(
        "div",
        { class: "sd-toggle" },
        el(
          "button",
          {
            class: isHourly ? "active" : "",
            onclick: () => switchTab("hourly"),
          },
          iconEl("fa-clock"),
          "Hourly",
        ),
        el(
          "button",
          {
            class: !isHourly ? "active" : "",
            onclick: () => switchTab("10day"),
          },
          iconEl("fa-calendar"),
          "10-day",
        ),
      ),
      el(
        "div",
        { class: "sd-slider-wrapper" },
        el(
          "button",
          { class: "sd-arrow sd-arrow-left", onclick: () => scrollSlider(-1) },
          iconEl("fa-chevron-left"),
        ),
        slider,
        el(
          "button",
          { class: "sd-arrow sd-arrow-right", onclick: () => scrollSlider(1) },
          iconEl("fa-chevron-right"),
        ),
      ),
    );
  }

  function renderSliderCard(rec, index, isHourly) {
    const isActive = isHourly
      ? state.activeHour === index
      : state.activeDay === index;
    const labelText = isHourly
      ? index === 15
        ? "Now"
        : D.formatHour(index)
      : index === 0
        ? "Today"
        : rec.dayShort;
    const iconDef =
      D.CONDITION_ICON[rec.outfitCondition || rec.condition] ||
      D.CONDITION_ICON["Sunny"];
    const tempValue = isHourly ? rec.temp : rec.high;
    const iconColor = isActive ? iconDef.primaryColor : "#475569";
    return el(
      "button",
      {
        class: "sd-slider-card" + (isActive ? " active" : ""),
        onclick: () => (isHourly ? selectHour(index) : selectDay(index)),
      },
      el("div", { class: "sd-card-label" }, labelText),
      el(
        "div",
        { class: "sd-card-icon-circle" },
        el("i", {
          class: faFamily(iconDef.primary) + " " + iconDef.primary,
          style: { color: iconColor },
        }),
      ),
      el("div", { class: "sd-card-temp" }, D.formatTemp(tempValue)),
    );
  }

  function scrollSlider(dir) {
    const slider = document.querySelector(".sd-slider");
    if (!slider) return;
    slider.scrollBy({ left: dir * 100, behavior: "smooth" });
  }
  function onSliderScroll() {
    const slider = document.querySelector(".sd-slider");
    if (slider) savedScrollLeft = slider.scrollLeft;
    updateArrows();
  }
  function updateArrows() {
    const slider = document.querySelector(".sd-slider");
    if (!slider) return;
    const left = document.querySelector(".sd-arrow-left");
    const right = document.querySelector(".sd-arrow-right");
    if (!left || !right) return;
    const atStart = slider.scrollLeft <= 2;
    const atEnd =
      slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 2;
    const noOverflow = slider.scrollWidth <= slider.clientWidth + 2;
    left.hidden = atStart || noOverflow;
    right.hidden = atEnd || noOverflow;
  }

  /* === Desktop STATS panel === */
  function renderStatsPanel() {
    const rec = activeRecord();
    const vm = state.userPrefs.visibleMetrics;
    /* If every metric card in the panel is toggled off, hide the whole
       panel chrome — strip, tab, overlay, and close tab. The user has no
       way to open it back up until they re-enable a metric in Preferences.
       Also force-close it in case it was open when the last metric was
       hidden. */
    const anyStatsVisible =
      vm.sunriseSunset ||
      vm.moonPhase ||
      vm.visibility ||
      vm.pressure ||
      vm.airQuality ||
      vm.allergyOutlook;
    if (!anyStatsVisible) {
      if (state.statsOpen) state.statsOpen = false;
      return el("div");
    }
    /* Three columns per the desktop layout:
         col 1 — Sun Cycle + Moon Phase
         col 2 — Visibility + Pressure
         col 3 — Air Quality + Allergy Outlook
       Each column lays out its visible cards as a flex column with 24 px
       row gap; the three columns sit in a flex row with 26 px column gap.
       Empty columns (all toggles off) are omitted. */
    function statsColumn(cards) {
      const visible = cards.filter(Boolean);
      if (visible.length === 0) return null;
      return el("div", { class: "sd-stats-col" }, visible);
    }
    const columns = [
      statsColumn([
        vm.sunriseSunset && renderSunCycleCard(rec),
        vm.moonPhase && renderMoonPhaseCard(rec),
      ]),
      statsColumn([
        vm.visibility && renderVisibilityCard(rec),
        vm.pressure && renderPressureCard(rec),
      ]),
      statsColumn([
        vm.airQuality && renderAQICard(rec),
        vm.allergyOutlook && renderAllergyCard(rec),
      ]),
    ].filter(Boolean);
    const wrap = el(
      "div",
      null,
      el("div", { class: "sd-stats-strip", onclick: () => toggleStats(true) }),
      el(
        "button",
        {
          class: "sd-stats-tab",
          onclick: () => toggleStats(!state.statsOpen),
          "aria-label": "Open stats panel",
        },
        el(
          "div",
          { class: "sd-stats-tab-mini-icons" },
          iconEl("fa-cloud-sun"),
          iconEl("fa-chart-simple"),
        ),
        el("div", { class: "sd-stats-tab-label" }, "STATS"),
        iconEl(
          state.statsOpen ? "fa-chevron-left" : "fa-chevron-right",
          "sd-stats-tab-chevron",
        ),
      ),
      el(
        "div",
        { class: "sd-stats-panel" + (state.statsOpen ? " open" : "") },
        el(
          "div",
          { class: "sd-stats-panel-inner" },
          el("h2", { class: "sd-stats-title" }, "Environment & Conditions"),
          el("div", { class: "sd-stats-grid" }, columns),
        ),
      ),
      el(
        "button",
        {
          class: "sd-stats-close-tab",
          onclick: () => toggleStats(false),
          "aria-label": "Close stats panel",
        },
        el(
          "div",
          { class: "sd-stats-tab-mini-icons" },
          iconEl("fa-cloud-sun"),
          iconEl("fa-chart-simple"),
        ),
        el("div", { class: "sd-stats-tab-label" }, "STATS"),
        iconEl("fa-chevron-left", "sd-stats-tab-chevron"),
      ),
    );
    return wrap;
  }

  function renderSunCycleCard(rec) {
    const cycle = D.sunCycleRelative(
      rec,
      state.activeTab === "hourly" ? state.activeHour : null,
    );
    return el(
      "div",
      { class: "sd-stats-card" },
      el("div", { class: "sd-stats-card-label" }, "Sun Cycle"),
      el(
        "div",
        { class: "sd-suncycle-row" },
        el(
          "div",
          { class: "sd-stats-card-icon-circle round" },
          iconEl("fa-sun"),
        ),
        el(
          "div",
          { class: "sd-suncycle-row-text" },
          el("div", { class: "sd-suncycle-name" }, "Sunrise"),
          el("div", { class: "sd-suncycle-time" }, formatTime12(rec.sunrise)),
        ),
        el("div", { class: "sd-suncycle-relative" }, cycle.sunriseRelative),
      ),
      el("div", { class: "sd-suncycle-divider" }),
      el(
        "div",
        { class: "sd-suncycle-row" },
        el(
          "div",
          { class: "sd-stats-card-icon-circle round sunset" },
          iconEl("fa-moon"),
        ),
        el(
          "div",
          { class: "sd-suncycle-row-text" },
          el("div", { class: "sd-suncycle-name" }, "Sunset"),
          el("div", { class: "sd-suncycle-time" }, formatTime12(rec.sunset)),
        ),
        el("div", { class: "sd-suncycle-relative" }, cycle.sunsetRelative),
      ),
    );
  }

  function renderVisibilityCard(rec) {
    const vis = D.visibilityLabel(rec.visibility);
    return el(
      "div",
      { class: "sd-stats-card" },
      el(
        "div",
        { class: "sd-stats-card-label" },
        el("div", { class: "sd-stats-card-icon-circle" }, iconEl("fa-eye")),
        "Visibility",
      ),
      el(
        "div",
        { class: "sd-visibility-value" },
        el("div", { class: "sd-visibility-num" }, rec.visibility),
        el("div", { class: "sd-visibility-unit" }, "km"),
      ),
      el(
        "div",
        { class: "sd-visibility-box" },
        el("div", { class: "sd-visibility-label" }, vis.label),
        el("div", { class: "sd-visibility-tip" }, vis.tip),
      ),
    );
  }

  function renderAQICard(rec) {
    const numeric = D.AQI_NUMERIC[rec.aqi] || 22;
    const desc = D.AQI_DESCRIPTION[rec.aqi] || "";
    const fraction = D.aqiBarFraction(rec.aqi);
    return el(
      "div",
      { class: "sd-stats-card sd-aqi-card" },
      el("div", { class: "sd-stats-card-label" }, "Air Quality"),
      el("div", { class: "sd-aqi-label" }, rec.aqi),
      el("div", { class: "sd-aqi-num" }, numeric + " AQI"),
      el(
        "div",
        { class: "sd-aqi-bar" },
        el("div", {
          class: "sd-aqi-bar-fill",
          style: { width: fraction * 100 + "%" },
        }),
      ),
      el("div", { class: "sd-aqi-desc" }, desc),
    );
  }

  function renderMoonPhaseCard(rec) {
    const illum = D.MOON_ILLUM[rec.moonPhase] ?? 0;
    const daysToFull = D.nextFullMoon(
      state.activeTab === "10day" ? state.activeDay : 0,
    );
    return el(
      "div",
      { class: "sd-stats-card" },
      el("div", { class: "sd-stats-card-label" }, "Moon Phase"),
      el(
        "div",
        { class: "sd-moonphase" },
        el(
          "div",
          { class: "sd-stats-card-icon-circle round" },
          iconEl("fa-moon"),
        ),
        el(
          "div",
          null,
          el("div", { class: "sd-moonphase-name" }, rec.moonPhase),
          el("div", { class: "sd-moonphase-illum" }, illum + "% Illumination"),
        ),
      ),
      el(
        "div",
        { class: "sd-moonphase-footer" },
        el("div", { class: "sd-moonphase-next-label" }, "Next Full Moon"),
        el(
          "div",
          { class: "sd-moonphase-next-value" },
          rec.moonPhase === "Full Moon"
            ? "Today"
            : `In ${daysToFull} day${daysToFull !== 1 ? "s" : ""}`,
        ),
      ),
    );
  }

  function renderPressureCard(rec) {
    const records = state.activeTab === "hourly" ? D.hourly : D.daily;
    const prevIndex = state.activeTab === "hourly" ? state.activeHour - 1 : -1;
    const prev = prevIndex >= 0 ? records[prevIndex] : null;
    const trend = D.pressureTrend(rec, prev);
    const fraction = D.pressureBarFraction(rec.pressure);
    return el(
      "div",
      { class: "sd-stats-card" },
      el(
        "div",
        { class: "sd-stats-card-label" },
        el("div", { class: "sd-stats-card-icon-circle" }, iconEl("fa-gauge")),
        "Pressure",
      ),
      el(
        "div",
        { class: "sd-visibility-value" },
        el(
          "div",
          { class: "sd-visibility-num" },
          rec.pressure.toLocaleString(),
        ),
        el("div", { class: "sd-visibility-unit" }, "hPa"),
      ),
      el(
        "div",
        { class: "sd-pressure-bar" },
        el("div", {
          class: "sd-pressure-bar-fill",
          style: { width: fraction * 100 + "%" },
        }),
      ),
      el("div", { class: "sd-pressure-trend" }, trend),
    );
  }

  function renderAllergyCard(rec) {
    const rows = [
      { icon: "fa-tree", name: "Tree Pollen", value: rec.treePollen },
      { icon: "fa-feather", name: "Ragweed Pollen", value: rec.ragweedPollen },
      { icon: "fa-seedling", name: "Grass Pollen", value: rec.grassPollen },
      { icon: "fa-cloud", name: "Dust & Dander", value: rec.dustDander },
    ];
    return el(
      "div",
      { class: "sd-stats-card" },
      el("div", { class: "sd-stats-card-label" }, "Allergy Outlook"),
      el(
        "div",
        { class: "sd-allergy-list" },
        rows.map((r) =>
          el(
            "div",
            { class: "sd-allergy-row" },
            iconEl(r.icon, "sd-allergy-icon"),
            el("div", { class: "sd-allergy-name" }, r.name),
            el("div", { class: "sd-allergy-value" }, r.value),
            el("div", { class: "sd-allergy-bar " + r.value.toLowerCase() }),
          ),
        ),
      ),
    );
  }

  /* === Mobile bottom sheet === */
  function renderMobileSheet() {
    const rec = activeRecord();
    const uvText = rec.uvIndex == null ? "—" : rec.uvLabel;
    const uvLevel = rec.uvIndex == null ? "—" : `Level ${rec.uvIndex}`;
    const sheet = el(
      "div",
      {
        class:
          "sd-mobile-sheet " + (state.sheetExpanded ? "expanded" : "collapsed"),
        onpointerdown: handleSheetPointerDown,
        onpointerup: handleSheetPointerUp,
      },
      el("div", { class: "sd-sheet-handle", onclick: () => toggleSheet() }),
      el(
        "div",
        { class: "sd-sheet-content" },
        el(
          "div",
          { class: "sd-sheet-row" },
          sheetCard("fa-umbrella", "Rain", rec.rainChance + "%"),
          sheetCard(
            "fa-temperature-half",
            "Feels Like",
            D.formatTemp(rec.feelsLike),
          ),
        ),
        state.sheetExpanded &&
          el(
            "div",
            null,
            el(
              "div",
              { class: "sd-sheet-row" },
              sheetCompound("fa-compass", "Wind", "NW", rec.windDeg + "°"),
              sheetCompound("fa-bolt", "UV Index", uvText, uvLevel),
            ),
            el(
              "div",
              { class: "sd-sheet-row" },
              sheetCard("fa-droplet", "Humidity", rec.humidity + "%"),
              sheetCard("fa-gauge", "Pressure", rec.pressure + " hPa"),
            ),
            renderSheetSunCycle(rec),
            renderSheetMoonPhase(rec),
            renderSheetVisibility(rec),
            renderSheetAQI(rec),
            renderSheetAllergy(rec),
          ),
      ),
    );
    return sheet;
  }
  function sheetCard(icon, label, value) {
    return el(
      "div",
      { class: "sd-sheet-card" },
      iconEl(icon),
      el("div", { class: "sd-sheet-label" }, label),
      el("div", { class: "sd-sheet-value" }, value),
    );
  }
  function sheetCompound(icon, label, primary, secondary) {
    return el(
      "div",
      { class: "sd-sheet-card compound" },
      iconEl(icon),
      el("div", { class: "sd-sheet-label" }, label),
      el("div", { class: "sd-sheet-value" }, primary),
      el("div", { class: "sd-sheet-aux" }, secondary),
    );
  }

  function renderSheetSunCycle(rec) {
    const cycle = D.sunCycleRelative(
      rec,
      state.activeTab === "hourly" ? state.activeHour : null,
    );
    return el(
      "div",
      { class: "sd-sheet-large-card" },
      el("div", { class: "sd-sheet-section-label" }, "Sun Cycle"),
      el(
        "div",
        { class: "sd-suncycle-row" },
        el(
          "div",
          {
            class: "sd-stats-card-icon-circle round",
            style: { width: "40px", height: "40px", fontSize: "18px" },
          },
          iconEl("fa-sun"),
        ),
        el(
          "div",
          { class: "sd-suncycle-row-text" },
          el(
            "div",
            { class: "sd-suncycle-name", style: { fontSize: "11px" } },
            "Sunrise",
          ),
          el(
            "div",
            { class: "sd-suncycle-time", style: { fontSize: "16px" } },
            formatTime12(rec.sunrise),
          ),
        ),
        el(
          "div",
          { class: "sd-suncycle-relative", style: { fontSize: "11px" } },
          cycle.sunriseRelative,
        ),
      ),
      el("div", { class: "sd-suncycle-divider" }),
      el(
        "div",
        { class: "sd-suncycle-row" },
        el(
          "div",
          {
            class: "sd-stats-card-icon-circle round sunset",
            style: { width: "40px", height: "40px", fontSize: "18px" },
          },
          iconEl("fa-moon"),
        ),
        el(
          "div",
          { class: "sd-suncycle-row-text" },
          el(
            "div",
            { class: "sd-suncycle-name", style: { fontSize: "11px" } },
            "Sunset",
          ),
          el(
            "div",
            { class: "sd-suncycle-time", style: { fontSize: "16px" } },
            formatTime12(rec.sunset),
          ),
        ),
        el(
          "div",
          { class: "sd-suncycle-relative", style: { fontSize: "11px" } },
          cycle.sunsetRelative,
        ),
      ),
    );
  }
  function renderSheetMoonPhase(rec) {
    const illum = D.MOON_ILLUM[rec.moonPhase] ?? 0;
    const daysToFull = D.nextFullMoon(
      state.activeTab === "10day" ? state.activeDay : 0,
    );
    return el(
      "div",
      { class: "sd-sheet-large-card" },
      el("div", { class: "sd-sheet-section-label" }, "Moon Phase"),
      el(
        "div",
        { class: "sd-moonphase", style: { marginTop: "12px" } },
        el(
          "div",
          {
            class: "sd-stats-card-icon-circle round",
            style: { width: "40px", height: "40px", fontSize: "18px" },
          },
          iconEl("fa-moon"),
        ),
        el(
          "div",
          null,
          el(
            "div",
            { class: "sd-moonphase-name", style: { fontSize: "16px" } },
            rec.moonPhase,
          ),
          el(
            "div",
            { class: "sd-moonphase-illum", style: { fontSize: "11px" } },
            illum + "% Illumination",
          ),
        ),
      ),
      el(
        "div",
        { class: "sd-moonphase-footer" },
        el(
          "div",
          { class: "sd-moonphase-next-label", style: { fontSize: "10px" } },
          "Next Full Moon",
        ),
        el(
          "div",
          { class: "sd-moonphase-next-value", style: { fontSize: "11px" } },
          rec.moonPhase === "Full Moon"
            ? "Today"
            : `In ${daysToFull} day${daysToFull !== 1 ? "s" : ""}`,
        ),
      ),
    );
  }
  function renderSheetVisibility(rec) {
    const vis = D.visibilityLabel(rec.visibility);
    return el(
      "div",
      { class: "sd-sheet-large-card" },
      el(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "12px" } },
        el(
          "div",
          {
            class: "sd-stats-card-icon-circle",
            style: {
              width: "40px",
              height: "40px",
              fontSize: "18px",
              borderRadius: "12px",
            },
          },
          iconEl("fa-eye"),
        ),
        el("div", { class: "sd-sheet-section-label" }, "Visibility"),
      ),
      el(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "baseline",
            gap: "6px",
            marginTop: "8px",
          },
        },
        el(
          "div",
          {
            style: {
              fontFamily: "Open Sans, sans-serif",
              fontWeight: "700",
              fontSize: "28px",
              color: "var(--c-text-brown)",
            },
          },
          rec.visibility,
        ),
        el(
          "div",
          {
            style: {
              fontFamily: "Open Sans, sans-serif",
              fontWeight: "500",
              fontSize: "14px",
              color: "var(--c-text-brown)",
            },
          },
          "km",
        ),
      ),
      el(
        "div",
        {
          class: "sd-visibility-box",
          style: { marginTop: "8px", padding: "10px 12px" },
        },
        el(
          "div",
          { class: "sd-visibility-label", style: { fontSize: "13px" } },
          vis.label,
        ),
        el(
          "div",
          { class: "sd-visibility-tip", style: { fontSize: "11px" } },
          vis.tip,
        ),
      ),
    );
  }
  function renderSheetAQI(rec) {
    const numeric = D.AQI_NUMERIC[rec.aqi] || 22;
    const desc = D.AQI_DESCRIPTION[rec.aqi] || "";
    const fraction = D.aqiBarFraction(rec.aqi);
    return el(
      "div",
      { class: "sd-sheet-large-card aqi-card" },
      el("div", { class: "sd-sheet-section-label" }, "Air Quality"),
      el(
        "div",
        {
          style: {
            position: "absolute",
            top: "18px",
            right: "18px",
            fontFamily: "Open Sans, sans-serif",
            fontSize: "14px",
            color: "var(--c-cream)",
          },
        },
        numeric + " AQI",
      ),
      el(
        "div",
        {
          style: {
            fontFamily: "Open Sans, sans-serif",
            fontWeight: "700",
            fontSize: "20px",
            color: "#fff",
            marginTop: "4px",
          },
        },
        rec.aqi,
      ),
      el(
        "div",
        { class: "sd-aqi-bar" },
        el("div", {
          class: "sd-aqi-bar-fill",
          style: { width: fraction * 100 + "%" },
        }),
      ),
      el("div", { class: "sd-aqi-desc", style: { fontSize: "10px" } }, desc),
    );
  }
  function renderSheetAllergy(rec) {
    const rows = [
      { icon: "fa-tree", name: "Tree Pollen", value: rec.treePollen },
      { icon: "fa-feather", name: "Ragweed Pollen", value: rec.ragweedPollen },
      { icon: "fa-seedling", name: "Grass Pollen", value: rec.grassPollen },
      { icon: "fa-cloud", name: "Dust & Dander", value: rec.dustDander },
    ];
    return el(
      "div",
      { class: "sd-sheet-large-card" },
      el("div", { class: "sd-sheet-section-label" }, "Allergy Outlook"),
      el(
        "div",
        { class: "sd-allergy-list" },
        rows.map((r) =>
          el(
            "div",
            { class: "sd-allergy-row" },
            iconEl(r.icon, "sd-allergy-icon"),
            el(
              "div",
              { class: "sd-allergy-name", style: { fontSize: "12px" } },
              r.name,
            ),
            el(
              "div",
              { class: "sd-allergy-value", style: { fontSize: "12px" } },
              r.value,
            ),
            el("div", { class: "sd-allergy-bar " + r.value.toLowerCase() }),
          ),
        ),
      ),
    );
  }

  /* Pointer-based swipe for the mobile bottom sheet. Pointer events cover
     touch, mouse, and pen so the browser-preview "drag" works alongside real
     touch on devices. Swipe-down to collapse is gated on the sheet not being
     scrolled — otherwise scrolling content would accidentally close it. */
  let sheetDragStartY = null;
  function handleSheetPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    sheetDragStartY = e.clientY;
  }
  function handleSheetPointerUp(e) {
    if (sheetDragStartY == null) return;
    const dy = e.clientY - sheetDragStartY;
    sheetDragStartY = null;
    if (dy < -40 && !state.sheetExpanded) {
      toggleSheet(true);
    } else if (dy > 40 && state.sheetExpanded) {
      const sheet = document.querySelector(".sd-mobile-sheet");
      if (!sheet || sheet.scrollTop <= 0) toggleSheet(false);
    }
  }

  function formatTime12(hhmm) {
    if (!hhmm) return "";
    const [h, m] = hhmm.split(":").map(Number);
    const period = h < 12 ? "AM" : "PM";
    let hh = h % 12;
    if (hh === 0) hh = 12;
    return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
  }

  /* === Global event handlers === */
  function onDocumentClick(e) {
    if (state.dropdownOpen) {
      const within = e.target.closest(".sd-search-area");
      if (!within) {
        state.dropdownOpen = false;
        render();
        return;
      }
    }
    if (state.statsOpen) {
      const insidePanel = e.target.closest(".sd-stats-panel-inner");
      const onTab =
        e.target.closest(".sd-stats-tab") ||
        e.target.closest(".sd-stats-close-tab") ||
        e.target.closest(".sd-stats-strip");
      if (!insidePanel && !onTab) {
        state.statsOpen = false;
        render();
      }
    }
  }
  function onKeyDown(e) {
    if (e.key === "Escape" && state.dropdownOpen) {
      state.dropdownOpen = false;
      render();
    }
  }
  window.addEventListener("click", onDocumentClick);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", () => {
    updateArrows();
  });

  /* Dev-only error trigger via URL: append ?state=error to the URL. */
  const initParams = new URL(location.href).searchParams;
  if (initParams.get("state") === "error") state.error = true;

  /* Extended URL handling: ?view=signin|signup|main|public and ?error=true */
  const initView = initParams.get("view");
  if (
    initView === "signin" ||
    initView === "signup" ||
    initView === "signupform"
  )
    state.view = initView;
  else if (initView === "main") {
    /* Allow developers to land directly on the main page (logged-out pill). */
    state.view = "main";
  }
  if (initParams.get("error") === "true") state.authErrorToast = true;

  /* Expose for console debugging */
  window.SkyDress.setError = function (v) {
    state.error = !!v;
    render();
  };
  window.SkyDress.setHour = function (h) {
    state.activeHour = h;
    render();
  };
  window.SkyDress.setDay = function (d) {
    state.activeDay = d;
    render();
  };

  /* Expose for extended modules — must happen BEFORE the first render so the
     auth / settings / feedback modules can use these helpers from their own
     init code if they want to. */
  window.SkyDress.app = {
    state: state,
    el: el,
    iconEl: iconEl,
    faFamily: faFamily,
    render: render,
  };

  render();
})();
