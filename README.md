# zara-portfolio

A hand-built, scroll-driven 3D portfolio — **"an observatory at the edge of dawn"** — with an honesty-first AI twin.

**Live:** https://muhammad-musa-ml.github.io/zara-portfolio/ · **AI twin deep link:** https://muhammad-musa-ml.github.io/zara-portfolio/#ai · **Résumé:** https://muhammad-musa-ml.github.io/zara-portfolio/resume.html

> ⚠️ All personal details are **clearly-labeled demo content** (see [CONTENT-GUIDE.md](./CONTENT-GUIDE.md)) until the real bio lands. The engineering is real; the persona is a placeholder.

## What's inside

- **The living sky** — one draw-call of ~16k GPU particles that morphs through seven procedural formations (nebula → helix → torus knot → eye → wave → heart → beacon) as you scroll, with the palette traveling from midnight to dawn. Custom GLSL, no models, no textures, cursor-reactive.
- **Seven chapters** — hero, education timeline, sticky project case studies, an interactive design-psychology lab (Hick's law / Fitts's law / Von Restorff experiments that measure *your* behavior), skills, personal, contact.
- **The design lens (◐)** — toggle it and the site annotates its own UX decisions with the psychology behind them. The portfolio practices what it preaches.
- **Zara's AI twin** — a chat grounded in [`public/persona/knowledge.md`](./public/persona/knowledge.md) with an explicit honesty contract: it says "no, I haven't done that" *first*, then bridges to transferable evidence. Includes an anti-hallucination "things I have NOT done" list.
- **Command palette** (`Ctrl/⌘ K`), custom cursor, Konami code, `sudo hire zara`, print-ready résumé page, reduced-motion + no-WebGL fallbacks, full keyboard navigation.

## Stack

Vite 8 · vanilla JS · three.js (custom ShaderMaterial) · GSAP ScrollTrigger · Lenis · self-hosted fonts (Instrument Serif, Bricolage Grotesque, Spline Sans Mono). No frameworks, no templates, no trackers, $0/month.

## AI providers (all free)

The chat tries providers in order and degrades gracefully:

| Tier | Provider | Needs | Quality |
|------|----------|-------|---------|
| 1 | Gemini 2.5 Flash | free AI Studio key in `public/config.json` | best |
| 2 | Pollinations.ai | nothing (keyless) | currently blocked for browser origins (Turnstile) — kept as a free retry |
| 3 | Offline notes | nothing | 20 curated Q&As, honestly labeled "offline mode" |

### Go fully live in ~2 minutes (recommended)

1. Visit **aistudio.google.com** → "Get API key" → create key (free, **no credit card**, cannot incur charges).
2. Put it in [`public/config.json`](./public/config.json): `"geminiApiKey": "AIza…"` — editable directly on GitHub's web UI; the site redeploys automatically.
3. (Recommended) Restrict the key: console.cloud.google.com → APIs & Services → Credentials → your key → *Application restrictions: Websites* → add `https://<user>.github.io/*`; *API restrictions* → Generative Language API only.

The key ships client-side by design: it is quota-capped (~250 requests/day), referrer-restricted, and attached to no billing — worst case someone exhausts the day's free quota and the twin falls back to offline notes.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
```

`?instant` skips the boot choreography; `?instant&at=work` lands on a chapter (used by automated screenshots).

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml` (build → GitHub Pages). If the repo moves to a new account: Settings → Pages stays on "GitHub Actions", and update `base` in [`vite.config.js`](./vite.config.js) if the repo name changes.

## Swap in the real person

Everything editable lives in three files — see **[CONTENT-GUIDE.md](./CONTENT-GUIDE.md)**:
`src/content/site-content.json` (site copy) · `public/persona/knowledge.md` (AI grounding) · `public/persona/faq.json` (offline answers).
