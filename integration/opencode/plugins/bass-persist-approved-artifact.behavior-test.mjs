import { strict as assert } from "node:assert"
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { execSync } from "node:child_process"
import { dirname, join } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath, pathToFileURL } from "node:url"

const pluginRoot = new URL(".", import.meta.url)
const root = mkdtempSync(join(tmpdir(), "bass-persist-"))
const write = (path, text) => { mkdirSync(join(path, ".."), { recursive: true }); writeFileSync(path, text) }
const localTsc = () => {
  const command = process.platform === "win32" ? "where tsc" : "command -v tsc"
  const executable = execSync(command, { encoding: "utf8" }).trim().split(/\r?\n/)[0]
  const resolved = realpathSync(existsSync(join(dirname(executable), "node_modules", "typescript", "bin", "tsc")) ? join(dirname(executable), "node_modules", "typescript", "bin", "tsc") : executable)
  if (!/[\\/]node_modules[\\/]typescript[\\/]bin[\\/]tsc(?:\.js)?$/i.test(resolved)) throw new Error(`A local TypeScript compiler is required; resolved tsc is not TypeScript: ${resolved}`)
  return resolved
}
async function load(file, name) { const module = await import(`${pathToFileURL(file).href}?${Math.random()}`); const plugin = await module[name]({}); return plugin.tool }

