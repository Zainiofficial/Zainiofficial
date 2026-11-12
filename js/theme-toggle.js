/* ============================================================
   theme-toggle.js — Light / Dark switch for Zaini Official
   • Adds a toggle button into .header (or floating if no header)
   • Saves the choice in localStorage ("zaini-theme")
   • Swaps the header logo to the white version in dark mode
   Pair with css/theme.css and the inline no-flash snippet in <head>.
   ============================================================ */
(function () {
  "use strict";

  var KEY = "zaini-theme";
  var html = document.documentElement;
  var LOGO_LIGHT = "images/zaini-logo-black.png";
  var LOGO_DARK = "images/zaini-logo-dark.png";

  function saved() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }
  function store(v) {
    try {
      localStorage.setItem(KEY, v);
    } catch (e) {
      /* private mode */
    }
  }
  function current() {
    return html.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function swapLogos(theme) {
    var imgs = document.querySelectorAll(".header .logo img");
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (!img.dataset.lightSrc) {
        img.dataset.lightSrc = img.getAttribute("src");
        img.dataset.darkSrc =
          img.dataset.lightSrc.replace(/[^/]*$/, "") +
          LOGO_DARK.replace(/^images\//, "");
        if (img.dataset.lightSrc.indexOf("zaini-logo-black") === -1)
          img.dataset.darkSrc = img.dataset.lightSrc;
      }
      img.setAttribute(
        "src",
        theme === "dark" ? img.dataset.darkSrc : img.dataset.lightSrc,
      );
    }
  }

  function apply(theme, animate) {
    if (animate) {
      html.classList.add("theme-switching");
      clearTimeout(apply._t);
      apply._t = setTimeout(function () {
        html.classList.remove("theme-switching");
      }, 500);
    }
    if (theme === "dark") html.setAttribute("data-theme", "dark");
    else html.removeAttribute("data-theme");
    swapLogos(theme);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = theme === "dark" ? "#0d1717" : "#008b8b";

    var btns = document.querySelectorAll(".theme-toggle");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btns[i].setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      );
      btns[i].title = theme === "dark" ? "Light mode" : "Dark mode";
    }
  }

  function buildButton() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-toggle";
    btn.innerHTML =
      '<span class="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/>' +
      '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>' +
      "</span>" +
      '<span class="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
      "</span>" +
      '<span class="theme-toggle__knob" aria-hidden="true"></span>';
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      store(next);
      apply(next, true);
    });
    return btn;
  }

  function mount() {
    var header = document.querySelector(".header");
    var btn = buildButton();

    if (header) {
      var actions = document.createElement("div");
      actions.className = "header-actions";
      actions.appendChild(btn);
      var menuBtn = header.querySelector(".menu-btn");
      if (menuBtn) actions.appendChild(menuBtn); // keep ☰ next to the switch on mobile
      header.appendChild(actions); // after the nav links (right end)
    } else {
      btn.classList.add("theme-toggle--floating");
      document.body.appendChild(btn);
    }

    apply(saved() === "dark" ? "dark" : current(), false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }

  // follow the OS only if the user never chose manually
  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function (e) {
        if (!saved()) apply(e.matches ? "dark" : "light", true);
      });
  }

  window.zainiTheme = {
    set: function (t) {
      store(t);
      apply(t, true);
    },
    get: current,
  };
})();
