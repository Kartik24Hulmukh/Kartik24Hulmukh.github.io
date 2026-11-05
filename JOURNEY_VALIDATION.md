# Section index — design and verification

> Historical note: the floating index described below was superseded by the in-flow section menus in `WAYPOINT_VALIDATION.md` after a mobile overlap was found.

## Intent

The original header is in the document flow, avoiding a large sticky bar that can obscure content. The page is long, however, and the header disappears when a reader scrolls. The optional section index gives readers direct links to the existing eight sections and indicates the current section. It appears only after the hero and can be hidden until reload. It does not trap scrolling or create a separate route; links use the page's native fragments and browser history. The original header and its mobile menu remain available.

The visual treatment uses the site's existing pink, green and circle/triangle/square language. The index is an aid to reading, not a simulated game or a substitute for the work.

## Risks and mitigations

- **A floating control may cover content:** its closed state is compact, it is absent in the hero, and readers can choose “Hide until reload.” The expanded panel scrolls internally on short screens.
- **Keyboard users could be stranded:** the native disclosure supports keyboard use, Escape returns focus to its summary, and activating a section by keyboard moves focus to that section. Focus has a visible outline.
- **Scroll or motion could feel forced:** scrolling and fragment links are native; no content motion is added. Reduced-motion users get the same static index. W3C notes that interaction-triggered animation can affect users with vestibular sensitivities: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- **Script failure:** the enhancement is initially hidden, so failed or disabled JavaScript leaves the original navigation intact.
- **Limits:** Chromium and emulated touch do not establish real-device usability or conversion. Three requested parallel-agent reviews were attempted but the service failed; this is not a council review. The character artwork remains restricted to non-commercial use; see `docs/models/README.md`.

## Checks

`scripts/test_journey.cjs` checks both site routes at multiple widths, current-section state, touch, keyboard, Escape, dismissal, native scrolling and no-JavaScript behavior. `scripts/test_journey_history.cjs` checks short screens, fragment navigation, back/forward restoration, reload and blocked-script recovery. The Playwright browser automation tool is listed in the supplied `repos.md` and was already installed; no additional dependency was required. Existing interaction and fallback suites are run separately.
