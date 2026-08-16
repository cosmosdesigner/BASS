# D7 Inference Preview Regression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a D7 Creator preview parity regression proving an Inference-only evidence set is preview-ready.

**Architecture:** Reuse the behavior suite's `invoke` helper, which compares emitted TypeScript with shipped JavaScript, for a Feature request containing only `Inference` evidence. Update the focused D7 report to record this verified eligible-evidence case.

**Tech Stack:** Node.js built-in assertions, TypeScript/JavaScript parity behavior test, Markdown report.

## Global Constraints

- Do not modify Creator production code or persistence code.
- Keep the regression under the existing TypeScript/JavaScript parity helper.
- Do not use MCP, ADO, or host installation.

---

### Task 1: Add Inference Preview Parity Regression and Report Evidence

**Files:**
- Modify: `BASS/integration/opencode/plugins/bass-creator-preview.behavior-test.mjs`
- Modify: `BASS/reports/task-2-d7-creator-persistence.md`

**Interfaces:**
- Consumes: `invoke(args)`, which runs committed JavaScript and TypeScript-emitted Creator previews and asserts deep output parity.
- Produces: an Inference-only Feature preview regression covering status, rendered classification, source classification, and local ADO preview.

- [ ] **Step 1: Add the behavior assertion.**

```js
const inference = await invoke({ projectName: "project", artifactType: "feature", title: "Inferred workflow", evidence: [evidence("Inference")] })
assert.equal(inference.writeStatus, "ready_for_approval")
assert.match(inference.artifactMarkdown, /classification: Inference/)
assert.match(inference.artifactMarkdown, /\| Inference \| local_file \|/)
assert.equal(inference.adoPreview.type, "Feature")
```

- [ ] **Step 2: Run the Creator behavior suite.**

Run: `node BASS/integration/opencode/plugins/bass-creator-preview.behavior-test.mjs`

Expected: `bass-creator-preview behavioral contract passed`.

- [ ] **Step 3: Update the D7 report.**

Add that an Inference-only evidence set is eligible for a ready Feature preview, retains `Inference` provenance in rendered evidence, and includes a local-only Feature ADO preview under TS/JS parity coverage.
