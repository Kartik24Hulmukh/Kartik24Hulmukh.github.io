# Distributed character-stage release validation

## Scope

November 1, 2026. Maintained `docs/` and generated root mirror. Existing identity, illustrated portrait, seven projects, source links, evidence boundaries, original attachment stylesheet and legacy rollback script are preserved. No new achievement, visitor, conversion or traction claim is made.

## Shipped changes

- Front Man is the baseline artwork; interaction reveals Kartik's existing illustration. Escape also dismisses a hover-only reveal without immediately reopening it.
- Real full-body Pink Soldier in Work and Unknown in Process. Their native draw calls each contain 48,816 indices / 16,272 triangles. No new model conversion was necessary; source-manifest counts match the preserved geometry.
- Lightweight poster SVGs embed fresh renders of the actual meshes, with correct aspect ratios and no external image dependencies. Source FBX/Blend/large PBR maps are not published.
- One shared renderer, lazy geometry, bounded scroll/hover/manual turns, static reduced-motion turns, stale-load guards, actual context-loss fallback/restoration, and no unchanged idle render loop.
- Native scroll, readable normal-flow manifesto, one reserved header band, no corrective focus scrolling. Atomic accordion enhancement eliminates the slow-script visible-but-inert race. Progress tracks changes in document height.
- Renderer-creation failure evicts the incomplete mesh so Retry works; failed and paused statuses are truthful. Work-stage caption/action colors are scoped for the light surface.

## Automated evidence

A clean frozen-revision rerun passed **66/66 behavioral assertions**, **4/4 renderer-init recovery scenarios**, and **8/8 lifecycle/stress checks** across both routes. Source hashes matched before/after the run. An initial fixed-delay wheel assertion was timing-sensitive under concurrent software rendering; the harness now waits for settled positioning and actual native scroll movement, and the full serial rerun passed without changing website code.

- Both entry routes exercised with ordinary, 1.3/2/5-second delayed and permanently failed motion-engine requests; visible content is not inert and disclosure ARIA agrees with state.
- Transient WebGL denial followed by Retry succeeds; permanent denial retains posters and a truthful retry state. Four recovery scenarios pass across root/docs. Reduced-motion retry paints once and adds zero idle frames.
- Forty rapid section jumps per route retain one renderer, three model fetches and three cached meshes. Actual `WEBGL_lose_context` loss shows the poster state; restoration reuses the renderer and repaints once. Settled idle adds no model renders.
- Twenty-eight additional layout checks pass across 320, 390, 768 and 1440px: four section anchors clear the header; progress matches expanded and collapsed page lengths; physical header content fits the viewport.
- Both repository validators, JavaScript syntax checks and patch whitespace checks pass.

## Visual inspection

Individually inspected hero mask/portrait, Work and Process captures at desktop, 320/390px portrait, and 844x390 landscape. Verified full-body boots and fingertips remain within their artwork viewport at combined pointer/manual turns. Inspected no-JavaScript Front Man poster fallback. Process spacing was tightened following review. Decorative rings may intentionally approach the artwork edge; no essential content is cropped to fit.

## Reproduce

Serve the repository root, e.g. `python3 -m http.server 8771`. Install Playwright/Chromium in your test environment, then run:

```sh
python3 scripts/build_bootstrap.py
python3 scripts/validate.py
python3 scripts/validate_motion.py
CHROMIUM_PATH=/path/to/chromium QA_URL=http://127.0.0.1:8771 node scripts/test_stages.cjs
CHROMIUM_PATH=/path/to/chromium QA_URL=http://127.0.0.1:8771 node scripts/test_stage_retry.cjs
```

## Evidence limits and rights

Tests used headless Chromium and software WebGL, not physical iOS/Android, real Safari, real GPU FPS/memory or a screen-reader certification. Actual BFCache navigation, audible playback and production traffic improvement are not certified by these checks. First-paint correctness is supported by default markup/CSS and no-JavaScript inspection, not an earliest-paint filmstrip benchmark. Artwork remains restricted by @jaeysart's personal/non-commercial-use notice; obtain broader rights or replace it before commercial use.

## Subsequent background/interaction release

The mask-first/full-body behavior above remains. The supplied reference contour shader and bounded interaction polish were restored afterward; the background now intentionally owns a separate lightweight WebGL context while character rendering still uses one shared Three.js renderer. See BACKGROUND_VALIDATION.md for the newer clean 101-check acceptance run and actual pixel-proof fallback validation. Earlier stage-only counts are historical, not a claim that the background has no context.
