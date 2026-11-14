/* Progressive enhancement only: the page is complete without this file. */
(function () {
  "use strict";
  var doc = document;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* 1. Current-sheet highlight in the top bar */
  var links = Array.prototype.slice.call(doc.querySelectorAll(".sheetnav a"));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  function setCurrent(id) {
    links.forEach(function (a) {
      if (byId[id] === a) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  var sections = Object.keys(byId).map(function (id) { return doc.getElementById(id); }).filter(Boolean);
  if (hasIO && sections.length) {
    // Sections without their own nav entry map to the nearest one.
    var alias = { about: "contact" };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setCurrent(alias[e.target.id] || e.target.id); });
    }, { rootMargin: "-35% 0px -60% 0px", threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
    Object.keys(alias).forEach(function (id) { var el = doc.getElementById(id); if (el) io.observe(el); });
    // The contact block is short: mark it current once the page bottom is reached.
    window.addEventListener("scroll", function () {
      if (window.innerHeight + window.scrollY >= doc.documentElement.scrollHeight - 4) setCurrent("contact");
    }, { passive: true });
  }

  /* 2. Gentle reveal for below-the-fold blocks (skipped under reduced motion) */
  if (!reduce && hasIO) {
    var items = Array.prototype.slice.call(doc.querySelectorAll(".reveal"));
    var vh = window.innerHeight;
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.remove("pre"); rio.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh) { el.classList.add("pre"); rio.observe(el); }
    });
    window.addEventListener("beforeprint", function () {
      items.forEach(function (el) { el.classList.remove("pre"); });
    });
  }

  /* 3. Figure lightbox (links still open the image directly without JS) */
  if (typeof HTMLDialogElement !== "function") return;
  var dlg = doc.createElement("dialog");
  dlg.className = "lb";
  dlg.setAttribute("aria-label", "Figure");
  dlg.innerHTML =
    '<div class="lb-in"><div class="lb-bar"><p class="lb-cap"></p>' +
    '<button type="button" class="lb-close">Close<span class="vh"> figure</span></button></div>' +
    '<div class="lb-img"><img alt=""></div></div>';
  doc.body.appendChild(dlg);
  var img = dlg.querySelector("img");
  var cap = dlg.querySelector(".lb-cap");
  var closeBtn = dlg.querySelector(".lb-close");
  var opener = null;

  doc.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("a.zoom");
    if (!a || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
    ev.preventDefault();
    var src = a.querySelector("img");
    var fig = a.closest("figure");
    var fc = fig && fig.querySelector("figcaption");
    img.src = a.getAttribute("href");
    img.alt = src ? src.alt : "";
    cap.textContent = fc ? fc.textContent.replace(/\s+/g, " ").trim() : "";
    opener = a;
    dlg.showModal();
    closeBtn.focus();
  });
  dlg.addEventListener("click", function (ev) {
    // Click on the backdrop, the image, or the close button closes; caption bar text does not.
    if (ev.target === dlg || ev.target === img || ev.target.closest(".lb-close")) dlg.close();
  });
  dlg.addEventListener("close", function () {
    img.removeAttribute("src");
    if (opener) { opener.focus(); opener = null; }
  });
})();
