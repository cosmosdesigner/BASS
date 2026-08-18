import { strict as assert } from "node:assert"
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

const root = mkdtempSync(join(tmpdir(), "bass-d8-p1-p2-"))
const write = (file, text) => { mkdirSync(join(file, ".."), { recursive: true }); writeFileSync(file, text) }
const registers = (project) => {
  write(join(project, "evidence-register.md"), "# Evidence Register\n\n| ID | Classification | Title | Sources | Confidence | Location | Related items | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n")
  write(join(project, "decision-log.md"), "# Decision Log\n\n| ID | Decision | Alternatives | Supporting evidence | Actor | Date | Related items | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n")
  write(join(project, "action-log.md"), "# Action Log\n\n| ID | Operation | Target | Before/after or result | Supporting evidence | Decision | Actor | Date | Status | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n")
}
const markdown = (id, title = "Safe", version = "v1.0") => `---\nid: ${id}\ntitle: ${title}\nversion: ${version}\nupdated_date: 2026-08-01\nderived_from: null\nsupersedes: null\n---\n# Artifact\n\n## Goal\n\nSafe improvement.\n\n## Scope\n\n- Local persistence.\n\n## Dependencies\n\n- None.\n\n## Risks\n\n- None.\n\n## Cited Evidence\n\n| Classification | Source | Location | Claim |\n| --- | --- | --- | --- |\n| Fact | source.md | scope | Persistence is local. |\n\n## Given/When/Then Acceptance Criteria\n\n- Given approval\n- When persisted\n- Then version advances\n\n## Changelog\n\n| Date | Version | Change | Reason | Related records |\n| --- | --- | --- | --- | --- |\n| 2026-08-01 | v1.0 | Initial. | Baseline. | ${id} |\n`
const itemMarkdown = (id) => id.startsWith("IDEA-") ? `---\nid: ${id}\ntitle: Safe\nversion: v1.0\nprovenance:\n  classification: Proposal\n---\n# Idea\n\n## Problem or Opportunity\n\nA problem.\n\n## Proposal\n\nA proposal.\n\n## Expected Value\n\nValue.\n\n## Scope and Considerations\n\n- Scope.\n\n## Next Step\n\nValidate.\n\n## Related Evidence and Decisions\n\n- EVD-001.\n\n## Changelog\n\n| Date | Version | Change | Reason | Related records |\n| --- | --- | --- | --- | --- |\n| 2026-08-01 | v1.0 | Initial. | Baseline. | ${id} |\n` : id.startsWith("PRO-") ? `---\nid: ${id}\ntitle: Safe\nversion: v1.0\nprovenance:\n  classification: Proposal\n---\n# Functional Proposal\n\n## Problem or Opportunity\n\nA problem.\n\n## Proposed Change\n\nA change.\n\n## Expected Value\n\nValue.\n\n## Scope\n\n- Scope.\n\n## Out of Scope\n\n- None.\n\n## Rules\n\n- Rule.\n\n## Dependencies\n\n- None.\n\n## Risks\n\n- None.\n\n## Assumptions\n\n- None.\n\n## Questions\n\n- None.\n\n## Cited Evidence\n\n| Classification | Source | Location | Claim |\n| --- | --- | --- | --- |\n| Proposal | source.md | scope | A proposal. |\n\n## Next Step\n\nValidate.\n\n## Changelog\n\n| Date | Version | Change | Reason | Related records |\n| --- | --- | --- | --- | --- |\n| 2026-08-01 | v1.0 | Initial. | Baseline. | ${id} |\n` : markdown(id)

