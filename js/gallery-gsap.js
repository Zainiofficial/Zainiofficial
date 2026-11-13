/* =========================================================
   gallery-gsap.js — GALLERY PAGE
   Works with Locomotive Scroll (desktop, set up in main.js) and
   with native scroll (<= 1024px). Plays once per card:
     1) the box (.gallery-box-* / .mosaic-box-* / .cards-box-*)
        rises in with a smooth, lerp-like ease
     2) then the image wipes open from LEFT → RIGHT
   Transforms / clip-path are cleared after each card finishes so
   160+ images do not stay on the GPU as separate layers.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;
  gsap.registerPlugin(ScrollTrigger);

  const container = document.querySelector("[data-scroll-web_page]");
  const useLoco = window.innerWidth > 1024 && container; // same rule as main.js
  const scroller = useLoco ? container : window;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const boxes = gsap.utils.toArray(
    ".gallery-page [class^='gallery-box-'], .gallery-page [class^='mosaic-box-'], .gallery-page [class^='cards-box-'], .gallery-page [class^='portrait-box-']",
  );
  if (!boxes.length || reduceMotion) return;

  /* ---- initial states (JS only, so no-JS users still see everything) ---- */
  gsap.set(boxes, {
    autoAlpha: 0,
    y: 70,
    scale: 0.94,
    transformOrigin: "50% 100%",
  });
  boxes.forEach((box) => {
    const img = box.querySelector("img");
    if (img)
      gsap.set(img, {
        clipPath: "inset(0 100% 0 0)",
        webkitClipPath: "inset(0 100% 0 0)",
        scale: 1.15,
        transformOrigin: "0% 50%",
      });
  });

  /* ---- reveal: box first (lerp-like ease), then image from the left ---- */
  const reveal = (batch) => {
    batch.forEach((box, i) => {
      const img = box.querySelector("img");
      const tl = gsap.timeline({delay: i * 0.07});
      tl.to(box, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 1.1,
        ease: "expo.out",
        onComplete: () =>
          gsap.set(box, {clearProps: "transform,opacity,visibility"}),
      });
      if (img) {
        tl.to(
          img,
          {
            clipPath: "inset(0 0% 0 0)",
            webkitClipPath: "inset(0 0% 0 0)",
            scale: 1,
            duration: 1.0,
            ease: "power3.out",
            onComplete: () =>
              gsap.set(img, {clearProps: "clipPath,webkitClipPath,transform"}),
          },
          "-=0.75",
        );
      }
    });
  };

  ScrollTrigger.batch(boxes, {
    scroller: scroller,
    start: "top 92%",
    once: true,
    batchMax: 8, // at most one row of cards per batch
    interval: 0.1,
    onEnter: reveal,
  });

  /* ---- keep positions correct after loader + full load ---- */
  const refresh = () => ScrollTrigger.refresh();
  if (window.__zlDone || !document.getElementById("zlLoader"))
    setTimeout(refresh, 50);
  else
    document.addEventListener(
      "zaini:loader-done",
      () => setTimeout(refresh, 50),
      {once: true},
    );
  window.addEventListener("load", refresh);
});
