# Reveal continuity and scroll verification

## Findings and changes

The live Front Man was removed from the renderer as soon as hover or focus revealed the portrait. The static poster therefore replaced the live mask under the still-transparent portrait, causing a visible jump at the start of the transition. The shared renderer now keeps the visible mask eligible while the portrait opens and closes; it can still hand off to another visible character. The portrait status remains accurate. The button's accessible name is now stable, while `aria-pressed` indicates whether the portrait is pinned. The reference contour field, mask-first arrival, native scrolling, user-controlled motion and in-flow navigation remain intact.

## Premortem and tests

- Renderer retained when needed: the new `scripts/test_reveal_continuity.cjs` checks live mask continuity, transition completion, rapid reversals and consistent toggle semantics on both routes. Before the fix, the opening continuity assertion failed on both routes; after it, all 12 checks passed.
- One renderer, not an always-running scene: the existing stage stress test passed, reporting one renderer and no extra idle draws during its sample. Drag and keyboard-turn tests, touch tests, and portrait tests passed, including reduced motion.
- Scrolling and access: section-index tests passed 74 checks; history and failure tests passed 16; scroll review passed 18. Native wheel, reverse scroll, direct links, short viewports, no-JavaScript and disabled engine paths were included.
- Background: both routes passed 11 synchronized shader tests each; the static fallback test passed 10 checks. An initial test used a fixed 300ms delay and intermittently sampled the old scroll uniform; it is now synchronized to the actual native scroll and WebGL uniform change, with a bounded timeout. The first run also used a nonexistent browser path; reruns specified the installed Chromium. These are test-environment observations, not measured device performance.
- Existing fallback/reversal, slow-start and source-integrity validations passed. Tested with headless Chromium and software WebGL, not physical phones, Safari or production traffic. This is not a WCAG certification or a claim of awards, traction or conversion.

The current artwork is credited to @jaeysart and is restricted to personal/non-commercial use; see `docs/models/README.md`. Parallel-agent reviews were attempted but the session service failed, so no council review is claimed.

References: [W3C animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [WAI-ARIA button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).
