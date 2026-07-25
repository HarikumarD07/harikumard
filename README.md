# Harikumar D — Executive Website

A static, dependency-free personal site for an Independent Director aspirant
and corporate governance advisor. Pure HTML5, CSS3 and vanilla JavaScript —
no build step, no backend, deploys straight from GitHub Pages.

## Structure

```
index.html      Full single-page site (all sections)
styles.css      Design tokens + all styling, incl. dark mode
script.js       Nav, dark-mode toggle, scroll reveal, counters, form
assets/         Downloadable executive profile PDF goes here
icons/          Favicon
images/         Hero/OG imagery (add your own — see below)
```

## Deploy to GitHub Pages

1. Create a new repository (e.g. `harikumar-d.github.io` for a user site,
   or any name for a project site).
2. Push these files to the repository root (or to `/docs` if you prefer).
3. In the repo, go to **Settings → Pages**, set the source branch to `main`
   (and folder to `/root` or `/docs`, matching where you put the files).
4. Your site will be live at `https://<username>.github.io/` (user site) or
   `https://<username>.github.io/<repo-name>/` (project site).

## Before going live

- **Executive profile PDF** — click "Update executive profile" at the very
  bottom of the page, enter the password, and upload the PDF. See
  **Executive profile uploads** below for how this actually works and its
  limits — it is not the same as adding a file to the repo.
- **LinkedIn URL** — replace `linkedin.com/in/harikumar-d` in `index.html`
  (appears in the Hero, Contact and Footer) with the real profile URL.
- **Email** — replace `contact@harikumard.com` with the real contact address.
- **Canonical URL & Open Graph** — update the `og:url` and `canonical` tags
  in `<head>` once you know the final GitHub Pages URL.
- **OG image** — add a 1200×630 image at `images/og-cover.jpg` for link
  previews on LinkedIn/Twitter.
- **Contact form** — the form currently only shows a client-side
  confirmation, since GitHub Pages cannot run a backend. Wire it to a
  service such as Formspree, Getform, or Netlify Forms if you need actual
  submissions delivered to an inbox.

## Executive profile uploads

Because GitHub Pages serves static files with no backend, there is nowhere
to accept a real file upload from visitors. To let Harikumar update the
downloadable PDF without editing code, the site includes a password-gated
upload panel ("Update executive profile" link at the bottom of the page).

**How it works:** the chosen PDF is stored as base64 in the browser's
`localStorage`, and the "Download Executive Profile" buttons read from
that storage.

**Important limits to know:**
- The upload only persists **on the device/browser used to upload it.**
  It will not appear for other visitors browsing from their own devices —
  each visitor's browser has no knowledge of what was uploaded elsewhere.
  This is a real constraint of static hosting, not a bug.
- The password check (`Dhkpoo@7982` by default, set in `script.js` as
  `PROFILE_PASSWORD`) runs in client-side JavaScript, which means anyone
  who views the page source can read it. It is a convenience gate to
  prevent casual visitors from replacing the file, **not real security.**
  Do not rely on it to protect confidential documents, and change the
  password in `script.js` if you'd like a different one.
- Files are capped at 4MB to stay within typical `localStorage` limits.

**If you want the PDF to load the same for every visitor,** the reliable
approach is to add the file to the repo directly: place
`harikumar-d-executive-profile.pdf` in `/assets`, then update the
`js-download-profile` click handler in `script.js` to fall back to
`assets/harikumar-d-executive-profile.pdf` when no upload is found in
`localStorage`. That requires a small code change but guarantees every
visitor sees the same file without needing real backend storage.

## Notes on the build

- Fonts: Fraunces (display), Inter (body), IBM Plex Mono (data/eyebrows) —
  loaded from Google Fonts.
- Icons: Font Awesome via CDN — the only external library used, as required.
- Dark mode toggle is persisted via `localStorage` and respects the
  visitor's OS-level preference on first visit.
- Timeline reveal and KPI counters use `IntersectionObserver` and respect
  `prefers-reduced-motion`.
- Print styles strip navigation/CTAs for a clean printable profile
  (`Cmd/Ctrl + P` on the page).
