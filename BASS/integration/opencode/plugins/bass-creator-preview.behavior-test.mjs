import { strict as assert } from "node:assert"
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath, pathToFileURL } from "node:url"
import { execSync } from "node:child_process"

const pluginRoot = new URL(".", import.meta.url)
const fixtureRoot = fileURLToPath(new URL("../../../fixtures/d7-creator/", pluginRoot))
const root = mkdtempSync(join(tmpdir(), "bass-creator-preview-"))
const write = (path, text) => { mkdirSync(join(path, ".."), { recursive: true }); writeFileSync(path, text) }
const localTsc = () => {
  const command = process.platform === "win32" ? "where tsc" : "command -v tsc"
  const executable = execSync(command, { encoding: "utf8" }).trim().split(/\r?\n/)[0]
  const resolved = realpathSync(existsSync(join(dirname(executable), "node_modules", "typescript", "bin", "tsc")) ? join(dirname(executable), "node_modules", "typescript", "bin", "tsc") : executable)
  if (!/[\\/]node_modules[\\/]typescript[\\/]bin[\\/]tsc(?:\.js)?$/i.test(resolved)) throw new Error(`A local TypeScript compiler is required; resolved tsc is not TypeScript: ${resolved}`)
  return resolved
}
const normalizePreview = (value) => { const { previewId, integrityHash, ...stable } = value; return stable }
const evidence = (classification = "Fact") => ({ type: "local_file", source: "project-context/functional/source.md", location: "Scope", classification, confidence: "high", claim: "Customers need a guided account creation step." })
async function load(file) { const module = await import(`${pathToFileURL(file).href}?${Math.random()}`); const plugin = await module.BassCreatorPreviewPlugin({}); return plugin.tool.bass_creator_preview.execute }

