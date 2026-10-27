# Portfolio publishing and maintenance

The site preserves the attached ink/paper/orange design. It is plain HTML/CSS/JS; no framework, API key, tracker, external font request or model service is required by the browser. Archivo and Instrument Serif are embedded under their Open Font Licenses in `licenses/`.

## Locations

- Profile README: `Kartik24Hulmukh/Kartik24Hulmukh`, root `README.md` and `assets/`.
- Canonical portfolio: `Kartik24Hulmukh/Kartik24Hulmukh.github.io`, deployed from `docs/` using Actions to `https://kartik24hulmukh.github.io/`.
- Existing profile-repository Pages route can serve the same source as a compatibility URL. Canonical metadata points to the dedicated root site.

The root repository may also contain a self-contained `index.html` bootstrap so its default user-site branch can display the portfolio before Actions deployment finishes. The maintained website source is `docs/`; regenerate the bootstrap when editing the site if retaining it.

## Workflow

`pages.yml` validates the exact triggering commit, generates the short play-once README GIF and social PNG, selects Actions publishing for an already-existing Pages site, and uploads only `docs/`. The built-in workflow token is scoped to read source, write Pages and request an identity token. It is not a personal credential and is never embedded in site files. If Pages source configuration is rejected by the workspace/repository policy, select Settings → Pages → GitHub Actions as the owner, then rerun deployment. No access policy should be weakened.

`activity.yml` requests metadata only for jittest, Axiom-Grid, AccessDoc and project-xray, updating the README region, static HTML snapshot and local JSON. It explicitly calls deployment because token-generated commits do not ordinarily trigger a second workflow. Repository push dates are freshness, not impact or adoption. API failure preserves the old snapshot. Protected-branch rules may require PR-based snapshot updates instead of bot pushes.

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
