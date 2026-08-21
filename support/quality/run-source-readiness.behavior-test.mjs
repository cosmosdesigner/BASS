import assert from "node:assert/strict";
import { existsSync, readFileSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));
const bassRoot = workspaceRoot;
const runner = fileURLToPath(new URL("./run-source-readiness.mjs", import.meta.url));
const expectedPath = fileURLToPath(new URL("./expected-source-readiness.json", import.meta.url));

assert.equal(existsSync(runner), true, "source readiness runner must exist");

const expected = JSON.parse(readFileSync(expectedPath, "utf8"));
assert.equal(expected.source_ready, "source_ready", "expected metadata must state the current portable readiness contract");
assert.equal(expected.target_ready, "pending", "expected metadata must retain the pending target-host contract");
assert.doesNotMatch(expected.reason, /have not yet been created/i, "expected metadata must not retain an obsolete missing-documentation claim");

const run = (cwd = workspaceRoot, env = process.env) => spawnSync(process.execPath, [runner], { cwd, encoding: "utf8", env });
const d1Artifact = join(workspaceRoot, "AGENTS.md");
const d1ArtifactMissing = `${d1Artifact}.source-readiness-test-missing`;
if (!existsSync(d1Artifact) && existsSync(d1ArtifactMissing)) renameSync(d1ArtifactMissing, d1Artifact);
for (const cwd of [workspaceRoot, bassRoot]) {
  const rootRun = run(cwd, { ...process.env, BASS_SOURCE_READINESS_SKIP_HARNESSES: "1" });
  const rootResult = JSON.parse(rootRun.stdout);
  assert.equal(rootResult.required_artifacts.find((result) => result.path === "AGENTS.md").status, "pass", `AGENTS.md must pass from ${cwd}`);
}
const baselineRun = run();
const baselineResult = JSON.parse(baselineRun.stdout);
assert.ok(Array.isArray(baselineResult.configuredHarnessIds));
assert.deepEqual(baselineResult.executedHarnesIds, baselineResult.configuredHarnessIds, "every configured harness must execute");
assert.equal(baselineResult.source_ready === "source_ready", baselineResult.harnesses.every((result) => result.status === "pass"), "source_ready is allowed only when every configured harness passes");
assert.ok(baselineResult.target_host_checks.length > 0);
for (const check of baselineResult.target_host_checks) {
  assert.ok(["pending", "skipped"].includes(check.status));
  assert.ok(check.reason);
  assert.ok(check.evidence_requirement);
}

renameSync(d1Artifact, d1ArtifactMissing);
try {
  const missingD1 = run();
  assert.notEqual(missingD1.status, 0, "missing D1 artifact must cause a nonzero runner exit");
  const missingD1Result = JSON.parse(missingD1.stdout);
  assert.equal(missingD1Result.required_artifacts.find((result) => result.path === "AGENTS.md").status, "blocked");
} finally {
  renameSync(d1ArtifactMissing, d1Artifact);
}

const harness = join(workspaceRoot, "integration", "opencode", "plugins", "bass-context-brief.behavior-test.mjs");
const missingHarness = `${harness}.source-readiness-test-missing`;
renameSync(harness, missingHarness);
try {
  const incompleteRun = run();
  assert.notEqual(incompleteRun.status, 0, "a missing configured harness must cause a nonzero runner exit");
  const incompleteResult = JSON.parse(incompleteRun.stdout);
  assert.equal(incompleteResult.source_ready, "blocked");
  assert.deepEqual(incompleteResult.executedHarnesIds, incompleteResult.configuredHarnessIds, "a failed execution must remain recorded under its configured harness ID");
  assert.equal(incompleteResult.harnesses.find((result) => result.id === "d5-context-brief").status, "fail");
  assert.ok(incompleteResult.harnesses.some((result) => result.status === "fail"), "source_ready must be blocked when any configured harness fails");
} finally {
  renameSync(missingHarness, harness);
}

const report = readFileSync(new URL("../reports/phase-1-source-readiness.md", import.meta.url), "utf8");
assert.match(report, /Source readiness: `blocked`/);
assert.match(report, /Target-host readiness: `pending`/);
assert.match(report, /Executed harness IDs/);
assert.match(report, /Target-Host Checks/);
assert.match(report, /current `source_ready` report.*before.*target-host ADO evidence.*evaluated or claimed/s);

console.log("bass source readiness behavior passed");
