/* =========================================================
   PROJECTS PAGE — GSAP (clean / professional)
   Load AFTER: gsap.min.js, scrollTrigger.min.js, locomotive, main.js, gsap.js
   Header + footer are handled by gsap.js — not touched here.
   One motion style everywhere: soft fade-up, power3.out, small stagger.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined") return console.warn("GSAP not loaded.");
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Same scroller as homepage: Locomotive wrapper on desktop, window below 1024
  const wrap = document.querySelector("[data-scroll-web_page]");
  const scroller = window.innerWidth > 1024 && wrap ? wrap : window;

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- One motion style ---------- */
  const EASE = "power3.out";
  const FROM = {y: 40, opacity: 0};
  const TO = (extra = {}) => ({
    y: 0,
    opacity: 1,
    duration: 0.9,
    ease: EASE,
    clearProps: "transform,opacity", // keeps your CSS hover effects working
    ...extra,
  });

  // Play once when the element enters
  const st = (trigger, start = "top 85%") => ({
    trigger,
    scroller,
    start,
    toggleActions: "play none none none",
  });

  /* ---------- Banner heading: words rise from a mask (keeps <span> + <br>) ---------- */
  // keepElements = true → inner tags like <span> stay whole (their CSS is untouched)
  const makeMask = () => {
    const mask = document.createElement("span");
    mask.style.cssText =
      "display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.12em;margin-bottom:-0.12em;";
    const inner = document.createElement("span");
    inner.style.display = "inline-block";
    mask.appendChild(inner);
    return {mask, inner};
  };

  function splitWords(el, keepElements = false) {
    const words = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part))
              return frag.appendChild(document.createTextNode(" "));
            const mask = document.createElement("span");
            mask.style.cssText =
              "display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.12em;margin-bottom:-0.12em;";
            const word = document.createElement("span");
            word.style.display = "inline-block";
            word.textContent = part;
            mask.appendChild(word);
            frag.appendChild(mask);
            words.push(word);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          if (keepElements) {
            const {mask, inner} = makeMask();
            child.replaceWith(mask);
            inner.appendChild(child);
            words.push(inner);
          } else {
            walk(child);
          }
        }
      });
    };
    walk(el);
    return words;
  }

  // Words rise one by one; when done, original HTML is put back → design stays 100% original
  function revealWords(el, keepElements = false, extra = {}) {
    const original = el.innerHTML;
    return gsap.fromTo(
      splitWords(el, keepElements),
      {yPercent: 100},
      {
        yPercent: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.04,
        ...extra,
        onComplete: () => (el.innerHTML = original),
      },
    );
  }

  /* =========================================================
     1. BANNER — after the Zaini loader
     ========================================================= */
  const hero = gsap.timeline({paused: true});
  const heroH2 = $(".project-caption-banner h2");
  const heroP = $(".project-caption-banner p");

  // Banner image wipes open left → right (same as card images)
  const heroImg = $(".project-banner-bg img");
  if (heroImg) {
    hero.fromTo(
      heroImg,
      {clipPath: "inset(0% 100% 0% 0%)"},
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.4,
        ease: "power3.inOut",
        clearProps: "clipPath",
      },
      0,
    );
  }

  if (heroH2) {
    hero.add(revealWords(heroH2), 0.7);
  }
  if (heroP) hero.fromTo(heroP, FROM, TO(), "-=0.6");

  // Run fn only after the Zaini loader is gone (otherwise in-view items animate hidden behind it)
  const afterLoader = (fn) => {
    if (window.__zlDone || !document.getElementById("zlLoader")) fn();
    else document.addEventListener("zaini:loader-done", fn, {once: true});
  };
  const inView = (el) =>
    el.getBoundingClientRect().top < window.innerHeight * 0.9;

  afterLoader(() => hero.play());

  /* =========================================================
     2. FILTER BUTTONS — whole bar (div + buttons) comes in as ONE piece
     ========================================================= */
  const filterBox = $(".filter-buttons");

  if (filterBox) {
    // CSS `transition` on this div would fight GSAP and hide the motion → off while animating
    const cssTransition = filterBox.style.transition;
    filterBox.style.transition = "none";
    gsap.set(filterBox, {y: 80, opacity: 0});

    afterLoader(() => {
      gsap.to(filterBox, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        delay: inView(filterBox) ? 1.1 : 0, // already on screen → wait for banner text
        scrollTrigger: st(filterBox, "top 95%"),
        onComplete: () => {
          gsap.set(filterBox, {clearProps: "transform,opacity"});
          filterBox.style.transition = cssTransition;
        },
      });
    });
  }

  /* =========================================================
     3. PROJECT CARDS — 1 by 1:
        STEP 1: the whole card rises up into place
        STEP 2: then the image inside it wipes open left → right
     ========================================================= */
  const cards = $$(".project-grid .project-card");

  if (cards.length) {
    const IMG_HIDDEN = "inset(0% 100% 0% 0%)";
    const IMG_SHOWN = "inset(0% 0% 0% 0%)";
    const imgOf = (card) => $(".project-image img", card);
    const partsOf = (card) =>
      [card, $(".project-image", card), imgOf(card)].filter(Boolean);

    // CSS transitions (hover) fight GSAP → off while animating, back on when done
    const transitionsOff = (card) =>
      partsOf(card).forEach((el) => {
        el.style.transition = "none";
        el.style.willChange = "transform, opacity, clip-path";
      });
    const finishCard = (card) => {
      gsap.set(card, {clearProps: "transform,opacity"});
      const img = imgOf(card);
      if (img) gsap.set(img, {clearProps: "clipPath"});
      partsOf(card).forEach((el) => {
        el.style.transition = "";
        el.style.willChange = "";
      });
    };

    // hidden start state
    cards.forEach((card) => {
      transitionsOff(card);
      gsap.set(card, {y: 100, opacity: 0});
      const img = imgOf(card);
      if (img) gsap.set(img, {clipPath: IMG_HIDDEN});
    });

    const revealCard = (card, delay) => {
      if (card._revealed) return;
      card._revealed = true;
      const img = imgOf(card);

      const tl = gsap.timeline({delay, onComplete: () => finishCard(card)});
      // STEP 1 — card rises (long soft settle = lerp feel)
      tl.to(card, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        force3D: true,
      });
      // STEP 2 — image wipes in once the card is (almost) in place
      if (img)
        tl.to(
          img,
          {clipPath: IMG_SHOWN, duration: 1.1, ease: "power3.inOut"},
          "-=0.35",
        );
      card._tl = tl;
    };

    let cardTriggers = [];

    afterLoader(() => {
      const createdAt = Date.now();
      cardTriggers = ScrollTrigger.batch(cards, {
        scroller,
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          // cards already on screen at load → wait for banner + filter bar
          const delay = Date.now() - createdAt < 300 ? 1.4 : 0;
          batch.forEach((card, i) => revealCard(card, delay + i * 0.2));
        },
      });
    });

    // Filter click → finish everything so your CSS card-show / card-hidden takes over
    $$("[data-filter]").forEach((btn) =>
      btn.addEventListener("click", () => {
        cardTriggers.forEach((t) => t.kill());
        cardTriggers = [];
        cards.forEach((card) => {
          if (card._tl) card._tl.kill();
          card._revealed = true;
          finishCard(card);
        });
      }),
    );
  }

  /* =========================================================
     4. PROCESS SECTION — label + heading first, then steps one by one
     ========================================================= */
  const steps = $$(".process-timeline .process-step");
  const label = $(".process-heading .process-label");
  const heading = $(".process-heading h2");

  // Mask rise WITHOUT touching the HTML → layout never changes.
  // Element moves up 100% while the clip opens by the same 100% → looks like it rises from behind a fixed mask.
  const maskRise = (el, extra = {}) =>
    gsap.fromTo(
      el,
      {yPercent: 100, clipPath: "inset(0% 0% 100% 0%)"},
      {
        yPercent: 0,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.1,
        ease: "power4.out",
        clearProps: "transform,clipPath",
        ...extra,
      },
    );

  // label + h2
  const headingTl = () => {
    const tl = gsap.timeline();
    if (label) tl.add(maskRise(label, {duration: 0.9}));
    if (heading) tl.add(maskRise(heading), label ? "-=0.65" : 0);
    return tl;
  };

  // one step → marker fades up, h3 words rise, p fades up
  const stepTl = (step) => {
    const tl = gsap.timeline();
    const marker = $(".step-marker", step);
    const h3 = $("h3", step);
    const p = $("p", step);
    if (marker) tl.fromTo(marker, {y: 20, opacity: 0}, TO({duration: 0.7}));
    if (h3) tl.add(maskRise(h3, {duration: 0.9}), 0.1);
    if (p) tl.fromTo(p, FROM, TO(), 0.3);
    return tl;
  };

  if ($(".process-section")) {
    if (window.innerWidth >= 768) {
      // Desktop / tablet: heading first, then steps left → right, one by one
      const tl = gsap.timeline({
        scrollTrigger: st(".process-section", "top 75%"),
      });
      tl.add(headingTl());
      steps.forEach((step, i) =>
        tl.add(stepTl(step), i === 0 ? "-=0.5" : "-=0.85"),
      );
    } else {
      // Mobile: heading on its own, each stacked step when it scrolls in
      gsap.timeline({scrollTrigger: st(".process-heading")}).add(headingTl());
      steps.forEach((step) =>
        gsap.timeline({scrollTrigger: st(step, "top 90%")}).add(stepTl(step)),
      );
    }
  }

  // Images change page height once loaded — recalc trigger positions
  window.addEventListener("load", () => ScrollTrigger.refresh());
});
