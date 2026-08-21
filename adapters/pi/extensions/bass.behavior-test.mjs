import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = join(import.meta.dirname, "standalone");
const init = require(join(root, "bass-init-project.js"));
const status = require(join(root, "bass-project-status.js"));
const router = require(join(root, "bass-route-workflow.js"));
const compare = require(join(root, "bass-compare-ado-sync.js"));

const runtime = mkdtempSync(join(tmpdir(), "bass-pi-behavior-"));
try {
  mkdirSync(join(runtime, "BASS"), { recursive: true });
  const initialized = init.initProject({ directory: runtime, projectName: "customer-onboarding" });
  assert.equal(initialized.status, "warning");
  assert.equal(status.projectStatus({ directory: runtime, projectName: "customer-onboarding" }).projectName, "customer-onboarding");
  assert.equal(router.routeWorkflow({ command: "/bass status" }).workflow, "Status");
  assert.equal(router.routeWorkflow({ request: "create a user story" }).workflow, "Create");
  const conflicts = compare.compareAdoSync({ fields: ["title"], baseline: { title: "Old" }, local: { title: "Local" }, ado: { title: "ADO" } });
  assert.equal(conflicts.conflicts.length, 1);

  for (const file of readdirSync(root)) {
    if (file.endsWith(".js")) assert.doesNotMatch(readFileSync(join(root, file), "utf8"), /@opencode-ai|adapters\/opencode/);
  }
  console.log("Pi standalone behavior tests passed");
} finally {
  rmSync(runtime, { recursive: true, force: true });
}
