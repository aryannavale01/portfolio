# QA Log — portfolio glass + consistency pass

## Iteration 1 (2026-10-13)
### Audit (DOM probes, served-CSS inspection, ffmpeg sampling — no Playwright/Lighthouse/axe in this env)
- Console: 0 errors, 0 warnings. Overflow: none (985 ≤ 1000, all sections ok).
- Alt text present on all images. will-change only on marquee/magnetic (tiny elements) — no large panels.
- Contrast: sampled journey source at 4 timeline points — all dark imagery; white body text passes 4.5:1 with wide margin. No problem sections.
- Found 16 hard-coded blur sites; `.glass` 20px / `.glass-strong` 28px exceeded the 16px cap.
- Found nested backdrop-filters (badges/tiles/inputs inside blurred panels).
- Found a real pipeline bug: LightningCSS drops the FIRST of a standard/-webkit backdrop-filter pair, so all blurs silently computed to `none`. Fixed by ordering standard last.

### Issues
- P0: none.
- P1: (1) scattered glass values + over-cap blurs; (2) nested backdrop-filters; (3) one-off panel classes (skills/about/nav/eyebrow); (4) no mobile blur reduction or no-support fallback.
- P2: CTA button keeps its own blur (not nested — acceptable); red quote card keeps identity.

### Fixes (5)
1. `globals.css`: glass-1/2/3 + glass-flat + hover-lift + mobile vars (7/10/10) + `@supports not` fallback; `.glass`/`.glass-strong` aliased to 1/2.
2. Panels (skills, about) → `glass-2`.
3. Nested children (hero badges, skill tiles, contact inputs/socials) → `glass-flat` / blur removed.
4. Navbar/menu/eyebrow → `glass-3`.
5. Prefix-order fix so the standard `backdrop-filter` survives minification.

### Verify
- `npm run build`: clean (lint + types). `npm start`: 200.
- Probes: nav `backdrop-filter: blur(16px)` computes; tiles `none` (correct); 0 console errors; no overflow.
- Deviations: radius stays in component classes (utilities would break `rounded-full` pills); navbar is now 0.60 alpha per spec (was 0.28 — say the word to revert); framer-transformed elements ignore the CSS hover lift (inline style wins, harmless).

### Unmeasured (no tooling here — not claimed)
Lighthouse perf/a11y, axe scan, CLS, metered 60fps, screenshots at 1440/768/390.

## Iteration 2 (2026-10-13)
### Audit
- Tap targets measured: carousel 32px, socials 37px, footer 17px, nav links ~20px (all <44px P1); submit/input already 44px.
- Hover lift used `transform`, which loses to framer-motion's inline transforms — cards never lifted (P1).
- Console: 0 errors. Overflow: none (re-checked).

### Fixes (5)
1. `globals.css`: hover lift now uses the `translate` property so it composes with framer transforms.
2. `navbar.tsx`: desktop links `px-1 py-3` (~44px hit area, no visual shift); Hire me → `h-11`.
3. `projects.tsx`: carousel buttons `sm` → `lg` (48px).
4. `contact.tsx`: social pills `py-2` → `py-3` (45px measured).
5. `footer.tsx`: links `inline-block px-2 py-3` (44px measured).

### Verify
- Build + lint clean. Measured: 48 / 45 / 44 / 44px. Zero console errors.
- Accepted P2: tiny inline text links (project source links) stay small — padding them would wreck card rhythm.

## Mid-loop owner overrides (logged, not QA issues)
- Marquees run under reduced-motion too (explicit request; revert block kept in CSS comments).
- Journey scrub runs in all modes for the same reason.
- 2026-10-13: whole site switched to the Skills quote card's red glass (`.glass-quote`) per explicit request — supersedes neutral levels for panels/cards. Tiles, inputs, menu overlay and buttons intentionally keep neutral/flat treatments for calm and usability.
- Bad-email path verified live ("Please enter a valid email"); empty submit shows Zod message; valid submit without keys shows honest 503 notice.
- Focus: single red `:focus-visible` outline system; shadcn ring utilities removed from Button/Input/textarea so one system rules. (Programmatic `.focus()` in headless tabs doesn't match `:focus-visible` heuristics, so live-ring proof needs a real keyboard Tab — rule presence verified in served CSS pipeline via clean build parse.)
- Section headers unified: Projects header is now a red `QuoteBanner`; Expertise/Certifications headers are dark `PanelBanner`s with red-square titles (new shared `bits/section-banner.tsx`). Cert icon chip de-nested to `glass-flat`. No copy/ids/order changed.

## Iteration 4 — Group 7 glass + type (2026-10-14)
- All three headers now share one neutral `PanelBanner` (Projects regained its eyebrow as `PanelTitle`); `QuoteBanner` kept exported for future use.
- Skill tiles: 10px labels, clamp-2, fixed icon slot, equal heights (94px row measured).
- Project tag labels → `#FF6B63` on red cards.
- Verified live, zero errors. Build + lint clean. Committed as d9f2670.

## Iteration 5 — Group 8 contact (2026-10-14)
- Visible Name/Email/Message labels; icons on pills (SiGithub, Briefcase, Mail) + white Download resume button.
- `public/resume.pdf`: hand-built valid 1-page placeholder (981 bytes, serves 200) — replace with the real export.
- States verified live: empty → Zod error, bad email → Zod error, valid → honest 503 notice (no keys), loader + disabled while sending, `noValidate` so custom messages always win. Zero console errors. Committed as 43456f6.
