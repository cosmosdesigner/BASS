import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { createHmac } from "node:crypto"
import { createRequire } from "node:module"
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { pathToFileURL } from "node:url"

const require = createRequire(import.meta.url)
const { initProject, normalizeInitProjectInput } = require("./bass-init-project.js")
const { projectStatus } = require("./bass-project-status.js")
const { routeWorkflow } = require("./bass-route-workflow.js")

const pending = []
function test(name, run) {
  pending.push(Promise.resolve().then(run).then(() => console.log(`PASS ${name}`), (error) => { console.error(`FAIL ${name}\n${error.stack}`); process.exitCode = 1 }))
}

const signingKey = "p0-source-test-key"
process.env.BASS_TOKEN_SIGNING_KEY = signingKey
function attestation(workflow, target, status = "ready", expiresAt = "2099-01-01T00:00:00.000Z") {
  const payload = { workflow, target, status, expiresAt }
  return { ...payload, integrity: createHmac("sha256", signingKey).update(JSON.stringify(payload)).digest("hex") }
}

function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "bass-p0-"))
  fs.mkdirSync(path.join(directory, "BASS"), { recursive: true })
  return directory
}

function cleanup(directory) { fs.rmSync(directory, { recursive: true, force: true }) }

test("P0 init tool boundary normalizes omitted Wiki URLs", () => {
  const directory = fixture()
  try {
    const input = normalizeInitProjectInput({ projectName: "agentlab", projectTitle: "agentlab" }, directory)
    assert.equal(input.functionalWikiUrl, "")
    assert.equal(input.technicalWikiUrl, "")
    const result = initProject(input)
    assert.equal(result.status, "warning")
    assert.equal(result.projectName, "agentlab")
    assert.ok(fs.existsSync(path.join(directory, "BASS/projects")))
    assert.equal(result.gaps.length, 2)
    assert.ok(result.gaps.every((gap) => gap.classification === "Question"))
    assert.ok(fs.existsSync(path.join(directory, "BASS/projects/agentlab/project-context/context-registry.md")))
  } finally { cleanup(directory) }
})

