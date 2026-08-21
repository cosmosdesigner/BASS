import { strict as assert } from "node:assert"
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath, pathToFileURL } from "node:url"
import { execSync } from "node:child_process"

const pluginRoot = new URL(".", import.meta.url)
const fixturesRoot = fileURLToPath(new URL("../../../support/fixtures/d6-discovery", pluginRoot))
const root = mkdtempSync(join(tmpdir(), "bass-discovery-"))
const source = (id, classification = "Fact", extra = "") => `provenance:\n  classification: ${classification}\n  sources:\n    - type: local_file\n      reference: records/${id}\n      location: ${id}\n${extra}  confidence: high\n`
const write = (path, contents) => { mkdirSync(join(path, ".."), { recursive: true }); writeFileSync(path, contents) }
const feature = (project, directory, id, title, extra = "", body = "") => write(join(project, "features", directory, "feature.md"), `---\nid: ${id}\ntitle: ${title}\ntype: Feature\ntags: [urgent]\nstate: Active\narea: Product\niteration: Sprint 1\n${extra}${source(id)}---\n# Feature: ${title}\n\n## Summary\n\n${title} summary.\n${body}`)
const story = (project, directory, id, title, parent) => write(join(project, "features", "F-1-parent", "user-stories", directory, "user-story.md"), `---\nid: ${id}\ntitle: ${title}\nparent_feature_id: ${parent}\ntype: User Story\ntags: [urgent]\nstate: Active\narea: Product\niteration: Sprint 1\n${source(id)}---\n# User Story: ${title}\n\n## Summary\n\n${title} summary.\n`)
async function load(file) { const module = await import(`${pathToFileURL(file).href}?${Math.random()}`); const plugin = await module.BassDiscoveryReportPlugin({}); return plugin.tool.bass_discovery_report.execute }

