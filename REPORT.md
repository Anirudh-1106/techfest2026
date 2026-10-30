# Experiment 5 – Security, Version Control, CI/CD and Cloud Deployment

**Module 5 – Security, DevOps and Deployment (CO5)** · TechFest 2026 Portal (MERN)

## Aim

To secure the MERN application against common OWASP vulnerabilities, manage it with Git/GitHub, configure a CI pipeline, deploy it to the cloud, and analyse and improve its performance.

## Question

Prepare the TechFest 2026 Portal for production deployment by implementing security, version control, performance optimization, and cloud deployment.

1. Identify potential security vulnerabilities in the application and implement appropriate preventive measures.
2. Secure user authentication and sensitive information during communication between the client and the server.
3. Maintain the project using Git by demonstrating appropriate branching and merging strategies.
4. Configure an automated deployment pipeline for the application.
5. Deploy the frontend, backend, and database using suitable cloud platforms.
6. Optimize the application to improve loading speed and overall performance.
7. Analyze the deployed application using browser developer tools and performance auditing tools, and document the observations.
8. Verify that the deployed application functions correctly across different devices and browsers.
9. Prepare a brief deployment report including the application architecture, deployment URLs, and screenshots of the deployed application.

---

## 1. Application Architecture

![Architecture](screenshots/arch01_architecture.png)

```
User Browser ──HTTPS──▶ React (Netlify) ──HTTPS /api + httpOnly cookie──▶ Express API (Render) ──TLS──▶ MongoDB Atlas
                                   ▲                                              ▲
                                   └──── auto-deploy on push to main ─────────────┘
                     GitHub repo ──▶ GitHub Actions CI (tests + lint + build)
```

| Tier | Technology | Hosting |
| --- | --- | --- |
| Frontend | React 19 + Vite, React Router | Netlify |
| Backend | Node.js, Express 5, Mongoose, JWT | Render (Web Service) |
| Database | MongoDB | MongoDB Atlas (free M0 cluster) |
| CI | GitHub Actions (`.github/workflows/ci.yml`) | GitHub |

## 2. Deployment URLs

