(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = window.matchMedia("(min-width: 768px)");

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add("is-loaded");
    });
  });

  document.querySelectorAll("[data-stagger]").forEach(function (list) {
    Array.prototype.forEach.call(list.children, function (child, i) {
      child.style.setProperty("--i", i);
    });
  });

  var revealTargets = document.querySelectorAll("[data-reveal], [data-stagger], .block-head");
  if ("IntersectionObserver" in window) {
    var revealer = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach(function (el) { revealer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  var nav = document.querySelector(".dock");
  var button = nav.querySelector(".menu-btn");
  var menu = nav.querySelector(".menu");
  var indicator = menu.querySelector(".indicator");
  var links = Array.prototype.slice.call(menu.querySelectorAll("a"));

  links.forEach(function (link, i) {
    link.parentNode.style.setProperty("--i", i);
  });

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
  }

  button.addEventListener("click", function () {
    setMenu(button.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("click", function (event) {
    if (!nav.contains(event.target)) { setMenu(false); }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setMenu(false);
      button.focus();
    }
  });

  links.forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  var activeLink = null;
  var placed = false;

  function moveIndicator(link) {
    if (!desktop.matches || !link) {
      indicator.style.opacity = "0";
      return;
    }
    indicator.style.opacity = "1";
    indicator.style.width = link.offsetWidth + "px";
    indicator.style.transform = "translateX(" + link.offsetLeft + "px)";
    if (!placed) {
      placed = true;
      requestAnimationFrame(function () { indicator.classList.add("ready"); });
    } else if (!reduce) {
      indicator.classList.remove("is-moving");
      void indicator.offsetWidth;
      indicator.classList.add("is-moving");
    }
  }

  function setActive(id) {
    var next = links.filter(function (a) { return a.getAttribute("href") === "#" + id; })[0] || null;
    if (next === activeLink) { return; }
    activeLink = next;
    links.forEach(function (a) {
      if (a === next) { a.setAttribute("aria-current", "true"); }
      else { a.removeAttribute("aria-current"); }
    });
    moveIndicator(next);
  }

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { setActive(entry.target.id); }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("header#home, main section").forEach(function (el) { spy.observe(el); });
  }

  window.addEventListener("resize", function () { moveIndicator(activeLink); });

  var toTop = document.querySelector(".to-top");

  function updateToTop() {
    toTop.classList.toggle("is-visible", window.scrollY > 480);
  }

  window.addEventListener("scroll", updateToTop, { passive: true });
  updateToTop();
})();