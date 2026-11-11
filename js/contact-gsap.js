/* =========================================================
   CONTACT PAGE — GSAP (same motion style as projects-gsap.js)
   Load AFTER: gsap.min.js, scrollTrigger.min.js, locomotive, main.js, gsap.js
   Header + footer are handled by gsap.js — not touched here.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined") return console.warn("GSAP not loaded.");
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Same scroller as homepage: Locomotive wrapper on desktop, window below 1024
  const wrap = document.querySelector("[data-scroll-web_page]");
  const scroller = window.innerWidth > 1024 && wrap ? wrap : window;
  const isMobile = window.innerWidth < 768;

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Shared motion (identical to projects page) ---------- */
  const EASE = "power3.out";
  const IMG_HIDDEN = "inset(0% 100% 0% 0%)";
  const IMG_SHOWN = "inset(0% 0% 0% 0%)";

  // soft fade-up
  const up = (targets, y = 40, extra = {}) =>
    gsap.fromTo(
      targets,
      {y, opacity: 0},
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: EASE,
        force3D: true,
        clearProps: "transform,opacity",
        ...extra,
      },
    );

  // rises from behind a fixed mask — HTML untouched, so layout never changes
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

  // image wipes open left → right
  const wipeIn = (img, extra = {}) =>
    gsap.fromTo(
      img,
      {clipPath: IMG_HIDDEN},
      {
        clipPath: IMG_SHOWN,
        duration: 1.4,
        ease: "power3.inOut",
        clearProps: "clipPath",
        ...extra,
      },
    );

  // CSS transitions (hover / focus) fight GSAP and cause jerks → off while animating, back on after
  const transitionsOff = (els) => {
    els = els.filter(Boolean);
    const saved = els.map((el) => el.style.transition);
    els.forEach((el) => {
      el.style.transition = "none";
      el.style.willChange = "transform, opacity, clip-path";
    });
    return () =>
      els.forEach((el, i) => {
        el.style.transition = saved[i];
        el.style.willChange = "";
      });
  };

  // Run only after the Zaini loader is gone
  const afterLoader = (fn) => {
    if (window.__zlDone || !document.getElementById("zlLoader")) fn();
    else document.addEventListener("zaini:loader-done", fn, {once: true});
  };

  // Play a paused timeline when its trigger scrolls in (once).
  // If it's already on screen at load → wait for the banner to finish first.
  const playOnScroll = (trigger, tl, start = "top 85%", inViewDelay = 1.4) => {
    if (!trigger) return;
    afterLoader(() => {
      const createdAt = Date.now();
      ScrollTrigger.create({
        trigger,
        scroller,
        start,
        once: true,
        onEnter: () => {
          const delay = Date.now() - createdAt < 300 ? inViewDelay : 0;
          gsap.delayedCall(delay, () => tl.play());
        },
      });
    });
  };

  /* ---------- Banner heading: words rise from a mask (keeps <span> + <br>) ---------- */
  function splitWords(el) {
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
          walk(child);
        }
      });
    };
    walk(el);
    return words;
  }

  // words rise one by one; original HTML is put back at the end → design stays 100% original
  function revealWords(el) {
    const original = el.innerHTML;
    return gsap.fromTo(
      splitWords(el),
      {yPercent: 100},
      {
        yPercent: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.04,
        onComplete: () => (el.innerHTML = original),
      },
    );
  }

  /* =========================================================
     1. BANNER — same as projects page
        image wipes left → right, heading words rise, paragraph fades up
     ========================================================= */
  const hero = gsap.timeline({paused: true});
  const heroImg = $(".project-banner-bg img");
  const heroH2 = $(".project-caption-banner h2");
  const heroP = $(".project-caption-banner p");

  if (heroImg) hero.add(wipeIn(heroImg), 0);
  if (heroH2) hero.add(revealWords(heroH2), 0.7);
  if (heroP) hero.add(up(heroP), "-=0.6");

  afterLoader(() => hero.play());

  /* =========================================================
     2. CONTACT CARD — same idea as the project cards:
        STEP 1: the whole card rises into place
        STEP 2: then each column fills in — badge, heading, text,
                form fields / info items one by one
     ========================================================= */
  const ctCard = $(".ct-card");

  if (ctCard) {
    const formCol = $(".ct-form-col", ctCard);
    const infoCol = $(".ct-info-col", ctCard);

    // slide in from the left
    const fromLeft = (targets, x = -60, extra = {}) =>
      gsap.fromTo(
        targets,
        {x, opacity: 0},
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: EASE,
          force3D: true,
          clearProps: "transform,opacity",
          ...extra,
        },
      );

    // one column: badge → heading → text → fields/items one by one, all from the left
    const columnTl = (col, listSelector) => {
      const tl = gsap.timeline();
      if (!col) return tl;
      const badge = $(".ct-badge", col);
      const heading = $(".ct-heading", col);
      const text = $(".ct-text", col);
      const list = $$(listSelector, col);

      if (badge) tl.add(fromLeft(badge, -40, {duration: 0.8}));
      if (heading)
        tl.add(fromLeft(heading, -80, {duration: 1.1}), badge ? "-=0.6" : 0);
      if (text) tl.add(fromLeft(text), "-=0.8");
      if (list.length) tl.add(fromLeft(list, -60, {stagger: 0.1}), "-=0.75");
      return tl;
    };

    const formList = ".ct-form .ct-input, .ct-form .ct-actions";
    const infoList = ".ct-list .ct-item";
    const animated = [
      ctCard,
      ...$$(".ct-badge, .ct-heading, .ct-text", ctCard),
      ...$$(formList, ctCard),
      ...$$(infoList, ctCard),
    ];

    if (!isMobile) {
      // Desktop: card rises, then BOTH columns fill in at the same time
      const restore = transitionsOff(animated);
      const tl = gsap.timeline({paused: true, onComplete: restore});
      tl.add(up(ctCard, 100, {duration: 1.2}));
      tl.add(columnTl(formCol, formList), 0.15); // text starts almost with the card
      tl.add(columnTl(infoCol, infoList), "<"); // "<" = starts together with the form column
      playOnScroll(ctCard, tl, "top 88%");
    } else {
      // Mobile: columns are stacked → info column waits until it scrolls in
      const restoreA = transitionsOff([
        ctCard,
        ...(formCol
          ? $$(`.ct-badge, .ct-heading, .ct-text, ${formList}`, formCol)
          : []),
      ]);
      const tlA = gsap.timeline({paused: true, onComplete: restoreA});
      tlA.add(up(ctCard, 100, {duration: 1.2}));
      tlA.add(columnTl(formCol, formList), 0.15);
      playOnScroll(ctCard, tlA, "top 90%");

      if (infoCol) {
        const restoreB = transitionsOff(
          $$(`.ct-badge, .ct-heading, .ct-text, ${infoList}`, infoCol),
        );
        const tlB = gsap.timeline({paused: true, onComplete: restoreB});
        tlB.add(columnTl(infoCol, infoList));
        playOnScroll(infoCol, tlB, "top 85%", 0);
      }
    }
  }

  /* =========================================================
     3. LET'S TALK (CTA) — background wipes left → right,
        then label + heading rise, text + button fade up
     ========================================================= */
  const talk = $(".talk-section");

  if (talk) {
    const bg = $(".talk-bg img", talk);
    const label = $(".talk-description > p", talk);
    const h2 = $(".talk-description h2", talk);
    const h3 = $(".talk-description h3", talk);
    const btn = $(".talk-description .bab-button", talk);

    const restore = transitionsOff([bg, label, h2, h3, btn]);
    const tl = gsap.timeline({paused: true, onComplete: restore});
    if (bg) tl.add(wipeIn(bg), 0);
    if (label) tl.add(maskRise(label, {duration: 0.9}), 0.5);
    if (h2) tl.add(maskRise(h2), "-=0.65");
    if (h3) tl.add(up(h3, 30), "-=0.75");
    if (btn) tl.add(up(btn, 30), "-=0.65");

    playOnScroll(talk, tl, "top 80%", 0);
  }

  // Images change page height once loaded — recalc trigger positions
  window.addEventListener("load", () => ScrollTrigger.refresh());
});
