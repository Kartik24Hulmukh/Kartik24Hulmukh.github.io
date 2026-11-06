# Hero 3D control validation

## Issue and change

The hero's 3D control reported a pressed state but did not offer a corresponding off action, and its enabled state was hidden. It is now a visible, reversible toggle with a stable accessible name, a status description, and an obvious active-state affordance. Turning it off cancels an in-flight model request and restores the static mask. It stays off while navigating the page and can be re-enabled; the portrait reveal remains independent. Reduced-motion visitors still begin with a static preview.

## Checks

- `test_3d_toggle.cjs`: 26 checks passed on both entrypoints, with normal and reduced motion, including keyboard use, focus, accessible state, scroll-away/return, and re-enabling.
- `test_3d_cancel.cjs`: four checks passed with a deliberately delayed model request, cancellation and re-enabling.
- Existing scene refinement regression: 46 checks passed; touch-stage and 3D failure/retry tests passed for both entrypoints. The pre-change scroll audit also passed 18 checks.
- `validate.py`, `validate_motion.py`, JavaScript syntax validation and `git diff --check` passed. The 320px control was visually reviewed without horizontal overflow.

Tests were run locally in Chromium; browser, device and assistive-technology coverage is not exhaustive. The preference lasts for the current page session, not across reloads. Model usage remains subject to the existing non-commercial notice in `docs/models/README.md`.
