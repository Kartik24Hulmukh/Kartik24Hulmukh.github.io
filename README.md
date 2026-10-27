<picture>
  <source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="./assets/hero-dark.svg">
  <source media="(prefers-reduced-motion: reduce)" srcset="./assets/hero-light.svg">
  <img src="https://kartik24hulmukh.github.io/assets/hero-motion.gif" alt="Kartik Hulmukh — software that shows its work. Verification tools, local-first systems, source-linked engineering." width="100%">
</picture>

## Software that shows its work.

I’m Kartik Hulmukh, a Computer Engineering student in Mumbai. I build tools that make the important parts visible: what ran, what changed, and where a human should decide.

My current focus is **verification infrastructure for AI-written work**, **human-gated desktop agents**, and **source-linked systems**. The common thread: useful software with a way to inspect its results.

[**Explore the portfolio ↗**](https://kartik24hulmukh.github.io/) &nbsp; · &nbsp; [GitHub](https://github.com/Kartik24Hulmukh) &nbsp; · &nbsp; [LinkedIn](https://www.linkedin.com/in/kartik-hulmukh-74081236a/) &nbsp; · &nbsp; [Email](mailto:kartikhulmukh24@gmail.com)

---

### Selected work

**01 / [jittest](https://github.com/Kartik24Hulmukh/jittest)** — A test is a claim. Run it both ways.

Advisory differential test execution for agent-authored pull requests. Compares base and head revisions and emits Ed25519-signed receipts that can be independently re-verified. Inconclusive evidence stays inconclusive.

`Python` · `CI` · `Ed25519`  
[Inspect the evidence report →](https://github.com/Kartik24Hulmukh/jittest/blob/main/docs/evidence/layer1/REPORT.md)

**02 / [Axiom-Grid](https://github.com/Kartik24Hulmukh/Axiom-Grid)** — An agent that waits for your say-so.

A local-first desktop copilot in development, exploring ghost-typing around **propose → approve → execute → verify**. Document automation and signed action records, with human approval as part of the operating model. **Readiness varies by component; focused-runtime production NO-GO gates remain.**

`Rust` · `Python` · `Tauri`  
[Read the current work and launch boundaries →](https://github.com/Kartik24Hulmukh/Axiom-Grid)

**03 / [AccessDoc](https://github.com/Kartik24Hulmukh/AccessDoc)** — Findings, packaged for inspection.

Turns axe-core output into tamper-evident accessibility evidence: reports, OpenACR, SARIF, VPAT drafts and in-toto attestations. Beta / hardening candidate. Documents what the scan found; **does not claim WCAG conformance**. Sigstore signing is opt-in.

`Python` · `axe-core` · `in-toto`  
[Explore the bundle and verification workflow →](https://github.com/Kartik24Hulmukh/AccessDoc#readme)

**04 / [Project X-Ray](https://github.com/Kartik24Hulmukh/project-xray)** — Keep the source. Keep the human.

Source-linked public-infrastructure claims for human investigation. Supports review; **does not determine corruption**. A controlled synthetic preview, not production authorization. Preview evidence is not a finding about a real person or organization.

`Python` · `PostgreSQL` · `Infrastructure`  
[Read the scope →](https://github.com/Kartik24Hulmukh/project-xray#readme)

---

### The way I work

- **Make it checkable.** Put the command, source, or artifact next to the claim.
- **Publish the boundary.** A signature is not correctness. A clean scan is not conformance. A demo is not deployment.
- **Keep the person in control.** Preserve ambiguity instead of silently choosing for them.

<details>
<summary><b>More on the workbench</b></summary>

- [Simultaneity Index](https://github.com/Kartik24Hulmukh/frontier-oss-ideas) — evidence-linked crowding intelligence for builders and agents.
- [LedgerMatch](https://github.com/Kartik24Hulmukh/Ledgermatch) — review-first reconciliation that keeps ambiguous allocations visible.
- [RGIT Rozgar](https://github.com/Kartik24Hulmukh/unified-experience) — a campus resource platform for people nearby.

</details>

### Repository pulse

<!-- ACTIVITY:START -->
| Repository | Last pushed (UTC) |
| :-- | :-- |
| [jittest](https://github.com/Kartik24Hulmukh/jittest) | 2026-10-25 |
| [project-xray](https://github.com/Kartik24Hulmukh/project-xray) | 2026-10-24 |
| [AccessDoc](https://github.com/Kartik24Hulmukh/AccessDoc) | 2026-10-20 |
| [Axiom-Grid](https://github.com/Kartik24Hulmukh/Axiom-Grid) | 2026-10-13 |

<sub>Public repository metadata checked 2026-10-27. Push dates are not adoption or impact metrics.</sub>
<!-- ACTIVITY:END -->

---

**Have something worth building?** [Let’s make it hold up.](mailto:kartikhulmukh24@gmail.com)
