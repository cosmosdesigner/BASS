import { strict as assert } from "node:assert"
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath, pathToFileURL } from "node:url"
import { execSync } from "node:child_process"

const pluginRoot = new URL(".", import.meta.url)
const root = mkdtempSync(join(tmpdir(), "bass-validate-ado-"))
const map = `# ADO Read Capabilities

## Wiki
tool_name: ado_wiki_read
supported_input: wiki_url
verified_read_only: true
verification_date: 2026-08-13

## Work Item
tool_name: ado_work_item_read
supported_input: work_item_id
verified_read_only: true
verification_date: 2026-08-13

## Relations
tool_name:
supported_input: relation_reference
verified_read_only: true
verification_date: 2026-08-13

## History/comments
tool_name: ado_history_read
supported_input: work_item_id
verified_read_only: true
verification_date: 2026-08-13
`
function write(path, contents) { mkdirSync(join(path, ".."), { recursive: true }); writeFileSync(path, contents) }
async function load(file) { const module = await import(`${pathToFileURL(file).href}?${Math.random()}`); return module.validateAdoReadCapabilities }

try {
  const shim = join(root, "node_modules", "@opencode-ai", "plugin")
  mkdirSync(shim, { recursive: true })
  write(join(shim, "package.json"), '{"type":"module","exports":"./index.js"}')
  write(join(shim, "index.js"), 'export const tool = (definition) => definition; tool.schema = { string: () => ({ optional: () => ({}) }) };')
  const project = join(root, "project")
  write(join(project, "project-context", "ado-read-capabilities.md"), map)
  const runtime = join(root, "runtime"); mkdirSync(runtime, { recursive: true })
  cpSync(fileURLToPath(new URL("bass-validate-ado-read-capabilities.js", pluginRoot)), join(runtime, "validator.js"))
  const compiled = join(root, "compiled"); mkdirSync(compiled, { recursive: true })
  try { execSync(`npx tsc --target ES2022 --module NodeNext --moduleResolution NodeNext --skipLibCheck --noEmitOnError false --outDir "${compiled}" "${fileURLToPath(new URL("bass-validate-ado-read-capabilities.ts", pluginRoot))}"`, { stdio: "pipe" }) } catch {}
  const js = await load(join(runtime, "validator.js")); const tsModule = await import(`${pathToFileURL(join(compiled, "bass-validate-ado-read-capabilities.js")).href}?${Math.random()}`); const ts = tsModule.validateAdoReadCapabilities
  const brief = "- Expected source: ADO Work Item (42). Reason: unavailable.\n- Expected source: ADO relations (42). Reason: unavailable.\n- Expected source: ADO history (42). Reason: unavailable."
  const jsResult = js({ projectDirectory: project, brief }); const tsResult = ts({ projectDirectory: project, brief })
  assert.deepEqual(tsResult, jsResult, "TS and JS validator results must match")
  assert.equal(jsResult.permissionFragment, '"ado_*": deny\n"ado_wiki_read": allow\n"ado_work_item_read": allow\n"ado_history_read": allow')
  assert.deepEqual(jsResult.dispatch, [{ category: "ADO Work Item", tool_name: "ado_work_item_read", input: "42" }, { category: "ADO history", tool_name: "ado_history_read", input: "42" }])
  assert.deepEqual(jsResult.unmappedGaps, ["ADO relations (42)"], "a linked Work Item keeps unmapped relations explicit")
  write(join(project, "project-context", "ado-read-capabilities.md"), map.replace("verified_read_only: true", "verified_read_only: false"))
  const malformed = js({ projectDirectory: project, brief })
  assert.equal(malformed.permissionFragment, '"ado_*": deny\n"ado_work_item_read": allow\n"ado_history_read": allow', "an unverified Wiki entry must not invalidate independent mappings")
  assert.equal(malformed.mappings.Wiki.valid, false)
  assert.equal(malformed.mappings["History/comments"].valid, true, "final History/comments section must parse")
  for (const unsafeName of ["ado_*", "ado read", '"ado_read"', "ado/read", "ado_read: allow", "tool\nextra"]) {
    write(join(project, "project-context", "ado-read-capabilities.md"), map.replace("ado_wiki_read", unsafeName))
    const unsafeJs = js({ projectDirectory: project, brief }); const unsafeTs = ts({ projectDirectory: project, brief })
    assert.deepEqual(unsafeTs, unsafeJs, `TS and JS must reject ${JSON.stringify(unsafeName)} identically`)
    assert.equal(unsafeJs.mappings.Wiki.valid, false, `unsafe tool name ${JSON.stringify(unsafeName)} must be rejected`)
    assert.doesNotMatch(unsafeJs.permissionFragment, new RegExp(`"${unsafeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}": allow`), `unsafe tool name ${JSON.stringify(unsafeName)} must not enter permissions`)
  }
  write(join(project, "project-context", "ado-read-capabilities.md"), map)
  const wrapperSource = readFileSync(fileURLToPath(new URL("bass-validate-ado-read-capabilities.ts", pluginRoot)), "utf8").replace('from "node:fs"', 'from "node:fs"')
  writeFileSync(join(compiled, "wrapper.ts"), wrapperSource)
  try { execSync(`npx tsc --target ES2022 --module NodeNext --moduleResolution NodeNext --skipLibCheck --noEmitOnError false --outDir "${compiled}" "${join(compiled, "wrapper.ts")}"`, { stdio: "pipe" }) } catch {}
  const wrapper = await import(`${pathToFileURL(join(compiled, "wrapper.js")).href}?${Math.random()}`)
  const plugin = await wrapper.BassValidateAdoReadCapabilitiesPlugin()
  const output = await plugin.tool.bass_validate_ado_read_capabilities.execute({ projectDirectory: project, brief })
  assert.equal(typeof output, "string", "OpenCode adapter output must be a string")
  assert.deepEqual(JSON.parse(output), jsResult)
  const jsPlugin = await (await import(`${pathToFileURL(join(runtime, "validator.js")).href}?${Math.random()}`)).BassValidateAdoReadCapabilitiesPlugin()
  const jsOutput = await jsPlugin.tool.bass_validate_ado_read_capabilities.execute({ projectDirectory: project, brief })
  assert.equal(typeof jsOutput, "string", "JavaScript OpenCode adapter output must be a string")
  assert.deepEqual(JSON.parse(jsOutput), jsResult)
  console.log("bass-validate-ado-read-capabilities behavioral contract passed")
} finally { rmSync(root, { recursive: true, force: true }) }
