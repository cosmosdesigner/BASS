import assert from "node:assert/strict"
import { copyFileSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { spawnSync } from "node:child_process"
import { pathToFileURL } from "node:url"
import routeRuntime from "../../integration/opencode/plugins/bass-route-workflow.js"
import composeRuntime from "../../integration/opencode/plugins/bass-compose-response.js"
import nextRuntime from "../../integration/opencode/plugins/bass-recommend-next.js"

const root = process.cwd(), output = mkdtempSync(join(tmpdir(), "bass-d11-ts-plugin-")), shimRoot = join(output, "node_modules", "@opencode-ai", "plugin")
mkdirSync(shimRoot, { recursive: true })
writeFileSync(join(shimRoot, "index.js"), `module.exports = require(${JSON.stringify(join(root, "test-support", "d9", "opencode-plugin-runtime-stub.cjs"))});`, "utf8")
const names = [["bass-route-workflow", "BassRouteWorkflowPlugin", "bass_route_workflow"], ["bass-compose-response", "BassComposeResponsePlugin", "bass_compose_response"], ["bass-recommend-next", "BassRecommendNextPlugin", "bass_recommend_next"]]
const args = ["--module", "node16", "--target", "es2022", "--moduleResolution", "node16", "--skipLibCheck", "--outDir", output, ...names.map(([file]) => join(root, "integration", "opencode", "plugins", `${file}.ts`)), join(root, "test-support", "d9", "opencode-plugin-shim.d.ts")]
const compile = process.platform === "win32" ? spawnSync(process.env.ComSpec, ["/d", "/s", "/c", `tsc ${args.join(" ")}`], { encoding: "utf8" }) : spawnSync("tsc", args, { encoding: "utf8" })
assert.equal(compile.status, 0, compile.stderr || compile.stdout)
for (const [file] of names) copyFileSync(join(root, "integration", "opencode", "plugins", `${file}.js`), join(output, `${file}.js`))
const evidence = { type: "local_file", source: "context.md", location: "# Scope", classification: "Fact", confidence: "high", claim: "Scope is approved." }
const envelope = composeRuntime.composeResponse({ workflowResult: { status: "ready", workflow: "Review", result: evidence, evidence: [evidence], gaps: [], conflicts: [], nextAction: "Review findings." } })
const calls = [
  [routeRuntime.routeWorkflow, { command: "/bass understand", context: { target: "US-001", contextStatus: "ready" } }],
  [composeRuntime.composeResponse, { workflowResult: { status: "ready", workflow: "Review", result: evidence, evidence: [evidence], gaps: [], conflicts: [], nextAction: "Review findings." } }],
  [nextRuntime.recommendNext, { envelope }]
]
for (const [index, [file, exportName, toolName]] of names.entries()) {
  const wrapper = await import(pathToFileURL(join(output, `${file}.js`)).href), plugin = await wrapper[exportName]({ directory: output })
  assert.ok(plugin.tool[toolName]); assert.ok(plugin.tool[toolName].args)
  assert.deepEqual(await plugin.tool[toolName].execute(calls[index][1]), calls[index][0](calls[index][1]))
}
console.log("bass D11 TypeScript plugin load passed")
