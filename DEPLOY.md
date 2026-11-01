# Portfolio publishing and maintenance

The site preserves the approved ink/paper/orange composition with an optional geometric atmosphere. It is plain HTML/CSS/JS; no framework, API key, analytics tracker or model service is required. The current page requests fonts from Google Fonts and includes system fallbacks; retained local font/license files are not all referenced by the current page.

## Locations

- Profile README: `Kartik24Hulmukh/Kartik24Hulmukh`, root `README.md` and `assets/`.
- Canonical portfolio: `Kartik24Hulmukh/Kartik24Hulmukh.github.io`, maintained in `docs/` and mirrored at the root for existing branch-based Pages to `https://kartik24hulmukh.github.io/`.
- Existing profile-repository Pages route can serve the same source as a compatibility URL. Canonical metadata points to the dedicated root site.

The maintained website source is `docs/`. In the dedicated root repository, `scripts/build_bootstrap.py` mirrors the HTML into a root `index.html` that references the maintained local assets and also copies crawler metadata. This is regenerated whenever the asset-build workflow runs, including after scheduled snapshot updates. The builder also stamps local CSS/JS URLs with content hashes; run it after changing those assets. Validation rejects stale hash URLs to prevent mixed cached releases.

## Workflow

The dedicated user-site repository keeps its working **branch-based Pages** publishing mode. Its `pages.yml` validates the checked-in source and root mirror, syntax-checks both original and motion-layer JavaScript, and requests the existing Pages build. The root mirror is regenerated locally with `scripts/build_bootstrap.py` before an authored change is committed. This path was deployed successfully; switching the Pages configuration is not required.

The profile repository's compatibility site uses its existing **Actions artifact** deployment mode. Its `pages.yml` validates the triggering revision, generates artwork and uploads only `docs/`. The two repositories intentionally have mode-specific Pages workflows; do not overwrite one with the other's workflow blindly.

`activity.yml` is manual validation only. No cron or automated editorial rewrite is active. The retained `update_activity.py` targets an older page structure and must not be re-enabled without a separate, validated migration. Historical repository push dates are not adoption evidence.

## Local checks

```sh
python3 scripts/validate.py
python3 scripts/validate_motion.py
node --check docs/motion-controller.js
node --check docs/motion-engine.js
node --check docs/experience.js
python3 -m http.server 8000 --directory docs
```

Test desktop, 390px and 320px; project expansion controls; keyboard-only navigation; paused/reduced motion; clipboard-denied; no JavaScript; missing enhancement scripts. `scripts/render_assets.py` requires Pillow only at build time. Source graphics are original; no product screenshot or executed result is implied.

## An owned `.me` domain

Do not guess or buy a domain. Once the exact owned domain and DNS provider are known:

1. Verify the domain for the GitHub owner to reduce takeover risk.
2. Add the custom domain to the dedicated website repository's Pages settings before changing DNS.
3. For an apex domain, use all four current GitHub Pages A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; or a supported ALIAS/ANAME to `kartik24hulmukh.github.io`. `www` uses CNAME to `kartik24hulmukh.github.io`, without a repository path. Review existing records and avoid wildcard DNS.
4. Wait for DNS verification/certificate readiness; enforce HTTPS.
5. Update canonical, Open Graph image/URL, robots/sitemap and the profile's portfolio link to the verified HTTPS domain. Deploy and check apex/www redirects.

Official reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Rollback

Use a normal revert commit or restore the backed-up files through a new commit. Do not force-push shared history. Keep the previous route until the new canonical site is confirmed signed out.

## Optional motion layer (November 2026)

`docs/index.html` loads `motion-controller.js`, `motion-engine.js`, and `experience.js`; it does not load the retained original `attachment.js`. The original attachment stylesheet and JS remain unchanged for baseline integrity and rollback. Enhancements are in `experience.css`.