test("P0 init creates a clean project instead of cloning demo evidence", () => {
  const directory = fixture()
  try {
    const result = initProject({ directory, projectName: "account-recovery", projectTitle: "Account Recovery" })
    assert.equal(result.status, "warning")
    assert.ok(fs.existsSync(path.join(directory, "BASS/projects/account-recovery/features")))
    assert.ok(fs.existsSync(path.join(directory, "BASS/projects/account-recovery/ideas")))
    assert.ok(fs.existsSync(path.join(directory, "BASS/projects/account-recovery/project-context/context-registry.md")))
    const evidenceRegister = fs.readFileSync(path.join(directory, "BASS/projects/account-recovery/evidence-register.md"), "utf8")
    assert.match(evidenceRegister, /provenance:\n  classification: Fact\n  sources: \[\]/)
    assert.match(evidenceRegister, /## Changelog/)
    assert.doesNotMatch(fs.readFileSync(path.join(directory, "BASS/projects/account-recovery/project-context/context-registry.md"), "utf8"), /example-org|demo-customer-onboarding/)
    assert.equal(result.gaps.length, 2)
  } finally { cleanup(directory) }
})

test("P0 init accepts verified-shape ADO Wiki URLs and refuses overwrite", () => {
  const directory = fixture()
  try {
    const input = { directory, projectName: "account-recovery", functionalWikiUrl: "https://dev.azure.com/acme/recovery/_wiki/wikis/functional", technicalWikiUrl: "https://dev.azure.com/acme/recovery/_wiki/wikis/technical" }
    assert.equal(initProject(input).status, "ready")
    assert.equal(initProject(input).error.code, "project_exists")
  } finally { cleanup(directory) }
})

test("P0 status is deterministic local health and never claims live ADO connectivity", () => {
  const directory = fixture()
  try {
    initProject({ directory, projectName: "account-recovery" })
    const status = projectStatus({ directory, projectName: "account-recovery" })
    assert.equal(status.projectName, "account-recovery")
    assert.equal(status.ado.liveConnectivity, "unknown")
    assert.deepEqual(status.artifacts, { ideas: 0, features: 0, userStories: 0, proposals: 0, total: 0 })
    assert.match(status.nextAction, /Configure/i)
  } finally { cleanup(directory) }
})

test("P0 OpenCode adapters serialize init and status envelopes", async () => {
  const directory = fixture()
  try {
    const output = fs.mkdtempSync(path.join(os.tmpdir(), "bass-p0-ts-"))
    const shimRoot = path.join(output, "node_modules", "@opencode-ai", "plugin")
    mkdirSync(shimRoot, { recursive: true })
    writeFileSync(path.join(shimRoot, "index.js"), `module.exports = require(${JSON.stringify(path.join(process.cwd(), "support", "test-support", "d9", "opencode-plugin-runtime-stub.cjs"))})`, "utf8")
    const source = path.join(output, "source")
    mkdirSync(source, { recursive: true })
    const files = [["bass-init-project", "init-wrapper"], ["bass-project-status", "status-wrapper"], ["bass-compose-response", "compose-wrapper"]]
    for (const [runtime, wrapper] of files) {
      const original = fs.readFileSync(path.join(process.cwd(), "adapters", "opencode", "plugins", `${runtime}.ts`), "utf8")
      const runtimePath = path.join(process.cwd(), "adapters", "opencode", "plugins", `${runtime}.js`).replace(/\\/g, "\\\\")
      writeFileSync(path.join(source, `${wrapper}.ts`), original.replace(`require("./${runtime}.js")`, `require("${runtimePath}")`), "utf8")
    }
    const args = ["--module", "node16", "--target", "es2022", "--moduleResolution", "node16", "--skipLibCheck", "--outDir", output, ...files.map(([, wrapper]) => path.join(source, `${wrapper}.ts`)), path.join(process.cwd(), "support", "test-support", "d9", "opencode-plugin-shim.d.ts")]
    const compile = process.platform === "win32" ? spawnSync(process.env.ComSpec, ["/d", "/s", "/c", `tsc ${args.join(" ")}`], { encoding: "utf8" }) : spawnSync("tsc", args, { encoding: "utf8" })
    assert.equal(compile.status, 0, compile.stderr || compile.stdout)
    const initWrapper = await import(pathToFileURL(path.join(output, "init-wrapper.js")).href)
    const statusWrapper = await import(pathToFileURL(path.join(output, "status-wrapper.js")).href)
    const composeWrapper = await import(pathToFileURL(path.join(output, "compose-wrapper.js")).href)
    const initPlugin = await initWrapper.BassInitProjectPlugin()
    const initialized = await initPlugin.tool.bass_init_project.execute({ projectName: "agentlab" }, { directory })
    assert.equal(typeof initialized, "string")
    assert.equal(JSON.parse(initialized).status, "warning")

    const statusPlugin = await statusWrapper.BassProjectStatusPlugin()
    const status = await statusPlugin.tool.bass_project_status.execute({ projectName: "agentlab" }, { directory })
    assert.equal(typeof status, "string")
    assert.equal(JSON.parse(status).projectName, "agentlab")

    const composePlugin = await composeWrapper.BassComposeResponsePlugin()
    const composed = await composePlugin.tool.bass_compose_response.execute({ workflowResult: JSON.parse(initialized) })
    assert.equal(typeof composed, "string")
    assert.match(JSON.parse(composed).markdown, /## Status/)
  } finally { cleanup(directory) }
})

test("natural language treats artifact nouns as context rather than accidental Create intent", () => {
  const route = routeWorkflow({ request: "Explain this Feature", context: { target: "F-001", contextStatus: "ready" } })
  assert.equal(route.status, "ready")
  assert.equal(route.workflow, "Understand")
})

test("natural language routes brainstorm and challenge to existing specialists", () => {
  const brainstorm = routeWorkflow({ request: "Help me brainstorm alternatives for onboarding", context: { contextStatus: "partial" } })
  const challenge = routeWorkflow({ request: "Challenge this requirement", context: { target: "US-001", contextStatus: "ready" } })
  assert.equal(brainstorm.workflow, "Brainstorm")
  assert.deepEqual(brainstorm.specialistRoute, ["Reader", "Explorer", "Creator"])
  assert.equal(brainstorm.status, "warning")
  assert.equal(challenge.workflow, "Challenge")
  assert.deepEqual(challenge.specialistRoute, ["Reviewer"])
})

test("natural language can identify a requirement-creation goal without slash-command vocabulary", () => {
  const route = routeWorkflow({ request: "We need customers to be able to request a password reset link", context: { contextStatus: "ready" } })
  assert.equal(route.workflow, "Create")
  assert.equal(route.status, "clarification_required")
  assert.match(route.clarification, /canonical item ID|artifact path/i)
})

test("P0 source-level happy path reaches every canonical gate without bypassing approval or confirmation", () => {
  const init = routeWorkflow({ command: "/bass init", context: { projectName: "account-recovery" } })
  const status = routeWorkflow({ command: "/bass status", context: {} })
  const brainstorm = routeWorkflow({ command: "/bass brainstorm", context: { contextStatus: "ready" } })
  const create = routeWorkflow({ command: "/bass create-feature", context: { target: "F-001", contextStatus: "ready", attestations: [attestation("Create", "F-001", "approval_required")] } })
  const review = routeWorkflow({ command: "/bass review", context: { target: "F-001", contextStatus: "ready" } })
  const challenge = routeWorkflow({ command: "/bass challenge", context: { target: "F-001", contextStatus: "ready" } })
  const improve = routeWorkflow({ command: "/bass improve", context: { target: "F-001", contextStatus: "ready", attestations: [attestation("Improve", "F-001", "approved")] } })
  const syncPending = routeWorkflow({ command: "/bass sync-ado", context: { target: "F-001", contextStatus: "ready", attestations: [attestation("Sync/Execute ADO", "F-001", "confirmation_required")] } })
  const syncConfirmed = routeWorkflow({ command: "/bass sync-ado", context: { target: "F-001", contextStatus: "ready", attestations: [attestation("Sync/Execute ADO", "F-001", "confirmed")] } })

  assert.equal(init.status, "ready")
  assert.equal(status.status, "ready")
  assert.equal(brainstorm.status, "ready")
  assert.equal(create.status, "awaiting_approval")
  assert.deepEqual(create.specialistRoute, ["Reader", "Explorer", "Creator"])
  assert.equal(review.status, "ready")
  assert.equal(challenge.status, "ready")
  assert.equal(improve.status, "ready")
  assert.deepEqual(improve.specialistRoute, ["Editor", "Reviewer"])
  assert.equal(syncPending.status, "awaiting_confirmation")
  assert.deepEqual(syncPending.specialistRoute, [])
  assert.equal(syncConfirmed.status, "ready")
  assert.deepEqual(syncConfirmed.specialistRoute, ["Executor"])
})

await Promise.all(pending)
if (process.exitCode) process.exit(process.exitCode)
