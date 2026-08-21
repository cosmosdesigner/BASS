import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { strict as assert } from "node:assert"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath, pathToFileURL } from "node:url"
import { execSync } from "node:child_process"

const pluginRoot = new URL(".", import.meta.url)
const sourceRoot = new URL("../../../../", pluginRoot)
const fixturesRoot = fileURLToPath(new URL("../../../support/fixtures/d5-context", pluginRoot))
const root = mkdtempSync(join(tmpdir(), "bass-context-brief-"))

function write(path, contents) { mkdirSync(join(path, ".."), { recursive: true }); writeFileSync(path, contents) }
function frontmatter(id, title, classification = "Fact", sourceType = "local_file", extra = "") { return `---\nid: ${id}\ntitle: ${title}\n${extra}provenance:\n  classification: ${classification}\n  sources:\n    - type: ${sourceType}\n      reference: source/${id}\n      location: ${id} location\n  confidence: high\n---\n` }
function feature(project, directory, id, title, related = "", ado = "") { write(join(project, "features", directory, "feature.md"), `${frontmatter(id, title, "Fact", "local_file", ado)}\n# Feature: ${title}\n\n## Objective\n\n${title} objective.\n\n## Related Evidence and Decisions\n\n${related}`) }
function setupProject(project) {
  write(join(project, "project-context", "context-registry.md"), `${frontmatter("REG-1", "Registry")}\n# Context Registry\n`)
  write(join(project, "project-context", "functional", "functional-context.md"), `${frontmatter("CTX-F", "Functional")}\n# Functional Context\n\n## Purpose\n\nFunctional state.\n`)
  write(join(project, "project-context", "technical", "technical-context.md"), `${frontmatter("CTX-T", "Technical")}\n# Technical Context\n\n## Purpose\n\nTechnical state.\n`)
  return project
}

async function load(file) {
  const module = await import(`${pathToFileURL(file).href}?${Math.random()}`)
  const plugin = await module.BassContextBriefPlugin({})
  return plugin.tool.bass_context_brief.execute
}