The game-inspired pink/teal geometry is the authored default. Motion runs unless paused or reduced-motion is requested. Sources are visible and the lead project is open. Compact visible controls replace the settings sheet. Music gets one normal automatic attempt where browser policy permits; otherwise a visible Sound on control remains. Saved mute is respected. Playback stops on tab hide/page exit and never automatically resumes on return. The supplied recording is not claimed to be royalty-free. See AUDIO_SOURCE.md and MOTION_UPGRADE.md for policy and transport limits.

Before publishing, run `python3 scripts/build_bootstrap.py` then both Python validators and syntax checks. Preserve existing CNAME/settings/workflows and unrelated assets. Never deploy local research/profile recovery notes.

## Distributed 3D character stages — November 2026

Front Man is the first-paint hero artwork, independent of JavaScript/WebGL. Hover/focus reveals the retained illustrated Kartik portrait; tap/Enter/Space pins or toggles it. Escape restores the mask, including hover-only interactions. Work has the full-body Pink Soldier; Process has the full-body Unknown character. These are actual supplied meshes, not CSS-only model simulations. One locally bundled Three.js renderer is moved between visible stages; others retain model-rendered posters. There is no character-selector detour in the hero.

Native wheel/touch/keyboard scrolling is retained. The former 230vh sticky manifesto is normal-flow, readable content. Header utilities are inside one reserved header band; no corrective focus-scroll listener runs. Accordion enhancement is atomic: slow or failed engine loading leaves all bodies expanded, non-inert and truthfully labelled. Progress updates when document layout changes.

Only visible eligible geometry is loaded. Three models are cached with bounded angles, capped DPR and no render-on-idle loop. Explicit turns remain static while decorative motion is paused or reduced. Renderer-init failure rolls back the mesh cache so Retry can really recover. Context loss uses posters; restoration reuses the renderer. Hidden/disposed lifecycle guards reject stale async work. Runtime/model payloads remain the existing optimized assets, not the 418MB source archive.

Build: `python3 scripts/build_bootstrap.py`; run both validators and JS syntax checks. Browser regressions are in `scripts/test_stages.cjs` and `scripts/test_stage_retry.cjs`; they require Playwright and Chromium. Set `QA_URL`, `QA_OUT`, and `CHROMIUM_PATH` as needed. Serve the repository root locally so both `/` and `/docs/` can be tested. See `STAGE_VALIDATION.md` for release evidence and limits.

Models are credited to @jaeysart. The archive previews restrict the artwork to personal/non-commercial use. No broader rights or franchise endorsement are asserted; obtain permission or replace these assets before commercial use. Retain `docs/models/README.md`, source manifest and software licenses.

## Restored reference background and responsive interaction polish

`atmosphere.js/css` restore the contour shader from the supplied HTML, with pink/teal light and an exact shader-derived static fallback. It owns one small background WebGL context; `hero3d.js` still owns exactly one shared character renderer. Do not interpret the intentional background context as duplicate model rendering. Background work is capped at 24 draws/sec during finite input bursts; coarse/save-data resolution is lower. Pause, hidden-page, paper-cover and context-loss paths are bounded. No endless ambient field loop is retained.

`interaction-polish.js/css` add readable scroll emphasis, bounded decaying marquee skew, and artwork-only hero depth. Buttons and neighboring name letters stay physically stable. The background poster remains visible without JavaScript/WebGL and under reduced motion. Original project claims and model rights notices are unchanged.

See `BACKGROUND_VALIDATION.md` for the clean 101-check run and pixel-proof fallback comparison. Portable new regressions: `scripts/test_background.cjs`, `scripts/test_interaction_polish.cjs`, `scripts/test_background_fallback.cjs`; set CHROMIUM_PATH, QA_URL and QA_OUT as appropriate. The background test accepts a full page URL, so run it for root and `/docs/` separately (use distinct QA_TAG values). The polish/fallback tests take the root base URL and construct their routes. CI syntax-checks both new runtime files.
