# In-flow navigation — audit and verification

## Finding and change

The former floating index could cover project-card text on a 390 × 844 screen. It has been removed, rather than merely moved to another corner. Three native section-index disclosures now sit in the document flow at Work, Boundaries and Ledger; when opened, they push subsequent content down instead of overlaying it. The original header, mobile menu, project dossier links, native scrolling, fragments and browser history remain available. The controls use the existing pink, green and geometric visual language. They work with JavaScript disabled.

## Premortem

- **Menus could take over the reading experience:** each is a collapsed 48 px control in normal flow, rather than a persistent bar. They are placed at three section checkpoints rather than every paragraph.
- **An open menu could obscure projects:** it grows in flow; automated checks compare its bottom against the following dossier's top at multiple viewport sizes.
- **Keyboard or touch users could lose navigation:** native disclosure controls and links provide built-in keyboard, touch and browser-history behavior. Both modes are tested; link targets remain the actual section IDs.
- **Failed scripts could hide navigation:** section menus require no script. Tests also block the motion engine and check navigation and project access.
- **Limits:** Chromium emulation cannot establish physical iOS or Android behavior, real-user usability, conversion, or an award result. Three parallel-agent reviews were attempted but the service failed; there was no council review. The supplied character artwork remains non-commercial-only (`docs/models/README.md`).

## Checks and references

`scripts/test_journey.cjs` covers layout, native interaction, reduced motion, keyboard, touch and JavaScript-disabled behavior; `scripts/test_journey_history.cjs` covers direct links, history, short screens and engine failure. Existing hero, 3D, dossier, scroll and fallback suites are run as regressions. The installed Playwright automation tool is listed in the supplied `repos.md`.

For interaction design, web.dev recommends retaining access to content and controlling non-essential motion: https://web.dev/learn/accessibility/motion