try {
  const { reviewArtifact } = await import(`${new URL("./bass-review-artifact.js", import.meta.url).href}?${Math.random()}`)
  const { improveArtifact } = await import(`${new URL("./bass-improve-artifact.js", import.meta.url).href}?${Math.random()}`)
  const { issueImprovementPreview, persistApprovedImprovement } = await import(`${new URL("./bass-persist-approved-improvement.js", import.meta.url).href}?${Math.random()}`)

  const typeHost = join(root, "type-aware"), typeProject = join(typeHost, "BASS", "projects", "project")
  for (const [fixture, relative] of [["idea.md", "ideas/IDEA-901-guided-onboarding/idea.md"], ["proposal.md", "proposals/PRO-901-guided-onboarding/proposal.md"]]) {
    write(join(typeProject, ...relative.split("/")), readFileSync(new URL(`../../../fixtures/d8-review/type-aware/${fixture}`, import.meta.url), "utf8"))
    const report = reviewArtifact({ directory: typeHost, projectName: "project", artifactPath: relative })
    assert.notEqual(report.status, "blocked", `${fixture} should not inherit Feature-only blockers`)
    assert.equal(report.findings.some((item) => ["completeness", "dependencies", "risks", "testability", "provenance"].includes(item.check)), false, `${fixture} type matrix`)
  }
  const proposalPath = join(typeProject, "proposals", "PRO-901-guided-onboarding", "proposal.md")
  write(proposalPath, readFileSync(proposalPath, "utf8").replace("## Proposed Change", "## Change"))
  assert.equal(reviewArtifact({ directory: typeHost, projectName: "project", artifactPath: "proposals/PRO-901-guided-onboarding/proposal.md" }).status, "blocked")

  const host = join(root, "host"), project = join(host, "BASS", "projects", "project")
  const feature = join(project, "features", "F-805-scoped", "feature.md")
  write(feature, markdown("F-805").replace("- Given approval\n- When persisted\n- Then version advances", "- None."))
  const blocked = reviewArtifact({ directory: host, projectName: "project", artifactPath: "features/F-805-scoped/feature.md" })
  const finding = blocked.findings.find((item) => item.check === "testability")
  const decision = join(project, "features", "F-805-scoped", "decisions", "DEC-805-waiver.md")
  const bindings = `# Decision\n\n## Finding ID\n\n${finding.id}\n\n## Check\n\n${finding.check}\n\n## Location\n\n${finding.location}\n\n## Evidence Fingerprint\n\n${finding.fingerprint}\n\n## Rationale\n\nThe feature owner accepts manual validation.\n\n## Residual Risk\n\nAutomated validation remains pending.\n`
  write(decision, `---\nid: DEC-805\nprovenance:\n  classification: Decision\n---\n${bindings}`)
  assert.equal(reviewArtifact({ directory: host, projectName: "project", artifactPath: "features/F-805-scoped/feature.md" }).findings.find((item) => item.id === finding.id).status, "open")
  const d3 = `---\nid: DEC-805\nprovenance:\n  classification: Decision\n  sources:\n    - type: local_file\n      reference: source.md\n      location: Lines 1-1\n      retrieved_date: 2026-08-14\n  actor: BASS\n  date: 2026-08-14\n  confidence: high\n  source_version: v1.0\n  related_items:\n    - F-805\n---\n`
  write(decision, `${d3}${bindings}`)
  assert.equal(reviewArtifact({ directory: host, projectName: "project", artifactPath: "features/F-805-scoped/feature.md" }).findings.find((item) => item.id === finding.id).status, "open")
  write(join(project, "decision-log.md"), `# Decision Log\n\n| ID | Decision | Alternatives | Supporting evidence | Actor | Date | Related items | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n| DEC-805 | Waive testability. | None. | source.md | BASS | 2026-08-14 | F-805 | [DEC-805](features/F-805-scoped/decisions/DEC-805-waiver.md) |\n`)
  assert.equal(reviewArtifact({ directory: host, projectName: "project", artifactPath: "features/F-805-scoped/feature.md" }).findings.find((item) => item.id === finding.id).status, "waived")
  const validLog = readFileSync(join(project, "decision-log.md"), "utf8")
  for (const invalidLog of [
    validLog.replace("# Decision Log", "# Decisions"),
    validLog.replace("| ID | Decision | Alternatives | Supporting evidence | Actor | Date | Related items | Record |", "| Decision | ID | Record |"),
    `# Decision Log\n\nDecision DEC-805 is linked as [DEC-805](features/F-805-scoped/decisions/DEC-805-waiver.md).\n\n| Note | Value |\n| --- | --- |\n| DEC-805 | [DEC-805](features/F-805-scoped/decisions/DEC-805-waiver.md) |\n`,
    `${validLog}| DEC-805 | Conflicting waiver. | None. | source.md | BASS | 2026-08-14 | F-805 | [DEC-805](features/F-805-scoped/decisions/DEC-805-waiver.md) |\n`
  ]) {
    write(join(project, "decision-log.md"), invalidLog)
    assert.equal(reviewArtifact({ directory: host, projectName: "project", artifactPath: "features/F-805-scoped/feature.md" }).findings.find((item) => item.id === finding.id).status, "open")
  }
  write(join(project, "decision-log.md"), validLog)

  for (const [relative, id] of [["features/F-801-feature/feature.md", "F-801"], ["features/F-801-feature/user-stories/US-801-story/user-story.md", "US-801"], ["ideas/IDEA-801-idea/idea.md", "IDEA-801"], ["proposals/PRO-801-proposal/proposal.md", "PRO-801"]]) {
    const familyHost = join(root, id), familyProject = join(familyHost, "BASS", "projects", "project"), artifact = join(familyProject, ...relative.split("/"))
    registers(familyProject); write(artifact, itemMarkdown(id))
    const revised = readFileSync(artifact, "utf8").replace(`title: Safe`, `title: ${id} improved`)
    const preview = issueImprovementPreview({ directory: familyHost, projectName: "project", artifactPath: relative, originalVersion: "v1.0", revisedArtifactMarkdown: revised, reviewReport: { findings: [] }, changes: [], unresolved: [] })
    const persisted = persistApprovedImprovement({ directory: familyHost, projectName: "project", previewId: preview.previewId, approved: true, integrityHash: preview.integrityHash, approvedArtifactMarkdown: revised })
    assert.equal(persisted.status, "persisted", relative)
    const outputRelative = relative.split("/").slice(0, -1).concat(["outputs", `OUT-${id}-v1.1-improvement-record.md`]).join("/")
    for (const register of ["evidence-register.md", "decision-log.md", "action-log.md"]) assert.match(readFileSync(join(familyProject, register), "utf8"), new RegExp(`\\[OUT-${id}-v1\\.1\\]\\(${outputRelative.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`), `${relative}: ${register}`)
  }

  const malformedHost = join(root, "malformed"), malformedProject = join(malformedHost, "BASS", "projects", "project"), malformed = join(malformedProject, "features", "F-901-safe", "feature.md")
  registers(malformedProject); write(malformed, markdown("NOT-F-901", "Bad id"))
  assert.equal(improveArtifact({ directory: malformedHost, projectName: "project", artifactPath: "features/F-901-safe/feature.md", evidence: [] }).status, "blocked")
  const malformedVersion = join(malformedProject, "features", "F-902-safe", "feature.md")
  write(malformedVersion, markdown("F-902", "Bad version", "one"))
  const candidate = readFileSync(malformedVersion, "utf8").replace("title: Bad version", "title: Candidate")
  const before = readFileSync(malformedVersion, "utf8")
  const preview = issueImprovementPreview({ directory: malformedHost, projectName: "project", artifactPath: "features/F-902-safe/feature.md", originalVersion: "one", revisedArtifactMarkdown: candidate, reviewReport: { findings: [] }, changes: [], unresolved: [] })
  assert.equal(preview.previewId, "")
  assert.equal(readFileSync(malformedVersion, "utf8"), before)
  assert.equal(existsSync(join(malformedProject, "features", "F-902-safe", "outputs")), false)
  console.log("bass d8 P1/P2 behavioral regressions passed")
} finally { rmSync(root, { recursive: true, force: true }) }
