# TechNova 2026 — College Tech Fest Website

A complete, production-quality **single-page website** built with only **HTML5 + CSS3 + vanilla JavaScript** — no frameworks, no build step.

**Live site:** `https://crazyposhni1290-netizen.github.io/iemtechfest/`

---

## Folder structure

```
iemtechfest/
├── index.html          # All page structure & content (every section)
├── style.css           # All styles: theme variables, glassmorphism, 3D, animations
├── script.js           # All interactivity: countdown, filters, forms, lightbox…
├── README.md           # This file
└── images/
    ├── gallery1.jpg    # Gallery photo 1 — replace with your own
    ├── gallery2.jpg    # Gallery photo 2
    ├── gallery3.jpg    # Gallery photo 3
    ├── gallery4.jpg    # Gallery photo 4
    ├── gallery5.jpg    # Gallery photo 5
    ├── gallery6.jpg    # Gallery photo 6
    ├── gallery7.jpg    # Gallery photo 7
    └── gallery8.jpg    # Gallery photo 8
```

---

## How to run it

**Option A — just open the file**

Double-click `index.html` (it opens in your browser). Everything works, since there is no build step.

**Option B — local web server (recommended)**

```bash
# Python (pre-installed on most systems)
python3 -m http.server 8000
# → open http://localhost:8000

# or Node.js
npx serve .
```

---

## Where to change things

| What you want to change | File | Where to look |
|---|---|---|
| Fest name / tagline | `index.html` | Search `FEST DETAILS` — the `<h1 class="hero__title">` and `.hero__tagline`, plus `<title>` in `<head>` |
| Dates & venue | `index.html` | Hero section `.hero__meta` chips, countdown label, footer text |
| Countdown target date | `script.js` | Search `FEST_START` (section 08) — e.g. `new Date("2026-12-04T09:00:00+05:30")` |
| Theme colours (dark/light) | `style.css` | Section `01. CSS VARIABLES` — change `--c-purple`, `--c-cyan`, `--c-pink`, `--c-bg`… everything updates |
| Fonts | `index.html` | Google Fonts `<link>` in `<head>` (`Orbitron` + `Poppins`) |
| Events (add / edit cards) | `index.html` | Search `EVENTS GRID` — copy any `<article class="… event-card …">` block. Set `data-category` to one of: `coding`, `robotics`, `gaming`, `design`, `quiz`, `cultural` |
| Schedule | `index.html` | Search `TIMELINE` — edit the entries inside `#day1`, `#day2`, `#day3` |
| Gallery photos | `images/` | Replace `gallery1.jpg` … `gallery8.jpg` with your own photos (keep the same names, or update the `src=` in `index.html`) |
| Gallery captions | `index.html` | Each `<figure class="gallery-item">` has `data-caption` and an `alt` |
| Sponsors | `index.html` | Search `SPONSORS` — edit the `.sponsor` blocks (the list is intentionally duplicated for the seamless marquee) |
| FAQ | `index.html` | Search `FAQ` — edit the questions/answers in `.faq-item` blocks |
| Contact details / socials | `index.html` | Search `CONTACT` — email, phone, address and social links |
| Registration / login storage | `script.js` | `localStorage` keys: `tn_registrations`, `tn_users`, `tn_session`, `tn_newsletter`, `tn_theme` |

---

## Features included

- Animated preloader, scroll progress bar, back-to-top, toast notifications
- Sticky glass navbar with active-link highlighting and mobile hamburger menu
- Dark / light theme toggle (saved in the browser)
- Hero with CSS 3D title, pure-CSS rotating 3D cube, floating shapes
- **Live countdown timer** + real-time **digital clock**
- Animated stat counters (5000+ participants, ₹5L prizes…)
- About section with animated icon tiles
- Event grid with category filters + mouse-following **3D tilt cards**
- Day 1/2/3 schedule timeline with animated entries
- Masonry gallery with hover zoom + full lightbox (←/→/Esc keyboard support)
- Registration form with live validation, shake-on-error, success popup, localStorage save
- Login / Sign-up modal with password strength meter, show/hide password, remember-me
- Sponsors marquee, FAQ accordion, contact form, map placeholder, newsletter
- Custom glowing cursor, parallax background orbs, particle starfield
- Fully responsive + accessible (semantic HTML, focus states, `prefers-reduced-motion` support)

---

## Hosting for free

### GitHub Pages (this repo)

1. Push the code to GitHub (the repo already has it).
2. Go to **Settings → Pages** in the GitHub repo.
3. Under *Build and deployment*, choose **Deploy from a branch**, pick **main** and **/ (root)**, then **Save**.
4. After 1–2 minutes your site is live at:
   **https://<username>.github.io/<repo-name>/** (for this repo: `https://crazyposhni1290-netizen.github.io/iemtechfest/`)

### Netlify (drag & drop)

1. Go to [app.netlify.com](https://app.netlify.com) and sign in.
2. Drag the whole project folder onto the **Deploys** area.
3. Done — you get a live URL instantly. (Or connect the GitHub repo for automatic deploys on every push.)

> Note: use **relative** asset paths (`images/gallery1.jpg`, `style.css`, `script.js`) so the site works at any domain/sub-path — this project already does.

---

## Tech stack

- HTML5 (semantic markup, ARIA labels, meta/SEO tags)
- CSS3 (custom properties, glassmorphism, `backdrop-filter`, 3D transforms, keyframe animations, Grid + Flexbox, `prefers-reduced-motion`)
- Vanilla ES6+ JavaScript (IntersectionObserver, `requestAnimationFrame`, `localStorage`, throttled event handlers)
- Google Fonts (Orbitron + Poppins) and Font Awesome icons — via CDN
