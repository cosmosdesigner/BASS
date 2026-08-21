import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const bassRoot = fileURLToPath(new URL("../..", import.meta.url));
const workspaceRoot = bassRoot;
const resolveWorkspacePath = (path) => join(workspaceRoot, path);
const expectedPath = join(bassRoot, "support", "quality", "expected-source-readiness.json");
const reportPath = join(bassRoot, "support", "reports", "phase-1-source-readiness.md");
const expected = JSON.parse(readFileSync(expectedPath, "utf8"));

const harnesses = [
  ["P0 project initialization and routing", "integration/opencode/plugins/bass-p0.behavior-test.mjs"],
  ["D5 context brief", "integration/opencode/plugins/bass-context-brief.behavior-test.mjs"],
  ["D5 read capability validation", "integration/opencode/plugins/bass-validate-ado-read-capabilities.behavior-test.mjs"],
  ["D5 reader boundary", "integration/opencode/plugins/bass-reader-contract.behavior-test.mjs"],
  ["D6 discovery", "integration/opencode/plugins/bass-discovery-report.behavior-test.mjs"],
  ["D7 creator preview", "integration/opencode/plugins/bass-creator-preview.behavior-test.mjs"],
  ["D7 approved persistence", "integration/opencode/plugins/bass-persist-approved-artifact.behavior-test.mjs"],
  ["D8 review", "integration/opencode/plugins/bass-review-artifact.behavior-test.mjs"],
  ["D8 improvement", "integration/opencode/plugins/bass-improve-artifact.behavior-test.mjs"],
  ["D8 approved improvement persistence", "integration/opencode/plugins/bass-persist-approved-improvement.behavior-test.mjs"],
  ["D8 fixture snapshots", "integration/opencode/plugins/bass-d8-fixtures.behavior-test.mjs"],
  ["D8 regressions", "integration/opencode/plugins/bass-d8-p1-p2.behavior-test.mjs"],
  ["D9 executor", "integration/opencode/plugins/bass-ado-executor.behavior-test.mjs"],
  ["D9 core findings", "integration/opencode/plugins/bass-ado-executor-core-findings.red-test.mjs"],
  ["D9 recovery", "integration/opencode/plugins/bass-ado-executor-recovery.red-test.mjs"],
  ["D9 journal", "integration/opencode/plugins/bass-ado-executor-journal.red-test.mjs"],
  ["D9 journal P1", "integration/opencode/plugins/bass-ado-executor-journal-p1.red-test.mjs"],
  ["D9 journal durability", "integration/opencode/plugins/bass-ado-executor-journal-durability.red-test.mjs"],
  ["D9 journal cleanup", "integration/opencode/plugins/bass-ado-executor-journal-cleanup.red-test.mjs"],
  ["D9 read capability validation", "integration/opencode/plugins/bass-validate-ado-read-capabilities.behavior-test.mjs"],
  ["D9 discovery capability validation", "integration/opencode/plugins/bass-validate-ado-discovery-capabilities.behavior-test.mjs"],
  ["D9 TypeScript wrapper load", "support/test-support/d9/ts-wrapper-load-regression.mjs"],
  ["D10 technical delivery", "integration/opencode/plugins/bass-technical-delivery.behavior-test.mjs"],
  ["D10 fixture harness", "support/test-support/d10/technical-delivery-fixture-harness.mjs"],
  ["D11 orchestration", "integration/opencode/plugins/bass-orchestration.behavior-test.mjs"],
  ["D11 fixture harness", "support/test-support/d11/orchestration-fixture-harness.mjs"],
  ["D11 TypeScript plugin load", "support/test-support/d11/orchestration-ts-plugin-load.mjs"]
].map(([name, path]) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), name, path }));

const reports = [
  "support/reports/task-4-d5-acceptance-verification.md",
  "support/reports/task-1-d6-explorer-discovery.md",
  "support/reports/task-4-d7-acceptance-verification.md",
  "support/reports/task-4-d8-acceptance-verification.md",
  "support/reports/task-4-d9-acceptance-verification.md",
  "support/reports/task-4-d10-acceptance-verification.md",
  "support/reports/task-4-d11-acceptance-verification.md"
];

