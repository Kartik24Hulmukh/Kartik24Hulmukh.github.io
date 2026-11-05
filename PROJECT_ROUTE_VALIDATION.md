# Project-route validation

## Change

Every expanded case study ends with an in-flow link to the next project and a return to the featured-project index. The final case study leads to contact. The last three projects now have stable fragment IDs. These are ordinary anchors, not a fixed overlay or a replacement for native scrolling; existing accordion and disclosure behavior is unchanged.

## Checks

- `test_project_routes.cjs`: 80 checks passed across `/` and `/docs/`, at 320, 390, 768 and 1440px, with and without JavaScript. Verified keyboard activation, destination expansion, return, minimum target size, overflow and runtime errors.
- `test_project_route_chain.cjs`: 28 transitions passed across both routes with and without JavaScript at 320px, including the final contact destination.
- Existing `test_dossier.cjs`: 66 checks passed, including direct hashes, browser history, slow/failed engine and no-JavaScript.
- `validate.py`, `validate_motion.py` and `git diff --check` passed. Reviewed the 390px in-flow navigation visually.

These are local Chromium checks, not a guarantee for every browser, device or assistive technology.