try {
  const shim = join(root, "node_modules", "@opencode-ai", "plugin")
  mkdirSync(shim, { recursive: true })
  write(join(shim, "package.json"), '{"type":"module","exports":"./index.js"}')
  write(join(shim, "index.js"), 'export const tool = (definition) => definition; tool.schema = { string: () => ({ optional: () => ({}) }) };')
  const host = join(root, "host")
  const project = setupProject(join(host, "BASS", "projects", "project"))
  feature(project, "F-1-valid", "F-1", "Valid", "- [EVD-1](evidence.md)\n- [CON-1](conflict.md)")
  write(join(project, "features", "F-1-valid", "evidence.md"), `${frontmatter("EVD-1", "Evidence")}\n# Evidence\n\n## Summary\n\nDirect evidence.\n`)
  write(join(project, "features", "F-1-valid", "conflict.md"), `${frontmatter("CON-1", "Conflict", "Conflict")}\n# Conflict\n\n## Summary\n\nUnresolved conflict.\n`)
  feature(project, "F-2-indirect", "F-2", "Indirect", "- [EVD-2](evidence.md)")
  write(join(project, "features", "F-2-indirect", "evidence.md"), `${frontmatter("EVD-2", "Direct")}\n# Evidence\n\n## Summary\n\nDirect only.\n\n## Related Items\n\n- [EVD-3](indirect.md)\n`)
  write(join(project, "features", "F-2-indirect", "indirect.md"), `${frontmatter("EVD-3", "Indirect")}\n# Evidence\n\n## Summary\n\nMust not load.\n`)
  feature(project, "not-a-feature", "F-BAD", "Ignored")
  feature(project, "F-3-one", "F-3", "Duplicate")
  feature(project, "F-4-two", "F-4", "Duplicate")
  const outside = join(root, "outside")
  mkdirSync(outside, { recursive: true })
  write(join(outside, "feature.md"), `${frontmatter("F-LINK", "Linked")}\n# Feature\n`)
  symlinkSync(outside, join(project, "features", "F-99-linked"), "junction")

  const runtime = join(root, "runtime")
  mkdirSync(runtime, { recursive: true })
  cpSync(fileURLToPath(new URL("bass-context-brief.js", pluginRoot)), join(runtime, "bass-context-brief.js"))
  const compiled = join(root, "compiled", "bass-context-brief.js")
  mkdirSync(join(compiled, ".."), { recursive: true })
  try { execSync(`npx tsc --target ES2022 --module NodeNext --moduleResolution NodeNext --skipLibCheck --noEmitOnError false --outDir "${join(root, "compiled")}" "${fileURLToPath(new URL("bass-context-brief.ts", pluginRoot))}"`, { cwd: fileURLToPath(sourceRoot), stdio: "pipe" }) } catch { /* Type declarations belong to the target OpenCode host; tsc still emits the validated JS form. */ }
  const jsExecute = await load(join(runtime, "bass-context-brief.js"))
  const tsExecute = await load(compiled)
  const invoke = async (args) => {
    const js = await jsExecute(args, { directory: host })
    const ts = await tsExecute(args, { directory: host })
    assert.equal(ts, js, `TS and JS output differ for ${JSON.stringify(args)}`)
    return js
  }
  const invokeFixture = async (fixture, target) => {
    const fixtureHost = join(root, `fixture-${fixture}`)
    cpSync(join(fixturesRoot, fixture), join(fixtureHost, "BASS", "projects", fixture), { recursive: true })
    const js = await jsExecute({ projectName: fixture, target }, { directory: fixtureHost })
    const ts = await tsExecute({ projectName: fixture, target }, { directory: fixtureHost })
    assert.equal(ts, js, `TS and JS fixture output differ for ${fixture}`)
    assert.equal(js, readFileSync(join(fixturesRoot, `expected-${fixture}-context-brief.md`), "utf8").trim(), `fixture output differs for ${fixture}`)
    return js
  }

  const valid = await invoke({ projectName: "project", target: "F-1" })
  assert.match(valid, /Status: warning/)
  assert.match(valid, /classification: Fact; confidence: high/)
  assert.match(valid, /classification: Conflict; confidence: high/)
  assert.doesNotMatch(valid, /Expected source: ADO Work Item/)
  feature(project, "F-5-local", "F-5", "Local only")
  const localOnly = await invoke({ projectName: "project", target: "F-5" })
  assert.match(localOnly, /Status: ready/)
  assert.doesNotMatch(localOnly, /Expected source:/)
  feature(project, "F-6-work-item", "F-6", "Missing work item", "", "ado_work_item_id: 42\n")
  const missingWorkItem = await invoke({ projectName: "project", target: "F-6" })
  assert.match(missingWorkItem, /Status: warning/)
  assert.match(missingWorkItem, /Expected source: ADO Work Item \(42\)/)
  assert.match(missingWorkItem, /Expected source: ADO relations \(42\)/)
  assert.match(missingWorkItem, /Expected source: ADO history \(42\)/)
  feature(project, "F-6-null", "F-6-null", "Null work item", "", "ado_work_item_id: null\nado_work_item_url: ''\n")
  const nullWorkItem = await invoke({ projectName: "project", target: "F-6-null" })
  assert.match(nullWorkItem, /Status: ready/)
  assert.doesNotMatch(nullWorkItem, /Expected source: ADO Work Item/)
  feature(project, "F-6-false", "F-6-false", "False work item", "", "ado_work_item_id: false\nado_work_item_url: false\n")
  const falseWorkItem = await invoke({ projectName: "project", target: "F-6-false" })
  assert.match(falseWorkItem, /Status: ready/)
  assert.doesNotMatch(falseWorkItem, /Expected source: ADO Work Item/)
  feature(project, "F-6-both", "F-6-both", "Both work item references", "", "ado_work_item_id: 43\nado_work_item_url: https://example.test/work-items/43\n")
  assert.match(await invoke({ projectName: "project", target: "F-6-both" }), /Expected source: ADO Work Item \(https:\/\/example.test\/work-items\/43; 43\)/)
  write(join(project, "features", "F-7-wiki", "feature.md"), `${frontmatter("F-7", "Wiki", "Fact", "ado_wiki")}\n# Feature: Wiki\n\n## Objective\n\nWiki objective.\n`)
  assert.match(await invoke({ projectName: "project", target: "F-7" }), /Expected source: Functional ADO Wiki \(source\/F-7\)/)
  write(join(project, "features", "F-8-comment", "feature.md"), `${frontmatter("F-8", "Comment", "Fact", "ado_comment")}\n# Feature: Comment\n\n## Objective\n\nComment objective.\n`)
  assert.match(await invoke({ projectName: "project", target: "F-8" }), /Expected source: ADO history \(source\/F-8\)/)
  write(join(project, "features", "F-10-multiple", "feature.md"), `${frontmatter("F-10", "Multiple", "Fact", "local_file").replace("  confidence: high", "    - type: ado_work_item\n      reference: work-item/10\n      location: Item 10\n    - type: ado_comment\n      reference: comment/10\n      location: Comment 10\n  confidence: high")}\n# Feature: Multiple\n\n## Objective\n\nMultiple objective.\n`)
  const multiple = await invoke({ projectName: "project", target: "F-10" })
  assert.match(multiple, /Expected source: ADO Work Item \(work-item\/10\)/)
  assert.match(multiple, /Expected source: ADO history \(work-item\/10; comment\/10\)/)
  feature(project, "F-9-relation", "F-9", "Relation", "", "ado_relation_references:\n  - relation/123\n")
  assert.match(await invoke({ projectName: "project", target: "F-9" }), /Expected source: ADO relations \(relation\/123\)/)
  feature(project, "F-9-flow-relation", "F-9-flow", "Flow relation", "", "ado_relation_references: [relation/456]\n")
  assert.match(await invoke({ projectName: "project", target: "F-9-flow" }), /Expected source: ADO relations \(relation\/456\)/)
  write(join(project, "project-context", "context-registry.md"), `${frontmatter("REG-1", "Registry")}\n# Context Registry\n\n## Functional ADO Wiki\n\n- URL: \`https://dev.azure.com/contoso/project/_wiki/wikis/functional.wiki\`\n\n## Technical ADO Wiki\n\n- URL: \`https://dev.azure.com/contoso/project/_wiki/wikis/technical.wiki\`\n`)
  const registryWikis = await invoke({ projectName: "project", target: "F-5" })
  assert.match(registryWikis, /Expected source: Functional ADO Wiki \(https:\/\/dev.azure.com\/contoso\/project\/_wiki\/wikis\/functional.wiki\)/)
  assert.match(registryWikis, /Expected source: Technical ADO Wiki \(https:\/\/dev.azure.com\/contoso\/project\/_wiki\/wikis\/technical.wiki\)/)
  write(join(project, "project-context", "context-registry.md"), `${frontmatter("REG-1", "Registry")}\n# Context Registry\n\n## Functional ADO Wiki\n\n- URL: \`https://dev.azure.com/contoso/project/_wiki/wikis/one.wiki\`\n- URL: \`https://dev.azure.com/contoso/project/_wiki/wikis/two.wiki\`\n\n## Technical ADO Wiki\n\nIncidental URL https://dev.azure.com/contoso/project/_wiki/wikis/incidental.wiki\n`)
  const invalidRegistryWikis = await invoke({ projectName: "project", target: "F-5" })
  assert.doesNotMatch(invalidRegistryWikis, /Expected source: (Functional|Technical) ADO Wiki/, "duplicate and incidental registry URLs must not configure Wiki reads")
  assert.match(await invoke({ projectName: "../project", target: "F-1" }), /Status: blocked/)
  assert.match(await invoke({ projectName: "project", target: "Duplicate" }), /Status: blocked/)
  const indirect = await invoke({ projectName: "project", target: "F-2" })
  assert.match(indirect, /Direct only/)
  assert.doesNotMatch(indirect, /Must not load/)
  assert.match(await invoke({ projectName: "project", target: "F-LINK" }), /Status: blocked/)
  await invokeFixture("complete", "F-C-001")
  await invokeFixture("incomplete", "US-I-001")
  await invokeFixture("contradictory", "F-X-001")
  await invokeFixture("question", "F-Q-001")
  console.log("bass-context-brief behavioral contract passed")
} finally {
  rmSync(root, { recursive: true, force: true })
}