const runHarness = ({ id, name, path }) => {
  try {
    const output = execFileSync(process.execPath, [path], { cwd: workspaceRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    return { id, name, path, status: "pass", output };
  } catch (error) {
    return { id, name, path, status: "fail", output: `${error.stdout || ""}${error.stderr || error.message}`.trim() };
  }
};

const configuredHarnessIds = harnesses.map((harness) => harness.id);
const harnessResults = harnesses.map(runHarness);
const executedHarnesIds = harnessResults.map((result) => result.id);
const allConfiguredHarnessesExecuted = configuredHarnessIds.length === executedHarnesIds.length && configuredHarnessIds.every((id, index) => executedHarnesIds[index] === id);
const requiredArtifactResults = expected.requiredArtifacts.map((path) => ({ path, status: existsSync(resolveWorkspacePath(path)) ? "pass" : "blocked" }));
const reportResults = reports.map((path) => ({ path, status: existsSync(resolveWorkspacePath(path)) ? "pass" : "fail" }));
const documentationResults = expected.requiredDocumentation.map((path) => ({ path, status: existsSync(resolveWorkspacePath(path)) ? "pass" : "blocked" }));
const targetHostChecks = expected.targetHostChecks.map(([id, status, reason, evidence_requirement]) => ({ id, status, reason, evidence_requirement }));
const failedHarnesses = harnessResults.filter((result) => result.status === "fail");
const missingRequiredArtifacts = requiredArtifactResults.filter((result) => result.status === "blocked");
const missingReports = reportResults.filter((result) => result.status === "fail");
const missingDocumentation = documentationResults.filter((result) => result.status === "blocked");
const sourceReady = allConfiguredHarnessesExecuted && failedHarnesses.length === 0 && missingRequiredArtifacts.length === 0 && missingReports.length === 0 && missingDocumentation.length === 0;
const sourceStatus = sourceReady ? "source_ready" : "blocked";
const checkLine = (result) => `| ${result.name || "Required artifact"} | \`${result.path}\` | ${result.status} |`;
const report = [
  "# Phase 1 Source Readiness",
  "",
  "## Outcome",
  "",
  `- Source readiness: \`${sourceStatus}\``,
  "- Target-host readiness: `pending`",
  `- Classification: ${expected.classification}`,
  "- Confidence: High for local checks; no target-host evidence assessed.",
  "",
  "`target_ready` is not evaluated by this runner. A current `source_ready` report is required before separately recorded isolated target-host ADO evidence may be evaluated or claimed.",
  "",
  "## Source Harnesses",
  "",
  `Configured harness IDs: ${configuredHarnessIds.map((id) => `\`${id}\``).join(", ")}`,
  "",
  `Executed harness IDs: ${executedHarnesIds.map((id) => `\`${id}\``).join(", ")}`,
  "",
  "| Check | Source | Result |",
  "| --- | --- | --- |",
  ...harnessResults.map(checkLine),
  "",
  "## Required D1-D4 Artifacts",
  "",
  "| Check | Source | Result |",
  "| --- | --- | --- |",
  ...requiredArtifactResults.map(checkLine),
  "",
  "## Required Prior Reports",
  "",
  "| Check | Source | Result |",
  "| --- | --- | --- |",
  ...reportResults.map(checkLine),
  "",
  "## Documentation And Demo Paths",
  "",
  "Missing Task 3 artifacts are portable readiness blockers, not test-runner errors. They are checked without attempting host, network, Azure DevOps, or Git access.",
  "",
  "| Check | Source | Result |",
  "| --- | --- | --- |",
  ...documentationResults.map(checkLine),
  "",
  "## Target-Host Checks",
  "",
  "Every target-host matrix check is declarative and remains pending until recorded isolated target-host evidence exists.",
  "",
  "| Matrix check | Status | Reason | Evidence requirement |",
  "| --- | --- | --- | --- |",
  ...targetHostChecks.map((check) => `| ${check.id} | ${check.status} | ${check.reason} | ${check.evidence_requirement} |`),
  "",
  "## Evidence Gaps",
  "",
  ...(failedHarnesses.length ? failedHarnesses.map((result) => `- Failed local harness: \`${result.path}\`.`) : ["- No local harness failures."]),
  ...(allConfiguredHarnessesExecuted ? ["- Every configured D5-D11 harness ID executed."] : ["- Not every configured D5-D11 harness ID executed."]),
  ...(missingRequiredArtifacts.length ? missingRequiredArtifacts.map((result) => `- Missing required D1-D4 artifact: \`${result.path}\`.`) : ["- All required D1-D4 artifacts exist."]),
  ...(missingReports.length ? missingReports.map((result) => `- Missing prior acceptance report: \`${result.path}\`.`) : ["- All configured prior acceptance reports exist."]),
  ...(missingDocumentation.length ? missingDocumentation.map((result) => `- Missing required documentation or demo: \`${result.path}\`.`) : ["- All configured documentation and demo paths exist."]),
  "- Target-host ADO validation evidence is unavailable and remains pending."
].join("\n") + "\n";

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report, "utf8");
console.log(JSON.stringify({ source_ready: sourceStatus, target_ready: "pending", configuredHarnessIds, executedHarnesIds, harnesses: harnessResults, required_artifacts: requiredArtifactResults, reports: reportResults, documentation: documentationResults, target_host_checks: targetHostChecks }, null, 2));
if (!sourceReady) process.exitCode = 1;
