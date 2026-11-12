/* ============================================================
   gallery-gsap.js — Zaini Official Gallery (single-file: CSS is injected by this script)
   GSAP 3 + ScrollTrigger + custom LERP smooth scroll

   Features
   • Lerp (linear interpolation) smooth scroll — frame-rate independent
   • Scroll-velocity skew on the grids (lerped)
   • Masked character reveal on section titles
   • Clip-path + scale reveal for every gallery item (batched)
   • Scrubbed parallax inside each image frame
   • Lerped 3D tilt + zoom on hover (desktop only)
   • Waits for the Zaini loader (html.zl-lock / #zlLoader) before the intro
   • Respects prefers-reduced-motion, falls back to native scroll on touch

   Setup (before </body>):
   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>
   <script src="js/gallery-gsap.js"></script>
   ============================================================ */
(function () {
  "use strict";

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn("[gallery-anim] GSAP / ScrollTrigger not loaded.");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- inject the required CSS (single-file setup) ---------- */
  (function injectCSS() {
    if (document.getElementById("gallery-gsap-css")) return;
    var style = document.createElement("style");
    style.id = "gallery-gsap-css";
    style.textContent =
      "/* --- Lerp smooth scroll (only added on desktop / fine pointer) --- */\n" +
      "html.ga-smooth body {\n" +
      "    overscroll-behavior: none;\n" +
      "}\n" +
      "\n" +
      "html.ga-smooth .content_holder {\n" +
      "    position: fixed;\n" +
      "    top: 0;\n" +
      "    left: 0;\n" +
      "    width: 100%;\n" +
      "    will-change: transform;\n" +
      "    backface-visibility: hidden;\n" +
      "}\n" +
      "\n" +
      "/* --- Grid items / images --- */\n" +
      ".gallery_items {\n" +
      "    perspective: 900px;\n" +
      "}\n" +
      "\n" +
      ".gallery_grid_container {\n" +
      "    will-change: transform;\n" +
      "    transform-origin: 50% 50%;\n" +
      "}\n" +
      "\n" +
      ".grid_images {\n" +
      "    overflow: hidden;\n" +
      "    transform-style: preserve-3d;\n" +
      "    will-change: transform, clip-path;\n" +
      "}\n" +
      "\n" +
      ".grid_images img {\n" +
      "    display: block;\n" +
      "    width: 100%;\n" +
      "    height: 100%;\n" +
      "    object-fit: cover;\n" +
      "    will-change: transform;\n" +
      "    transform-origin: 50% 50%;\n" +
      "}\n" +
      "\n" +
      "/* --- Split heading characters --- */\n" +
      ".ga-mask {\n" +
      "    display: inline-block;\n" +
      "    overflow: hidden;\n" +
      "    vertical-align: bottom;\n" +
      "    padding-bottom: 0.14em;\n" +
      "    margin-bottom: -0.14em;\n" +
      "}\n" +
      "\n" +
      ".ga-char {\n" +
      "    display: inline-block;\n" +
      "    white-space: pre;\n" +
      "    will-change: transform;\n" +
      "}\n" +
      "\n" +
      "/* --- Reduced motion: show everything, no transforms --- */\n" +
      "@media (prefers-reduced-motion: reduce) {\n" +
      "    .gallery_items,\n" +
      "    .gallery_title p,\n" +
      "    .ga-char {\n" +
      "        opacity: 1 !important;\n" +
      "        visibility: visible !important;\n" +
      "        transform: none !important;\n" +
      "        clip-path: none !important;\n" +
      "    }\n" +
      "}";
    document.head.appendChild(style);
  })();

  /* ---------------- Tweak here ---------------- */
  var CONFIG = {
    lerp: 0.085, // 0.05 = floaty / heavy, 0.15 = snappy
    skewMax: 3.5, // max degrees of scroll-velocity skew
    skewFactor: 0.04, // how strongly velocity maps to skew
    skewLerp: 0.1, // smoothing of the skew value
    parallax: 8, // yPercent travel of each image while scrolling
    imgScale: 1.16, // resting scale (hides parallax edges)
    hoverScale: 1.24, // image scale on hover
    hoverTilt: 7, // max degrees of tilt on hover
    revealStagger: 0.07, // delay between neighbouring items
    revealMaxStagger: 0.5, // cap for the whole batch (seconds)
    loaderTimeout: 7000, // ms – start anyway if loader never signals
  };
  /* -------------------------------------------- */

  var html = document.documentElement;
  var body = document.body;
  var holder = document.querySelector(".content_holder");
  if (!holder) return;

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
  var useSmooth = finePointer && !reduceMotion;

  var lerp = function (a, b, t) {
    return a + (b - a) * t;
  };
  var clamp = gsap.utils.clamp(-CONFIG.skewMax, CONFIG.skewMax);

  var grids = gsap.utils.toArray(".gallery_grid_container");
  var items = gsap.utils.toArray(".gallery_items");
  var frames = gsap.utils.toArray(".grid_images");
  var imgs = gsap.utils.toArray(".grid_images img");
  var titles = gsap.utils.toArray(".gallery_title");

  if (reduceMotion) {
    // Nothing to animate – keep the page static and accessible.
    return;
  }

  /* =========================================================
       1. LERP SMOOTH SCROLL
       The native scrollbar stays (body gets the real height),
       .content_holder is fixed and translated towards window.scrollY
       with a lerp. ScrollTrigger reads our lerped value via scrollerProxy.
       ========================================================= */
  var scroll = {target: 0, current: 0, velocity: 0, skew: 0};
  var setY = gsap.quickSetter(holder, "y", "px");
  var setSkew = gsap.quickSetter(grids, "skewY", "deg");

  function setBodyHeight() {
    body.style.height = Math.ceil(holder.getBoundingClientRect().height) + "px";
  }

  if (useSmooth) {
    html.classList.add("ga-smooth");
    scroll.target = scroll.current = window.scrollY || 0;
    setY(-scroll.current);
    setBodyHeight();

    ScrollTrigger.scrollerProxy(body, {
      scrollTop: function (value) {
        if (arguments.length) {
          scroll.target = scroll.current = value;
          setY(-value);
          window.scrollTo(0, value);
        }
        return scroll.current;
      },
      getBoundingClientRect: function () {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: "transform",
    });

    gsap.ticker.add(function (time, deltaTime) {
      scroll.target = window.scrollY || 0;

      // frame-rate independent lerp (deltaTime is in ms)
      var t = 1 - Math.pow(1 - CONFIG.lerp, deltaTime / 16.667);
      scroll.current = lerp(scroll.current, scroll.target, t);
      if (Math.abs(scroll.target - scroll.current) < 0.1)
        scroll.current = scroll.target;

      scroll.velocity = scroll.target - scroll.current;
      setY(-scroll.current);

      // velocity → skew, itself lerped for a silky feel
      var targetSkew = clamp(scroll.velocity * CONFIG.skewFactor);
      scroll.skew = lerp(scroll.skew, targetSkew, CONFIG.skewLerp);
      if (Math.abs(scroll.skew) < 0.01) scroll.skew = 0;
      setSkew(scroll.skew);

      ScrollTrigger.update();
    });

    // keep body height & triggers in sync with lazy images / resizes
    var refreshTimer;
    var ro = new ResizeObserver(function () {
      setBodyHeight();
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(function () {
        ScrollTrigger.refresh();
      }, 120);
    });
    ro.observe(holder);
    ScrollTrigger.addEventListener("refresh", setBodyHeight);
  }

  ScrollTrigger.config({ignoreMobileResize: true});
  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });

  /* =========================================================
       2. INITIAL STATES (hidden until revealed)
       ========================================================= */
  gsap.set(frames, {clipPath: "inset(14% 10% 14% 10%)", autoAlpha: 0, y: 60});
  gsap.set(imgs, {scale: CONFIG.imgScale + 0.25});
  gsap.set(".gallery_title p", {autoAlpha: 0, y: 30});

  // split heading text into masked characters
  function splitChars(el) {
    var text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    var mask = document.createElement("span");
    mask.className = "ga-mask";
    mask.setAttribute("aria-hidden", "true");
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement("span");
      span.className = "ga-char";
      span.textContent = text[i];
      mask.appendChild(span);
    }
    el.appendChild(mask);
    return mask.children;
  }

  titles.forEach(function (title) {
    var heading = title.querySelector("h1, h2, h3");
    if (!heading) return;
    var chars = splitChars(heading);
    gsap.set(chars, {yPercent: 115, rotate: 4});
  });

  /* =========================================================
       3. REVEAL ANIMATIONS (created once the loader is gone)
       ========================================================= */
  function buildReveals() {
    // Titles
    titles.forEach(function (title) {
      var chars = title.querySelectorAll(".ga-char");
      var para = title.querySelector("p");
      var tl = gsap.timeline({
        scrollTrigger: {trigger: title, start: "top 85%", once: true},
      });
      tl.to(chars, {
        yPercent: 0,
        rotate: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: {each: 0.035, from: "start"},
      });
      if (para) {
        tl.to(
          para,
          {autoAlpha: 1, y: 0, duration: 1, ease: "power3.out"},
          0.35,
        );
      }
    });

    // Gallery items – batched so neighbours stagger together
    ScrollTrigger.batch(frames, {
      start: "top 92%",
      once: true,
      onEnter: function (batch) {
        // cap total stagger so a big scroll jump never feels sluggish
        var stagger = {
          amount: Math.min(
            CONFIG.revealStagger * (batch.length - 1),
            CONFIG.revealMaxStagger,
          ),
        };
        gsap.to(batch, {
          clipPath: "inset(0% 0% 0% 0%)",
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: stagger,
          overwrite: "auto",
        });
        gsap.to(
          batch.map(function (f) {
            return f.querySelector("img");
          }),
          {
            scale: CONFIG.imgScale,
            duration: 1.6,
            ease: "power3.out",
            stagger: stagger,
            overwrite: "auto",
          },
        );
      },
    });

    // Parallax inside each frame (scrubbed to the lerped scroll)
    frames.forEach(function (frame) {
      var img = frame.querySelector("img");
      if (!img) return;
      gsap.fromTo(
        img,
        {yPercent: -CONFIG.parallax},
        {
          yPercent: CONFIG.parallax,
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });

    ScrollTrigger.refresh();
  }

  /* =========================================================
       4. HOVER – lerped 3D tilt + zoom (desktop only)
       ========================================================= */
  if (finePointer) {
    items.forEach(function (item) {
      var frame = item.querySelector(".grid_images");
      var img = item.querySelector("img");
      if (!frame || !img) return;

      var rx = gsap.quickTo(frame, "rotationX", {
        duration: 0.7,
        ease: "power3",
      });
      var ry = gsap.quickTo(frame, "rotationY", {
        duration: 0.7,
        ease: "power3",
      });
      // quickTo can't reset 'scale' directly, so drive scaleX/scaleY
      var sx = gsap.quickTo(img, "scaleX", {duration: 0.9, ease: "power3"});
      var sy = gsap.quickTo(img, "scaleY", {duration: 0.9, ease: "power3"});
      var sc = function (v) {
        sx(v);
        sy(v);
      };

      item.addEventListener("pointerenter", function () {
        sc(CONFIG.hoverScale);
      });
      item.addEventListener("pointermove", function (e) {
        var r = frame.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5; // -0.5 → 0.5
        var py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * CONFIG.hoverTilt * 2);
        rx(-py * CONFIG.hoverTilt * 2);
      });
      item.addEventListener("pointerleave", function () {
        rx(0);
        ry(0);
        sc(CONFIG.imgScale);
      });
    });
  }

  /* =========================================================
       5. WAIT FOR THE LOADER, THEN START
       ========================================================= */
  var loaderEl = document.getElementById("zlLoader");

  function loaderGone() {
    if (html.classList.contains("zl-lock")) return false;
    if (!loaderEl || !loaderEl.isConnected || loaderEl.hidden) return true;
    if (loaderEl.getAttribute("aria-hidden") === "true") return true;
    if (
      /\b(done|hide|hidden|out|complete|finish|loaded)\b/i.test(
        loaderEl.className,
      )
    )
      return true;
    var cs = getComputedStyle(loaderEl);
    return (
      cs.display === "none" ||
      cs.visibility === "hidden" ||
      parseFloat(cs.opacity) === 0
    );
  }

  var started = false;
  function start() {
    if (started) return;
    started = true;
    html.classList.add("ga-ready");
    buildReveals();
  }

  if (loaderGone()) {
    start();
  } else {
    var poll = setInterval(function () {
      if (loaderGone()) {
        clearInterval(poll);
        start();
      }
    }, 100);
    setTimeout(function () {
      clearInterval(poll);
      start();
    }, CONFIG.loaderTimeout);
  }

  // expose for debugging / tweaking in the console
  window.galleryAnim = {
    config: CONFIG,
    scroll: scroll,
    refresh: function () {
      ScrollTrigger.refresh();
    },
  };
})();
