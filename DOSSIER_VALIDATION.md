# Project dossier navigation — rationale and verification

## Intent

The work section already contains detailed project receipts, but the first open project is long. The dossier selector gives visitors four direct entry points, with a concise description and the existing project maturity labels. It links to the real project sections; it is not a simulated execution or a substitute for the other three projects. The surrounding Front Man, full-body character interactions, contour background, evidence links, and original project disclosures remain in place.

Project links are ordinary fragment links. When the enhancement is available, it opens the matching project and keeps `aria-expanded`, `inert`, and the selected link state consistent. Direct hashes, reloads, and browser history are supported. If JavaScript or the main interaction engine is unavailable, the original open-content fallback still allows visitors to reach the content.

## Design references

- The layered portfolio research at Codrops uses a user-directed hub as an alternative to forcing a linear presentation: https://tympanus.net/codrops/2026/05/02/designing-against-the-gallery-a-two-year-journey-to-a-layered-portfolio-experience/
- W3C explains why the text of a link should describe its purpose: https://www.w3.org/WAI/WCAG22/Techniques/html/H30
- Web.dev describes native focusable controls and their built-in keyboard behavior: https://web.dev/learn/accessibility/focus

## Premortem

- **The selector hides or replaces projects:** it is an optional navigation aid; the full seven-project list remains immediately below.
- **A direct link lands inside a collapsed disclosure:** the enhancement opens the owning project on click and hash change, including links to content nested inside a project.
- **Slow or unavailable scripts strand the reader:** native links still navigate and the existing content-first fallback exposes project content. Slow and blocked engine cases are tested.
- **Decorative styling hurts reading:** links are text-based with visible focus states; motion-off and reduced-motion settings suppress movement, and each card is a large target.
- **The selector becomes another obstacle:** the work and contact links remain available in the hero; links jump directly to the project rather than requiring a game or animation to finish.
- **Limits:** no conversion uplift, award outcome, or external usability result is claimed. Chromium software-rendered tests and emulated touch are not a substitute for real devices or human studies. The parallel-agent service was attempted and failed; no multi-agent council is claimed.

## Checks

See `scripts/test_dossier.cjs` for route, viewport, keyboard, fragment, history, slow engine, blocked engine, and no-JavaScript checks. Existing interaction, touch, stage, scroll, fallback and build tests cover the retained experience. Character models remain non-commercial-only as documented in `docs/models/README.md`.