try {
  const shim = join(root, "node_modules", "@opencode-ai", "plugin")
  mkdirSync(shim, { recursive: true })
  write(join(shim, "package.json"), '{"type":"module","exports":"./index.js"}')
  write(join(shim, "index.js"), 'export const tool = (definition) => definition; tool.schema = { string: () => ({ optional: () => ({}) }), object: () => ({}) };')
  const host = join(root, "host"), project = join(host, "BASS", "projects", "project")
  feature(project, "F-1-parent", "F-1", "Parent", "ado_relation_references: [related/F-9]\n", "\n## Related Evidence and Decisions\n\n- [EVD-1](evidence.md)\n- [CON-1](conflict.md)\n")
  story(project, "US-1-child", "US-1", "Child", "F-1")
  story(project, "US-2-grandchild", "US-2", "Grandchild", "F-1")
  feature(project, "F-9-related", "F-9", "Related")
  feature(project, "F-2-other", "F-2", "Other", "tags: [other]\n")
  feature(project, "F-3-second-root", "F-3", "Parent second root", "ado_relation_references: [related/F-9]\n")
  write(join(project, "project-context", "context-registry.md"), "# Context Registry\n\n## Functional ADO Wiki\n\n- URL: `https://dev.azure.com/contoso/project/_wiki/wikis/functional.wiki`\n\n## Technical ADO Wiki\n\n- URL: `https://dev.azure.com/contoso/project/_wiki/wikis/technical.wiki`\n")
  write(join(project, "features", "F-1-parent", "evidence.md"), `---\nid: EVD-1\ntitle: Evidence\n${source("EVD-1")}---\n# Evidence\n\n## Summary\n\nDirect evidence.\n`)
  write(join(project, "features", "F-1-parent", "conflict.md"), `---\nid: CON-1\ntitle: Conflict\n${source("CON-1", "Conflict", "    - type: ado_work_item\n      reference: work-items/42\n      location: Work Item 42\n")}conflict:\n  status: open\n---\n# Conflict\n\n## Summary\n\nDependency is disputed.\n`)
   feature(project, "F-4-closed", "F-4", "Closed conflict", "ado_relation_references: [related/F-9]\n", "\n## Conflicts\n\n- [CON-2](conflict.md)\n")
   write(join(project, "features", "F-4-closed", "conflict.md"), `---\nid: CON-2\ntitle: Closed Conflict\n${source("CON-2", "Conflict", "    - type: ado_work_item\n      reference: related/F-9\n      location: Related Feature F-9\n")}conflict:\n  status: resolved\n---\n# Conflict\n\n## Summary\n\nResolved dependency.\n`)
  const outside = join(root, "outside"); mkdirSync(outside, { recursive: true }); feature(outside, "F-evil", "F-EVIL", "Evil"); symlinkSync(outside, join(host, "BASS", "projects", "linked"), "junction")
  const runtime = join(root, "runtime"); mkdirSync(runtime, { recursive: true })
  cpSync(fileURLToPath(new URL("bass-discovery-report.js", pluginRoot)), join(runtime, "bass-discovery-report.js"))
  const compiled = join(root, "compiled"); mkdirSync(compiled, { recursive: true })
  try { execSync(`npx tsc --target ES2022 --module NodeNext --moduleResolution NodeNext --skipLibCheck --noEmitOnError false --outDir "${compiled}" "${fileURLToPath(new URL("bass-discovery-report.ts", pluginRoot))}"`, { stdio: "pipe" }) } catch { /* Target OpenCode supplies plugin and Node declarations; tsc still emits JS. */ }
  const execute = await load(join(runtime, "bass-discovery-report.js"))
  const tsExecute = await load(join(compiled, "bass-discovery-report.js"))
  const invoke = async (args) => { const js = await execute(args, { directory: host }); const ts = await tsExecute(args, { directory: host }); assert.equal(ts, js, `TS and JS output differ for ${JSON.stringify(args)}`); return js }
  const invokeFixture = async (fixture, filters) => {
    const fixtureHost = join(root, `fixture-${fixture}`)
    cpSync(join(fixturesRoot, fixture), join(fixtureHost, "BASS", "projects", fixture), { recursive: true })
    const args = { projectName: fixture, filters }
    const js = await execute(args, { directory: fixtureHost })
    const ts = await tsExecute(args, { directory: fixtureHost })
    assert.equal(ts, js, `TS and JS fixture output differ for ${fixture}`)
    assert.equal(js, readFileSync(join(fixturesRoot, `expected-${fixture}-discovery-report.md`), "utf8").trim(), `fixture output differs for ${fixture}`)
    return js
  }
  const report = await invoke({ projectName: "project", filters: { type: "Feature", tag: "urgent", state: "Active", text: "Parent" } })
  assert.match(report, /^# Discovery Report: F-1/m)
  assert.match(report, /Status: warning/)
  assert.match(report, /F-1.*classification: Fact.*confidence: high.*directness: direct/)
  assert.match(report, /US-1.*relationship: child/)
  assert.doesNotMatch(report, /US-2.*Grandchild/)
  assert.match(report, /F-9.*relationship: related/)
  assert.doesNotMatch(report, /F-2.*Other/)
  assert.match(report, /CON-1.*classification: Conflict/)
  assert.match(report, /disputed dependency is isolated/)
  assert.match(report, /local_file: records\/CON-1 \(CON-1\); ado_work_item: work-items\/42 \(Work Item 42\)/)
  assert.match(report, /Required Wiki Search and Read/)
  const multiRoot = await invoke({ projectName: "project", filters: { text: "Parent", tag: "urgent" } })
  assert.match(multiRoot, /F-1 -> F-9 \(related\)/)
  assert.match(multiRoot, /F-3 -> F-9 \(related\)/)
   const closedConflict = await invoke({ projectName: "project", filters: { id: "F-4" } })
   assert.match(closedConflict, /CON-2 status: resolved/)
   assert.doesNotMatch(closedConflict, /disputed dependency is isolated/)
   assert.match(closedConflict, /F-4 -> F-9 \(related\)/)
  assert.match(await invoke({ projectName: "project", filters: { tag: "urgent", state: "Closed" } }), /Status: blocked/)
  assert.match(await invoke({ projectName: "../project", filters: { id: "F-1" } }), /Status: blocked/)
  assert.match(await invoke({ projectName: "linked", filters: { id: "F-EVIL" } }), /Status: blocked/)
  assert.match(await invoke({ projectName: "project", filters: {} }), /Status: blocked/)
  assert.match(await invoke({ projectName: "project", filters: { unsupported: "x" } }), /Status: blocked/)
  assert.match(await invoke({ projectName: "project", filters: { id: "   " } }), /Status: blocked/)
  assert.match(await invoke({ projectName: "project", filters: { id: 42 } }), /Status: blocked/)
  const complete = await invokeFixture("complete", { type: "Feature", tag: "ready", state: "Active", area: "Onboarding", iteration: "Sprint 6", text: "Welcome" })
  assert.doesNotMatch(complete, /US-C-002/)
  const incomplete = await invokeFixture("incomplete", { id: "F-I-001", type: "Feature", tag: "mapped", state: "Active" })
  assert.match(incomplete, /Coverage: .*\[source: local discovery; location: complete local search and unexecuted mapped ADO categories; classification: Fact; confidence: high; directness: direct\]/)
   for (const category of ["Work Item Search and Filtering", "Hierarchy and Relations", "Comments and History", "Wiki Search and Read"]) {
     assert.match(incomplete, new RegExp(`Required ${category} is not executed by this local-only tool`))
     assert.match(incomplete, new RegExp(`Risk: ${category} remains unexecuted`))
     assert.match(incomplete, new RegExp(`Question: What evidence from ${category} is needed to complete discovery\\? \\[source: none; location: ${category}; classification: Question; confidence: low; directness: direct; evidence_gap: local-only tool did not execute the required category\\]\\.`))
   }
   const conflicting = await invokeFixture("conflicting", { id: "F-X-001", type: "Feature", tag: "dependency", state: "Active" })
   assert.doesNotMatch(conflicting, /F-X-001 -> F-X-002 \(related\)/)
   assert.doesNotMatch(conflicting, /F-X-002 \(related\)/)
  console.log("bass-discovery-report behavioral contract passed")
} finally { rmSync(root, { recursive: true, force: true }) }
