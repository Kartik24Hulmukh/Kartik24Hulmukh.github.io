# Interaction reliability and character checkpoints

Review date: 2026-11-02 (Asia/Kolkata). Baseline: `d8429fcc10f8c079c894e3a9c294e5d02896edc6`.

## Delivered changes

- Preserved the reference contour-field background and its pink/teal treatment.
- Kept Front Man as the initial identity. Hover/focus or tap reveals the existing illustrated portrait; pin instructions now match the persistent state. Transient hover clears on visibility loss and when native scrolling moves the target away. Simulated persisted-page restoration resets to the mask.
- Added a full-body Pink Soldier at Contact, in addition to the Work and Process characters. Desktop placement supports the headline; mobile contact actions come before the character. All three full-body scenes share one renderer and reuse cached geometry.
- Replaced the small turn/reset toggle with explicit 90-degree inspection: front, side, back, other side, front. The actual mesh rotates, including when reduced motion is requested and the visitor explicitly activates it. Static posters do not pretend to show unseen model angles.
- Fixed the CSS conflict that hid both mask and portrait in the no-JavaScript hover/focus fallback.
- Measured and edge-flipped receipt previews before display; removed their stale-position fly-in and rotation clipping. Escape, Tab, resize, scroll and blur dismiss previews.
- Made process emphasis derive from current visible geometry, so reverse scrolling is deterministic. Removed redundant marquee transform easing and kept letter-hover hit areas stationary.
- Allowed vertical touch panning and pinch zoom over character surfaces.
- Added content-hashed local CSS/JS URLs and build-time digest validation, so returning browsers request the matching effect scripts and styles for each release.
- Reused the bundled condensed display font for the hero. Reproduced and fixed a no-JavaScript/external-font-blocked surname overlap; no new dependency or font download source was introduced.

## Review method

Three parallel tracks covered interaction/accessibility, visual hierarchy, and scroll/hover implementation, followed by cross-review and a serial integrated run. Initial failures were investigated rather than counted as passes. In particular, the older reduced-motion assertion counted the static contour shader as automatic character rendering; it now scopes its assertion to character geometry. Background lifecycle is checked separately.

The maintained implementation is in `docs/`. The root HTML is generated with `scripts/build_bootstrap.py`; both routes use the same JavaScript/CSS, not independently edited copies. Original attachment CSS/JS, seven project records, source links and claim boundaries are preserved.

## Reproduction

Serve the repository root on port 8771. Install Playwright/Chromium in the test environment and set `CHROMIUM_PATH` to its executable. Run the following serially to avoid concurrent software-WebGL contention:

```sh
python3 scripts/validate.py
python3 scripts/validate_motion.py
node scripts/test_stages.cjs
node scripts/test_interaction_polish.cjs
node scripts/test_background.cjs
node scripts/test_background_fallback.cjs
node scripts/test_scroll_review.cjs
node scripts/test_character_review.cjs
node scripts/test_fallback_hover.cjs
node scripts/test_stage_retry.cjs
```

`QA_URL` selects the preview origin; `QA_OUT` selects evidence directories for most suites. The retry suite uses `QA_RETRY_OUT`.

## Result and boundaries

Serial acceptance: **145/145 checks passed** (with runtime files unchanged throughout the run). The content-versioned HTML packaging is subjected to the same serial suites before publication.

| Suite | Passed / total |
| --- | --- |
| Integrated root/docs stages and disclosures | 70 / 70 |
| Rendered portrait depth, word emphasis and marquee response | 18 / 18 |
| Background pixels, lifecycle and reduced-motion fallback | 11 / 11 |
| Background failure/context restoration | 10 / 10 |
| Scroll/hover council regression | 18 / 18 |
| Model rotation, reveal restoration and touch council regression | 8 / 8 |
| No-JS portrait and external-font-blocked layout | 6 / 6 |
| Character renderer failure and retry | 4 / 4 |

All 21 final PNGs were individually visually inspected; no blocking overlaps, clipped labels or missing full-body geometry were found. The responsive run reported no horizontal overflow or uncaught page exceptions at all four widths. The 4× CPU-throttled fallback scenario retained keyboard accordion control and native scrolling after sixteen section changes (final wheel moved the document 400px). Responsive screenshots additionally cover 1440, 768, 390 and 320 CSS pixels. A separate 4× CPU-throttled fallback scenario exercises keyboard project expansion, repeated section changes and native wheel scrolling.

These are local Chromium/headless software-WebGL and touch-emulation checks, not physical iOS/Android/Safari testing, a real-device FPS or Core Web Vitals guarantee, a complete WCAG audit, or evidence of increased traffic/conversion. Visibility and persisted-page events are synthetic; actual BFCache eligibility is not certified. Pinch permission is checked in CSS, not on a physical device. The existing portrait is an illustration, not a newly supplied photograph.

The supplied @jaeysart character artwork retains its personal/non-commercial restriction. No new commercial rights or franchise endorsement are claimed. See `docs/models/README.md` and `docs/models/source-manifest.json`.

## Platform references

- [MDN: touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) — vertical browser panning and pinch zoom must remain available.
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — nonessential motion must respect the visitor's preference.