| Part | URL |
| --- | --- |
| Frontend (Netlify) | _to be added after deployment_ |
| Backend API (Render) | _to be added after deployment_ — health check: `/api/health` |
| Database | MongoDB Atlas cluster (connection string is kept only in Render's environment settings) |
| Source code | https://github.com/Anirudh-1106/techfest2026 |
| CI runs | https://github.com/Anirudh-1106/techfest2026/actions |

---

## 3. Security Note (Questions 1 and 2)

To demonstrate each attack safely, a separate **insecure test copy** of the project was run on other ports (API on `5001`, site on `5174`, database `techfest_vulntest`). The test copy had Helmet, sanitising and validation removed. The real application ran on ports `5000` and `4173`.

### 3.1 NoSQL injection (login bypass) — OWASP A03 Injection

**Problem.** If the request body is placed straight into a Mongo query, an attacker can send an operator object instead of a string. The test copy used the naive query `User.findOne({ email, password })`, which is common in tutorials. Sending `{"$gt": ""}` for both fields matches the first user, and the attacker is logged in without knowing an email or password.

**Before (insecure copy)** — a wrong password fails, but the injection logs in as "Fest Admin":

![Injection before](screenshots/sec01_injection_before.png)

**Fixes in the real app**
- `express-mongo-sanitize` strips keys that start with `$` or contain `.` from `req.body` and `req.params` (`techfest-backend/app.js`).
- A `requireStrings()` check returns 400 unless `email`/`password`/`name` are plain strings (`routes/auth.js`).
- `express-validator` checks the email format and password length, and limits feedback to 500 characters.
- Passwords are hashed with **bcrypt** and compared with `bcrypt.compare`, never inside the query.
- `express-rate-limit` allows 10 login attempts per 15 minutes per IP (slows brute force, OWASP A07).
- The JSON body limit is `10kb`.

**After** — the same payloads are rejected with 400 before they reach MongoDB:

![Injection after](screenshots/sec02_injection_after.png)

### 3.2 Cross-Site Scripting (XSS) — OWASP A03

**Problem.** The test copy rendered feedback with `dangerouslySetInnerHTML`. Submitting `<img src=x onerror="alert('hi')">` in the feedback box runs the attacker's JavaScript in every visitor's browser.

> Note: `<script>alert('hi')</script>` was also submitted. Browsers never execute `<script>` tags that are inserted through `innerHTML`, so that payload did not fire. The `<img onerror>` payload is the standard way to show the same attack, and it fired.

**Before** — the alert pops up, and the injected `<img>` tags appear in the list as broken images:

![XSS popup](screenshots/sec03b_xss_alert_popup.png)
![XSS before](screenshots/sec03_xss_before.png)

**Fixes**
- Feedback is displayed as **plain text** (`{item.comment}`). React escapes `< > & "`, so the markup is shown and never executed. The "vulnerable mode" switch was removed from the production page.
- **Helmet** sends a strict Content-Security-Policy (`default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'`) along with `X-Content-Type-Options: nosniff`, `X-Frame-Options` and HSTS.
- The frontend sends its own CSP and security headers from `netlify.toml`. `script-src 'self'` blocks inline and third-party scripts even if markup slips through.

**After** — the same payloads appear as harmless text, and no alert fires (0 dialogs in the automated test):

![XSS after](screenshots/sec04_xss_after.png)

### 3.3 Secure authentication cookie and token storage — OWASP A02 / A07

**Problem.** Before the fix, the JWT was stored in `localStorage` and the cookie had no flags. Any XSS script could read the token with `localStorage.getItem("token")` and send it to an attacker.

![Cookie before](screenshots/sec05_cookie_before.png)
![Storage before](screenshots/sec07_token_storage_before.png)

**Fix**
- The token is sent in a cookie with **`HttpOnly`** (JavaScript cannot read it), **`Secure`** (sent only over HTTPS) and **`SameSite`** (`config/cookie.js`).
- The frontend no longer writes the token to `localStorage`. The session is restored on page load from the cookie through `GET /api/auth/me`.
- All traffic is HTTPS in production (Netlify and Render certificates, plus the HSTS header). The Atlas connection uses TLS (`mongodb+srv`).
- Secrets (`MONGO_URI`, `JWT_SECRET`) live in `.env` locally and in Render's environment settings in production. `.env` is listed in `.gitignore` and was never committed.

![Cookie after](screenshots/sec06_cookie_after.png)
![Storage after](screenshots/sec08_token_storage_after.png)

### 3.4 CSRF and how SameSite helps

**Cross-Site Request Forgery** happens when a malicious website makes the victim's browser send a request (for example "register me for this event" or "post this feedback") to our API. The browser attaches the victim's login cookie automatically, so the server thinks the real user sent it.

- **`SameSite=Lax/Strict`** tells the browser *not* to attach the cookie to requests that start on another site, so the forged request arrives without a login and fails. Locally the cookie uses `SameSite=Lax`.
- In production the frontend (`*.netlify.app`) and API (`*.onrender.com`) are on **different sites**, so the cookie must be `SameSite=None; Secure` for login to work. CSRF is then blocked by two server-side checks:
  1. **CORS allow-list**: only `FRONTEND_URL` may make credentialed requests.
  2. **Origin check** (`middleware/csrf.js`): any POST/PUT/DELETE whose `Origin` header is not our frontend gets **403**. This is shown in the last command of the "Injection after" screenshot (`Origin: https://evil.example.com` → `Origin not allowed`).

### 3.5 Automated security tests

`techfest-backend/tests/security.test.js` (Jest + Supertest) contains 10 tests. They cover the health check, the 404 handler, Helmet headers, NoSQL-injection rejection on login and register, input validation, a protected route without a token, the guest session check, and blocking a cross-site POST. They run on every push in CI.

| Vulnerability | Fix | Verified by |
| --- | --- | --- |
| NoSQL injection / login bypass | mongo-sanitize, string type check, validator, bcrypt | sec01 → sec02, Jest |
| Stored XSS | text rendering, CSP (Helmet + Netlify) | sec03 → sec04 |
| Token theft via XSS | httpOnly cookie, no localStorage | sec05/07 → sec06/08 |
| CSRF | SameSite, CORS allow-list, Origin check | sec02, Jest |
| Brute-force login | express-rate-limit | `X-RateLimit-*` headers |
| Clickjacking / MIME sniffing | `X-Frame-Options`, `frame-ancestors`, `nosniff` | Jest |

---

## 4. Version Control with Git (Question 3)

- `git init` with a `.gitignore` containing `node_modules`, `.env`, `dist`, `*.log`.
- Work was committed in small steps with clear messages (`first version`, `secure api: helmet, cors, csrf, rate limit`, `use httponly cookie auth`, `add api tests`, …).
- **Branch and merge:** the `feature-page` branch added a site footer, and was merged into `main` with `git merge --no-ff feature-page`.
- **Merge conflict:** `update-hero` and `main` both changed the same hero tagline line in `Home.jsx`. Git stopped with `CONFLICT (content)`. The file was edited to keep one combined line, the `<<<<<<< ======= >>>>>>>` markers were removed, and the result was committed as `resolve hero conflict`.
- Pushed to GitHub with `git remote add origin …` and `git push -u origin main`. The branches were pushed too.

![Branch merge](screenshots/git01_branch_merge.png)
![Merge conflict](screenshots/git02_merge_conflict.png)
![Conflict resolved](screenshots/git03_conflict_resolved_graph.png)
![GitHub repository](screenshots/git04_github_repo.png)
![Branches](screenshots/git05_github_branches.png)
![Commit history](screenshots/git06_github_commits.png)

## 5. CI Pipeline (Question 4)

`.github/workflows/ci.yml` runs on every push and pull request to `main`, with two jobs:

| Job | Steps |
| --- | --- |
| backend | checkout → Node 22 → `npm ci` → `npm test` (Jest + Supertest) |
| frontend | checkout → Node 22 → `npm ci` → `npm run lint` → `npm run build` |

**Red, then green:** the first push (`add ci workflow`, run #1) **failed**. The health-check test deliberately expected `"ok"` instead of `"healthy"`. That push also removed the old PNG images before `Gallery.jsx` had been switched to the new WebP files, so the frontend build failed as well. The next push (`fix health test` + `lazy load pages and images`, run #2) passed, and so did every later run.

![CI failed](screenshots/ci01_failed_run.png)
![CI passed](screenshots/ci02_passing_run.png)
![CI runs](screenshots/ci03_runs_list.png)

**Continuous deployment:** Render and Netlify are both connected to the GitHub repository and redeploy automatically on every push to `main`.

## 6. Cloud Deployment (Question 5)

| Step | Setting |
| --- | --- |
| **MongoDB Atlas** | Free M0 cluster, a database user with a password, Network Access `0.0.0.0/0` (Render has no fixed IP), connection string `mongodb+srv://…/techfest` |
| **Render** (Web Service from GitHub, or Blueprint from `render.yaml`) | Root directory `techfest-backend`, build `npm ci`, start `npm start`, health check `/api/health`. Environment: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL` |
| **Seed data** | `npm run seed` (with the Atlas `MONGO_URI`) adds the 4 TechFest events |
| **Netlify** | Base directory `techfest-react`, build `npm run build`, publish `dist` (from `netlify.toml`). Environment: `VITE_API_URL=<Render URL>` |
| **SPA routing** | `techfest-react/public/_redirects` → `/*  /index.html  200`, so refreshing `/events` or `/gallery` works |

_Live screenshots (HTTPS lock, registration stored in Atlas) are added after deployment — see section 9._

## 7. Performance Optimisation (Question 6)

| Change | Where |
| --- | --- |
| Gallery images converted from 2816×1536 PNG (~9.5 MB each) to 800 px **WebP** (50–76 KB), plus 400 px versions served with `srcset`/`sizes` | `src/assets/*.webp`, `Gallery.jsx` |
| Images use `loading="lazy"`, `decoding="async"` and fixed `width`/`height` (no layout shift); the first image has `fetchpriority="high"` | `Gallery.jsx` |
| **Route-level code splitting** with `React.lazy` + `Suspense`: each page is its own JS chunk, downloaded only when visited | `App.jsx` |
| Production build: minified + tree-shaken by Vite (`npm run build`) | — |
| **gzip compression** of API responses (`compression` middleware) | `app.js` |
| Long-term caching of hashed build files (`Cache-Control: max-age=31536000, immutable`) | `netlify.toml` |
| Removed unused assets (`hero.png`, `react.svg`, `vite.svg`, `icons.svg`) | — |

**Build output, before and after:**

| | Before | After |
| --- | --- | --- |
| Images | 4 PNG = **37,966 KB** | 8 WebP = **349 KB** (only 4 load on a given screen) |
| JavaScript | 1 bundle, 255 KB (80 KB gzip) | main 238 KB (76 KB gzip) + 7 page chunks of 0.3–5 KB |
| CSS | 14.2 KB | 14.3 KB |

![Build before](screenshots/perf01_build_before.png)
![Build after](screenshots/perf02_build_after.png)

## 8. Analysis with Lighthouse and DevTools (Question 7)

Lighthouse 12 (mobile emulation, simulated slow 4G), run on the production build. Saved reports: [`reports/lighthouse/`](reports/lighthouse).

| Page | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| Home – before | 100 | 91 | 100 | 82 |
| Home – after | 100 | **100** | 100 | **100** |
| Gallery – before | 75 | 100 | 100 | 83 |
| Gallery – after | **97** | 100 | 100 | **100** |

| Gallery metric | Before | After |
| --- | --- | --- |
| Largest Contentful Paint | 115.1 s | 2.6 s |
| Time to Interactive | 122.1 s | 2.6 s |
| Total transfer (Network panel) | 37,162 KB | 338 KB |
| Image transfer | 37,078 KB | 255 KB |
| Cumulative Layout Shift | 0 | 0 |

**Lighthouse suggestions fixed (6):**
1. *Serve images in modern formats / properly size images* → WebP, resized, `srcset`.
2. *Largest Contentful Paint image was lazily loaded / not prioritised* → `fetchpriority="high"` on the first image, lazy loading on the rest.
3. *Document does not have a meta description* → added to `index.html`, and the page title changed from `techfest-react` to `TechFest 2026 Portal`.
4. *robots.txt is not valid* → added `public/robots.txt` (previously the SPA returned `index.html` for it).
5. *Background and foreground colours do not have sufficient contrast* → darker or lighter label colours. The large decorative "26" is now drawn with CSS `::before` and hidden from screen readers.
6. *Browser errors were logged to the console* → the session check returns `{ user: null }` for guests instead of a 401.

![LH before home](screenshots/lh01_before_home.png)
![LH before gallery](screenshots/lh02_before_gallery.png)
![LH after home](screenshots/lh03_after_home.png)
![LH after gallery](screenshots/lh04_after_gallery.png)

**Observations**
- Before optimisation, the Gallery page downloaded 37 MB. On a mobile connection the hackathon image took almost two minutes to appear. Images were over 99 % of the page weight.
- JavaScript is now the largest resource (~76 KB gzip, mostly React and React Router). The remaining Lighthouse hint, "reduce unused JavaScript (~33 KB)", comes from these library bundles.
- No layout shift (CLS 0) and no long main-thread tasks (TBT 0 ms) were recorded on any page.
- Network panel: before, the Gallery page made 8 requests; 4 of them were PNGs of ~9.5 MB each. After, it makes 10 small requests (the page's own JS chunk is fetched on demand).

## 9. Cross-Device and Cross-Browser Testing (Question 8)

An automated Playwright check opened every route directly (including a hard refresh of each route and an unknown URL for the 404 page). It confirmed the events load from the API, logged in, refreshed the page to confirm the session persists, and counted JavaScript errors. This ran in Chromium (Chrome), Firefox and WebKit (Safari) engines, at desktop sizes and on emulated iPhone 13, Pixel 7 and iPad Mini.

![Compatibility results](screenshots/local_dev00_compat_results.png)

| Device / browser | Screenshot |
| --- | --- |
| Chrome desktop – home, events, gallery, contact, register, logged in, 404 | `local_site01…07` |
| Firefox desktop | ![](screenshots/local_dev01_firefox_home.png) |
| Safari (WebKit) desktop | ![](screenshots/local_dev02_safari_gallery.png) |
| iPhone 13 | ![](screenshots/local_dev03_iphone_home.png) ![](screenshots/local_dev04_iphone_events.png) |
| Pixel 7 | ![](screenshots/local_dev05_pixel_gallery.png) ![](screenshots/local_dev06_pixel_contact.png) |
| iPad Mini | ![](screenshots/local_dev07_ipad_home.png) |

![Home](screenshots/local_site01_home.png)
![Events](screenshots/local_site02_events.png)
![Gallery](screenshots/local_site03_gallery.png)
![Logged in](screenshots/local_site06_logged_in.png)

_The same check is repeated against the live HTTPS site after deployment._

---

## Result

Thus the Security, Version Control, CI/CD and Cloud Deployment was developed and its output verified successfully.
