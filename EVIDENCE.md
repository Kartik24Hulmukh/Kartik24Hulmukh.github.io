# Public GitHub evidence notes — 2026-10-27

Scope: independent read-only review of public GitHub metadata, READMEs, selected implementation/tests, readiness ledgers, releases and Actions metadata. No secrets, authentication, repository execution, live client checks or publishing. `original.html` was not read or treated as evidence. Only this requested notes file was authored. Repository statements are maintainer evidence, not independent runtime certification. No adoption, customer, revenue or resume statistics established.

## Recommended short portfolio claims

### jittest
- **Safe copy:** “Differential test execution for agent-authored pull requests, with Ed25519-signed receipts and offline receipt verification.”
- Evidence: README describes base/head test execution and six verdicts; `src/jittest/receipt.py` contains receipt signing/verification implementation. Offline verification authenticates a record; it does not rerun tests or establish full program correctness.
- **Status:** public Apache-2.0 project. GitHub release and independently fetched public PyPI JSON both identify **0.4.1** as the published version. PyPI wheel digest matches the repository release mapping: `d33eaa33cc24d0be2dd9dad5975ca4d3c6e3fb8640f008cea6988e7b6a8b6b95`. Main contains unreleased safeguards; engineering version metadata is not proof of shipment. README identifies the verifier as advisory, not a conventional blocking production merge gate.
- Pitfalls: do not say “proves code correct,” “production merge gate,” “fully sandboxed by default,” or transfer main-only guarantees to the published wheel. Signed confinement metadata is a producer assertion, not independent daemon attestation. Do not repeat historical catch-rate numbers without denominator, refusal count and exact cohort.
- Sources:
  - https://github.com/Kartik24Hulmukh/jittest/blob/39e07bf33d6efed8842a9723c34c665ed4641926/README.md
  - https://github.com/Kartik24Hulmukh/jittest/blob/39e07bf33d6efed8842a9723c34c665ed4641926/src/jittest/receipt.py
  - https://github.com/Kartik24Hulmukh/jittest/blob/39e07bf33d6efed8842a9723c34c665ed4641926/docs/RELEASE-ARTIFACTS.md
  - https://github.com/Kartik24Hulmukh/jittest/blob/39e07bf33d6efed8842a9723c34c665ed4641926/docs/ADVISORY-PREVIEW-ACCEPTANCE.md
  - https://github.com/Kartik24Hulmukh/jittest/releases/tag/v0.4.1
  - https://pypi.org/pypi/jittest/json

### Axiom-Grid
- **Safe copy:** “Document-intelligence and signed-receipt research, including page/line citations, Merkle-chain verification and a focused local Rust preview runtime.”
- Evidence: README describes the document Q&A/receipt surface; `tests/test_merkle_receipts.py` contains Ed25519 receipt fixtures, RFC 6962 Merkle vectors and subprocess external-verifier tests. `axiom-runtime/src/lib.rs` separately contains local model/readiness/preview APIs. Do not imply that the focused preview CI certifies the entire inherited document-intelligence surface.
- **Status:** public MIT repository with a `v1.0.0-launch` non-prerelease GitHub release. However, the repository mixes several product generations and scope-specific status documents. README says “LAUNCH-READY” and advertises broad tests/zero-egress; `docs/axiom/LAUNCH-GATES.md` explicitly retains **production NO-GO for ghost typing**, disables automatic insertion and requires native-platform, distribution and privacy qualification. Older `CLAIMS.md` applies specifically to legal-v3 technical preview, not all current surfaces. Safest status label: **research / technical preview; release exists, production scope unresolved**.
- Pitfalls: avoid “cryptographic proof of zero network egress,” “every action signed,” universal launch-ready/production-ready claims, all-app automation, certified security, and headline test/latency/model-availability numbers. The launch-gates document explicitly says no cryptographic zero-egress claim. A signature proves integrity relative to a key, not absence of all machine networking.
- Sources:
  - https://github.com/Kartik24Hulmukh/Axiom-Grid/blob/aa386b49f19e160491a8e7225cc01b391ae2e522/README.md
  - https://github.com/Kartik24Hulmukh/Axiom-Grid/blob/aa386b49f19e160491a8e7225cc01b391ae2e522/tests/test_merkle_receipts.py
  - https://github.com/Kartik24Hulmukh/Axiom-Grid/blob/aa386b49f19e160491a8e7225cc01b391ae2e522/axiom-runtime/src/lib.rs
  - https://github.com/Kartik24Hulmukh/Axiom-Grid/blob/aa386b49f19e160491a8e7225cc01b391ae2e522/docs/axiom/LAUNCH-GATES.md
  - https://github.com/Kartik24Hulmukh/Axiom-Grid/blob/aa386b49f19e160491a8e7225cc01b391ae2e522/CLAIMS.md
  - https://github.com/Kartik24Hulmukh/Axiom-Grid/releases/tag/v1.0.0-launch

