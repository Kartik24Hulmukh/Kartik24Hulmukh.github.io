# Portfolio publishing and maintenance

The site preserves the attached ink/paper/orange design. It is plain HTML/CSS/JS; no framework, API key, tracker, external font request or model service is required by the browser. Archivo and Instrument Serif are embedded under their Open Font Licenses in `licenses/`.

## Locations

- Profile README: `Kartik24Hulmukh/Kartik24Hulmukh`, root `README.md` and `assets/`.
- Canonical portfolio: `Kartik24Hulmukh/Kartik24Hulmukh.github.io`, deployed from `docs/` using Actions to `https://kartik24hulmukh.github.io/`.
- Existing profile-repository Pages route can serve the same source as a compatibility URL. Canonical metadata points to the dedicated root site.

The maintained website source is `docs/`. In the dedicated root repository, `scripts/build_bootstrap.py` mirrors the HTML into a root `index.html` that references the maintained local assets and also copies crawler metadata. This is regenerated whenever the asset-build workflow runs, including after scheduled snapshot updates.

## Workflow

The dedicated user-site repository keeps its working **branch-based Pages** publishing mode. Its `pages.yml` validates source, generates the short play-once GIF/social PNG, regenerates the homepage mirror, commits generated files through the built-in workflow token, and requests the existing Pages build. This path was deployed successfully; switching the Pages configuration is not required.

The profile repository's compatibility site uses its existing **Actions artifact** deployment mode. Its `pages.yml` validates the triggering revision, generates artwork and uploads only `docs/`. The two repositories intentionally have mode-specific Pages workflows; do not overwrite one with the other's workflow blindly.

`activity.yml` runs independently in each maintained repository. It requests metadata only for jittest, Axiom-Grid, AccessDoc and project-xray, updating the marked README region, static HTML snapshot and local JSON. It explicitly invokes the repository's own publication workflow because token-generated commits do not ordinarily trigger a second workflow. The root-site reusable caller grants `contents:write` for generated assets; the profile-site caller needs only source-read plus Pages/id-token permissions.

Push dates are freshness—not adoption. API-fetch failure occurs before source writes; a subsequent validation failure prevents committing/publishing the local changes. Protected-branch rules may require PR-based updates instead of bot pushes. The canonical site is the dedicated root repository; keep its authored content and profile compatibility copy aligned when making editorial changes.

## Local checks

```sh
python3 scripts/validate.py
node --check docs/app.js
python3 -m http.server 8000 --directory docs
```

Test desktop, 390px and 320px; native disclosures; keyboard-only navigation; paused/reduced motion; clipboard-denied; no JavaScript; no WebGL. `scripts/render_assets.py` requires Pillow only at build time. Source graphics are original; no product screenshot or executed result is implied.

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
