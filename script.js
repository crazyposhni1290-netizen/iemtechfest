/* ============================================================================
   TechNova 2026 — script.js
   ----------------------------------------------------------------------------
   Pure vanilla JavaScript (no libraries!). Each feature lives in its own
   clearly-marked section so it is easy to find and edit.

   TABLE OF CONTENTS
     01. HELPERS & GLOBALS
     02. PRELOADER
     03. CUSTOM CURSOR
     04. SCROLL PROGRESS BAR + BACK-TO-TOP
     05. NAVBAR (scrolled state, hamburger, active link)
     06. THEME TOGGLE (dark / light)
     07. DIGITAL CLOCK
     08. COUNTDOWN TIMER
     09. STARFIELD CANVAS (particle background)
     10. PARALLAX ORBS
     11. 3D TILT (hero title + event cards)
     12. MAGNETIC BUTTONS + RIPPLE
     13. SCROLL REVEAL (IntersectionObserver)
     14. ANIMATED COUNTERS
     15. EVENT FILTERS
     16. SCHEDULE DAY TABS
     17. GALLERY LIGHTBOX
     18. REGISTRATION FORM (validation + localStorage)
     19. CONTACT FORM
     20. AUTH MODAL (login / sign-up demo)
     21. FAQ ACCORDION
     22. TOAST NOTIFICATIONS
     23. NEWSLETTER + MISC
   ============================================================================ */

