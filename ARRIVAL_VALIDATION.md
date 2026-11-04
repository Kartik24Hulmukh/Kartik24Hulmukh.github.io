# Arrival layout and interaction pass

## Intent

The portfolio keeps the existing contour field, character studies, honest project evidence and native scrolling. On a 390 × 844 viewport the mask's reveal prompt was partly below the first screen; on a 1440 × 900 viewport the sound and motion controls began below it. This pass removes a duplicated metadata line on small screens, tightens the first-screen layout, and modestly reduces the character frame at large desktop sizes. The work CTA, mask, reveal prompt and motion controls remain normal, reachable page content; nothing is gated behind a game.

The iris transition has been shortened from 620 ms to 460 ms for quicker acknowledgement, while retaining reversible hover, pinning, touch, keyboard controls and immediate reduced-motion and motion-off states. On short displays content may still require scrolling. The Front Man remains the default; a user gesture reveals the illustrated portrait.

## Research and premortem

- Expressive motion should guide rather than obscure the content, and respect reduced-motion preferences: https://design.intuit.com/quickbooks/brand/design-foundations/motion
- The smaller character should not make the interaction hard to use: the button remains the entire frame, with a visible prompt and keyboard focus.
- A less prominent mobile metadata line must not remove the identity: the same portfolio and location text is retained in the player line, alongside the name, description and work link.
- Rapid reveal reversals and scroll must not strand a visitor: existing regression tests exercise reversal, native scroll, touch and fallback states. `scripts/test_arrival_layout.cjs` checks both published routes and multiple viewports.
- Automated Chromium and touch emulation cannot prove physical iOS/Android behavior, user conversion, awards or usability outcomes. Parallel-agent calls failed and no independent council review is claimed.
- The character artwork is licensed for non-commercial use only; see `docs/models/README.md`. There is no franchise endorsement.
