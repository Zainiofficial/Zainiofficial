(function () {
  var loader = document.getElementById("zlLoader");
  var root = document.documentElement;
  if (!loader) {
    window.__zlDone = true;
    return;
  }

  var ANIM_MS = 1800;
  var HOLD_MS = 250;
  var EXIT_MS = 800;
  var MAX_WAIT = 8000;
  var SHOW_ONCE_PER_SESSION = false;

  var reduce =
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finished = false;

  try {
    if (SHOW_ONCE_PER_SESSION && sessionStorage.getItem("zlSeen")) {
      loader.parentNode.removeChild(loader);
      window.__zlDone = true;
      return;
    }
  } catch (e) {}

  root.classList.add("zl-lock");

  function done() {
    if (finished) return;
    finished = true;
    try {
      sessionStorage.setItem("zlSeen", "1");
    } catch (e) {}
    loader.classList.add("zl-exit");

    setTimeout(
      function () {
        window.__zlDone = true;
        document.dispatchEvent(new CustomEvent("zaini:loader-done"));
      },
      reduce ? 0 : 350,
    );

    setTimeout(
      function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
        root.classList.remove("zl-lock");
        if (window.ScrollTrigger) {
          try {
            ScrollTrigger.refresh();
          } catch (e) {}
        }
      },
      reduce ? 450 : EXIT_MS + 50,
    );
  }

  setTimeout(done, MAX_WAIT);

  var imgs = Array.prototype.slice.call(loader.querySelectorAll("img"));
  var ready = Promise.all(
    imgs.map(function (img) {
      if (img.decode) return img.decode().catch(function () {});
      return new Promise(function (res) {
        if (img.complete) return res();
        img.onload = img.onerror = res;
      });
    }),
  );
  var timeout = new Promise(function (res) {
    setTimeout(res, 2500);
  });

  Promise.race([ready, timeout]).then(function () {
    loader.classList.add("zl-go");
    var animDone = new Promise(function (res) {
      setTimeout(res, reduce ? 500 : ANIM_MS + HOLD_MS);
    });
    var pageLoaded = new Promise(function (res) {
      if (document.readyState === "complete") res();
      else window.addEventListener("load", res, {once: true});
    });
    Promise.all([animDone, pageLoaded]).then(done);
  });
})();
