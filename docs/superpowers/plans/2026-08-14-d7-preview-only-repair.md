# D7 Preview-Only Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the D7 Creator preview validation and proposal ID behavior without changing persistence or invoking ADO/MCP.

**Architecture:** The preview tool validates all evidence against the D3 source-type allowlist and requires at least one Fact or Inference before it renders an artifact or generates an ID, hash, or ADO preview. Proposal ID allocation scans canonical proposal records independently of feature and user-story records. The committed JavaScript remains behaviorally identical to the TypeScript source and the behavior suite verifies both.

**Tech Stack:** TypeScript, committed CommonJS JavaScript, Node.js built-in test utilities.

## Global Constraints

- Change only the Creator preview subset; do not modify persistence code.
- D7 never creates, updates, or otherwise mutates ADO resources.
- Do not install runtime files in the workspace host `.opencode/`.
- Do not use MCP, ADO, or host installation.
- Evidence types are limited to `local_file`, `ado_wiki`, `ado_work_item`, `ado_comment`, `ado_pull_request`, and `ado_pipeline`.
- An evidence set without at least one `Fact` or `Inference` is blocked before preview rendering, ID/hash issuance, or ADO preview creation.

---

### Task 1: Repair Creator Preview Validation and Proposal Rendering

**Files:**
- Modify: `BASS/integration/opencode/plugins/bass-creator-preview.ts`
- Modify: `BASS/integration/opencode/plugins/bass-creator-preview.js`

**Interfaces:**
- Consumes: `{ projectName, artifactType, title, evidence, targetId?, promoteTo? }`.
- Produces: the existing preview result, with blocked requests returning an empty `previewId` and no `integrityHash` or `adoPreview`.

- [ ] **Step 1: Add failing behavior assertions for unsupported evidence types and evidence sets without a Fact or Inference.**

```js
assert.equal((await invoke({
  projectName: "project", artifactType: "feature", title: "Questions only",
  evidence: [evidence("Question")]
})).previewId, "")
```

- [ ] **Step 2: Run the behavior suite and verify the assertions fail against the current preview implementation.**

Run: `node BASS/integration/opencode/plugins/bass-creator-preview.behavior-test.mjs`

Expected: FAIL because question-only evidence currently receives a ready preview.

- [ ] **Step 3: Add a six-value D3 evidence-type set and a Fact/Inference eligibility check before `render`, `id`, `digest`, and ADO-preview construction.**

```ts
const evidenceTypes = new Set(["local_file", "ado_wiki", "ado_work_item", "ado_comment", "ado_pull_request", "ado_pipeline"])
const grounded = evidence.some((e) => e.classification === "Fact" || e.classification === "Inference")
if (!grounded) return blocked("Evidence requires at least one Fact or Inference.")
```

- [ ] **Step 4: Scan `BASS/proposals/PRO-*/proposal.md` for `PRO-###` IDs and use those IDs exclusively for proposal allocation. Add `## Next Step` to proposal markdown.**

```ts
const proposals = join(project, "proposals")
for (const name of readdirSync(proposals)) {
  const proposal = join(proposals, name, "proposal.md")
  if (file(root, proposal)) ids.push(Number(field(readFileSync(proposal, "utf8"), "id").match(/^PRO-(\d+)$/)?.[1] || 0))
}
```

- [ ] **Step 5: Mirror the TypeScript source exactly in the committed JavaScript.**

- [ ] **Step 6: Run the behavior suite and verify it passes.**

Run: `node BASS/integration/opencode/plugins/bass-creator-preview.behavior-test.mjs`

Expected: PASS with TypeScript-emitted and committed JavaScript outputs equal for every invocation.

### Task 2: Extend Preview Parity Coverage and Report the D7 Subset

**Files:**
- Modify: `BASS/integration/opencode/plugins/bass-creator-preview.behavior-test.mjs`
- Create: `BASS/reports/task-2-d7-creator-persistence.md`

**Interfaces:**
- Consumes: shipped JavaScript and TypeScript source compiled during the test.
- Produces: parity coverage for all D7 repair cases and an accurate D7-specific verification report.

- [ ] **Step 1: Add canonical `PRO-009` and `PRO-014` fixtures under the temporary project and assert a new proposal receives `PRO-015`.**

```js
write(join(project, "proposals", "PRO-014-existing", "proposal.md"), "---\nid: PRO-014\n---\n")
assert.match(proposal.artifactMarkdown, /^id: PRO-015$/m)
```

- [ ] **Step 2: Assert all permitted D3 evidence types are accepted, unsupported types are blocked, and question-only and assumption-only inputs have no preview ID, hash, or ADO preview.**

```js
for (const type of allowedTypes) assert.equal((await invoke({ ...base, evidence: [{ ...evidence(), type }] })).writeStatus, "ready_for_approval")
for (const classification of ["Question", "Assumption"]) {
  const result = await invoke({ ...base, evidence: [evidence(classification)] })
  assert.equal(result.previewId, "")
  assert.equal(result.integrityHash, undefined)
  assert.equal(result.adoPreview, undefined)
}
```

- [ ] **Step 3: Assert proposal previews contain `## Next Step` and retain the existing promotion-only ADO-preview behavior.**

```js
assert.match(proposal.artifactMarkdown, /## Next Step/)
assert.equal(localProposal.adoPreview, undefined)
```

- [ ] **Step 4: Write `BASS/reports/task-2-d7-creator-persistence.md` describing only the verified preview subset, the non-persistence boundary, test command, and no-ADO/MCP guarantee. Do not modify the D6 report.**

- [ ] **Step 5: Run the behavior suite and scan the changed preview files for prohibited remote operations.**

Run: `node BASS/integration/opencode/plugins/bass-creator-preview.behavior-test.mjs`

Expected: PASS.

Run: `rg -n "MCP|ADO.*(create|update|write)|fetch\(" BASS/integration/opencode/plugins/bass-creator-preview.ts BASS/integration/opencode/plugins/bass-creator-preview.js`

Expected: no network or remote-write invocation.
