/* =========================================================================
   Harikumar D — site interactions
   No dependencies. No backend. Progressive enhancement only.
   ========================================================================= */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- */
  /* Footer year                                                       */
  /* ---------------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------- */
  /* Mobile nav toggle                                                  */
  /* ---------------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Dark mode toggle — persisted via localStorage                     */
  /* ---------------------------------------------------------------- */
  var themeToggle = document.getElementById("themeToggle");
  var root = document.documentElement;
  var THEME_KEY = "hd-theme";

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", "true");
        themeToggle.innerHTML = '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
      }
    } else {
      root.removeAttribute("data-theme");
      if (themeToggle) {
        themeToggle.setAttribute("aria-pressed", "false");
        themeToggle.innerHTML = '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
      }
    }
  }

  var storedTheme = null;
  try { storedTheme = localStorage.getItem(THEME_KEY); } catch (e) { /* storage unavailable */ }

  if (storedTheme) {
    applyTheme(storedTheme);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var isDark = root.getAttribute("data-theme") === "dark";
      var next = isDark ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage unavailable */ }
    });
  }

  /* ---------------------------------------------------------------- */
  /* Sticky nav shadow on scroll (subtle, no flashy effects)           */
  /* ---------------------------------------------------------------- */
  var siteNav = document.querySelector(".site-nav");
  var lastScroll = 0;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (siteNav) {
      siteNav.style.boxShadow = y > 8 ? "0 1px 0 rgba(15,42,74,0.08)" : "none";
    }
    lastScroll = y;
  }, { passive: true });

  /* ---------------------------------------------------------------- */
  /* Timeline reveal on scroll                                         */
  /* ---------------------------------------------------------------- */
  var timelineItems = document.querySelectorAll(".timeline-item");
  if ("IntersectionObserver" in window && timelineItems.length) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    timelineItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    timelineItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------------- */
  /* Animated KPI counters                                             */
  /* ---------------------------------------------------------------- */
  var kpiGrid = document.getElementById("kpiGrid");
  var counters = document.querySelectorAll(".kpi-number[data-count]");

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }
    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window && kpiGrid) {
    var kpiObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          counters.forEach(animateCounter);
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    kpiObserver.observe(kpiGrid);
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------------------------------------------------------------- */
  /* Contact form — client-side only (GitHub Pages has no backend)     */
  /* ---------------------------------------------------------------- */
  var contactForm = document.getElementById("contactForm");
  var formSuccess = document.getElementById("formSuccess");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      if (formSuccess) {
        formSuccess.classList.add("show");
        formSuccess.setAttribute("tabindex", "-1");
        formSuccess.focus();
      }
      contactForm.reset();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Executive profile PDF — password-gated client-side upload         */
  /*                                                                    */
  /* GitHub Pages has no backend, so there is nowhere to actually      */
  /* store an uploaded file server-side. This stores the PDF as base64 */
  /* in this browser's localStorage, so the update only persists on    */
  /* the device/browser used to upload it — it will not appear for     */
  /* other visitors. The password check happens in plain JS, so it is  */
  /* a convenience gate, not real security; anyone can read it in the  */
  /* page source. Do not use this for confidential material.           */
  /* ---------------------------------------------------------------- */
  var PROFILE_PASSWORD = "Dhkpoo@7982";
  var PROFILE_STORAGE_KEY = "hd-executive-profile";
  var MAX_PROFILE_BYTES = 4 * 1024 * 1024; /* 4MB, comfortably under most localStorage quotas */

  function getStoredProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setProfileStatus(text) {
    var statusEl = document.getElementById("profileStatus");
    if (statusEl) statusEl.textContent = text;
  }

  function refreshProfileStatus() {
    var stored = getStoredProfile();
    if (stored) {
      var uploaded = new Date(stored.uploadedAt);
      setProfileStatus("Current file: " + stored.name + " (uploaded " + uploaded.toLocaleDateString() + ")");
    } else {
      setProfileStatus("No profile uploaded yet on this device.");
    }
  }
  refreshProfileStatus();

  /* Download buttons */
  var downloadButtons = document.querySelectorAll(".js-download-profile");
  downloadButtons.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var stored = getStoredProfile();
      if (!stored) {
        setProfileStatus("No profile uploaded yet — please check back soon, or contact Harikumar directly for a copy.");
        return;
      }
      var link = document.createElement("a");
      link.href = stored.dataUrl;
      link.download = stored.name || "harikumar-d-executive-profile.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });

  /* Modal open/close */
  var manageProfileBtn = document.getElementById("manageProfileBtn");
  var profileModal = document.getElementById("profileModal");
  var profileModalClose = document.getElementById("profileModalClose");
  var profileUploadForm = document.getElementById("profileUploadForm");
  var profileModalFeedback = document.getElementById("profileModalFeedback");
  var profileRemoveBtn = document.getElementById("profileRemoveBtn");

  function openProfileModal() {
    if (!profileModal) return;
    profileModal.hidden = false;
    var pwInput = document.getElementById("profilePassword");
    if (pwInput) pwInput.focus();
  }
  function closeProfileModal() {
    if (!profileModal) return;
    profileModal.hidden = true;
    if (profileUploadForm) profileUploadForm.reset();
    if (profileModalFeedback) { profileModalFeedback.textContent = ""; profileModalFeedback.className = "modal-feedback"; }
  }

  if (manageProfileBtn) manageProfileBtn.addEventListener("click", openProfileModal);
  if (profileModalClose) profileModalClose.addEventListener("click", closeProfileModal);
  if (profileModal) {
    profileModal.addEventListener("click", function (e) {
      if (e.target === profileModal) closeProfileModal();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && profileModal && !profileModal.hidden) closeProfileModal();
  });

  if (profileUploadForm) {
    profileUploadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var password = document.getElementById("profilePassword").value;
      var fileInput = document.getElementById("profileFile");
      var file = fileInput && fileInput.files && fileInput.files[0];

      if (password !== PROFILE_PASSWORD) {
        profileModalFeedback.textContent = "Incorrect password.";
        profileModalFeedback.className = "modal-feedback error";
        return;
      }
      if (!file) {
        profileModalFeedback.textContent = "Please choose a PDF file.";
        profileModalFeedback.className = "modal-feedback error";
        return;
      }
      if (file.type !== "application/pdf") {
        profileModalFeedback.textContent = "Please upload a PDF file.";
        profileModalFeedback.className = "modal-feedback error";
        return;
      }
      if (file.size > MAX_PROFILE_BYTES) {
        profileModalFeedback.textContent = "File is too large for browser storage (max 4MB).";
        profileModalFeedback.className = "modal-feedback error";
        return;
      }

      var reader = new FileReader();
      reader.onload = function () {
        try {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
            name: file.name,
            dataUrl: reader.result,
            uploadedAt: new Date().toISOString()
          }));
          profileModalFeedback.textContent = "Profile updated on this device.";
          profileModalFeedback.className = "modal-feedback success";
          refreshProfileStatus();
          window.setTimeout(closeProfileModal, 1200);
        } catch (err) {
          profileModalFeedback.textContent = "Could not save file — it may be too large for this browser's storage.";
          profileModalFeedback.className = "modal-feedback error";
        }
      };
      reader.onerror = function () {
        profileModalFeedback.textContent = "Could not read that file. Please try again.";
        profileModalFeedback.className = "modal-feedback error";
      };
      reader.readAsDataURL(file);
    });
  }

  if (profileRemoveBtn) {
    profileRemoveBtn.addEventListener("click", function () {
      var password = document.getElementById("profilePassword").value;
      if (password !== PROFILE_PASSWORD) {
        profileModalFeedback.textContent = "Enter the password to remove the file.";
        profileModalFeedback.className = "modal-feedback error";
        return;
      }
      try { localStorage.removeItem(PROFILE_STORAGE_KEY); } catch (e) { /* storage unavailable */ }
      profileModalFeedback.textContent = "Uploaded profile removed from this device.";
      profileModalFeedback.className = "modal-feedback success";
      refreshProfileStatus();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Sticky nav active-link highlight                                  */
  /* ---------------------------------------------------------------- */
  var sections = document.querySelectorAll("main section[id]");
  var navAnchors = document.querySelectorAll(".nav-links a");
  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.getAttribute("id");
        var link = document.querySelector('.nav-links a[href="#' + id + '"]');
        if (!link) return;
        if (entry.isIntersecting) {
          navAnchors.forEach(function (a) { a.style.color = ""; });
          link.style.color = "var(--gold)";
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { navObserver.observe(s); });
  }

})();
