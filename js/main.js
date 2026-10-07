document.addEventListener("DOMContentLoaded", function () {
  const e = document.querySelector("[data-scroll-web_page]"),
    t = document.querySelector(".header"),
    o = window.innerWidth <= 1024;
  gsap.registerPlugin(ScrollTrigger);
  let r = null;
  !o &&
    e &&
    ((r = new LocomotiveScroll({
      el: e,
      smooth: !0,
      multiplier: 1.1,
      lerp: 0.09,
      getDirection: !0,
      getSpeed: !0,
    })),
    r.on("scroll", ScrollTrigger.update),
    ScrollTrigger.scrollerProxy(e, {
      scrollTop(e) {
        return arguments.length
          ? r.scrollTo(e, 0, 0)
          : r.scroll.instance.scroll.y;
      },
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }),
      pinType: e.style.transform ? "transform" : "fixed",
    }),
    new ResizeObserver(() => r.update()).observe(e));
  let n = 0;
  !o && r
    ? r.on("scroll", (e) => {
        let o = e.scroll.y;
        (o > n && o > 100
          ? t?.classList.add("scrollUp")
          : t?.classList.remove("scrollUp"),
          (n = o));
      })
    : window.addEventListener(
        "scroll",
        () => {
          let e = window.pageYOffset || document.documentElement.scrollTop;
          (e > n && e > 100
            ? t?.classList.add("scrollUp")
            : t?.classList.remove("scrollUp"),
            e <= 10 && t?.classList.remove("scrollUp"),
            (n = e <= 0 ? 0 : e));
        },
        {passive: !0},
      );
  document.querySelectorAll("[data-scroll-to]").forEach((e) => {
    e.addEventListener("click", function (e) {
      e.preventDefault();
      const t = this.getAttribute("href");
      if (!t || "#" === t) return;
      const n = document.querySelector(t);
      n &&
        (!o && r
          ? r.scrollTo(n, -50, 800)
          : n.scrollIntoView({behavior: "smooth"}));
    });
  });
  const l = document.getElementById("menu-btn"),
    i = document.getElementById("nav-menu");
  (l &&
    l.addEventListener("click", () => {
      (i?.classList.toggle("active"), l?.classList.toggle("active"));
    }),
    document.querySelectorAll(".nav-links a").forEach((e) => {
      e.addEventListener("click", () => {
        (i?.classList.remove("active"), l?.classList.remove("active"));
      });
    }));
  const s =
      void 0 !== document.hidden
        ? "hidden"
        : void 0 !== document.msHidden
          ? "msHidden"
          : "webkitHidden",
    c =
      void 0 !== document.hidden
        ? "visibilitychange"
        : void 0 !== document.msHidden
          ? "msvisibilitychange"
          : "webkitvisibilitychange",
    d = [
      document.querySelector(".titlebg"),
      document.querySelector(".svglogo"),
    ];
  function a() {
    (ScrollTrigger.refresh(), r && r.update());
  }
  (c &&
    document.addEventListener(
      c,
      () => {
        return (
          (e = document[s]),
          void d.forEach((t) => {
            t && t.classList.toggle("noplay", e);
          })
        );
        var e;
      },
      !1,
    ),
    d[0]?.classList.add("titleanim"),
    window.addEventListener("resize", () => {
      (ScrollTrigger.refresh(), !o && r && r.update());
    }),
    ScrollTrigger.addEventListener("refresh", () => r?.update()));
  const m = Array.from(document.images).filter((e) => !e.complete);
  if (0 === m.length) a();
  else {
    let e = m.length;
    m.forEach((t) => {
      const o = () => {
        ((e -= 1),
          a(),
          0 === e &&
            (t.removeEventListener("load", o),
            t.removeEventListener("error", o)));
      };
      (t.addEventListener("load", o, {once: !0}),
        t.addEventListener("error", o, {once: !0}));
    });
  }

  (window.addEventListener("load", a), setTimeout(a, 1000));
});
