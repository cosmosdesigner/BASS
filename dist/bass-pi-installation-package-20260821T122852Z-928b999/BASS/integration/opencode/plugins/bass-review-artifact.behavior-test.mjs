import { strict as assert } from "node:assert"
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { tmpdir } from "node:os"
import { execSync } from "node:child_process"

const root = mkdtempSync(join(tmpdir(), "bass-d8-review-"))
const write = (path, text) => { mkdirSync(join(path, ".."), { recursive: true }); writeFileSync(path, text) }
const load = async (file, name) => (await import(`${file.href}?${Math.random()}`))[name]
const localTsc = () => {
  const executable = execSync(process.platform === "win32" ? "where tsc" : "command -v tsc", { encoding: "utf8" }).trim().split(/\r?\n/)[0]
  const candidate = join(dirname(executable), "node_modules", "typescript", "bin", "tsc")
  return existsSync(candidate) ? realpathSync(candidate) : realpathSync(executable)
}

try {
  const host = join(root, "host"), project = join(host, "BASS", "projects", "project")
  const artifact = join(project, "features", "F-001-safe", "feature.md")
  write(artifact, "---\nid: F-001\ntitle: Safe registration\nversion: v1.0\nupdated_date: 2026-08-01\nderived_from: null\nsupersedes: null\n---\n# Feature\n\n## Goal\n\nSupport registration.\n\n## Scope\n\n- Register an account.\n\n## Dependencies\n\n- None identified.\n\n## Risks\n\n- None identified.\n\n## Questions\n\n- None.\n\n## Cited Evidence\n\n| Classification | Source | Location | Claim |\n| --- | --- | --- | --- |\n| Fact | source.md | Scope | Registration is needed. |\n\n## Given/When/Then Acceptance Criteria\n\n- Given a new user\n- When they register\n- Then an account is created\n\n## Changelog\n\n| Date | Version | Change | Reason | Related records |\n| --- | --- | --- | --- | --- |\n| 2026-08-01 | v1.0 | Initial record. | Baseline. | F-001 |\n")
  const review = await load(new URL("./bass-review-artifact.js", import.meta.url), "reviewArtifact")
  const improve = await load(new URL("./bass-improve-artifact.js", import.meta.url), "improveArtifact")
  const plugin = await load(new URL("./bass-review-artifact.js", import.meta.url), "BassReviewArtifactPlugin")
  assert.ok((await plugin({})).tool.bass_review_artifact)
  const improvePlugin = await load(new URL("./bass-improve-artifact.js", import.meta.url), "BassImproveArtifactPlugin")
  assert.ok((await improvePlugin({})).tool.bass_improve_artifact)
  const persistPlugin = await load(new URL("./bass-persist-approved-improvement.js", import.meta.url), "BassPersistApprovedImprovementPlugin")
  assert.ok((await persistPlugin({})).tool.bass_persist_approved_improvement)
  const report = review({ directory: host, projectName: "project", artifactPath: "features/F-001-safe/feature.md" })
  assert.equal(report.status, "pass")
  assert.equal(report.findings.length, 0)
  // Containment must finish before content is read, including paths which resolve inside only after normalization.
  for (const artifactPath of ["../project/features/F-001-safe/feature.md", "features/../features/F-001-safe/feature.md"]) {
    assert.equal(review({ directory: host, projectName: "project", artifactPath }).status, "blocked", artifactPath)
  }
  const outside = join(root, "outside"); write(join(outside, "feature.md"), readFileSync(artifact, "utf8"))
  symlinkSync(outside, join(project, "features", "F-001-safe", "linked"), "junction")
  assert.equal(review({ directory: host, projectName: "project", artifactPath: "features/F-001-safe/linked/feature.md" }).status, "blocked")
  const blockedPath = join(project, "features", "F-002-blocked", "feature.md")
  write(blockedPath, readFileSync(artifact, "utf8").replace("id: F-001", "id: F-002").replace("## Risks\n\n- None identified.", "## Risks\n\n- None identified.").replace("## Cited Evidence", "## Cited Evidence").replace("## Given/When/Then Acceptance Criteria\n\n- Given a new user\n- When they register\n- Then an account is created", "## Given/When/Then Acceptance Criteria\n\n- None."))
  const blocked = review({ directory: host, projectName: "project", artifactPath: "features/F-002-blocked/feature.md" })
  assert.equal(blocked.status, "blocked")
  assert.equal(blocked.findings[0].check, "testability")
  const finding = blocked.findings[0]
  assert.match(finding.id, /^REV-[a-f0-9]{16}$/)
  assert.match(finding.fingerprint, /^[a-f0-9]{64}$/)
  assert.match(finding.location, /^features\/F-002-blocked\/feature\.md:\d+$/)
  assert.match(finding.evidence, /## Given\/When\/Then Acceptance Criteria/)
  assert.equal(review({ directory: host, projectName: "project", artifactPath: "features/F-002-blocked/feature.md", waivers: [{ findingId: finding.id, decisionId: "DEC-001", rationale: "caller supplied", residualRisk: "caller supplied" }] }).status, "blocked")
  write(join(project, "decisions", "DEC-001-waiver.md"), `---\nid: DEC-001\nprovenance:\n  classification: Decision\n  sources:\n    - type: local_file\n      reference: source.md\n      location: Scope\n      retrieved_date: 2026-08-14\n  actor: BASS\n  date: 2026-08-14\n  confidence: high\n  source_version: v1.0\n  related_items:\n    - F-002\n---\n# Decision\n\n## Finding ID\n\n${finding.id}\n\n## Check\n\n${finding.check}\n\n## Location\n\n${finding.location}\n\n## Evidence Fingerprint\n\n${finding.fingerprint}\n\n## Rationale\n\nAccepted by accountable owner.\n\n## Residual Risk\n\nRegistration acceptance checks remain manual.\n`)
  write(join(project, "decision-log.md"), "# Decision Log\n\n| ID | Decision | Alternatives | Supporting evidence | Actor | Date | Related items | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n| DEC-001 | Waive testability. | None. | source.md | BASS | 2026-08-14 | F-002 | [DEC-001](decisions/DEC-001-waiver.md) |\n")
  const waived = review({ directory: host, projectName: "project", artifactPath: "features/F-002-blocked/feature.md" })
  assert.notEqual(waived.status, "blocked")
  assert.equal(waived.findings[0].status, "waived")
  assert.equal(waived.findings[0].waiver.decisionId, "DEC-001")
  const reordered = readFileSync(blockedPath, "utf8").replace("## Changelog", "TBD\n\n## Changelog")
  write(blockedPath, reordered)
  const reorderedReport = review({ directory: host, projectName: "project", artifactPath: "features/F-002-blocked/feature.md" })
  assert.equal(reorderedReport.findings.find((item) => item.check === "testability").status, "waived")
  assert.notEqual(reorderedReport.findings.find((item) => item.check === "ambiguity").status, "waived")
  write(blockedPath, readFileSync(artifact, "utf8").replace("id: F-001", "id: F-002").replace("## Given/When/Then Acceptance Criteria\n\n- Given a new user\n- When they register\n- Then an account is created", "## Given/When/Then Acceptance Criteria\n\n- None."))
  const improved = improve({ directory: host, projectName: "project", artifactPath: "features/F-002-blocked/feature.md", reviewReport: blocked, evidence: [{ source: "source.md", location: "Scope", claim: "Then an account is created." }] })
  assert.equal(improved.status, "ready_for_approval")
  assert.equal(improved.reReview.status, "pass")
  assert.match(improved.revisedArtifactMarkdown, /Then an account is created/)
  const source = join(root, "source"); for (const name of ["bass-review-artifact", "bass-improve-artifact", "bass-persist-approved-improvement"]) cpSync(new URL(`./${name}.ts`, import.meta.url), join(source, `${name}.ts`))
  const shim = join(source, "node_modules", "@opencode-ai", "plugin"); write(join(shim, "package.json"), '{"type":"commonjs","main":"index.js"}'); write(join(shim, "index.js"), 'exports.tool=(definition)=>definition; exports.tool.schema={string:()=>({optional:()=>({})}),array:()=>({optional:()=>({})}),object:()=>({optional:()=>({})}),boolean:()=>({optional:()=>({})})};'); write(join(shim, "index.d.ts"), 'export type Plugin = any; export const tool: any;')
  const compiled = join(root, "compiled"); mkdirSync(compiled, { recursive: true })
  execSync(`node "${localTsc()}" --target ES2022 --module NodeNext --moduleResolution NodeNext --skipLibCheck --outDir "${compiled}" "${join(source, "bass-review-artifact.ts")}" "${join(source, "bass-improve-artifact.ts")}" "${join(source, "bass-persist-approved-improvement.ts")}"`, { stdio: "pipe" })
  for (const name of ["bass-review-artifact", "bass-improve-artifact", "bass-persist-approved-improvement"]) { cpSync(new URL(`./${name}.runtime.js`, import.meta.url), join(compiled, `${name}.runtime.js`)); cpSync(new URL(`./${name}.js`, import.meta.url), join(compiled, `${name}.js`)) }
  cpSync(join(source, "node_modules"), join(compiled, "node_modules"), { recursive: true })
  const compiledReview = await load(new URL(`file:///${join(compiled, "bass-review-artifact.js").replace(/\\/g, "/")}`), "reviewArtifact")
  const compiledImprove = await load(new URL(`file:///${join(compiled, "bass-improve-artifact.js").replace(/\\/g, "/")}`), "BassImproveArtifactPlugin")
  const compiledPersist = await load(new URL(`file:///${join(compiled, "bass-persist-approved-improvement.js").replace(/\\/g, "/")}`), "BassPersistApprovedImprovementPlugin")
  assert.deepEqual(compiledReview({ directory: host, projectName: "project", artifactPath: "features/F-001-safe/feature.md" }), report)
  assert.ok((await compiledImprove({})).tool.bass_improve_artifact)
  assert.ok((await compiledPersist({})).tool.bass_persist_approved_improvement)
  console.log("bass review and improve behavioral contract passed")
} finally { rmSync(root, { recursive: true, force: true }) }