try {
  const shim = join(root, "node_modules", "@opencode-ai", "plugin")
  write(join(shim, "package.json"), '{"type":"module","exports":"./index.js"}')
  write(join(shim, "index.js"), 'export const tool = (definition) => definition; tool.schema = { string: () => ({ optional: () => ({}) }), array: () => ({ optional: () => ({}) }), object: () => ({ optional: () => ({}) }), boolean: () => ({ optional: () => ({}) }) };')
  const host = join(root, "host"), project = join(host, "BASS", "projects", "project")
  write(join(project, "evidence-register.md"), "# Evidence Register\n\n| ID | Classification | Title | Sources | Confidence | Location | Related items | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n")
  write(join(project, "decision-log.md"), "# Decision Log\n\n| ID | Decision | Alternatives | Supporting evidence | Actor | Date | Related items | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n")
  write(join(project, "action-log.md"), "# Action Log\n\n| ID | Operation | Target | Before/after or result | Supporting evidence | Decision | Actor | Date | Status | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n")
  write(join(project, "features", "F-001-parent", "feature.md"), "---\nid: F-001\ntitle: Parent\nversion: v1.0\ncreated_date: 2026-08-01\nupdated_date: 2026-08-01\nderived_from: null\nsupersedes: null\nprovenance:\n  classification: Fact\n  sources:\n    - type: local_file\n      reference: source.md\n      location: Scope\n      retrieved_date: 2026-08-01\n  actor: BASS\n  date: 2026-08-01\n  confidence: high\n  source_version: v1.0\n---\n# Feature\n\n## Goal\n\nKeep this goal unchanged.\n\n## Acceptance Criteria\n\n| ID | Given | When | Then | Evidence |\n| --- | --- | --- | --- | --- |\n| AC-001 | existing state | existing action | existing outcome | EVD-001 |\n\n## Changelog\n\n| Date | Version | Change | Reason | Related records |\n| --- | --- | --- | --- | --- |\n| 2026-08-01 | v1.0 | Initial record. | Baseline. | F-001 |\n")
  write(join(project, "features", "F-001-parent", "evidence", "EVD-001-registration.md"), "---\nid: EVD-001\n---\n# Evidence\n")
  write(join(project, "features", "F-001-parent", "decisions", "DEC-001-registration.md"), "---\nid: DEC-001\n---\n# Decision\n")
  mkdirSync(join(project, "features"), { recursive: true })
  mkdirSync(join(project, "proposals"), { recursive: true })
  const outside = join(root, "outside"); mkdirSync(outside, { recursive: true }); symlinkSync(outside, join(host, "BASS", "projects", "linked"), "junction")
  const runtime = join(root, "runtime"); mkdirSync(runtime, { recursive: true }); for (const file of ["bass-creator-preview.js", "bass-persist-approved-artifact.js"]) cpSync(fileURLToPath(new URL(file, pluginRoot)), join(runtime, file))
  const compiled = join(root, "compiled"); mkdirSync(compiled, { recursive: true })
  const tsc = localTsc()
  try { execSync(`node "${tsc}" --target ES2022 --module NodeNext --moduleResolution NodeNext --skipLibCheck --noEmitOnError false --outDir "${compiled}" "${fileURLToPath(new URL("bass-creator-preview.ts", pluginRoot))}" "${fileURLToPath(new URL("bass-persist-approved-artifact.ts", pluginRoot))}"`, { stdio: "pipe" }) } catch { /* Host provides declarations; emitted JS remains usable. */ }
  const previewTool = await load(join(runtime, "bass-creator-preview.js"), "BassCreatorPreviewPlugin")
  const persistTool = await load(join(runtime, "bass-persist-approved-artifact.js"), "BassPersistApprovedArtifactPlugin")
  const tsPreviewTool = await load(join(compiled, "bass-creator-preview.js"), "BassCreatorPreviewPlugin")
  const tsPersistTool = await load(join(compiled, "bass-persist-approved-artifact.js"), "BassPersistApprovedArtifactPlugin")
  const context = { directory: host }, input = { projectName: "project", artifactType: "feature", title: "Safe feature", evidence: [{ type: "local_file", source: "features/F-001-parent/evidence/EVD-001-registration.md", location: "Scope", classification: "Fact", confidence: "high", claim: "A supported need exists.", relatedItemId: "EVD-001" }, { type: "local_file", source: "features/F-001-parent/decisions/DEC-001-registration.md", location: "Scope", classification: "Decision", confidence: "high", claim: "DEC-001 supports the scope." }] }, preview = await previewTool.bass_creator_preview.execute(input, context)
  const unapproved = await persistTool.bass_persist_approved_artifact.execute({ projectName: "project", previewId: preview.previewId, approvedArtifactMarkdown: preview.artifactMarkdown, integrityHash: preview.integrityHash }, context)
  assert.equal(unapproved.status, "blocked")
  const tampered = await persistTool.bass_persist_approved_artifact.execute({ projectName: "project", previewId: preview.previewId, approved: true, integrityHash: preview.integrityHash, approvedArtifactMarkdown: `${preview.artifactMarkdown}\nchanged` }, context)
  assert.equal(tampered.status, "blocked")
  const persisted = await persistTool.bass_persist_approved_artifact.execute({ projectName: "project", previewId: preview.previewId, approved: true, integrityHash: preview.integrityHash, approvedArtifactMarkdown: preview.artifactMarkdown }, context)
  assert.equal(persisted.status, "persisted")
  assert.match(readFileSync(persisted.path, "utf8"), /Approval recorded/)
  assert.match(readFileSync(persisted.path, "utf8"), /related_items:\n    - EVD-001\n    - DEC-001/)
  assert.match(readFileSync(persisted.path, "utf8"), /- \[EVD-001\]\(\.\.\/F-001-parent\/evidence\/EVD-001-registration\.md\)/)
  assert.match(readFileSync(persisted.path, "utf8"), /- \[DEC-001\]\(\.\.\/F-001-parent\/decisions\/DEC-001-registration\.md\)/)
  assert.match(readFileSync(join(project, "evidence-register.md"), "utf8"), /F-002/)
  assert.match(readFileSync(join(project, "decision-log.md"), "utf8"), /Approved local artifact/)
  assert.match(readFileSync(join(project, "action-log.md"), "utf8"), /local artifact persistence/)
  assert.equal((await persistTool.bass_persist_approved_artifact.execute({ projectName: "project", previewId: preview.previewId, approved: true, integrityHash: preview.integrityHash, approvedArtifactMarkdown: preview.artifactMarkdown }, context)).status, "blocked")
  assert.equal((await persistTool.bass_persist_approved_artifact.execute({ projectName: "../project", previewId: preview.previewId, approved: true, integrityHash: preview.integrityHash, approvedArtifactMarkdown: preview.artifactMarkdown }, context)).status, "blocked")
  const story = await previewTool.bass_creator_preview.execute({ ...input, artifactType: "user_story", title: "Nested story", targetId: "F-001" }, context)
  const persistedStory = await persistTool.bass_persist_approved_artifact.execute({ projectName: "project", previewId: story.previewId, approved: true, integrityHash: story.integrityHash, approvedArtifactMarkdown: story.artifactMarkdown }, context)
  assert.match(persistedStory.path, /features[\\/]F-001-parent[\\/]user-stories[\\/]US-001-nested-story[\\/]user-story\.md$/)
  assert.match(readFileSync(persistedStory.path, "utf8"), /related_items:\n    - EVD-001\n    - DEC-001/)
  assert.match(readFileSync(persistedStory.path, "utf8"), /- \[EVD-001\]\(\.\.\/\.\.\/evidence\/EVD-001-registration\.md\)/)
  const proposal = await previewTool.bass_creator_preview.execute({ ...input, artifactType: "proposal", title: "Related proposal" }, context)
  const persistedProposal = await persistTool.bass_persist_approved_artifact.execute({ projectName: "project", previewId: proposal.previewId, approved: true, integrityHash: proposal.integrityHash, approvedArtifactMarkdown: proposal.artifactMarkdown }, context)
  assert.equal(persistedProposal.status, "persisted")
  assert.match(readFileSync(persistedProposal.path, "utf8"), /related_items:\n    - EVD-001\n    - DEC-001/)
  assert.match(readFileSync(persistedProposal.path, "utf8"), /- \[DEC-001\]\(\.\.\/\.\.\/features\/F-001-parent\/decisions\/DEC-001-registration\.md\)/)
  const originalFeature = readFileSync(join(project, "features", "F-001-parent", "feature.md"), "utf8")
   const acceptanceCriteria = await previewTool.bass_creator_preview.execute({ ...input, artifactType: "acceptance_criteria", title: "Supported registration", targetId: "F-001", assumptions: ["The identity provider returns a verified account."] }, context)
  assert.equal(acceptanceCriteria.writeStatus, "ready_for_approval")
  const unapprovedAcceptanceCriteria = await persistTool.bass_persist_approved_artifact.execute({ projectName: "project", previewId: acceptanceCriteria.previewId, integrityHash: acceptanceCriteria.integrityHash, approvedArtifactMarkdown: acceptanceCriteria.artifactMarkdown }, context)
  assert.equal(unapprovedAcceptanceCriteria.status, "blocked")
  const tamperedAcceptanceCriteria = await persistTool.bass_persist_approved_artifact.execute({ projectName: "project", previewId: acceptanceCriteria.previewId, approved: true, integrityHash: acceptanceCriteria.integrityHash, approvedArtifactMarkdown: `${acceptanceCriteria.artifactMarkdown}\nchanged` }, context)
  assert.equal(tamperedAcceptanceCriteria.status, "blocked")
  const persistedAcceptanceCriteria = await persistTool.bass_persist_approved_artifact.execute({ projectName: "project", previewId: acceptanceCriteria.previewId, approved: true, integrityHash: acceptanceCriteria.integrityHash, approvedArtifactMarkdown: acceptanceCriteria.artifactMarkdown }, context)
  assert.equal(persistedAcceptanceCriteria.status, "persisted")
  assert.equal(persistedAcceptanceCriteria.path, join(project, "features", "F-001-parent", "feature.md"))
  const updatedFeature = readFileSync(persistedAcceptanceCriteria.path, "utf8")
  assert.match(updatedFeature, /## Goal\n\nKeep this goal unchanged\./)
   assert.match(updatedFeature, /## Acceptance Criteria\n\n### AC-001: Supported registration/)
   assert.match(updatedFeature, /### Assumptions\n\n- The identity provider returns a verified account\. \[classification: Assumption; source: explicit_input; location: assumptions; confidence: unverified\]/)
  assert.doesNotMatch(updatedFeature, /\| AC-001 \| existing state \|/)
  assert.match(updatedFeature, /^version: v1\.1$/m)
  assert.match(updatedFeature, /^updated_date: 2026-08-14$/m)
  assert.match(updatedFeature, /^derived_from: F-001@v1\.0$/m)
  assert.match(updatedFeature, /^supersedes: F-001@v1\.0$/m)
  assert.match(updatedFeature, /^  classification: Fact$/m)
  assert.match(updatedFeature, /\| 2026-08-14 \| v1\.1 \| Approved acceptance-criteria update\. \|/)
  const unchanged = (text) => text.replace(/^version:.*$/m, "version: <changed>").replace(/^updated_date:.*$/m, "updated_date: <changed>").replace(/^derived_from:.*$/m, "derived_from: <changed>").replace(/^supersedes:.*$/m, "supersedes: <changed>").replace(/## Acceptance Criteria\n\n[\s\S]*?(?=\n## Changelog)/, "## Acceptance Criteria\n\n<changed>").replace(/## Changelog\n\n[\s\S]*$/, "## Changelog\n\n<changed>")
  assert.equal(unchanged(updatedFeature), unchanged(originalFeature))
  assert.equal(existsSync(join(project, "acceptance-criteria")), false)
  assert.match(readFileSync(join(project, "evidence-register.md"), "utf8"), /F-001/)
  assert.match(readFileSync(join(project, "decision-log.md"), "utf8"), /Approved acceptance criteria update F-001/)
  assert.match(readFileSync(join(project, "action-log.md"), "utf8"), /acceptance criteria persistence/)
  assert.equal((await persistTool.bass_persist_approved_artifact.execute({ projectName: "project", previewId: acceptanceCriteria.previewId, approved: true, integrityHash: acceptanceCriteria.integrityHash, approvedArtifactMarkdown: acceptanceCriteria.artifactMarkdown }, context)).status, "blocked")
  const faultedAcceptanceCriteria = (source, destination, stage) => {
    const original = readFileSync(source, "utf8"), needle = "renameSync)(temps[i], files[i]);", index = original.indexOf(needle), injection = ` if (i === ${stage === "target" ? 0 : ["evidence register", "decision log", "action log"].indexOf(stage) + 1}) throw new Error("injected ${stage} failure");`, instrumented = index < 0 ? original : `${original.slice(0, index + needle.length)}${injection}${original.slice(index + needle.length)}`
    assert.notEqual(instrumented, original, `test must inject AC ${stage} failure`)
    writeFileSync(destination, instrumented)
  }
  for (const [label, previewFile, persistenceFile] of [["shipped JavaScript", join(runtime, "bass-creator-preview.js"), join(runtime, "bass-persist-approved-artifact.js")], ["TypeScript emission", join(compiled, "bass-creator-preview.js"), join(compiled, "bass-persist-approved-artifact.js")]]) {
    for (const stage of ["target", "evidence register", "decision log", "action log"]) {
      const rollbackProject = join(host, "BASS", "projects", `ac-rollback-${label.slice(0, 2)}-${stage.replace(" ", "-")}`), target = join(rollbackProject, "features", "F-001-parent", "feature.md"), originalTarget = readFileSync(join(project, "features", "F-001-parent", "feature.md"), "utf8"), originals = ["evidence-register.md", "decision-log.md", "action-log.md"].map((file) => `original ${file}\n`)
      write(target, originalTarget); originals.forEach((text, index) => write(join(rollbackProject, ["evidence-register.md", "decision-log.md", "action-log.md"][index]), text))
      const faultFile = join(root, `ac-${label.slice(0, 2)}-${stage.replace(" ", "-")}.js`); faultedAcceptanceCriteria(persistenceFile, faultFile, stage)
      const faultPreviewTool = await load(previewFile, "BassCreatorPreviewPlugin"), faultPersistTool = await load(faultFile, "BassPersistApprovedArtifactPlugin"), rollbackProjectName = rollbackProject.slice(rollbackProject.lastIndexOf("projects") + 9), faultPreview = await faultPreviewTool.bass_creator_preview.execute({ ...input, projectName: rollbackProjectName, artifactType: "acceptance_criteria", title: `Rollback ${stage}`, targetId: "F-001" }, context), result = await faultPersistTool.bass_persist_approved_artifact.execute({ projectName: rollbackProjectName, previewId: faultPreview.previewId, approved: true, integrityHash: faultPreview.integrityHash, approvedArtifactMarkdown: faultPreview.artifactMarkdown }, context)
      assert.equal(result.status, "blocked", `${label} must block after AC ${stage} failure`)
      assert.equal(readFileSync(target, "utf8"), originalTarget, `${label} must restore target bytes after AC ${stage} failure`)
      originals.forEach((text, index) => assert.equal(readFileSync(join(rollbackProject, ["evidence-register.md", "decision-log.md", "action-log.md"][index]), "utf8"), text, `${label} must restore log bytes after AC ${stage} failure`))
      assert.deepEqual(readdirSync(rollbackProject, { recursive: true }).filter((entry) => /\.(?:tmp|bak)-/.test(String(entry))), [], `${label} must remove AC transaction remnants`)
    }
  }
  const tsPreview = await tsPreviewTool.bass_creator_preview.execute({ ...input, title: "TS parity" }, context)
  const tsPersisted = await tsPersistTool.bass_persist_approved_artifact.execute({ projectName: "project", previewId: tsPreview.previewId, approved: true, integrityHash: tsPreview.integrityHash, approvedArtifactMarkdown: tsPreview.artifactMarkdown }, context)
  assert.equal(tsPersisted.status, "persisted")
  const broken = join(host, "BASS", "projects", "broken"); write(join(broken, "decision-log.md"), "# Decision Log\n"); write(join(broken, "action-log.md"), "# Action Log\n"); mkdirSync(join(broken, "evidence-register.md"), { recursive: true }); mkdirSync(join(broken, "features"), { recursive: true })
  const rollback = await previewTool.bass_creator_preview.execute({ ...input, projectName: "broken", title: "Rollback" }, context)
  assert.equal((await persistTool.bass_persist_approved_artifact.execute({ projectName: "broken", previewId: rollback.previewId, approved: true, integrityHash: rollback.integrityHash, approvedArtifactMarkdown: rollback.artifactMarkdown }, context)).status, "blocked")
  assert.equal(existsSync(join(broken, "features", "F-001-rollback")), false)
  const faultedPersistence = (source, destination, stage) => {
    const original = readFileSync(source, "utf8")
    const commitIndex = ["evidence register", "decision log", "action log"].indexOf(stage)
    const needle = stage === "artifact" ? "temps[0], artifact);" : stage === "action log" ? "for (const backup of backups)" : "temps[i + 1], registers[i]);"
    const index = stage === "action log" ? original.indexOf(needle) : original.lastIndexOf(needle)
    const injection = stage === "artifact" ? " throw new Error(\"injected artifact failure\");" : stage === "action log" ? ` { ${original.includes("fs.rmSync") ? "fs.rmSync(backups[0], { force: true }); " : "(0, node_fs_1.rmSync)(backups[0], { force: true }); "}throw new Error("injected action log failure"); } for (const ignored of backups)` : ` if (i === ${commitIndex}) throw new Error("injected ${stage} failure");`
    const instrumented = index < 0 ? original : `${original.slice(0, index + needle.length)}${injection}${original.slice(index + needle.length)}`
    assert.notEqual(instrumented, original, `test must inject a ${stage} failure`)
    writeFileSync(destination, instrumented)
  }
  for (const [label, previewFile, persistenceFile] of [["shipped JavaScript", join(runtime, "bass-creator-preview.js"), join(runtime, "bass-persist-approved-artifact.js")], ["TypeScript emission", join(compiled, "bass-creator-preview.js"), join(compiled, "bass-persist-approved-artifact.js")]]) {
    for (const stage of ["artifact", "evidence register", "decision log", "action log"]) {
      const rollbackProject = join(host, "BASS", "projects", `rollback-${label.slice(0, 2)}-${stage.replace(" ", "-")}`)
      const originals = ["evidence-register.md", "decision-log.md", "action-log.md"].map((file) => `original ${file}\n`)
      originals.forEach((text, index) => write(join(rollbackProject, ["evidence-register.md", "decision-log.md", "action-log.md"][index]), text))
      mkdirSync(join(rollbackProject, "features"), { recursive: true })
      const faultFile = join(root, `${label.slice(0, 2)}-${stage.replace(" ", "-")}.js`)
      faultedPersistence(persistenceFile, faultFile, stage)
      const faultPreviewTool = await load(previewFile, "BassCreatorPreviewPlugin")
      const faultPersistTool = await load(faultFile, "BassPersistApprovedArtifactPlugin")
      const rollbackProjectName = rollbackProject.slice(rollbackProject.lastIndexOf("projects") + 9)
      const faultPreview = await faultPreviewTool.bass_creator_preview.execute({ ...input, projectName: rollbackProjectName, title: `Rollback ${stage}` }, context)
      const result = await faultPersistTool.bass_persist_approved_artifact.execute({ projectName: rollbackProjectName, previewId: faultPreview.previewId, approved: true, integrityHash: faultPreview.integrityHash, approvedArtifactMarkdown: faultPreview.artifactMarkdown }, context)
      assert.equal(result.status, "blocked", `${label} must report a blocked transaction after ${stage} failure`)
      assert.equal(result.message, "Atomic persistence failed; all staged writes were rolled back.", `${label} must reach the injected ${stage} failure`)
      assert.deepEqual(readdirSync(join(rollbackProject, "features"), { recursive: true }).filter((entry) => String(entry).endsWith("feature.md")), [], `${label} must remove the new artifact after ${stage} failure`)
      originals.forEach((text, index) => assert.equal(readFileSync(join(rollbackProject, ["evidence-register.md", "decision-log.md", "action-log.md"][index]), "utf8"), text, `${label} must restore original register bytes after ${stage} failure`))
      assert.deepEqual(readdirSync(rollbackProject, { recursive: true }).filter((entry) => /\.(?:tmp|bak)-/.test(String(entry))), [], `${label} must remove transaction remnants after ${stage} failure`)
    }
  }
  assert.equal(typeof globalThis.fetch, "function")
  console.log("bass-persist-approved-artifact behavioral contract passed")
} finally { rmSync(root, { recursive: true, force: true }) }
