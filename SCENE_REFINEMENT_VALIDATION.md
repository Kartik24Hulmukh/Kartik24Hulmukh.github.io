# Checkpoint scene refinement

## Direction and implementation

The hero is a clearer, high-contrast checkpoint with a deeper green player strip, stronger pink/green framing and a gridded character room. The user-supplied contour field remains visible and responsive. Full-body characters retain their existing three separate work/process/contact scenes and shared renderer. The portrait opens from the center over the live Front Man and reverses cleanly; the initial state remains the mask. On 320px screens, the two primary actions now fit in one row. Dossier hover uses an inset highlight rather than moving the hit target.

## Premortem and mitigations

- **Gate hides the wrong image or flickers:** the previous continuity fix keeps the live mask underneath; the new checks verify mask-first, live-mask continuity, clip-path progression, open/close and rapid reversal.
- **Motion or hover excludes visitors:** touch toggles and keyboard focus/Enter/Escape remain available. Reduced-motion and the site's motion-off switch eliminate the animation. No-JavaScript fallback remains available. The aperture and dossier hitboxes remain fixed.
- **Navigation or scroll becomes trapped:** no wheel or touch listener was added; existing native vertical scrolling and links are unchanged. The section-index and history regressions cover direct links, small screens and blocked scripts.
- **Character visuals or text become unreadable:** reviewed desktop, tablet and mobile previews; focused layout checks cover 320, 390 and 768 pixels on both routes. The work characters remain visible, with their controls outside the scene.
- **Performance or rights are misrepresented:** the existing single renderer and finite-burst background remain unchanged. Tests use headless Chromium/software rendering, not physical devices, real GPU metrics, conversion or an award. Supplied models by @jaeysart are restricted to personal/non-commercial use; see `docs/models/README.md`.

## Validation

The new `scripts/test_scene_refinement.cjs` passed 46 checks across root and docs routes. Fourteen existing regression suites passed: portal, reveal continuity, hero hierarchy, arrival layout, dossier, stage drag/touch/stress, section navigation/history, scroll review, failure reversal, slow start and background fallback. The background shader suite also passed 11/11 on each route; source integrity validation passed. Tests include reduced motion, no JavaScript, disabled engine, pointer and keyboard input. The stage stress sample observed one renderer and no extra draws during its idle sample; it is not a physical-device performance measurement.

The independent agent service failed to create parallel sessions; no council review was conducted. The visual audit and premortem were performed directly. Playwright was used from the supplied `repos.md` list. References: [web.dev motion accessibility](https://web.dev/learn/accessibility/motion), [W3C content on hover or focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html).
