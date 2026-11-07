# Compact mobile and tablet menu

## Change and rationale

The previous in-flow menu stacked five links in a narrow right column, leaving most of the expanded header empty. It measured approximately 292px tall at 390px. The new numbered checkpoint grid uses the full header width, retains 48px minimum link heights, and follows the page's section order. It measured approximately 216px tall at 390px. The header stays in document flow and never overlays the hero. Escape closes an open menu and returns keyboard focus to its summary when JavaScript is available. Without JavaScript, the native disclosure and links still work; closing is done with the summary.

## Validation

- `test_compact_menu.cjs`: 132 checks passed across root and `/docs/`, 320, 390, 640, 768 and 980px, JavaScript on/off, and desktop navigation at 981px. Checks include target sizes, clipping, accessible link names, keyboard activation and in-flow positioning.
- `test_compact_menu_routes.cjs`: 26 checks passed for all five destinations and brand hit-testing at 320px, with and without JavaScript, plus a 200% zoom check.
- `test_menu_escape.cjs`: six keyboard dismissal and focus-return checks passed.
- Existing failure-reversal, slow-start, scroll-review, and scene-refinement regressions passed. Local browser checks used Chromium, not a full cross-browser or assistive-technology audit.
- `validate.py`, `validate_motion.py` and `git diff --check` passed. The open menu was visually reviewed at 320, 390 and 768px.
