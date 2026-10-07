document.addEventListener("DOMContentLoaded", function () {
  if ("undefined" == typeof gsap)
    return void console.warn("GSAP library is not loaded.");
  "undefined" != typeof ScrollTrigger && gsap.registerPlugin(ScrollTrigger);
  const r = document.querySelector("[data-scroll-web_page]"),
    e = () => (window.innerWidth > 1024 && r ? r : window),
    o = gsap.timeline({defaults: {overwrite: "auto", ease: "power3.out"}});
  (o
    .from(".header", {
      y: -20,
      opacity: 0,
      duration: 0.45,
      stagger: 0.05,
      delay: 1,
    })
    .from(
      ".right-svg",
      {scale: 0.6, opacity: 0, duration: 0.9, ease: "power2.out"},
      "-=1",
    )
    .from(
      ".profile-main",
      {x: -100, scale: 1.25, opacity: 0, duration: 1.2, ease: "power2.out"},
      "<+=0.3",
    )
    .from(
      [
        ".hi-btn",
        ".main-txt",
        ".banner-container h2",
        ".dev-vector",
        ".dev-description",
        ".work-btn-container .bab-button",
      ],
      {x: -30, opacity: 0, duration: 0.6, stagger: 0.06},
      "<+=0.1",
    ),
    document.querySelector("#about") &&
      (gsap.from(".about-left img", {
        scrollTrigger: {
          trigger: "#about",
          scroller: e(),
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        x: -50,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
      }),
      gsap.from(".about-right > *", {
        scrollTrigger: {
          trigger: "#about",
          scroller: e(),
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: "power2.out",
      }),
      gsap.from(".expertse-box", {
        scrollTrigger: {
          trigger: ".about-grid-wrapper",
          scroller: e(),
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        scale: 0.85,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "back.out(1.5)",
      })),
    document.querySelector("#skill") &&
      (gsap.from(".skill-wrapper .inner-heading, .skill-wrapper > p", {
        scrollTrigger: {
          trigger: "#skill",
          scroller: e(),
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 0.3,
      }),
      gsap.from(".skills-container .skill", {
        scrollTrigger: {
          trigger: ".skills-container",
          scroller: e(),
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        stagger: {each: 0.1, from: "start", grid: "auto"},
        duration: 0.5,
        ease: "power2.out",
        clearProps: "all",
      })),
    document.querySelector("#work") &&
      (gsap.from(".work-section h2, .work-section > p", {
        scrollTrigger: {
          trigger: "#work",
          scroller: e(),
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
      }),
      gsap.from(".work-grid .work-item", {
        scrollTrigger: {
          trigger: ".work-grid",
          scroller: e(),
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 60,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power2.out",
      })),
    document.querySelector("#company") &&
      (gsap.from(".company-right > *", {
        scrollTrigger: {
          trigger: "#company",
          scroller: e(),
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        x: -50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
      }),
      gsap.from(".creative-box", {
        scrollTrigger: {
          trigger: ".creative-container",
          scroller: e(),
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
      }),
      gsap.from(".company-left", {
        scrollTrigger: {
          trigger: "#company",
          scroller: e(),
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
      })),
    document.querySelector("#hobbies") &&
      (gsap.from(".hobbies-wrapper h2, .hobbies-wrapper > p", {
        scrollTrigger: {
          trigger: "#hobbies",
          scroller: e(),
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
      }),
      gsap.from(".hoby-left", {
        scrollTrigger: {
          trigger: ".hobbies",
          scroller: e(),
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        x: -50,
        opacity: 0,
        duration: 1,
      }),
      gsap.from(".hoby-items", {
        scrollTrigger: {
          trigger: ".hoby-right",
          scroller: e(),
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        x: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 0.9,
        ease: "power2.out",
      }),
      gsap.from(".fueling-growth .opening-project", {
        scrollTrigger: {
          trigger: ".fueling-growth",
          scroller: e(),
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
      })),
    document.querySelector(".footer") &&
      gsap.from(".footer-flex-container > div", {
        scrollTrigger: {
          trigger: ".footer",
          scroller: e(),
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
      }));
});
