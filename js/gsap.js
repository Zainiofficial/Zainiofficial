/* =========================================================
   gsap.js — SITE-WIDE (homepage sections + header + footer)
   - Header + footer animations: unchanged from the original
   - Homepage sections: same motion style as projects-gsap.js / contact-gsap.js
     (images wipe left → right, headings rise from a mask, text fades up,
      cards come in 1 by 1, everything plays once)
   Every section is guarded, so projects.html / contact.html only get header + footer.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  if ("undefined" == typeof gsap)
    return void console.warn("GSAP library is not loaded.");
  "undefined" != typeof ScrollTrigger && gsap.registerPlugin(ScrollTrigger);

  const r = document.querySelector("[data-scroll-web_page]"),
    e = () => (window.innerWidth > 1024 && r ? r : window),
    o = gsap.timeline({
      paused: true,
      defaults: {overwrite: "auto", ease: "power3.out"},
    });

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ---------- Loader handling (same as before) ---------- */
  const afterLoader = (fn) => {
    if (window.__zlDone || !document.getElementById("zlLoader")) fn();
    else document.addEventListener("zaini:loader-done", fn, {once: true});
  };

  /* =========================================================
     HEADER — exactly as before
     ========================================================= */
  o.from(".header", {
    y: -20,
    opacity: 0,
    duration: 0.45,
    stagger: 0.05,
    delay: 0.5,
  });

  /* =========================================================
     SHARED MOTION (same as projects / contact pages)
     ========================================================= */
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

  // rises from behind a fixed mask — HTML untouched, layout never changes
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

  // CSS transitions (hover) fight GSAP and cause jerks → off while animating, back on after
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

  // Build a paused timeline now (hidden states set right away), play it once when `trigger` scrolls in.
  // If it's already on screen when the loader finishes → wait for the hero first.
  const onScroll = (trigger, build, start = "top 82%", animatedEls = []) => {
    if (!trigger) return;
    const restore = transitionsOff(animatedEls);
    // tl.afterDone (optional, set inside build) runs after the timeline finishes
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        restore();
        if (tl.afterDone) tl.afterDone();
      },
    });
    build(tl);
    afterLoader(() => {
      const createdAt = Date.now();
      ScrollTrigger.create({
        trigger,
        scroller: e(),
        start,
        once: true,
        onEnter: () => {
          const delay = Date.now() - createdAt < 300 ? 1.6 : 0;
          gsap.delayedCall(delay, () => tl.play());
        },
      });
    });
  };

  // Words rise from a mask (hero heading only); original HTML put back at the end
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
  function revealWords(el, extra = {}) {
    const original = el.innerHTML;
    return gsap.fromTo(
      splitWords(el),
      {yPercent: 100},
      {
        yPercent: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.05,
        ...extra,
        onComplete: () => (el.innerHTML = original),
      },
    );
  }

  /* =========================================================
     HOMEPAGE — HERO (plays right after the header, after the loader)
     ========================================================= */
  const hero = $(".banner-container");

  if (hero && !reduceMotion) {
    const svg = $(".right-svg", hero);
    const profile = $(".profile-main", hero);
    const hiBtn = $(".hi-btn", hero);
    const h1 = $(".main-txt", hero);
    const h2 = $(".left-section > h2", hero);
    const vector = $(".dev-vector img", hero);
    const desc = $(".dev-description", hero);
    const btns = $$(".work-btn-container .bab-button", hero);
    const HERO_SYNC = {duration: 1.4, ease: "power3.out"}; // photo + h1 share this

    const restore = transitionsOff([hiBtn, desc, ...btns]);
    o.eventCallback("onComplete", restore);

    // STEP 1: the whole SVG (blob shape) zooms in
    if (svg) {
      o.add(
        gsap.fromTo(
          svg,
          {scale: 0.6, opacity: 0, transformOrigin: "50% 50%"},
          {
            scale: 1,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            clearProps: "transform,opacity",
          },
        ),
        0, // starts together with the header (was 0.6)
      );
    }
    o.addLabel("photo", 0.2); // photo + h1 start here (was 0.5)
    // STEP 2: then the photo inside the shape zooms in
    if (profile) {
      o.add(
        gsap.fromTo(
          profile,
          {scale: 0.75, opacity: 0, transformOrigin: "50% 50%"}, // zoom from the centre, not from the bottom
          {
            scale: 1,
            opacity: 1,
            duration: HERO_SYNC.duration,
            ease: HERO_SYNC.ease,
          }, // same timing as the h1
        ),
        "photo",
      );
    }

    // text: badge → name words rise → title words rise → vector wipes → description → buttons
    // fixed start times (seconds after the loader) so nothing waits for the item before it to finish
    if (hiBtn) o.add(fromLeft(hiBtn, -40, {duration: 0.8}), 0);
    // h1 uses the exact same start, duration and ease as the photo → they move as one.
    // Not split into words: the coloured <span> inside stays untouched, so its colour
    // is there from the first frame (splitting + rebuilding the HTML made the colour come late).
    // h1 is revealed left → right (a wipe opening from the left edge while it slides in).
    // HTML untouched → span colour shows from the first frame.
    if (h1)
      o.add(
        gsap.fromTo(
          h1,
          {clipPath: "inset(-10% 100% -10% 0%)", x: -40, opacity: 0},
          {
            clipPath: "inset(-10% 0% -10% 0%)",
            x: 0,
            opacity: 1,
            duration: HERO_SYNC.duration,
            ease: HERO_SYNC.ease,
            clearProps: "transform,opacity,clipPath",
          },
        ),
        "photo",
      );
    if (h2) o.add(revealWords(h2, {stagger: 0.06}), 0.4); // was ~1.2s
    if (vector) o.add(wipeIn(vector, {duration: 1}), 0.55); // was ~1.6s
    if (desc) o.add(up(desc, 30), 0.65); // was ~1.8s
    if (btns.length) o.add(up(btns, 30, {stagger: 0.1}), 0.8); // was ~2s
  }

  // Header + hero intro wait for the Zaini loader, then play by itself
  afterLoader(() => o.play());

  if (!reduceMotion) {
    /* =========================================================
       HOMEPAGE — ABOUT
       ========================================================= */
    const about = $("#about.about");
    if (about) {
      const img = $(".about-left img", about);
      const right = $(".about-right", about);
      const sideBySide = window.innerWidth >= 768;

      // Mobile (stacked): image on its own when it scrolls in
      if (!sideBySide) {
        onScroll($(".about-left", about), (tl) => {
          if (img) tl.add(wipeIn(img));
        });
      }

      if (right) {
        const badge = $(".me-about-wrapper", right);
        const h2 = $(":scope > h2", right);
        const h3 = $(":scope > h3", right);
        const paras = $$(":scope > p", right);
        // Desktop: image + text in ONE timeline → the image opens together with the h2
        onScroll(
          sideBySide ? about : right,
          (tl) => {
            if (badge) tl.add(fromLeft(badge, -40, {duration: 0.8}), 0);
            tl.addLabel("h2", 0.3);
            if (h2) tl.add(maskRise(h2), "h2");
            // image uses the h2's exact start, duration and ease → they show as one
            if (sideBySide && img)
              tl.add(wipeIn(img, {duration: 1.1, ease: "power4.out"}), "h2");
            if (h3) tl.add(maskRise(h3, {duration: 0.9}), "h2+=0.3");
            if (paras.length) tl.add(up(paras, 30, {stagger: 0.12}), "h2+=0.5");
          },
          "top 80%",
          [badge],
        );
      }

      // experience boxes — 1 by 1
      const boxes = $$(".expertse-box", about);
      onScroll(
        $(".about-grid-wrapper", about),
        // experience boxes: from the left, 1 by 1, long soft settle (lerp feel)
        (tl) =>
          tl.add(
            fromLeft(boxes, -100, {
              duration: 1.6,
              ease: "expo.out",
              stagger: 0.14,
            }),
          ),
        "top 88%",
        boxes,
      );
    }

    /* =========================================================
       HOMEPAGE — SKILLS (spotlight)
       Panels are switched by your CSS radios → not touched; only the reveal.
       ========================================================= */
    const sp = $(".sp-section");
    if (sp) {
      const badge = $(".sp-badge", sp);
      const title = $(".sp-title", sp);
      const items = $$(".sp-item", sp);
      const stage = $(".sp-stage", sp);

      onScroll(
        $(".sp-left", sp),
        (tl) => {
          if (badge) tl.add(fromLeft(badge, -40, {duration: 0.8}));
          if (title) tl.add(maskRise(title), "-=0.5");
          if (items.length)
            tl.add(
              fromLeft(items, -50, {duration: 0.8, stagger: 0.06}),
              "-=0.7",
            );
        },
        "top 80%",
        [badge, ...items],
      );

      // spotlight card rises like a card
      onScroll(
        stage,
        (tl) => tl.add(up(stage, 80, {duration: 1.2})),
        "top 85%",
        [stage],
      );
    }

    /* =========================================================
       HOMEPAGE — COMPANY (Spark Digitus)
       ========================================================= */
    const company = $("#company.company-container");
    if (company) {
      const right = $(".company-right", company);
      if (right) {
        const label = $(".currentlt-working", right);
        const h2 = $(":scope > h2", right);
        const paras = $$(":scope > p:not(.currentlt-working)", right);
        const boxes = $$(".creative-box", right);
        const btn = $(":scope > .bab-button", right);

        const card = $(".main-left-card", company);
        const cardImg = card && $(".left-card-one img", card);
        const stats = card ? $$(".opening-project", card) : [];
        const sideBySide = window.innerWidth >= 768;

        // Desktop: text + left card in ONE timeline → the card image opens together with the h2
        onScroll(
          sideBySide ? company : right,
          (tl) => {
            if (sideBySide && card) tl.add(up(card, 100, {duration: 1.2}), 0);
            if (label) tl.add(fromLeft(label, -40, {duration: 0.8}), 0);
            tl.addLabel("h2", 0.3);
            if (h2) tl.add(maskRise(h2), "h2");
            // image uses the h2's exact start, duration and ease → they move as one
            if (sideBySide && cardImg)
              tl.add(
                wipeIn(cardImg, {duration: 1.1, ease: "power4.out"}),
                "h2",
              );
            if (paras.length)
              tl.add(up(paras, 30, {stagger: 0.12}), "h2+=0.35");
            if (sideBySide && stats.length)
              tl.add(up(stats, 40, {stagger: 0.12}), "h2+=0.5");
          },
          "top 80%",
          sideBySide && card ? [card, ...stats] : [],
        );
        onScroll(
          $(".creative-container", right),
          (tl) => {
            if (boxes.length)
              // creative boxes: from the left, 1 by 1, long soft settle (lerp feel)
              tl.add(
                fromLeft(boxes, -100, {
                  duration: 1.6,
                  ease: "expo.out",
                  stagger: 0.14,
                }),
              );
            if (btn) tl.add(up(btn, 30), "-=1.1");
          },
          "top 88%",
          [...boxes, btn],
        );
      }

      // Mobile only (stacked): left card on its own — rises, image wipes in, stats 1 by 1
      const card = $(".main-left-card", company);
      if (card && window.innerWidth < 768) {
        const img = $(".left-card-one img", card);
        const stats = $$(".opening-project", card);
        onScroll(
          card,
          (tl) => {
            tl.add(up(card, 100, {duration: 1.2}));
            if (img) tl.add(wipeIn(img, {duration: 1.1}), "-=0.35");
            if (stats.length) tl.add(up(stats, 40, {stagger: 0.12}), "-=0.7");
          },
          "top 85%",
          [card, ...stats],
        );
      }
    }

    /* =========================================================
       HOMEPAGE — HOBBIES (Fueling My Growth)
       ========================================================= */
    const hobbies = $("#hobbies.hobbies-wrapper");
    if (hobbies) {
      const h2 = $(":scope > h2", hobbies);
      const p = $(":scope > p", hobbies);
      onScroll(hobbies, (tl) => {
        if (h2) tl.add(maskRise(h2));
        if (p) tl.add(up(p, 30), "-=0.75");
      });

      // ORDER: 1) left image + right cards together (cards 1 by 1 from the left) → 2) "fueling-growth" bar slides in from the left
      const hobbyRow = $(".hobbies", hobbies);
      const img = $(".hobbies-image img", hobbies);
      const items = $$(".hoby-right .hoby-items", hobbies);
      const growth = $(".fueling-growth", hobbies);

      // step 3 waits for BOTH: the cards finished AND the bar is on screen
      let cardsDone = !items.length;
      let growthInView = false;
      const growthTl = gsap.timeline({paused: true});
      if (growth) {
        const restoreGrowth = transitionsOff([growth]);
        growthTl.add(
          fromLeft(growth, -100, {duration: 1.1, onComplete: restoreGrowth}),
        );
      }
      const tryGrowth = () => cardsDone && growthInView && growthTl.play();

      if (hobbyRow) {
        if (window.innerWidth >= 768) {
          // side by side → one timeline: image, then cards
          onScroll(
            hobbyRow,
            (tl) => {
              // image and cards start at the SAME moment (cards still 1 by 1, from the left)
              if (img) tl.add(wipeIn(img), 0);
              if (items.length)
                tl.add(fromLeft(items, -80, {duration: 1.1, stagger: 0.15}), 0);
              tl.afterDone = () => {
                cardsDone = true;
                tryGrowth();
              };
            },
            "top 80%",
            items,
          );
        } else {
          // mobile: stacked → image when it scrolls in, then each card when it scrolls in
          onScroll($(".hoby-left", hobbies), (tl) => {
            if (img) tl.add(wipeIn(img));
          });
          items.forEach((item, i) =>
            onScroll(
              item,
              (tl) => {
                tl.add(fromLeft(item, -80, {duration: 1.1}));
                if (i === items.length - 1)
                  tl.afterDone = () => {
                    cardsDone = true;
                    tryGrowth();
                  };
              },
              "top 88%",
              [item],
            ),
          );
        }
      }

      if (growth) {
        afterLoader(() =>
          ScrollTrigger.create({
            trigger: growth,
            scroller: e(),
            start: "top 90%",
            once: true,
            onEnter: () => {
              growthInView = true;
              tryGrowth();
            },
          }),
        );
      }
    }

    /* =========================================================
       HOMEPAGE — SOCIAL (Find Me Online)
       ========================================================= */
    const social = $(".social-wrapper");
    if (social) {
      const cap = $(".every-where-caption", social);
      if (cap) {
        const label = $(":scope > p", cap);
        const h2 = $(":scope > h2", cap);
        const h3 = $(":scope > h3", cap);
        const h2Span = h2 && $("span", h2);
        // a span is inline by default and can't move → inline-block only while animating
        if (h2Span) h2Span.style.display = "inline-block";

        onScroll(cap, (tl) => {
          if (label) tl.add(fromLeft(label, -40, {duration: 0.8}));
          // h2 slides in from the left…
          if (h2) tl.add(fromLeft(h2, -80, {duration: 1.1}), "-=0.5");
          // …and the coloured span inside it rises up from below (from behind a mask)
          if (h2Span)
            tl.add(
              maskRise(h2Span, {
                duration: 1,
                onComplete: () => (h2Span.style.display = ""),
              }),
              "<0.35",
            );
          if (h3) tl.add(up(h3, 30), "-=0.6");
        });
      }

      // social <a> cards: rise from below, 1 by 1, with a long soft settle (lerp feel)
      const smCards = $$(".sm-links .sm-card", social);
      // an inline <a> can't be moved by transforms → inline-block only while animating
      const madeBlock = smCards.filter(
        (a) => getComputedStyle(a).display === "inline",
      );
      madeBlock.forEach((a) => (a.style.display = "inline-block"));

      onScroll(
        $(".sm-links", social),
        (tl) => {
          tl.add(
            gsap.fromTo(
              smCards,
              {y: 120, opacity: 0},
              {
                y: 0,
                opacity: 1,
                duration: 1.6,
                ease: "expo.out", // fast start, very long soft finish = lerp
                stagger: 0.14,
                force3D: true,
                clearProps: "transform,opacity",
              },
            ),
          );
          tl.afterDone = () => madeBlock.forEach((a) => (a.style.display = ""));
        },
        "top 90%",
        smCards,
      );
    }

    /* =========================================================
       HOMEPAGE — RUNNING SLIDER (only fades in; your CSS marquee keeps running)
       ========================================================= */
    const slider = $(".running-slider .slider");
    if (slider)
      onScroll(
        slider,
        (tl) => tl.add(up(slider, 40, {duration: 1})),
        "top 92%",
      );
  }

  /* =========================================================
     FOOTER — exactly as before
     ========================================================= */
  document.querySelector("footer") &&
    gsap.from("footer > *", {
      scrollTrigger: {
        trigger: "footer",
        scroller: e(),
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
      y: 25,
      opacity: 0,
      stagger: 0.12,
      duration: 0.7,
      ease: "power2.out",
    });

  // Images change page height once loaded — recalc trigger positions
  window.addEventListener("load", () => ScrollTrigger.refresh());
});