### AccessDoc
- **Safe copy:** “Converts axe-core scan JSON into tamper-evident accessibility evidence bundles, with OpenACR, SARIF and human-review VPAT drafts.”
- Evidence: `app/bundle.py` defines the artifact set, hashes, manifest and bundle validation. README distinguishes mandatory outputs from opt-in SARIF/VPAT/EAA/trend artifacts. `.github/workflows/sign-evidence.yml` implements an opt-in signing path with Sigstore/OIDC and verification steps.
- **Status:** MIT beta/hardening candidate. Main README says **v0.7.0-beta.7**, whereas the latest two GitHub releases returned start with **v0.7.0-beta.5**, marked prerelease. Do not describe beta.7 as an independently verified published release. Production-readiness document restricts the stdlib server to local/constrained single-replica use behind a hardened proxy and lists public-service gates.
- Pitfalls: not WCAG/EAA certification, legal compliance or a complete accessibility audit. Local attestations are **unsigned by default**; signing is workflow opt-in. PDF is explicitly **untagged** and not semantically screen-reader navigable; HTML is the intended accessible artifact. VPAT is a draft. Reproducibility requires a pinned audit date. Do not substitute old “automated detection percentage” claims for current independently verified evidence.
- Sources:
  - https://github.com/Kartik24Hulmukh/AccessDoc/blob/7ab1817c9ef74bcb05abb885308f7ab5e62f32e6/README.md
  - https://github.com/Kartik24Hulmukh/AccessDoc/blob/7ab1817c9ef74bcb05abb885308f7ab5e62f32e6/app/bundle.py
  - https://github.com/Kartik24Hulmukh/AccessDoc/blob/7ab1817c9ef74bcb05abb885308f7ab5e62f32e6/.github/workflows/sign-evidence.yml
  - https://github.com/Kartik24Hulmukh/AccessDoc/blob/7ab1817c9ef74bcb05abb885308f7ab5e62f32e6/docs/PRODUCTION_READINESS.md
  - https://github.com/Kartik24Hulmukh/AccessDoc/releases/tag/v0.7.0-beta.5

### project-xray
- **Safe copy:** “A source-linked public-infrastructure evidence workflow with two-reviewer publication controls and draft RTI exports; demonstrated on synthetic records.”
- Evidence: `app/server.py` includes RTI generation and publication queries counting distinct approving reviewers for the claim version, plus source-publishability checks. README describes dossiers, evidence gaps and correction review.
- **Status:** Apache-2.0, **controlled synthetic technical preview**. GitHub release `v0.4.8-synthetic-preview-rc1` is a prerelease. `ops/production-readiness.yaml` has ten checks: six pending, four partial, none passed. Local rehearsal receipts do not close target-environment gates.
- Pitfalls: not a corruption detector, guilt/legality engine, verified wrongdoing, nationwide production platform, real-case publication approval or established impact. Synthetic label must remain visible. No traction/design-partner claims. Older limitations/version documents exist; use current README plus readiness ledger rather than selecting a larger historic version number.
- Sources:
  - https://github.com/Kartik24Hulmukh/project-xray/blob/700cbe3edeaa20039d71cc5ece7147ad3be969eb/README.md
  - https://github.com/Kartik24Hulmukh/project-xray/blob/700cbe3edeaa20039d71cc5ece7147ad3be969eb/app/server.py
  - https://github.com/Kartik24Hulmukh/project-xray/blob/700cbe3edeaa20039d71cc5ece7147ad3be969eb/ops/production-readiness.yaml
  - https://github.com/Kartik24Hulmukh/project-xray/releases/tag/v0.4.8-synthetic-preview-rc1

## Optional secondary projects

- **frontier-oss-ideas / Simultaneity Index:** “Evidence-linked public-signal crowding research for comparing project ideas.” Current README's 1.6.12 increment calls this research beta and retains production/paid NO-GO. Discussion heat is not verified buyer demand; scores are not novelty, market validation or investment advice. Author calibration labels are not independent expert validation; historical synthetic-success gateway fallback was explicitly invalidated. Sources: https://github.com/Kartik24Hulmukh/frontier-oss-ideas/blob/main/README.md and https://github.com/Kartik24Hulmukh/frontier-oss-ideas/blob/main/docs/PRODUCTION_GATES.md
- **Ledgermatch / LedgerMatch:** “Local bank-deposit/invoice matching with explicit ambiguity handling and deterministic evidence bundles.” README labels it a local technical-evaluation release candidate. No bank integration, accounting API writeback, public hosted service or measured practitioner outcomes established. Review ledger hashes are tamper-evident relative to a head, not immutable when an owner can rewrite both. Sources: https://github.com/Kartik24Hulmukh/Ledgermatch/blob/main/README.md and https://github.com/Kartik24Hulmukh/Ledgermatch/blob/main/CLAIMS_POLICY.md
- **unified-experience:** “Campus resource exchange covering accommodation, resale, academics and local directories.” README and frontend/backend package manifests were inspected. A production-readiness document records unresolved admin-route/moderation E2E blockers; its age was not independently resolved. Do not infer current service health or an institutional client relationship from the README. Omit external deployment/client names and URLs from portfolio copy. Sources: https://github.com/Kartik24Hulmukh/unified-experience/blob/main/README.md and https://github.com/Kartik24Hulmukh/unified-experience/blob/main/docs/PRODUCTION_READINESS.md

## Verification boundary / editorial guidance

- All seven appear as public, non-fork, non-archived, non-disabled repositories in GitHub metadata. This does not establish sole authorship, original invention, production deployment or user traction.
- Observed successful main-branch runs: Axiom focused preview gates (2026-10-04), jittest CodeQL (2026-10-26), AccessDoc production-smoke (2026-10-26). These are specific checks, not whole-repository or production certification. Latest project-xray runs returned were dependency-update workflows, not proof that full CI is green.
- Axiom focused check: https://github.com/Kartik24Hulmukh/Axiom-Grid/actions/runs/37227849081
- jittest CodeQL: https://github.com/Kartik24Hulmukh/jittest/actions/runs/40281453850
- AccessDoc smoke: https://github.com/Kartik24Hulmukh/AccessDoc/actions/runs/40326926195
- Evidence of code/tests existing is not evidence those tests passed here. No dependencies installed or project code executed. No package artifact was executed; jittest registry digests were checked, not wheel/source byte identity independently reproduced.
- Prefer concrete verbs (compares, exports, records, verifies) plus scoped status labels. Avoid superlatives, cryptographic truth/safety claims, test-count marketing, unverifiable savings, clients, usage and revenue.