/* Wrap everything so we don't pollute the global scope */
(function () {
  "use strict";

  /* ==========================================================================
     01. HELPERS & GLOBALS
     ========================================================================== */

  /** Shortcut for document.querySelector */
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  /** Shortcut for document.querySelectorAll (returns a real Array) */
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /** Does the visitor prefer reduced motion? (checked live) */
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Is this a touch device? (we skip cursor / tilt effects there) */
  const isTouchDevice = () =>
    window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /** Simple clamp */
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  /** Throttle: run `fn` at most once every `ms` milliseconds */
  function throttle(fn, ms) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn(...args);
      }
    };
  }

  /** Debounce: run `fn` only after `ms` of silence */
  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  /** Safe JSON parse for localStorage */
  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  /* ==========================================================================
     02. PRELOADER — hide the loading screen once the page is ready
     ========================================================================== */
  const preloader = qs("#preloader");

  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add("done");
    // Remove from the DOM after the fade finishes (keeps tab order clean)
    setTimeout(() => preloader.remove(), 700);
  }

  // Wait for all images/fonts, but never longer than 2.5 seconds
  window.addEventListener("load", hidePreloader);
  setTimeout(hidePreloader, 2500);

  /* ==========================================================================
     03. CUSTOM CURSOR — glowing dot + ring that follows the mouse
     ========================================================================== */
  const cursorDot = qs("#cursorDot");
  const cursorRing = qs("#cursorRing");

  if (cursorDot && cursorRing && !isTouchDevice()) {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    // Track the raw mouse position
    window.addEventListener(
      "mousemove",
      throttle((e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // The small dot follows instantly
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }, 10) // throttled to ~100fps max
    );

    // The ring "lerps" toward the cursor every frame (smooth trailing feel)
    (function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    })();

    // Grow the ring over interactive elements
    document.addEventListener("mouseover", (e) => {
      const hoverable = e.target.closest(
        "a, button, .event-card, .gallery-item, input, select, textarea, label"
      );
      cursorRing.classList.toggle("is-hover", Boolean(hoverable));
    });
  }

  /* ==========================================================================
     04. SCROLL PROGRESS BAR + BACK-TO-TOP
     ========================================================================== */
  const progressBar = qs("#scrollProgress");
  const backTopBtn = qs("#backTop");

  function onScrollUI() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) progressBar.style.width = progress + "%";
    if (backTopBtn) backTopBtn.classList.toggle("show", scrollTop > 450);

    // Navbar solid-glass state
    const navbar = qs("#navbar");
    if (navbar) navbar.classList.toggle("scrolled", scrollTop > 24);
  }

  // Throttled scroll listener (max ~20 calls/second) → smooth + cheap
  window.addEventListener("scroll", throttle(onScrollUI, 50));
  onScrollUI(); // run once on load

  if (backTopBtn) {
    backTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
  }

  /* ==========================================================================
     05. NAVBAR — mobile menu + active-link highlighting
     ========================================================================== */
  const hamburger = qs("#hamburger");
  const navLinksBox = qs("#navLinks");

  if (hamburger && navLinksBox) {
    hamburger.addEventListener("click", () => {
      const isOpen = navLinksBox.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });

    // Close the mobile menu after clicking any link
    navLinksBox.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        navLinksBox.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Active link highlight: watch each section, highlight the matching link
  const sectionIds = qsa(".nav-link").map((a) => a.getAttribute("href")).filter(Boolean);
  const watchedSections = sectionIds
    .map((id) => qs(id))
    .filter(Boolean);

  if (watchedSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          qsa(".nav-link").forEach((link) =>
            link.classList.toggle("active", link.getAttribute("href") === id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" } // trigger when section is mid-viewport
    );
    watchedSections.forEach((sec) => sectionObserver.observe(sec));
  }

  /* ==========================================================================
     06. THEME TOGGLE — dark / light, remembered in localStorage
     ========================================================================== */
  const themeToggle = qs("#themeToggle");
  const THEME_KEY = "tn_theme";

  // Restore saved theme (dark is the default)
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  }

  function syncThemeIcon() {
    if (!themeToggle) return;
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    themeToggle.innerHTML = isLight
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }
  syncThemeIcon();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const next = isLight ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(THEME_KEY, next);
      syncThemeIcon();
      showToast(`Switched to ${next} mode`, "info");
    });
  }

  /* ==========================================================================
     07. DIGITAL CLOCK — real-time, updates every second
     ========================================================================== */
  const clockEl = qs("#digitalClock");
  const dateEl = qs("#digitalDate");

  function tickClock() {
    const now = new Date();

    if (clockEl) {
      // Pad single digits with a leading zero
      const p = (n) => String(n).padStart(2, "0");
      clockEl.textContent = `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ==========================================================================
     08. COUNTDOWN TIMER
     --------------------------------------------------------------------------
     >>> CHANGE THE FEST START DATE HERE <<<
     Use an ISO string with timezone so every visitor sees the same countdown.
     ========================================================================== */
  const FEST_START = new Date("2026-12-04T09:00:00+05:30"); // 4 Dec 2026, 9:00 AM IST

  const cdParts = {
    days: qs("#cdDays"),
    hours: qs("#cdHours"),
    mins: qs("#cdMins"),
    secs: qs("#cdSecs"),
  };

  function tickCountdown() {
    if (!cdParts.days) return;

    const diff = FEST_START.getTime() - Date.now();

    if (diff <= 0) {
      // Fest is live / over
      cdParts.days.textContent = "00";
      cdParts.hours.textContent = "00";
      cdParts.mins.textContent = "00";
      cdParts.secs.textContent = "00";
      return;
    }

    const days = Math.floor(diff / 86400000);               // 1 day  = 86 400 000 ms
    const hours = Math.floor((diff % 86400000) / 3600000);  // 1 hour =  3 600 000 ms
    const mins = Math.floor((diff % 3600000) / 60000);      // 1 min  =     60 000 ms
    const secs = Math.floor((diff % 60000) / 1000);

    const p = (n) => String(n).padStart(2, "0");
    cdParts.days.textContent = p(days);
    cdParts.hours.textContent = p(hours);
    cdParts.mins.textContent = p(mins);
    cdParts.secs.textContent = p(secs);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ==========================================================================
     09. STARFIELD CANVAS — drifting particles / stars behind the content
     ========================================================================== */
  const canvas = qs("#starfield");

  if (canvas && !prefersReducedMotion()) {
    const ctx = canvas.getContext("2d");
    let stars = [];
    let w = 0, h = 0;

    function buildStars() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.floor((w * h) / 14000); // density scales with screen size
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        speed: Math.random() * 0.22 + 0.05,
        twinkle: Math.random() * Math.PI * 2,
      }));
    }

    function drawStars() {
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        s.twinkle += 0.015;
        const alpha = 0.35 + Math.sin(s.twinkle) * 0.35; // pulsing brightness

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190, 215, 255, ${alpha})`;
        ctx.fill();

        // Slow upward drift + wrap-around
        s.y -= s.speed;
        if (s.y < -4) {
          s.y = h + 4;
          s.x = Math.random() * w;
        }
      });
      requestAnimationFrame(drawStars);
    }

    buildStars();
    drawStars();
    window.addEventListener("resize", debounce(buildStars, 250));
  }

  /* ==========================================================================
     10. PARALLAX ORBS — background blobs shift gently while scrolling
     ========================================================================== */
  const parallaxLayers = qsa("[data-parallax]");

  if (parallaxLayers.length && !prefersReducedMotion()) {
    window.addEventListener(
      "scroll",
      throttle(() => {
        const y = window.scrollY;
        parallaxLayers.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax) || 0.1;
          el.style.translate = `0 ${y * speed}px`;
        });
      }, 16) // ~60fps
    );
  }

  /* ==========================================================================
     11. 3D TILT — hero title + cards follow the mouse in 3D
     ========================================================================== */

  /* -- Hero title: gentle rotateX/rotateY toward the cursor -- */
  const heroTitle = qs("#heroTitle");
  const heroSection = qs(".hero");

  if (heroTitle && heroSection && !isTouchDevice() && !prefersReducedMotion()) {
    heroSection.addEventListener(
      "mousemove",
      throttle((e) => {
        const rect = heroSection.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 … 0.5
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        qsa(".word", heroTitle).forEach((word, i) => {
          const depth = (i + 1) * 6; // deeper layers move more → parallax
          word.style.transform =
            `rotateX(${14 - py * 14}deg) rotateY(${-6 + px * 18}deg) translateZ(${24 + depth}px)`;
        });
      }, 16)
    );

    heroSection.addEventListener("mouseleave", () => {
      qsa(".word", heroTitle).forEach((word) => {
        word.style.transform = "rotateX(14deg) rotateY(-6deg) translateZ(24px)";
      });
    });
  }

  /* -- Generic card tilt: add class "tilt" to any card -- */
  if (!isTouchDevice() && !prefersReducedMotion()) {
    qsa(".tilt").forEach((card) => {
      let frame = null;

      card.addEventListener("mousemove", (e) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform =
            `perspective(800px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-6px)`;
          frame = null;
        });
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = ""; // back to CSS default
      });
    });
  }

  /* ==========================================================================
     12. MAGNETIC BUTTONS + RIPPLE
     ========================================================================== */

  /* -- Magnetic: button leans toward the cursor -- */
  if (!isTouchDevice() && !prefersReducedMotion()) {
    qsa(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* -- Ripple: expanding circle from the click point -- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".ripple");
    if (!btn || prefersReducedMotion()) return;

    const rect = btn.getBoundingClientRect();
    const dot = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    dot.className = "ripple-dot";
    dot.style.width = dot.style.height = `${size}px`;
    dot.style.left = `${e.clientX - rect.left - size / 2}px`;
    dot.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(dot);
    dot.addEventListener("animationend", () => dot.remove());
  });

  /* ==========================================================================
     13. SCROLL REVEAL — fade / slide / scale / flip when in view
     ========================================================================== */
  const revealEls = qsa(".reveal");

  if (revealEls.length) {
    if (prefersReducedMotion()) {
      revealEls.forEach((el) => el.classList.add("in-view"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target); // reveal only once
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }

  /* ==========================================================================
     14. ANIMATED COUNTERS — count up when scrolled into view
     ========================================================================== */
  const counters = qsa(".counter");

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const duration = 1800;
    const startTime = performance.now();

    function step(now) {
      const progress = clamp((now - startTime) / duration, 0, 1);
      // easeOutCubic → fast start, gentle finish
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-IN");
      if (progress < 1) requestAnimationFrame(step);
    }

    if (prefersReducedMotion()) {
      el.textContent = target.toLocaleString("en-IN");
    } else {
      requestAnimationFrame(step);
    }
  }

  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => counterObserver.observe(c));
  }

  /* ==========================================================================
     15. EVENT FILTERS — show/hide cards by category
     ========================================================================== */
  const filterBtns = qsa(".filter-btn");
  const eventCards = qsa(".event-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Active state on the buttons
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      eventCards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("filter-hide", !match);

        if (match) {
          // tiny pop animation on the re-shown cards
          card.classList.remove("filter-pop");
          void card.offsetWidth; // restart CSS animation
          card.classList.add("filter-pop");
        }
      });
    });
  });

  // "Register" buttons on event cards → scroll to the form
  qsa(".event-register").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".event-card");
      const eventName = qs(".event-card__name", card)?.textContent.trim() || "event";
      const registerSection = qs("#register");
      if (registerSection) {
        registerSection.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      }
      showToast(`Great choice! Register for "${eventName}" below.`, "info");
    });
  });

  /* ==========================================================================
     16. SCHEDULE DAY TABS
     ========================================================================== */
  const dayTabs = qsa(".day-tab");
  const dayPanels = qsa(".timeline");

  dayTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      dayTabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      dayPanels.forEach((panel) => {
        const isTarget = panel.id === tab.dataset.day;
        panel.hidden = !isTarget;
        panel.classList.toggle("active", isTarget);
      });
    });
  });

  /* ==========================================================================
     17. GALLERY LIGHTBOX — full-screen viewer with keyboard support
     ========================================================================== */
  const lightbox = qs("#lightbox");
  const lbImg = qs("#lightboxImg");
  const lbCaption = qs("#lightboxCaption");
  const galleryItems = qsa(".gallery-item");
  let lbIndex = 0;

  function openLightbox(index) {
    if (!lightbox) return;
    lbIndex = (index + galleryItems.length) % galleryItems.length; // wrap around
    const item = galleryItems[lbIndex];
    const img = qs("img", item);

    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = item.dataset.caption || img.alt || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";   // lock page scroll
    qs("#lightboxClose").focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    galleryItems[lbIndex]?.focus?.();
  }

  galleryItems.forEach((item, i) => {
    item.setAttribute("tabindex", "0"); // keyboard clickable
    item.addEventListener("click", () => openLightbox(i));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  qs("#lightboxClose")?.addEventListener("click", closeLightbox);
  qs("#lightboxPrev")?.addEventListener("click", () => openLightbox(lbIndex - 1));
  qs("#lightboxNext")?.addEventListener("click", () => openLightbox(lbIndex + 1));

  // Click on the dark backdrop closes the lightbox
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard: Esc closes, ← → navigate
  document.addEventListener("keydown", (e) => {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") openLightbox(lbIndex - 1);
    if (e.key === "ArrowRight") openLightbox(lbIndex + 1);
  });

  /* ==========================================================================
     18. REGISTRATION FORM — live validation, shake, success popup, storage
     ========================================================================== */

  /** Reusable field validator -------------------------------------------- */
  function setFieldState(input, messageEl, ok, message) {
    const group = input.closest(".form-group");
    if (!group) return ok;
    group.classList.toggle("is-success", ok);
    group.classList.toggle("is-error", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    if (messageEl) messageEl.textContent = message;
    return ok;
  }

  /** Shake an element (adds .shake class briefly) */
  function shake(el) {
    if (prefersReducedMotion()) return;
    el.classList.remove("shake");
    void el.offsetWidth; // restart animation
    el.classList.add("shake");
    el.addEventListener("animationend", () => el.classList.remove("shake"), { once: true });
  }

  /* Validation rules (edit regexes here if needed) */
  const rules = {
    name: (v) =>
      v.trim().length >= 3
        ? { ok: true, msg: "Looks good!" }
        : { ok: false, msg: "Name must be at least 3 characters." },
    nameLetters: (v) =>
      /^[A-Za-z][A-Za-z .'-]{2,}$/.test(v.trim())
        ? { ok: true, msg: "Looks good!" }
        : { ok: false, msg: "Please use letters only." },
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
        ? { ok: true, msg: "Valid email ✓" }
        : { ok: false, msg: "Enter a valid email (e.g. name@example.com)." },
    phone: (v) =>
      /^\d{10}$/.test(v.trim())
        ? { ok: true, msg: "Valid number ✓" }
        : { ok: false, msg: "Enter a 10-digit phone number." },
    required: (v) =>
      v.trim().length > 0
        ? { ok: true, msg: "Looks good!" }
        : { ok: false, msg: "This field is required." },
  };

  const regForm = qs("#registerForm");

  if (regForm) {
    // Map each input to its validator, so blur/input handlers stay tiny
    const regFields = [
      {
        el: qs("#regName"),
        msg: qs("#regNameMsg"),
        validate: (v) => {
          const r1 = rules.required(v);
          if (!r1.ok) return r1;
          const r2 = rules.name(v);
          if (!r2.ok) return r2;
          return rules.nameLetters(v);
        },
      },
      { el: qs("#regEmail"), msg: qs("#regEmailMsg"), validate: rules.email },
      { el: qs("#regPhone"), msg: qs("#regPhoneMsg"), validate: rules.phone },
      { el: qs("#regCollege"), msg: qs("#regCollegeMsg"), validate: rules.required },
      { el: qs("#regDept"), msg: qs("#regDeptMsg"), validate: rules.required },
      {
        el: qs("#regYear"),
        msg: qs("#regYearMsg"),
        validate: (v) =>
          v ? { ok: true, msg: "Looks good!" } : { ok: false, msg: "Please select your year." },
      },
    ];

    // Validate one field and paint green/red
    function checkRegField(field) {
      const result = field.validate(field.el.value);
      return setFieldState(field.el, field.msg, result.ok, result.msg);
    }

    // Live validation: on blur always, then on every keystroke once touched
    regFields.forEach((field) => {
      if (!field.el) return;
      let touched = false;
      field.el.addEventListener("blur", () => {
        touched = true;
        checkRegField(field);
      });
      field.el.addEventListener("input", () => {
        if (touched) checkRegField(field);
      });
    });

    // Events checkboxes + terms
    const eventsMsg = qs("#regEventsMsg");
    const termsEl = qs("#regTerms");
    const termsMsg = qs("#regTermsMsg");

    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      // 1. Simple fields
      regFields.forEach((field) => {
        if (!field.el) return;
        const ok = checkRegField(field);
        if (!ok) {
          valid = false;
          shake(field.el.closest(".form-group"));
        }
      });

      // 2. At least one event checked
      const checkedEvents = qsa('input[name="events"]:checked', regForm);
      if (checkedEvents.length === 0) {
        valid = false;
        if (eventsMsg) eventsMsg.textContent = "Please select at least one event.";
        shake(qs(".check-grid"));
      } else if (eventsMsg) {
        eventsMsg.textContent = "";
      }

      // 3. Terms accepted
      if (!termsEl.checked) {
        valid = false;
        setFieldState(termsEl, termsMsg, false, "You must accept the terms.");
        shake(termsEl.closest(".form-group"));
      } else {
        setFieldState(termsEl, termsMsg, true, "");
      }

      if (!valid) {
        showToast("Please fix the highlighted fields.", "error");
        return;
      }

      // ---- Success: save to localStorage and celebrate ----
      const entry = {
        name: qs("#regName").value.trim(),
        email: qs("#regEmail").value.trim(),
        phone: qs("#regPhone").value.trim(),
        college: qs("#regCollege").value.trim(),
        dept: qs("#regDept").value.trim(),
        year: qs("#regYear").value,
        events: checkedEvents.map((c) => c.value),
        at: new Date().toISOString(),
      };

      const registrations = loadJSON("tn_registrations", []);
      registrations.push(entry);
      localStorage.setItem("tn_registrations", JSON.stringify(registrations));

      // Success popup
      const successModal = qs("#successModal");
      const successText = qs("#successText");
      if (successText) {
        successText.textContent =
          `Thanks ${entry.name.split(" ")[0]}! You're registered for ` +
          `${entry.events.length} event${entry.events.length > 1 ? "s" : ""}. ` +
          `A confirmation would be sent to ${entry.email}.`;
      }
      if (successModal) {
        successModal.hidden = false;
        document.body.style.overflow = "hidden";
      }

      regForm.reset();
      // Clear all green states after submit
      qsa(".form-group", regForm).forEach((g) => g.classList.remove("is-success", "is-error"));
      qsa(".form-msg", regForm).forEach((m) => (m.textContent = ""));
      showToast("Registration saved!", "success");
    });
  }

  /* ==========================================================================
     19. CONTACT FORM — lighter validation, toast on success
     ========================================================================== */
  const contactForm = qs("#contactForm");

  if (contactForm) {
    const fields = [
      { el: qs("#ctName"), msg: qs("#ctNameMsg"), validate: rules.name },
      { el: qs("#ctEmail"), msg: qs("#ctEmailMsg"), validate: rules.email },
      { el: qs("#ctSubject"), msg: qs("#ctSubjectMsg"), validate: rules.required },
      {
        el: qs("#ctMessage"),
        msg: qs("#ctMessageMsg"),
        validate: (v) =>
          v.trim().length >= 10
            ? { ok: true, msg: "Looks good!" }
            : { ok: false, msg: "Message should be at least 10 characters." },
      },
    ];

    fields.forEach((field) => {
      if (!field.el) return;
      let touched = false;
      field.el.addEventListener("blur", () => {
        touched = true;
        const r = field.validate(field.el.value);
        setFieldState(field.el, field.msg, r.ok, r.msg);
      });
      field.el.addEventListener("input", () => {
        if (!touched) return;
        const r = field.validate(field.el.value);
        setFieldState(field.el, field.msg, r.ok, r.msg);
      });
    });

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      fields.forEach((field) => {
        const r = field.validate(field.el.value);
        const ok = setFieldState(field.el, field.msg, r.ok, r.msg);
        if (!ok) {
          valid = false;
          shake(field.el.closest(".form-group"));
        }
      });

      if (!valid) {
        showToast("Please fix the highlighted fields.", "error");
        return;
      }

      // Demo: just clear the form + celebrate
      contactForm.reset();
      qsa(".form-group", contactForm).forEach((g) => g.classList.remove("is-success", "is-error"));
      qsa(".form-msg", contactForm).forEach((m) => (m.textContent = ""));
      showToast("Message sent! We'll get back to you soon.", "success");
    });
  }

  /* ==========================================================================
     20. AUTH MODAL — login / sign-up (demo logic stored in localStorage)
     --------------------------------------------------------------------------
     ⚠ DEMO ONLY — real apps must authenticate on a secure server.
     ========================================================================== */
  const authModal = qs("#authModal");
  const loginForm = qs("#loginForm");
  const signupForm = qs("#signupForm");
  const loginTab = qs("#loginTab");
  const signupTab = qs("#signupTab");
  const authInk = qs("#authInk");
  const authTitle = qs("#authTitle");
  const USERS_KEY = "tn_users";
  const SESSION_KEY = "tn_session";

  function openAuthModal(mode = "login") {
    if (!authModal) return;
    authModal.hidden = false;
    document.body.style.overflow = "hidden";
    switchAuthTab(mode);
    // Pre-fill remembered email
    const remembered = localStorage.getItem("tn_remember");
    if (remembered && qs("#liEmail")) qs("#liEmail").value = remembered;
    qs(mode === "login" ? "#liEmail" : "#suName")?.focus();
  }

  function closeAuthModal() {
    if (!authModal) return;
    authModal.hidden = true;
    document.body.style.overflow = "";
  }

  function switchAuthTab(mode) {
    const isLogin = mode === "login";
    loginTab?.classList.toggle("active", isLogin);
    signupTab?.classList.toggle("active", !isLogin);
    loginTab?.setAttribute("aria-selected", String(isLogin));
    signupTab?.setAttribute("aria-selected", String(!isLogin));
    if (authInk) authInk.classList.toggle("right", !isLogin);
    if (loginForm) loginForm.hidden = !isLogin;
    if (signupForm) signupForm.hidden = isLogin;
    if (authTitle) authTitle.textContent = isLogin ? "Welcome back" : "Create account";
  }

  qs("#loginBtn")?.addEventListener("click", () => openAuthModal("login"));
  loginTab?.addEventListener("click", () => switchAuthTab("login"));
  signupTab?.addEventListener("click", () => switchAuthTab("signup"));

  // Close modal via backdrop / ✕ buttons (any element with data-close-modal)
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-modal]")) {
      closeAuthModal();
      const successModal = qs("#successModal");
      if (successModal && !successModal.hidden) {
        successModal.hidden = true;
        document.body.style.overflow = "";
      }
    }
  });

  // Esc closes open modals
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (authModal && !authModal.hidden) closeAuthModal();
    const successModal = qs("#successModal");
    if (successModal && !successModal.hidden) {
      successModal.hidden = true;
      document.body.style.overflow = "";
    }
  });

  /* -- Show / hide password toggle -- */
  qsa(".eye-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = qs("#" + btn.dataset.togglePass);
      if (!input) return;
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      btn.innerHTML = showing
        ? '<i class="fa-solid fa-eye"></i>'
        : '<i class="fa-solid fa-eye-slash"></i>';
    });
  });

  /* -- Password strength meter (0–4 score) -- */
  const strengthFill = qs("#strengthFill");
  const strengthLabel = qs("#strengthLabel");
  const suPass = qs("#suPass");

  function passwordScore(pw) {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
    return clamp(score, 0, 4);
  }

  suPass?.addEventListener("input", () => {
    const score = passwordScore(suPass.value);
    const levels = [
      { pct: "0%", color: "var(--c-red)", label: "—" },
      { pct: "25%", color: "var(--c-red)", label: "Weak" },
      { pct: "50%", color: "#f59e0b", label: "Fair" },
      { pct: "75%", color: "var(--c-cyan)", label: "Good" },
      { pct: "100%", color: "var(--c-green)", label: "Strong" },
    ];
    const level = levels[score];
    if (strengthFill) {
      strengthFill.style.width = level.pct;
      strengthFill.style.background = level.color;
    }
    if (strengthLabel) {
      strengthLabel.textContent = level.label;
      strengthLabel.style.color = level.color;
    }
  });

  /* -- Sign up -- */
  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameEl = qs("#suName");
    const emailEl = qs("#suEmail");
    const passEl = qs("#suPass");
    const confirmEl = qs("#suConfirm");

    let valid = true;

    // Name
    const nameR = nameEl.value.trim().length >= 3
      ? { ok: true, msg: "Looks good!" }
      : { ok: false, msg: "Name must be at least 3 characters." };
    if (!setFieldState(nameEl, qs("#suNameMsg"), nameR.ok, nameR.msg)) {
      valid = false;
      shake(nameEl.closest(".form-group"));
    }

    // Email
    const emailR = rules.email(emailEl.value);
    if (!setFieldState(emailEl, qs("#suEmailMsg"), emailR.ok, emailR.msg)) {
      valid = false;
      shake(emailEl.closest(".form-group"));
    }

    // Password strength
    const passR = passwordScore(passEl.value) >= 2
      ? { ok: true, msg: "Password strength is acceptable." }
      : { ok: false, msg: "Use 6+ chars with mixed case & numbers." };
    if (!setFieldState(passEl, qs("#suPassMsg"), passR.ok, passR.msg)) {
      valid = false;
      shake(passEl.closest(".form-group"));
    }

    // Confirm match
    const matchR =
      confirmEl.value === passEl.value && confirmEl.value.length > 0
        ? { ok: true, msg: "Passwords match ✓" }
        : { ok: false, msg: "Passwords do not match." };
    if (!setFieldState(confirmEl, qs("#suConfirmMsg"), matchR.ok, matchR.msg)) {
      valid = false;
      shake(confirmEl.closest(".form-group"));
    }

    if (!valid) return;

    // Save the new user (DEMO ONLY — passwords in localStorage are not secure)
    const users = loadJSON(USERS_KEY, []);
    if (users.some((u) => u.email.toLowerCase() === emailEl.value.trim().toLowerCase())) {
      setFieldState(emailEl, qs("#suEmailMsg"), false, "An account with this email already exists.");
      shake(emailEl.closest(".form-group"));
      return;
    }

    users.push({
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      password: passEl.value, // ⚠ demo only
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    signupForm.reset();
    qsa(".form-group", signupForm).forEach((g) => g.classList.remove("is-success", "is-error"));
    if (strengthFill) strengthFill.style.width = "0%";
    if (strengthLabel) strengthLabel.textContent = "Strength";

    showToast("Account created! You can now log in.", "success");
    switchAuthTab("login");
  });

  /* -- Login -- */
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailEl = qs("#liEmail");
    const passEl = qs("#liPass");

    let valid = true;

    const emailR = rules.email(emailEl.value);
    if (!setFieldState(emailEl, qs("#liEmailMsg"), emailR.ok, emailR.msg)) {
      valid = false;
      shake(emailEl.closest(".form-group"));
    }
    const passR = passEl.value.length > 0
      ? { ok: true, msg: "" }
      : { ok: false, msg: "Please enter your password." };
    if (!setFieldState(passEl, qs("#liPassMsg"), passR.ok, passR.msg)) {
      valid = false;
      shake(passEl.closest(".form-group"));
    }
    if (!valid) return;

    const users = loadJSON(USERS_KEY, []);
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === emailEl.value.trim().toLowerCase() &&
        u.password === passEl.value
    );

    if (!user) {
      setFieldState(passEl, qs("#liPassMsg"), false, "Invalid email or password.");
      shake(passEl.closest(".form-group"));
      return;
    }

    // Remember me → store email
    const remember = qs("#liRemember")?.checked;
    if (remember) {
      localStorage.setItem("tn_remember", user.email);
    } else {
      localStorage.removeItem("tn_remember");
    }

    // "Log in": save the session and greet the user in the navbar
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
    applySession(user.name);

    closeAuthModal();
    loginForm.reset();
    showToast(`Welcome back, ${user.name.split(" ")[0]}! 🎉`, "success");
  });

  /* -- Session helpers (show name in navbar) -- */
  function applySession(name) {
    const chip = qs("#userChip");
    const nameEl = qs("#userName");
    const loginBtn = qs("#loginBtn");
    if (!chip) return;
    chip.hidden = false;
    if (nameEl) nameEl.textContent = `Hi, ${name.split(" ")[0]}`;
    if (loginBtn) loginBtn.hidden = true;
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    const chip = qs("#userChip");
    const loginBtn = qs("#loginBtn");
    if (chip) chip.hidden = true;
    if (loginBtn) loginBtn.hidden = false;
    showToast("You've been logged out.", "info");
  }

  qs("#logoutBtn")?.addEventListener("click", clearSession);

  // Restore session on page load
  const session = loadJSON(SESSION_KEY, null);
  if (session?.name) applySession(session.name);

  qs("#forgotLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    showToast("Password reset is not implemented in this demo.", "info");
  });

  /* ==========================================================================
     21. FAQ ACCORDION — one panel open at a time, animated height
     ========================================================================== */
  qsa(".faq-item").forEach((item) => {
    const question = qs(".faq-q", item);
    const answer = qs(".faq-a", item);
    if (!question || !answer) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // Close every panel first (accordion behaviour)
      qsa(".faq-item").forEach((other) => {
        other.classList.remove("open");
        qs(".faq-a", other).style.maxHeight = null;
        qs(".faq-q", other).setAttribute("aria-expanded", "false");
      });

      // Open the clicked one (unless it was already open)
      if (!isOpen) {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
        question.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ==========================================================================
     22. TOAST NOTIFICATIONS — showToast("message", "success"|"error"|"info")
     ========================================================================== */
  function showToast(message, type = "info") {
    const box = qs("#toasts");
    if (!box) return;

    const icons = {
      success: "fa-circle-check",
      error: "fa-circle-exclamation",
      info: "fa-circle-info",
    };

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
    box.appendChild(toast);

    // Auto-remove after 4 seconds (slide out first)
    setTimeout(() => {
      toast.classList.add("out");
      toast.addEventListener("animationend", () => toast.remove());
    }, 4000);
  }

  // Expose it globally so inline handlers / future code can use it too
  window.showToast = showToast;

  /* ==========================================================================
     23. NEWSLETTER + MISC
     ========================================================================== */
  const newsForm = qs("#newsForm");
  newsForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = qs("#newsEmail");
    if (!rules.email(input.value).ok) {
      showToast("Please enter a valid email.", "error");
      shake(input);
      return;
    }
    const subs = loadJSON("tn_newsletter", []);
    subs.push({ email: input.value.trim(), at: new Date().toISOString() });
    localStorage.setItem("tn_newsletter", JSON.stringify(subs));
    input.value = "";
    showToast("Subscribed! Welcome aboard. 🚀", "success");
  });

  // Footer copyright year (auto-updates)
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Welcome toast so students see the toast system in action ---- */
  setTimeout(() => showToast("Welcome to TechNova 2026 — explore, compete, conquer! ⚡", "info"), 1400);
})();
