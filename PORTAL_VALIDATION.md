# Checkpoint hero and mask-to-maker reveal

## Design intent

The arrival stays a working portfolio, not a gated game. The name has more typographic weight on wide screens; a subtle checkpoint frame, green player card and pink-edged character aperture create a more cohesive scene while retaining the contour background and direct work/contact links. Existing full-body character scenes remain in place. The hero starts with the Front Man and reveals the maker only on hover, focus or activation.

The former circular iris has been replaced by a short fade to the complete portrait while two light edges part. The hit target itself stays fixed. Pointer exit, pinning, Escape, touch, reduced motion and script-failure fallbacks remain available. No external assets or new runtime library were added.

## Premortem

- **The reveal may obscure the portrait or move the control:** the open state is visually inspected; the gate edges sit at the frame, and automated checks verify an unchanged button rectangle and no central shadow.
- **Repeated reversals could strand the reader:** automated tests cover rapid hover reversal, pinning, Escape, focus, touch and no-JavaScript fallback on both published routes.
- **Animation can distract or cause discomfort:** reduced-motion and the site's pause setting suppress these transitions. Motion guidance: https://web.dev/learn/accessibility/motion
- **Animation may feel heavy on a slower device:** the principal fade and gate motion use opacity and transform rather than animating a clipped iris. This is a design choice, not a measured performance guarantee: https://web.dev/articles/animations-overview
- **The visual motif could imply endorsement or create licensing risk:** no franchise endorsement is claimed. The supplied character models are non-commercial-only; see `docs/models/README.md` before commercial use.
- **Limits:** automated Chromium and emulated touch do not establish physical-device usability, conversion, awards or performance across devices. Three parallel-agent reviews were attempted and the service failed; no council review is claimed.

## Verification

`scripts/test_portal.cjs` checks both routes for default mask, fade, stable hit target, full reveal, reversal, pinning, Escape, reduced motion, touch and static fallback. Existing suites cover navigation, scroll, model interactions and degraded-engine behavior.
