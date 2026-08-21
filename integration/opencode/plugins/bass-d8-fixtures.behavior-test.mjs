import { strict as assert } from "node:assert"
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"
import { tmpdir } from "node:os"

const fixtures = new URL("../../../support/fixtures/d8-review/", import.meta.url)
const root = mkdtempSync(join(tmpdir(), "bass-d8-fixtures-"))
const normalize = (value) => {
  if (typeof value === "string") return value
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "<preview-id>")
    .replace(/\b[0-9a-f]{64}\b/gi, "<integrity-hash>")
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalize(item)]))
  return value
}
const expected = (name) => JSON.parse(readFileSync(new URL(`../../../support/fixtures/d8-review/${name}`, import.meta.url), "utf8"))
const stage = (name, artifactDirectory) => {
  const host = join(root, name)
  const project = join(host, "BASS", "projects", "project")
  cpSync(new URL(`../../../support/fixtures/d8-review/${name}/`, import.meta.url), project, { recursive: true })
  mkdirSync(join(project, "features", artifactDirectory), { recursive: true })
  cpSync(join(project, "feature.md"), join(project, "features", artifactDirectory, "feature.md"))
  return { host, artifactDirectory }
}

try {
  const { reviewArtifact } = await import(`${new URL("./bass-review-artifact.js", import.meta.url).href}?${Math.random()}`)
  const { improveArtifact } = await import(`${new URL("./bass-improve-artifact.js", import.meta.url).href}?${Math.random()}`)
  const { persistApprovedImprovement } = await import(`${new URL("./bass-persist-approved-improvement.js", import.meta.url).href}?${Math.random()}`)

  const blocked = stage("blocked", "F-801-blocked")
  const blockedReview = reviewArtifact({ directory: blocked.host, projectName: "project", artifactPath: "features/F-801-blocked/feature.md" })
  assert.deepEqual(normalize(blockedReview), expected("expected-blocked-review.json"))

  const improved = stage("improved", "F-802-improved")
  const improvement = improveArtifact({ directory: improved.host, projectName: "project", artifactPath: "features/F-802-improved/feature.md", evidence: [{ source: "source.md", location: "Registration", claim: "Then an account is created." }] })
  const persistedResult = persistApprovedImprovement({ directory: improved.host, projectName: "project", previewId: improvement.previewId, approved: true, integrityHash: improvement.integrityHash, approvedArtifactMarkdown: improvement.revisedArtifactMarkdown })
  const persisted = { ...persistedResult, path: relative(join(improved.host, "BASS", "projects", "project"), persistedResult.path).replace(/\\/g, "/"), outputPath: relative(join(improved.host, "BASS", "projects", "project"), persistedResult.outputPath).replace(/\\/g, "/") }
  const improvedArtifact = readFileSync(join(improved.host, "BASS", "projects", "project", "features", "F-802-improved", "feature.md"), "utf8")
  const output = readFileSync(persistedResult.outputPath, "utf8")
  const project = join(improved.host, "BASS", "projects", "project")
  const registers = Object.fromEntries(["evidence-register.md", "decision-log.md", "action-log.md"].map((name) => [name, readFileSync(join(project, name), "utf8")]))
  assert.deepEqual(normalize({ improvement, persisted, improvedArtifact, output, registers }), expected("expected-improvement-result.json"))

  const unresolved = stage("unresolved", "F-803-unresolved")
  const unresolvedResult = improveArtifact({ directory: unresolved.host, projectName: "project", artifactPath: "features/F-803-unresolved/feature.md", evidence: [] })
  assert.deepEqual(normalize(unresolvedResult), expected("expected-unresolved-result.json"))

  const waived = stage("waived", "F-804-waived")
  const waivedReview = reviewArtifact({ directory: waived.host, projectName: "project", artifactPath: "features/F-804-waived/feature.md" })
  assert.deepEqual(normalize(waivedReview), expected("expected-waived-review.json"))
  const waiverPath = join(waived.host, "BASS", "projects", "project", "decisions", "DEC-804-waiver.md")
  const validWaiver = readFileSync(waiverPath, "utf8")
  const invalidWaivers = [
    ["missing canonical classification", validWaiver.replace("  classification: Decision\n", "")],
    ["mismatched canonical classification", validWaiver.replace("  classification: Decision", "  classification: Fact")],
    ["nested metadata classification", validWaiver.replace("  classification: Decision", "  metadata:\n    classification: Decision")],
    ["top-level classification", validWaiver.replace("provenance:\n  classification: Decision", "classification: Decision")],
    ["body classification", validWaiver.replace("provenance:\n  classification: Decision\n", "").replace("# Decision", "# Decision\n\nclassification: Decision")],
    ["finding ID", validWaiver.replace("REV-412ebb973c22b0fb", "REV-not-the-finding")],
    ["check", validWaiver.replace("testability", "clarity")],
    ["location", validWaiver.replace("features/F-804-waived/feature.md:37", "features/F-804-waived/feature.md:1")],
    ["fingerprint", validWaiver.replace("412ebb973c22b0fb9650e29582bc16857fdbf806e35d769e0fb4c409bd13b780", "0".repeat(64))],
    ["rationale", validWaiver.replace("The accountable owner accepts manual validation for this pilot.", "")],
    ["residual risk", validWaiver.replace("Registration behavior remains unverified until automated criteria are approved.", "")]
  ]
  for (const [binding, invalidWaiver] of invalidWaivers) {
    writeFileSync(waiverPath, invalidWaiver)
    const review = reviewArtifact({ directory: waived.host, projectName: "project", artifactPath: "features/F-804-waived/feature.md" })
    assert.deepEqual(normalize(review), expected("expected-invalid-waiver-review.json"), `waiver with invalid ${binding} must match the blocked snapshot`)
    assert.equal(review.status, "blocked", `waiver with invalid ${binding} must not waive the Major finding`)
    assert.equal(review.findings[0].status, "open", `waiver with invalid ${binding} must leave the finding open`)
  }
  writeFileSync(waiverPath, validWaiver)
  console.log("bass d8 fixture snapshots passed")
} finally {
  rmSync(root, { recursive: true, force: true })
}
