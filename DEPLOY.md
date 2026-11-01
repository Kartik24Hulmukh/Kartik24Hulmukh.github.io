# Portfolio publishing and maintenance

The site preserves the approved ink/paper/orange composition with an optional geometric atmosphere. It is plain HTML/CSS/JS; no framework, API key, analytics tracker or model service is required. The current page requests fonts from Google Fonts and includes system fallbacks; retained local font/license files are not all referenced by the current page.

## Locations

- Profile README: `Kartik24Hulmukh/Kartik24Hulmukh`, root `README.md` and `assets/`.
- Canonical portfolio: `Kartik24Hulmukh/Kartik24Hulmukh.github.io`, maintained in `docs/` and mirrored at the root for existing branch-based Pages to `https://kartik24hulmukh.github.io/`.
- Existing profile-repository Pages route can serve the same source as a compatibility URL. Canonical metadata points to the dedicated root site.

The maintained website source is `docs/`. In the dedicated root repository, `scripts/build_bootstrap.py` mirrors the HTML into a root `index.html` that references the maintained local assets and also copies crawler metadata. This is regenerated whenever the asset-build workflow runs, including after scheduled snapshot updates.

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

The professional visual mode is default. Geometry is optional, motion respects the live system reduced-motion setting, and sound starts only after an explicit click. The opt-in background track is the user-supplied Pink Soldiers recording. Selecting a local audio file is a private preview action; it does not upload or distribute that file. No copied show imagery is included; the supplied recording is not claimed to be royalty-free.

Before publishing, run `python3 scripts/build_bootstrap.py` then both Python validators and syntax checks. Preserve existing CNAME/settings/workflows and unrelated assets. Never deploy local research/profile recovery notes.
