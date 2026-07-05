# Content guide — swapping demo content for the real person

Every fact on this site is **fabricated demo content** built around the persona "Zara Ahmed" (LUMS CS '26). This file lists exactly what to replace and where. Nothing else in the codebase hardcodes personal facts.

## The three content files

| File | Drives | Format |
|------|--------|--------|
| `src/content/site-content.json` | every word on the site + résumé page | JSON |
| `public/persona/knowledge.md` | what the AI twin knows and admits to | Markdown |
| `public/persona/faq.json` | offline-mode canned answers | JSON |

Keep the three consistent — same companies, same metrics, same dates. The AI twin only ever speaks from `knowledge.md`.

## Fabricated inventory (all must be replaced)

- **Name**: Zara Ahmed (also: monogram "za." in `index.html` nav + loader, favicon `public/favicon.svg`, `<title>`/meta in `index.html` and `resume.html`)
- **Employers**: "Lumen Loop" (SWE internship, Summer 2024) and "Notch Studio" (design internship, Summer 2025) — fictional companies
- **Projects**: Rasta, Alfaaz, Marrow, Sahulat — fictional, with fictional metrics (80 students, 72% agreement, 25+ components, 210 users / 340 sessions / 4.6★)
- **Awards**: Dean's Honor List (Fall 2023, Spring 2025), "Indus Valley Hackathon" win — fictional
- **Roles**: Design Lead of "LUMS Design Collective", Data Structures TA — fictional
- **Contact**: `hello@zaraahmed.dev`, `github.com/zaraahmed`, `linkedin.com/in/zaraahmed` — placeholders (links are `#` in the contact section; also update the plain-text contact line in `src/resume.js` and the `cmdk.js` "Copy email" command)
- **Fun facts / values / timeline entries** — all invented
- **Real things kept on purpose**: LUMS, the degree (BS CS 2022–2026), Lahore, the SWE/design/product positioning

## The photo

`#offscreen` has a styled empty portrait frame ("photo · coming soon"). To add a real photo: drop `public/portrait.jpg` and in `src/dom.js` replace the `.portrait-frame` inner span with `<img src="${import.meta.env.BASE_URL}portrait.jpg" alt="…" style="width:100%;height:100%;object-fit:cover">`. Project-card art slots (`.pc-art`) work the same way if real screenshots become available.

## The AI twin's honesty anchors

When updating `knowledge.md`, preserve the two sections that make the twin honest:

1. **"Things I have NOT done"** — explicit non-experiences. This is what stops the model from bluffing.
2. **"Transferable bridges"** — for each common gap, the closest real evidence + honest ramp-up note.

Update both to match the real person. If she *has* done something listed there, move it out.

## After editing

Commit to `main` — GitHub Actions rebuilds and redeploys automatically (~90s). `knowledge.md`, `faq.json`, and `config.json` are fetched at runtime, so those changes need no code edits at all.
