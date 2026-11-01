# Reference background and responsive motion release

## Requested direction

Use the contour background from the supplied `Kartik Hulmukh — Portfolio.html`, with restrained Squid Game-inspired pink/teal accents, while preserving the current portfolio, source-linked claims, mask-first portrait reveal and full-body characters.

Reference SHA-256: `af7601c884833967b2c55cdb5de9c873cd98a2a815cea902a152eab50521dc54`. The reference contains a fragment-shader field built from five-octave domain-warped noise, contour lines, pointer lens, scroll fade and evidence-density input. It is not merely a radial gradient. This release adapts that supplied shader, repairs undefined reversed-edge smoothstep calls, and uses pink/teal rather than orange. No rights to unrelated franchise assets are asserted.

## Implementation

- `atmosphere.js/css`: one lightweight background WebGL context, distinct from the single shared Three.js character renderer. At most 24 background draws/second during finite interaction bursts, not an infinite ambient RAF. Fine-pointer backing area is capped at 450k pixels/1000px long edge; coarse/save-data at 180k/700px. These are resource ceilings, not device-FPS guarantees.
- Stops background animation when paused, hidden or fully covered by the paper Work section. Reduced motion keeps a static scene. Context loss, no WebGL and no JavaScript retain an actual shader-derived embedded-WebP poster.
- `interaction-polish.js/css`: readable scroll-linked word emphasis, signed/decaying marquee skew bounded to ±3°, and artwork-only hero depth. Text is never gated behind a scroll position; the portrait button does not move.
- `motion-engine.js`: footer hover lighting replaces moving magnetic hit targets; peek previews clear on scroll/blur. Variable-width name hover no longer shifts neighboring letters.
- `hero3d.js`: existing reveal, Escape latch, keyboard/touch and real full-body turns remain. Motion-off/hidden/pointer-capability changes reset transient hero depth.
- Existing original attachment CSS/JS, all seven project entries, evidence boundaries, model geometry, attribution and crawler routes are preserved.

## Visual and contrast inspection

Individually inspected desktop 1440px and mobile 390/320px hero, portrait, manifesto, Work and Process captures, plus no-JavaScript and reduced-motion scenes. Static caption wrapping was tightened. Background brightness is bounded; selected normal-text contrast pairs verify 4.69:1 (dark labels), 5.72:1 (body), 5.96:1 (pink accent on protected ink backing), 6.16:1 (Work action/paper) and 11.43:1 (Work caption/paper). This is not a complete WCAG certification.

## Validation

A clean serial run passed **101/101 checks**: 46 integrated interaction/layout/rendered-stage checks, 11 root shader checks, 11 docs shader checks, 18 polish checks, 10 fallback checks, 4 keyboard checks, and one whole-source integrity check. Source manifests were byte-identical before and after testing. A separate adversarial compositing test also passed: forced background WebGL loss and the no-JavaScript poster produced pixel-identical 1200×900 images (zero RGB difference), both individually inspected. No opaque-black fallback was present.

The tests verified changed background RGB pixels and pointer/scroll uniforms, actual model draw/angle response, directional marquee transforms, reading-emphasis progression, stationary hover targets/focus, native wheel/touch scrolling, pause/reduced-motion behavior, context loss/recovery, hidden/paper-cover shutdown, finite-burst idle, and unchanged source. Initial concurrent software-renderer timing samples were retained separately and replaced by a full event-synchronized serial run, not counted as passes.

Tests distinguish real pixel/transform/uniform response from state flags alone. Timing-sensitive native-wheel probes wait for event completion rather than treating an arbitrary 500ms scheduling sample as proof of scroll hijacking. No native wheel/touch prevention or replacement smooth-scroll library is introduced.

## Reproduce and limits

Serve repository root on port 8771. With Playwright and Chromium installed, run the existing stage tests plus `scripts/test_background.cjs`, `scripts/test_interaction_polish.cjs` and `scripts/test_background_fallback.cjs`. Set `CHROMIUM_PATH`, `QA_URL`, `QA_OUT` as needed. Run the background script once for each root/docs URL. These checks use headless Chromium/software WebGL, not physical iOS/Android/Safari, real GPU FPS/memory or production traffic/conversion evidence. Actual BFCache navigation remains unverified. Supplied character artwork retains @jaeysart's personal/non-commercial-use restrictions.
