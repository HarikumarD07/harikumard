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
  /* Contact form — GitHub Pages has no backend, so this opens a       */
  /* pre-filled mailto: link so the message is genuinely sent via the  */
  /* visitor's own email client. For submissions to land in an inbox   */
  /* without opening an email client, swap this out for a form         */
  /* service such as Formspree — see the README for how.               */
  /* ---------------------------------------------------------------- */
  var contactForm = document.getElementById("contactForm");
  var formSuccess = document.getElementById("formSuccess");
  var CONTACT_EMAIL = "harikumard07@gmail.com";

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      var name = document.getElementById("name").value.trim();
      var email = document.getElementById("email").value.trim();
      var organization = document.getElementById("organization").value.trim();
      var message = document.getElementById("message").value.trim();

      var subject = "Website enquiry from " + name;
      var bodyLines = [
        message,
        "",
        "—",
        "From: " + name + " (" + email + ")"
      ];
      if (organization) bodyLines.push("Organization: " + organization);
      var body = bodyLines.join("\n");

      var mailtoUrl = "mailto:" + CONTACT_EMAIL
        + "?subject=" + encodeURIComponent(subject)
        + "&body=" + encodeURIComponent(body);

      if (formSuccess) {
        formSuccess.classList.add("show");
        formSuccess.setAttribute("tabindex", "-1");
        formSuccess.focus();
      }

      /* Give the confirmation a beat to render before handing off to the mail client */
      window.setTimeout(function () {
        window.location.href = mailtoUrl;
      }, 300);

      contactForm.reset();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Executive profile PDF — password-gated upload straight to GitHub  */
  /*                                                                    */
  /* GitHub Pages has no backend, so there is no server to accept a    */
  /* file upload. Instead, this calls the GitHub Contents API directly */
  /* from the browser to commit the PDF into the repo at               */
  /* assets/harikumar-d-executive-profile.pdf — the same path the      */
  /* Download buttons already link to. Once GitHub Pages rebuilds      */
  /* (usually under a minute), every visitor sees the new file.        */
  /*                                                                    */
  /* SECURITY NOTE: this requires a GitHub token with write access to  */
  /* the repo, entered at upload time. It is intentionally never       */
  /* hard-coded here — that would expose write access to anyone        */
  /* reading the public page source. The token is only held in memory  */
  /* for the duration of the upload and is not persisted. Use a        */
  /* fine-grained token scoped to just this repo (Contents: Read and   */
  /* write) with a short expiry. The password check itself still runs  */
  /* in plain JS and is a convenience gate, not real security.         */
  /* ---------------------------------------------------------------- */
  var PROFILE_PASSWORD = "Dhkpoo@7982";
  var PROFILE_FILE_PATH = "assets/harikumar-d-executive-profile.pdf";
  var REPO_DETAILS_KEY = "hd-github-repo-details"; /* owner/repo/branch only — never the token */

  var manageProfileBtn = document.getElementById("manageProfileBtn");
  var profileModal = document.getElementById("profileModal");
  var profileModalClose = document.getElementById("profileModalClose");
  var profileUploadForm = document.getElementById("profileUploadForm");
  var profileModalFeedback = document.getElementById("profileModalFeedback");
  var profileSubmitBtn = document.getElementById("profileSubmitBtn");
  var rememberRepoDetails = document.getElementById("rememberRepoDetails");

  function setProfileStatus(text) {
    var statusEl = document.getElementById("profileStatus");
    if (statusEl) statusEl.textContent = text;
  }

  function loadRememberedRepoDetails() {
    try {
      var raw = localStorage.getItem(REPO_DETAILS_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (saved.owner) document.getElementById("githubOwner").value = saved.owner;
      if (saved.repo) document.getElementById("githubRepo").value = saved.repo;
      if (saved.branch) document.getElementById("githubBranch").value = saved.branch;
      if (rememberRepoDetails) rememberRepoDetails.checked = true;
    } catch (e) { /* storage unavailable */ }
  }

  function openProfileModal() {
    if (!profileModal) return;
    profileModal.hidden = false;
    loadRememberedRepoDetails();
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

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        /* strip the "data:application/pdf;base64," prefix */
        var result = reader.result;
        var commaIndex = result.indexOf(",");
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function githubRequest(url, token, options) {
    options = options || {};
    options.headers = Object.assign({
      "Authorization": "token " + token,
      "Accept": "application/vnd.github+json"
    }, options.headers || {});
    return fetch(url, options);
  }

  function setSubmitting(isSubmitting, label) {
    if (!profileSubmitBtn) return;
    profileSubmitBtn.disabled = isSubmitting;
    profileSubmitBtn.textContent = label || (isSubmitting ? "Uploading…" : "Upload to GitHub");
  }

  function showFeedback(message, type) {
    if (!profileModalFeedback) return;
    profileModalFeedback.textContent = message;
    profileModalFeedback.className = "modal-feedback" + (type ? " " + type : "");
  }

  if (profileUploadForm) {
    profileUploadForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var password = document.getElementById("profilePassword").value;
      var owner = document.getElementById("githubOwner").value.trim();
      var repo = document.getElementById("githubRepo").value.trim();
      var branch = document.getElementById("githubBranch").value.trim() || "main";
      var token = document.getElementById("githubToken").value.trim();
      var fileInput = document.getElementById("profileFile");
      var file = fileInput && fileInput.files && fileInput.files[0];

      if (password !== PROFILE_PASSWORD) {
        showFeedback("Incorrect password.", "error");
        return;
      }
      if (!owner || !repo || !token) {
        showFeedback("Please fill in the GitHub username, repository and token.", "error");
        return;
      }
      if (!file) {
        showFeedback("Please choose a PDF file.", "error");
        return;
      }
      if (file.type !== "application/pdf") {
        showFeedback("Please upload a PDF file.", "error");
        return;
      }

      if (rememberRepoDetails && rememberRepoDetails.checked) {
        try { localStorage.setItem(REPO_DETAILS_KEY, JSON.stringify({ owner: owner, repo: repo, branch: branch })); } catch (e) { /* storage unavailable */ }
      } else {
        try { localStorage.removeItem(REPO_DETAILS_KEY); } catch (e) { /* storage unavailable */ }
      }

      var apiUrl = "https://api.github.com/repos/" + owner + "/" + repo + "/contents/" + PROFILE_FILE_PATH;

      setSubmitting(true, "Checking repository…");
      showFeedback("Contacting GitHub…");

      fileToBase64(file).then(function (base64) {
        /* look up the existing file's SHA — required by the GitHub API to update a file that already exists */
        return githubRequest(apiUrl + "?ref=" + encodeURIComponent(branch), token)
          .then(function (getResp) {
            if (getResp.status === 200) return getResp.json().then(function (data) { return data.sha; });
            if (getResp.status === 404) return null; /* file doesn't exist yet — that's fine, we'll create it */
            if (getResp.status === 401) throw new Error("GitHub rejected the token (401). Check that it's valid and not expired.");
            if (getResp.status === 403) throw new Error("GitHub denied access (403). Check the token's permissions and repo scope.");
            throw new Error("Unexpected response while checking the existing file (" + getResp.status + ").");
          })
          .then(function (sha) {
            setSubmitting(true, "Uploading…");
            var body = {
              message: "Update executive profile PDF (" + new Date().toISOString() + ")",
              content: base64,
              branch: branch
            };
            if (sha) body.sha = sha;
            return githubRequest(apiUrl, token, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
            });
          });
      }).then(function (putResp) {
        if (!putResp.ok) {
          return putResp.json().catch(function () { return {}; }).then(function (errBody) {
            throw new Error(errBody.message || ("GitHub API error (" + putResp.status + ")"));
          });
        }
        return putResp.json();
      }).then(function () {
        showFeedback("Uploaded. GitHub Pages will show the new file for everyone within a minute or so.", "success");
        setProfileStatus("Last upload: " + file.name + " — " + new Date().toLocaleString());
        setSubmitting(false);
        window.setTimeout(closeProfileModal, 2200);
      }).catch(function (err) {
        showFeedback(err.message || "Upload failed. Please check your details and try again.", "error");
        setSubmitting(false);
      });
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
