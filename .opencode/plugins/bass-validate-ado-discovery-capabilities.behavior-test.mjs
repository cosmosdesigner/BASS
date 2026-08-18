import { strict as assert } from "node:assert"
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath, pathToFileURL } from "node:url"
import { execSync } from "node:child_process"

const pluginRoot = new URL(".", import.meta.url)
const root = mkdtempSync(join(tmpdir(), "bass-discovery-capabilities-"))
const templatePath = fileURLToPath(new URL("../../../templates/ado-discovery-capabilities-template.md", pluginRoot))
const map = readFileSync(templatePath, "utf8").replaceAll("verified_read_only: false", "verified_read_only: true").replaceAll("<YYYY-MM-DD>", "2026-08-12").replace("<exact_target_host_tool_name>\nsupported_input: <id_url_text_type_tag_state_area_or_iteration_filter>", "ado_work_item_search\nsupported_input: wiql").replace("<exact_target_host_tool_name>\nsupported_input: <work_item_id_or_relation_reference>", "ado_relation_read\nsupported_input: work_item_id").replace("<exact_target_host_tool_name>\nsupported_input: <work_item_id_or_comment_or_history_reference>", "ado_history_read\nsupported_input: work_item_id").replace("<exact_target_host_tool_name>\nsupported_input: <wiki_search_text_page_identifier_or_url>", "ado_wiki_read\nsupported_input: query").replace(/(## Wiki Search and Read[\s\S]*?verified_read_only:) true/, "$1 false")
const write = (path, contents) => { mkdirSync(join(path, ".."), { recursive: true }); writeFileSync(path, contents) }
try {
  const shim = join(root, "node_modules", "@opencode-ai", "plugin"); mkdirSync(shim, { recursive: true })
  write(join(shim, "package.json"), '{"type":"module","exports":"./index.js"}')
  write(join(shim, "index.js"), 'export const tool = (definition) => definition; tool.schema = { string: () => ({}), array: () => ({}) };')
  const project = join(root, "project"); write(join(project, "project-context", "ado-discovery-capabilities.md"), map)
  const runtime = join(root, "runtime"); mkdirSync(runtime, { recursive: true })
  cpSync(join(fileURLToPath(pluginRoot), "bass-validate-ado-discovery-capabilities.js"), join(runtime, "validator.js"))
  const module = await import(`${pathToFileURL(join(runtime, "validator.js")).href}?${Math.random()}`)
  const compiled = join(root, "compiled"); mkdirSync(compiled, { recursive: true })
  try { execSync(`npx tsc --target ES2022 --module NodeNext --moduleResolution NodeNext --skipLibCheck --noEmitOnError false --outDir "${compiled}" "${join(fileURLToPath(pluginRoot), "bass-validate-ado-discovery-capabilities.ts")}"`, { stdio: "pipe" }) } catch { /* Target OpenCode supplies plugin and Node declarations; tsc still emits JS. */ }
  const tsModule = await import(`${pathToFileURL(join(compiled, "bass-validate-ado-discovery-capabilities.js")).href}?${Math.random()}`)
  const required = ["Work Item Search and Filtering", "Hierarchy and Relations", "Wiki Search and Read"]
  const result = module.validateAdoDiscoveryCapabilities({ projectDirectory: project, requiredCategories: required })
  assert.deepEqual(tsModule.validateAdoDiscoveryCapabilities({ projectDirectory: project, requiredCategories: required }), result, "TS and JS validator results must match")
  assert.equal(result.permissionFragment, '"ado_*": deny\n"ado_work_item_search": allow\n"ado_relation_read": allow\n"ado_history_read": allow')
  assert.deepEqual(result.dispatch, [{ category: "Work Item Search and Filtering", tool_name: "ado_work_item_search" }, { category: "Hierarchy and Relations", tool_name: "ado_relation_read" }])
  assert.deepEqual(result.unmappedGaps, ["Wiki Search and Read"])
  write(join(project, "project-context", "ado-discovery-capabilities.md"), map.replace("ado_wiki_read", "ado_*"))
  const unsafe = module.validateAdoDiscoveryCapabilities({ projectDirectory: project, requiredCategories: ["Wiki Search and Read"] })
  assert.deepEqual(tsModule.validateAdoDiscoveryCapabilities({ projectDirectory: project, requiredCategories: ["Wiki Search and Read"] }), unsafe, "TS and JS must reject unsafe tool names identically")
  assert.equal(unsafe.mappings["Wiki Search and Read"].valid, false)
  assert.doesNotMatch(unsafe.permissionFragment, /ado_\*": allow/)
  write(join(project, "project-context", "ado-discovery-capabilities.md"), map.replace("2026-08-12", "2026-99-99"))
  const impossibleDate = module.validateAdoDiscoveryCapabilities({ projectDirectory: project, requiredCategories: ["Work Item Search and Filtering"] })
  assert.equal(impossibleDate.mappings["Work Item Search and Filtering"].valid, false, "an impossible verification date must not authorize a tool")
  console.log("bass-validate-ado-discovery-capabilities behavioral contract passed")
} finally { rmSync(root, { recursive: true, force: true }) }
