# Validation record — 27 October 2026

The refined site preserves the supplied portfolio's ink/paper/orange identity rather than replacing it with a different design. Scope: website and profile presentation, not certification of the underlying projects.

## Checks completed

- Chromium at 320, 390, 768 and 1440 CSS pixels: no horizontal layout overflow, out-of-viewport navigation controls or page-script exceptions.
- axe-core 4.10.3 WCAG 2 A/AA and WCAG 2.1 A/AA tagged rules: zero reported violations, with all project disclosures collapsed and expanded. This is not a complete accessibility certification.
- Native project disclosures open and close; collapsed descendants are not keyboard-exposed. Content remains readable with JavaScript or WebGL disabled.
- Clipboard-denied feedback is accurate; it does not claim copying succeeded when both copy methods fail.
- Motion can be paused; reduced-motion/coarse-pointer/narrow-view contexts receive a static contour field. Sources remain visible without a special mode or single-letter shortcut.
- Original fonts are locally embedded as optimized licensed instances/subsets. No browser font CDN, tracker, API token or model service is required.
- Three independent review passes covered design-preserving changes, interaction implementation and publication premortem. The public source excludes confidential-client material; exclusion rules themselves are kept in private publishing QA rather than public files.
- Profile source validation passed in GitHub Actions. The dedicated root site's asset-generation job and branch-based Pages deployment completed successfully, including generated GIF and social PNG.

## Important limitations

No adoption, revenue, conversion, performance percentile or Lighthouse score is claimed. Project tests were not executed here. Public repository evidence is maintainer evidence, not independent production certification. The `.me` domain is not configured: its exact owned name and DNS provider are still needed. Scheduled future runs depend on repository policy and platform scheduling; initial successful publication does not guarantee future availability.
