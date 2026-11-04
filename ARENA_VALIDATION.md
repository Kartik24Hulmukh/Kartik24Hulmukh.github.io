# Character-room iteration — design and verification

## Design intent

The portfolio keeps its existing contour background and evidence-led project content. The revised character stages use a restrained pink/green architectural palette, inspired by the series' contrast between pastel spaces and uniforms—not by an implication of endorsement. Front Man is still the initial identity. Hover or keyboard focus opens the complete illustrated portrait; click or tap pins it; Escape restores the mask. An entrance-origin iris is retained, but the previous mouse-following crop is removed so the two faces do not remain composited together.

The full-body Pink Soldier and Unknown stages can be turned directly by dragging or horizontally swiping. The visible 90° button is a keyboard-accessible alternative and turns from the current dragged orientation. Native vertical scrolling and pinch zoom remain available. Nonessential scroll/pointer movement respects the existing motion setting; direct user-requested turning still works when motion is reduced. The renderer retains the existing static previews and retry path.

## Research informing the work

- Production designer Chae Kyoung-sun describes the pastel pink/green sets and contrasting uniforms: https://www.intjournal.com/chae-kyoung-sun
- User-controlled animation and optimization in a 3D web experience: https://www.awwwards.com/case-study-7-year-journey-by-zajno.html
- Motion can cause discomfort; users need a way to disable unnecessary interaction-triggered motion: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions
- Avoid unnecessary layout and paint-heavy animation: https://web.dev/articles/animations-and-performance

## Premortem and constraints

- **Visitors miss the interaction:** the mask's prompt and captions name hover/tap; stage captions advertise drag/swipe and the 90° button. No interaction is required to reach work.
- **Scroll or keyboard becomes trapped:** horizontal drags are distinguished from vertical gestures, vertical native scrolling and pinch zoom remain available, and the turn button does not depend on dragging.
- **Slow GPU, reduced motion, or failed models:** static artwork remains visible and retry remains separate. Motion can be paused; manual turning is opt-in.
- **The theme overshadows the portfolio:** name, specialty, work link, source links and project boundaries remain prominent and no performance or award claim is made.
- **Rights and endorsement:** the supplied @jaeysart character artwork is marked non-commercial only. See `docs/models/README.md`; no commercial clearance or franchise endorsement is claimed.
- **Limits:** automated tests and device emulation are not a substitute for physical iOS/Safari or Android testing, real-user usability studies, performance monitoring, or an award jury. Parallel-agent spawning was attempted but failed; this was not a council review.

## Test record

See the committed `scripts/test_checkpoint.cjs`, `scripts/test_failure_reversal.cjs`, `scripts/test_stage_drag.cjs`, `scripts/test_stage_touch.cjs`, `scripts/test_stage_stress.cjs`, and the existing stage, scrolling, recovery and validation scripts. They exercise both published paths, multiple viewport widths, no-JavaScript fallback, paused motion, pointer and touch gestures, keyboard operation, and model loading/recovery. Browser testing uses Chromium with software WebGL; touch gestures are emulated. The repeated-drag/turn stress check uses 4× CPU throttling and verifies that one renderer is created and stops rendering when idle; it is not a real-device frame-rate benchmark.
