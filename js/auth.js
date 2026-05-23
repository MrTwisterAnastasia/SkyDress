/* SkyDress extended — Auth screens (public landing, sign-in, sign-up, sign-up form).
   All state lives in window.SkyDress.state; helpers come from window.SkyDress.app. */
(function () {
  "use strict";

  window.SkyDress = window.SkyDress || {};

  /* App helpers — re-resolved at call time so we always read the live values. */
  function H() {
    return window.SkyDress.app;
  }
  function S() {
    return window.SkyDress.state;
  }

  /* === Shared elements === */

  function authHeader() {
    const { el, iconEl } = H();
    return el(
      "header",
      { class: "sd-auth-header" },
      el(
        "div",
        { class: "sd-logo", onclick: goHome, role: "button", tabindex: "0" },
        el("div", { class: "sd-logo-icon" }, iconEl("fa-sun")),
        el("span", { class: "sd-logo-text" }, "SkyDress"),
      ),
    );
  }

  /* Logo click → main page if logged in, public landing otherwise. */
  function goHome() {
    const state = S();
    const target = state.auth.loggedIn ? "main" : "public";
    if (state.view === target) return; // already there, avoid extra render
    go(target);
  }

  function go(view) {
    const state = S();
    state.view = view;
    /* Clear ?error=true and stale ?view= when navigating in-app */
    state.authErrorToast = false;
    /* Close any overlay state that doesn't belong on an auth screen. */
    state.profileDropdownOpen = false;
    state.panelOpen = null;
    state.panelDirty = false;
    state.panelPending = null;
    state.dialog = null;
    state.dialogContext = null;
    if (view === "signupform") {
      state.signupForm = {
        name: "",
        nameError: null,
        avatarDataUrl: null,
        sliderPos: 2, // Average
        nameTouched: false,
      };
    }
    history.replaceState({}, "", location.pathname);
    H().render();
  }

  /* === Public landing page === */

  function renderPublicPage() {
    const { el } = H();

    const featureCard = (icon, title, body) =>
      el(
        "div",
        { class: "sd-public-card" },
        el(
          "div",
          { class: "sd-public-card-icon" },
          el("i", { class: "fa-solid " + icon }),
        ),
        el(
          "div",
          { class: "sd-public-card-body" },
          el("div", { class: "sd-public-card-title" }, title),
          el("div", { class: "sd-public-card-desc" }, body),
        ),
      );

    /* Hero mascot — desktop and mobile use different artwork crops. CSS
       toggles which one is visible at the breakpoint. */
    const heroMascot = el(
      "div",
      { class: "sd-public-hero-mascot" },
      el("img", {
        class: "sd-public-hero-mascot-img sd-public-hero-desktop",
        src: "assets/mascot_states/publick_main_pose_web.png",
        alt: "",
        "aria-hidden": "true",
      }),
      el("img", {
        class: "sd-public-hero-mascot-img sd-public-hero-mobile",
        src: "assets/mascot_states/publick_main_pose_mobile.png",
        alt: "",
        "aria-hidden": "true",
      }),
    );

    return el(
      "div",
      { class: "sd-public" },
      authHeader(),
      el(
        "main",
        { class: "sd-public-main" },
        el(
          "h1",
          { class: "sd-public-headline" },
          "Your closet, weather-approved",
        ),
        el(
          "p",
          { class: "sd-public-sub" },
          "Create a free account and start every morning knowing exactly what to put on.",
        ),
        el(
          "div",
          { class: "sd-public-cards" },
          featureCard(
            "fa-cloud-sun",
            "Daily outfit picks",
            "Personalized based on real-time local weather data.",
          ),
          featureCard(
            "fa-location-dot",
            "Your city, saved",
            "Hyper-local forecasts for your exact neighborhood.",
          ),
          featureCard(
            "fa-clock",
            "Morning reminder",
            "Push notifications so you never overthink it again.",
          ),
        ),
        el(
          "div",
          { class: "sd-public-cta-area" },
          heroMascot,
          el(
            "div",
            { class: "sd-public-buttons" },
            el(
              "button",
              {
                class: "sd-cta-btn sd-cta-signup",
                onclick: () => go("signup"),
              },
              "SIGN UP",
            ),
            el(
              "button",
              {
                class: "sd-cta-btn sd-cta-signin",
                onclick: () => go("signin"),
              },
              "SIGN IN",
            ),
          ),
          el(
            "p",
            { class: "sd-public-caption" },
            "Free forever · No credit card · Cancel anytime",
          ),
        ),
      ),
      /* Bottom row: just the frosted card centered. Side mascots removed. */
      el(
        "div",
        { class: "sd-public-bottom-row" },
        el(
          "div",
          { class: "sd-public-bottom-card" },
          el(
            "div",
            { class: "sd-public-bottom-icon" },
            el("i", { class: "fa-solid fa-heart" }),
          ),
          el(
            "div",
            { class: "sd-public-bottom-text" },
            el(
              "div",
              { class: "sd-public-bottom-title" },
              "🧥 Today's pick: light jacket + jeans",
            ),
            el(
              "div",
              { class: "sd-public-bottom-sub" },
              "14°C and breezy in Kyiv",
            ),
            el(
              "div",
              { class: "sd-public-bottom-skel" },
              el("span", { class: "sd-skel-pill sd-skel-pill-lg" }),
              el("span", { class: "sd-skel-pill sd-skel-pill-sm" }),
            ),
          ),
        ),
      ),
    );
  }

  /* === Shared sign-in / sign-up screen (with two OAuth buttons) === */

  function renderOAuthScreen(headline, sub, onClick) {
    const { el } = H();
    /* Asset inventory:
         sign_web_hot_outfit.png       — has "26°" + sun baked in
         sign_web_cold_outfot.png      — clean penguin (no label)
         sign_mobile_hot_outfit.png    — has "26°" baked in
         sign_mobile_cold_outfit.png   — has "−6°" baked in
       So we render an overlay ONLY for the cold mascot on desktop. CSS hides
       the overlay below 600 px (mobile uses the labeled mobile PNG). */
    const hotMascot = el(
      "div",
      { class: "sd-signin-mascot sd-signin-mascot-tr" },
      el("img", {
        class: "sd-signin-mascot-img sd-signin-mascot-desktop",
        src: "assets/mascot_states/sign_web_hot_outfit.png",
        alt: "",
        "aria-hidden": "true",
      }),
      el("img", {
        class: "sd-signin-mascot-img sd-signin-mascot-mobile",
        src: "assets/mascot_states/sign_mobile_hot_outfit.png",
        alt: "",
        "aria-hidden": "true",
      }),
    );
    const coldMascot = el(
      "div",
      { class: "sd-signin-mascot sd-signin-mascot-bl" },
      el("img", {
        class: "sd-signin-mascot-img sd-signin-mascot-desktop",
        src: "assets/mascot_states/sign_web_cold_outfot.png",
        alt: "",
        "aria-hidden": "true",
      }),
      el("img", {
        class:
          "sd-signin-mascot-img sd-signin-cold-mascot-img sd-signin-mascot-mobile",
        src: "assets/mascot_states/sign_mobile_cold_outfit.png",
        alt: "",
        "aria-hidden": "true",
      }),
      el(
        "div",
        { class: "sd-signin-mascot-label sd-signin-mascot-label-cold" },
        el("span", { class: "sd-signin-mascot-temp" }, "−6°"),
        el("i", { class: "fa-solid fa-snowflake sd-signin-mascot-icon" }),
      ),
    );
    return el(
      "div",
      { class: "sd-signin" },
      authHeader(),
      hotMascot,
      coldMascot,
      el(
        "main",
        { class: "sd-signin-main" },
        /* Frosted card keeps the text + buttons readable above the mascots */
        el(
          "div",
          { class: "sd-signin-card" },
          el("h1", { class: "sd-signin-headline" }, headline),
          el("p", { class: "sd-signin-sub" }, sub),
          el(
            "div",
            { class: "sd-oauth-buttons" },
            el(
              "button",
              {
                class: "sd-oauth-btn sd-oauth-google",
                onclick: onClick,
              },
              el("i", { class: "fa-brands fa-google" }),
              "Sign in with Google",
            ),
            el(
              "button",
              {
                class: "sd-oauth-btn sd-oauth-facebook",
                onclick: onClick,
              },
              el("i", { class: "fa-brands fa-facebook-f" }),
              "Sign in with Facebook",
            ),
          ),
        ),
      ),
    );
  }

  function renderSignInPage() {
    return renderOAuthScreen(
      "Welcome back!",
      "Your personalized weather-based wardrobe awaits.",
      signInComplete,
    );
  }

  function renderSignUpPage() {
    return renderOAuthScreen(
      "Get started now!",
      "Your personalized weather-based wardrobe awaits.",
      () => go("signupform"),
    );
  }

  function signInComplete() {
    const state = S();
    state.auth = {
      loggedIn: true,
      user: { name: "User", avatar: null, sensitivityOffset: 0 },
    };
    state.view = "main";
    state.city = null;
    state.feedback.hidden = new Set();
    state.feedbackSessionHidden = false;
    state.authErrorToast = false;
    history.replaceState({}, "", location.pathname);
    H().render();
  }

  /* === Sign-up form === */

  /* Doc/05 §"sensitivityOffset value mapping" — sign-up: leftmost = -4. */
  const SIGNUP_OFFSETS = [-4, -2, 0, 2, 4];
  /* Every active label uses the same orange ("Average" treatment) — matches
     the preferences panel pattern in doc/06 so the slider feels consistent. */
  const SIGNUP_SLIDER_ACTIVE = "#F48525";
  const SLIDER_LABELS = [
    { label: "Always cold", icon: "fa-snowflake" },
    { label: "Usually cold", icon: "fa-cloud-sun" },
    { label: "Average", icon: "fa-temperature-half" },
    { label: "Usually warm", icon: "fa-sun" },
    { label: "Always warm", icon: "fa-fire" },
  ];

  function validateName(value, isSubmit) {
    const v = (value || "").trim();
    if (isSubmit && v.length === 0) return "Please enter your name.";
    if (v.length === 0) return null; // on blur with empty, no error
    if (v.length < 3) return "Name is too short — enter at least 3 characters.";
    if (v.length > 50)
      return "Name is too long — maximum 50 characters allowed.";
    if (v.toLowerCase() === "test")
      return "This name is already taken. Please choose another.";
    return null;
  }

  function renderSignUpForm() {
    const { el } = H();
    const state = S();
    if (!state.signupForm) {
      state.signupForm = {
        name: "",
        nameError: null,
        avatarDataUrl: null,
        sliderPos: 2,
        nameTouched: false,
      };
    }
    const sf = state.signupForm;

    /* === Avatar block === */
    const fileInput = el("input", {
      type: "file",
      accept: ".jpg,.jpeg,.png,image/jpeg,image/png",
      style: { display: "none" },
      onchange: (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          sf.avatarDataUrl = ev.target.result;
          H().render();
        };
        reader.readAsDataURL(file);
      },
    });

    const avatarCircle = el(
      "div",
      {
        class:
          "sd-form-avatar" + (sf.avatarDataUrl ? " sd-form-avatar-filled" : ""),
        onclick: () => fileInput.click(),
        role: "button",
        tabindex: "0",
      },
      sf.avatarDataUrl
        ? el("img", { src: sf.avatarDataUrl, alt: "avatar preview" })
        : el("i", { class: "fa-solid fa-camera" }),
    );

    const avatarLabel = el(
      "div",
      {
        class: "sd-form-avatar-label",
        onclick: () => fileInput.click(),
      },
      el("div", { class: "sd-form-avatar-title" }, "Add a photo"),
      el("div", { class: "sd-form-avatar-opt" }, "(optional)"),
    );

    /* === Name field === */
    const nameInput = el("input", {
      type: "text",
      class: "sd-form-name-input" + (sf.nameError ? " has-error" : ""),
      value: sf.name,
      placeholder: "e.g. Julianne Smith",
      maxlength: 200,
      oninput: (e) => {
        sf.name = e.target.value;
        if (sf.nameError) {
          /* Clear error live as user types */
          sf.nameError = null;
          /* Only re-render the error message, not the whole form (focus loss) */
          const wrap = e.target.closest(".sd-form-name");
          if (wrap) {
            const err = wrap.querySelector(".sd-form-name-error");
            if (err) err.remove();
            e.target.classList.remove("has-error");
          }
        }
      },
      onblur: (e) => {
        sf.nameTouched = true;
        const err = validateName(e.target.value, false);
        if (err === sf.nameError) return;
        sf.nameError = err;
        H().render();
      },
    });

    const nameBlock = el(
      "div",
      { class: "sd-form-name" },
      el("label", { class: "sd-form-name-label" }, "Your Name"),
      nameInput,
      sf.nameError && el("div", { class: "sd-form-name-error" }, sf.nameError),
    );

    /* === Sensitivity slider === */
    const sliderTrack = el("div", { class: "sd-form-slider-track" });
    const sliderFill = el("div", {
      class: "sd-form-slider-fill",
      style: { width: (sf.sliderPos / 4) * 100 + "%" },
    });
    const sliderHandle = el("div", {
      class: "sd-form-slider-handle",
      style: { left: (sf.sliderPos / 4) * 100 + "%" },
    });
    sliderTrack.appendChild(sliderFill);
    sliderTrack.appendChild(sliderHandle);

    function snapFromClientX(clientX) {
      const rect = sliderTrack.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      return Math.round(ratio * 4);
    }

    function startDrag(downEvt) {
      downEvt.preventDefault();
      const onMove = (ev) => {
        const pos = snapFromClientX(ev.clientX);
        sliderHandle.style.left = (pos / 4) * 100 + "%";
        sliderFill.style.width = (pos / 4) * 100 + "%";
      };
      const onUp = (ev) => {
        const pos = snapFromClientX(ev.clientX);
        sf.sliderPos = pos;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        H().render();
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }

    sliderTrack.addEventListener("pointerdown", startDrag);

    const sliderLabels = el(
      "div",
      { class: "sd-form-slider-labels" },
      SLIDER_LABELS.map((spec, i) => {
        const active = i === sf.sliderPos;
        const color = active ? SIGNUP_SLIDER_ACTIVE : "rgba(103,63,49,0.6)";
        return el(
          "button",
          {
            type: "button",
            class: "sd-form-slider-label" + (active ? " active" : ""),
            style: { color: color },
            onclick: () => {
              sf.sliderPos = i;
              H().render();
            },
          },
          el("i", {
            class: "fa-solid " + spec.icon,
            style: { color: color },
          }),
          el(
            "span",
            { style: { color: color, fontWeight: active ? 700 : 500 } },
            spec.label,
          ),
        );
      }),
    );

    const sliderBlock = el(
      "div",
      { class: "sd-form-slider-block" },
      el("h2", { class: "sd-form-slider-heading" }, "How do you usually feel?"),
      el(
        "p",
        { class: "sd-form-slider-sub" },
        "We'll use this to calibrate your outfit suggestion from day one",
      ),
      el("div", { class: "sd-form-slider-wrap" }, sliderTrack, sliderLabels),
    );

    /* === Card === */
    const card = el(
      "div",
      { class: "sd-form-card" },
      fileInput,
      el(
        "div",
        { class: "sd-form-card-left" },
        el("div", { class: "sd-form-avatar-row" }, avatarCircle, avatarLabel),
        nameBlock,
      ),
      el("div", { class: "sd-form-card-divider" }),
      el("div", { class: "sd-form-card-right" }, sliderBlock),
      el(
        "button",
        {
          class: "sd-form-finish",
          onclick: () => finishSignUp(),
        },
        el("span", null, "Finish Registration"),
        el("i", { class: "fa-solid fa-chevron-right" }),
      ),
    );

    return el(
      "div",
      { class: "sd-signupform" },
      authHeader(),
      el("main", { class: "sd-signupform-main" }, card),
      el(
        "p",
        { class: "sd-signupform-legal" },
        "By continuing, you agree to SkyDress's commitment to personalized comfort and thoughtful style.",
      ),
    );
  }

  function finishSignUp() {
    const state = S();
    const sf = state.signupForm;
    if (!sf) return;
    const err = validateName(sf.name, true);
    if (err) {
      sf.nameError = err;
      H().render();
      return;
    }
    const offset = SIGNUP_OFFSETS[sf.sliderPos];
    state.auth = {
      loggedIn: true,
      user: {
        name: sf.name.trim(),
        avatar: sf.avatarDataUrl,
        sensitivityOffset: offset,
      },
    };
    state.signupForm = null;
    state.view = "main";
    state.city = null;
    state.feedback.hidden = new Set();
    state.feedbackSessionHidden = false;
    state.authErrorToast = false;
    history.replaceState({}, "", location.pathname);
    H().render();
  }

  /* === Auth error toast (top-right corner, ?error=true) === */

  let authToastTimer = null;
  function maybeMountAuthErrorToast() {
    const state = S();
    if (!state.authErrorToast) return;
    if (state.view !== "signin" && state.view !== "signup") return;
    const { el } = H();
    /* Remove any existing one */
    const existing = document.querySelector(".sd-auth-error-toast");
    if (existing) existing.remove();
    const toast = el(
      "div",
      { class: "sd-auth-error-toast" },
      el(
        "div",
        { class: "sd-auth-error-msg" },
        "Something went wrong. Please reload the page to continue.",
      ),
      el(
        "button",
        {
          class: "sd-auth-error-reload",
          onclick: () => window.location.reload(),
        },
        el("i", { class: "fa-solid fa-rotate-right" }),
        " Reload",
      ),
    );
    document.body.appendChild(toast);
    if (authToastTimer) clearTimeout(authToastTimer);
    authToastTimer = setTimeout(() => {
      toast.remove();
      state.authErrorToast = false;
      authToastTimer = null;
    }, 5000);
  }

  window.SkyDress.auth = {
    renderPublicPage,
    renderSignInPage,
    renderSignUpPage,
    renderSignUpForm,
    maybeMountAuthErrorToast,
    go,
    goHome,
  };
})();
