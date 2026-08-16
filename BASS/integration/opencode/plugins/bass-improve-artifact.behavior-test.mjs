import { strict as assert } from "node:assert"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

const root = mkdtempSync(join(tmpdir(), "bass-d8-improve-"))
const write = (path, text) => { mkdirSync(join(path, ".."), { recursive: true }); writeFileSync(path, text) }
try {
  const host = join(root, "host"), project = join(host, "BASS", "projects", "project")
  const artifact = join(project, "features", "F-001-safe", "feature.md")
  write(artifact, "---\nid: F-001\nversion: v1.0\n---\n# Feature\n\n## Goal\n\nA goal.\n\n## Scope\n\n- scope\n\n## Dependencies\n\n- None.\n\n## Risks\n\n- None.\n\n## Questions\n\n- Which policy applies?\n\n## Cited Evidence\n\n| Classification | Source | Location | Claim |\n| --- | --- | --- | --- |\n| Fact | source.md | section 2 | grounded fact |\n\n## Given/When/Then Acceptance Criteria\n\n- None.\n\n## Changelog\n\n| Date | Version | Change | Reason | Related records |\n")
  const { reviewArtifact } = await import(`${new URL("./bass-review-artifact.js", import.meta.url).href}?${Math.random()}`)
  const { improveArtifact } = await import(`${new URL("./bass-improve-artifact.js", import.meta.url).href}?${Math.random()}`)
  const result = improveArtifact({ directory: host, projectName: "project", artifactPath: "features/F-001-safe/feature.md", reviewReport: reviewArtifact({ directory: host, projectName: "project", artifactPath: "features/F-001-safe/feature.md" }), evidence: [] })
  assert.equal(result.status, "blocked")
  assert.ok(result.unresolved.some((item) => item.status === "needs_decision"))
  assert.match(result.revisedArtifactMarkdown, /needs_decision: REV-[a-f0-9]{16}/)
  assert.equal(result.reReview.status, "blocked")
  console.log("bass improve behavioral contract passed")
} finally { rmSync(root, { recursive: true, force: true }) }