try {
  const shim = join(root, "node_modules", "@opencode-ai", "plugin")
  write(join(shim, "package.json"), '{"type":"module","exports":"./index.js"}')
  write(join(shim, "index.js"), 'export const tool = (definition) => definition; tool.schema = { string: () => ({ optional: () => ({}) }), array: () => ({ optional: () => ({}) }), object: () => ({ optional: () => ({}) }), boolean: () => ({ optional: () => ({}) }) };')
  const host = join(root, "host"), project = join(host, "BASS", "projects", "project")
  write(join(project, "features", "F-001-parent", "feature.md"), "---\nid: F-001\ntitle: Parent\n---\n# Feature: Parent\n")
  write(join(project, "features", "F-001-parent", "evidence", "EVD-001-registration.md"), "---\nid: EVD-001\n---\n# Evidence\n")
  write(join(project, "features", "F-001-parent", "decisions", "DEC-001-registration.md"), "---\nid: DEC-001\n---\n# Decision\n")
  write(join(project, "proposals", "PRO-009-existing", "proposal.md"), "---\nid: PRO-009\ntitle: Existing\n---\n# Functional Proposal: Existing\n")
  write(join(project, "proposals", "PRO-014-existing", "proposal.md"), "---\nid: PRO-014\ntitle: Latest\n---\n# Functional Proposal: Latest\n")
  const outside = join(root, "outside"); mkdirSync(outside, { recursive: true }); symlinkSync(outside, join(host, "BASS", "projects", "linked"), "junction")
  const runtime = join(root, "runtime"); mkdirSync(runtime, { recursive: true }); cpSync(fileURLToPath(new URL("bass-creator-preview.js", pluginRoot)), join(runtime, "bass-creator-preview.js"))
  const compiled = join(root, "compiled"); mkdirSync(compiled, { recursive: true })
  const tsc = localTsc()
  try { execSync(`node "${tsc}" --target ES2022 --module NodeNext --moduleResolution NodeNext --skipLibCheck --noEmitOnError false --outDir "${compiled}" "${fileURLToPath(new URL("bass-creator-preview.ts", pluginRoot))}"`, { stdio: "pipe" }) } catch { /* Target OpenCode supplies plugin and Node declarations; tsc still emits JS. */ }
  const execute = await load(join(runtime, "bass-creator-preview.js")), tsExecute = await load(join(compiled, "bass-creator-preview.js"))
  const invoke = async (args) => { const js = await execute(args, { directory: host }); const ts = await tsExecute(args, { directory: host }); assert.equal(typeof js, "string", `JS OpenCode adapter must serialize ${JSON.stringify(args)}`); assert.equal(typeof ts, "string", `TS OpenCode adapter must serialize ${JSON.stringify(args)}`); const jsResult = JSON.parse(js), tsResult = JSON.parse(ts); assert.deepEqual(normalizePreview(tsResult), normalizePreview(jsResult), `TS and JS output differ for ${JSON.stringify(args)}`); return jsResult }

  const feature = await invoke({ projectName: "project", artifactType: "feature", title: "Guided registration", evidence: [evidence()] })
  assert.equal(feature.writeStatus, "ready_for_approval")
  assert.match(feature.artifactMarkdown, /# Feature: Guided registration/)
  assert.match(feature.artifactMarkdown, /Given.*Customers need a guided account creation step/s)
  assert.match(feature.artifactMarkdown, /classification: Fact/)
  assert.equal(feature.adoPreview.type, "Feature")
  assert.match(feature.adoPreview.description, /Customers need a guided account creation step/)
  assert.match(feature.adoPreview.acceptanceCriteria, /Given Customers need a guided account creation step/)
  for (const field of ["title", "description", "acceptanceCriteria", "parentOrLinkTarget", "tags", "area", "iteration", "priority", "effort", "unavailableMappings"]) assert.ok(field in feature.adoPreview)
  assert.match(feature.integrityHash, /^[a-f0-9]{64}$/)
  const related = await invoke({ projectName: "project", artifactType: "feature", title: "Related registration", evidence: [{ ...evidence(), source: "features/F-001-parent/evidence/EVD-001-registration.md", relatedItemId: "EVD-001" }, { ...evidence(), source: "features/F-001-parent/decisions/DEC-001-registration.md", claim: "DEC-001 supports the registration scope." }] })
  assert.match(related.artifactMarkdown, /related_items:\n    - EVD-001\n    - DEC-001/)
  assert.match(related.artifactMarkdown, /- \[EVD-001\]\(\.\.\/F-001-parent\/evidence\/EVD-001-registration\.md\)/)
  assert.match(related.artifactMarkdown, /- \[DEC-001\]\(\.\.\/F-001-parent\/decisions\/DEC-001-registration\.md\)/)
  const assumed = await invoke({ projectName: "project", artifactType: "feature", title: "Guided registration with assumption", evidence: [evidence()], assumptions: ["Account creation requires an approved identity provider."] })
  assert.equal(assumed.writeStatus, "ready_for_approval")
  assert.match(assumed.artifactMarkdown, /## Assumptions\n\n- Account creation requires an approved identity provider\. \[classification: Assumption; source: explicit_input; location: assumptions; confidence: unverified\]/)
  const assumptionOnly = await invoke({ projectName: "project", artifactType: "feature", title: "Assumed registration", evidence: [], assumptions: ["An identity provider is available."] })
  assert.equal(assumptionOnly.writeStatus, "blocked")
  assert.equal(assumptionOnly.previewId, "")
  assert.equal(assumptionOnly.integrityHash, undefined)
  assert.equal(assumptionOnly.adoPreview, undefined)
  assert.match(assumptionOnly.artifactMarkdown, /- An identity provider is available\. \[classification: Assumption; source: explicit_input; location: assumptions; confidence: unverified\]/)
  const inference = await invoke({ projectName: "project", artifactType: "feature", title: "Inferred registration workflow", evidence: [evidence("Inference")] })
  assert.equal(inference.writeStatus, "ready_for_approval")
  assert.match(inference.artifactMarkdown, /classification: Inference/)
  assert.match(inference.artifactMarkdown, /\| Inference \| local_file \|/)
  assert.equal(inference.adoPreview.type, "Feature")
  const story = await invoke({ projectName: "project", artifactType: "user_story", title: "Register an account", targetId: "F-001", evidence: [evidence()] })
  assert.equal(story.writeStatus, "ready_for_approval")
  assert.match(story.artifactMarkdown, /parent_feature_id: F-001/)
  assert.equal(story.adoPreview.parentOrLinkTarget, "F-001")
  assert.match(story.artifactMarkdown, /type: local_file/)
  const assumedAc = await invoke({ projectName: "project", artifactType: "acceptance_criteria", title: "Supported registration assumption", targetId: "F-001", evidence: [evidence()], assumptions: ["The identity provider returns a verified account."] })
  assert.equal(assumedAc.writeStatus, "ready_for_approval")
  assert.match(assumedAc.artifactMarkdown, /### Assumptions\n\n- The identity provider returns a verified account\. \[classification: Assumption; source: explicit_input; location: assumptions; confidence: unverified\]/)
  const assumptionOnlyAc = await invoke({ projectName: "project", artifactType: "acceptance_criteria", title: "Assumed registration criterion", targetId: "F-001", evidence: [], assumptions: ["The identity provider is available."] })
  assert.equal(assumptionOnlyAc.writeStatus, "blocked")
  assert.equal(assumptionOnlyAc.previewId, "")
  assert.equal(assumptionOnlyAc.integrityHash, undefined)
  assert.equal(assumptionOnlyAc.adoPreview, undefined)
  const proposal = await invoke({ projectName: "project", artifactType: "proposal", title: "Registration improvement", promoteTo: "feature", evidence: [evidence()] })
  assert.equal(proposal.adoPreview.type, "Feature")
  assert.match(proposal.artifactMarkdown, /^id: PRO-015$/m)
  assert.match(proposal.artifactMarkdown, /## Problem or Opportunity/)
  assert.match(proposal.artifactMarkdown, /## Proposed Change/)
  assert.match(proposal.artifactMarkdown, /## Expected Value/)
  assert.match(proposal.artifactMarkdown, /## Next Step/)
  assert.equal((await invoke({ projectName: "project", artifactType: "proposal", title: "Local proposal", evidence: [evidence()] })).adoPreview, undefined)
  for (const type of ["local_file", "ado_wiki", "ado_work_item", "ado_comment", "ado_pull_request", "ado_pipeline"]) {
    assert.equal((await invoke({ projectName: "project", artifactType: "feature", title: `Allowed ${type}`, evidence: [{ ...evidence(), type }] })).writeStatus, "ready_for_approval")
  }
  const unsupportedEvidence = await invoke({ projectName: "project", artifactType: "feature", title: "Unsupported evidence", evidence: [{ ...evidence(), type: "web_page" }] })
  assert.equal(unsupportedEvidence.writeStatus, "blocked")
  for (const classification of ["Question", "Assumption"]) {
    const ungrounded = await invoke({ projectName: "project", artifactType: "feature", title: `${classification} only`, evidence: [evidence(classification)] })
    assert.equal(ungrounded.writeStatus, "blocked")
    assert.equal(ungrounded.previewId, "")
    assert.equal(ungrounded.integrityHash, undefined)
    assert.equal(ungrounded.adoPreview, undefined)
  }
  const blocked = await invoke({ projectName: "project", artifactType: "feature", title: "Unresolved", evidence: [evidence(), { ...evidence("Question"), claim: "Which enrolment route is authoritative?" }, { ...evidence("Conflict"), claim: "Sources disagree on enrolment eligibility." }] })
  assert.equal(blocked.writeStatus, "blocked")
  assert.equal(blocked.adoPreview, undefined)
  assert.ok(blocked.gaps.length)
  assert.ok(blocked.conflicts.length)
  const blockedAc = await invoke({ projectName: "project", artifactType: "acceptance_criteria", title: "Disputed criterion", targetId: "F-001", evidence: [evidence("Conflict")] })
  assert.equal(blockedAc.writeStatus, "blocked")
  assert.equal(blockedAc.previewId, "")
  assert.equal((await invoke({ projectName: "../project", artifactType: "feature", title: "Nope", evidence: [evidence()] })).writeStatus, "blocked")
  assert.equal((await invoke({ projectName: "linked", artifactType: "feature", title: "Nope", evidence: [evidence()] })).writeStatus, "blocked")
  assert.equal((await invoke({ projectName: "project", artifactType: "unsupported", title: "Nope", evidence: [evidence()] })).writeStatus, "blocked")
  assert.equal((await invoke({ projectName: "project", artifactType: "feature", title: "Nope", evidence: [{ source: "x" }] })).writeStatus, "blocked")
  const stageFixture = (name) => {
    rmSync(project, { recursive: true, force: true })
    const fixture = join(fixtureRoot, name)
    if (existsSync(join(fixture, "project"))) cpSync(join(fixture, "project"), project, { recursive: true })
    else mkdirSync(project, { recursive: true })
    return JSON.parse(readFileSync(join(fixture, "request.json"), "utf8"))
  }
  const assertFixture = async (name, expectedFile) => {
    const result = await invoke(stageFixture(name))
    const expected = JSON.parse(readFileSync(join(fixtureRoot, expectedFile), "utf8"))
    expected.artifactMarkdown = readFileSync(join(fixtureRoot, expected.artifactMarkdownFile), "utf8").trimEnd()
    delete expected.artifactMarkdownFile
    assert.deepEqual(normalizePreview(result), expected, `${name} fixture result differs from expected normalized preview`)
    return result
  }
  const completeFixture = await assertFixture("complete", "expected-user-story-preview.json")
  for (const field of ["type", "title", "description", "acceptanceCriteria", "parentOrLinkTarget", "tags", "area", "iteration", "priority", "effort", "unavailableMappings"]) assert.ok(field in completeFixture.adoPreview)
  const partialFixture = await assertFixture("partial", "expected-partial-preview.json")
  assert.equal(partialFixture.adoPreview, undefined)
  await assertFixture("promotion", "expected-proposal-promotion-preview.json")
  assert.equal(typeof globalThis.fetch, "function")
  console.log("bass-creator-preview behavioral contract passed")
} finally { rmSync(root, { recursive: true, force: true }) }
