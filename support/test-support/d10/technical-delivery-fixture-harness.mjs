import { strict as assert } from "node:assert";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import report from "../../../integration/opencode/plugins/bass-technical-delivery-report.js";
import persistence from "../../../integration/opencode/plugins/bass-persist-approved-technical-evidence.js";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const fixtures = join(root, "support", "fixtures", "d10-technical");
const normalize = (value, workspace) => JSON.parse(JSON.stringify(value)
  .replaceAll(JSON.stringify(workspace).slice(1, -1), "<workspace>")
  .replaceAll(workspace.replaceAll("\\", "/"), "<workspace>")
  .replaceAll(`/private${workspace}`, "<workspace>")
  .replaceAll("/private<workspace>", "<workspace>")
  .replace(/EVD-TECH-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, "EVD-TECH-<generated>")
  .replace(/Preview: [0-9a-f-]+/g, "Preview: <generated>")
  .replace(/Integrity hash: [0-9a-f]+/g, "Integrity hash: <generated>")
  .replace(/## Technical Delivery Report\n\n[\s\S]*$/, "## Technical Delivery Report\n\n<report>"));

for (const name of ["direct", "inferred", "unavailable", "conflicting"]) {
  const workspace = mkdtempSync(join(tmpdir(), "bass-d10-fixture-"));
  try {
    const project = join(workspace, "BASS", "projects", "demo-customer-onboarding");
    const feature = join(project, "features", "F-001-customer-onboarding");
    mkdirSync(join(feature, "user-stories"), { recursive: true });
    mkdirSync(join(project, "project-context"), { recursive: true });
    writeFileSync(join(feature, "feature.md"), "---\nid: F-001\ntitle: Customer onboarding\nado_work_item_id: 1001\n---\n# Feature\n");
    writeFileSync(join(project, "evidence-register.md"), readFileSync(join(fixtures, "base-evidence-register.md"), "utf8"));
    const scenario = JSON.parse(readFileSync(join(fixtures, name, "scenario.json"), "utf8"));
    const result = report.technicalDeliveryReport({ directory: workspace, projectName: "demo-customer-onboarding", target: scenario.target, extracts: scenario.extracts });
    const actual = { status: result.status, releaseState: result.releaseState, report: result.markdown, evidence: result.evidence };
    if (scenario.persistApprovedEvidence) {
      const clock = () => "2026-04-05T12:00:00.000Z";
      const preview = persistence.issueTechnicalEvidencePreview({ projectName: "demo-customer-onboarding", target: scenario.target, markdown: result.markdown, evidence: result.evidence, extractedAt: scenario.extractedAt, approvedAt: scenario.approvedAt, clock });
      const saved = persistence.persistApprovedTechnicalEvidence({ directory: workspace, projectName: "demo-customer-onboarding", previewId: preview.previewId, approved: true, integrityHash: preview.integrityHash, approvedEvidenceMarkdown: result.markdown, approvedAt: scenario.approvedAt });
      actual.persistence = {
        result: saved,
        record: readFileSync(saved.path, "utf8"),
        register: readFileSync(join(workspace, "BASS", "projects", "demo-customer-onboarding", "evidence-register.md"), "utf8")
      };
    }
    const expected = JSON.parse(readFileSync(join(fixtures, "expected", `${name}.json`), "utf8"));
    expected.report = readFileSync(join(fixtures, "expected", `${name}-report.md`), "utf8").trimEnd();
    if (expected.persistence) {
      expected.persistence.record = readFileSync(join(fixtures, "expected", `${name}-persistence-record.md`), "utf8").replace("<report>", expected.report);
      expected.persistence.register = readFileSync(join(fixtures, "base-evidence-register.md"), "utf8") + readFileSync(join(fixtures, "expected", `${name}-persistence-register.md`), "utf8");
    }
    assert.deepEqual(normalize(actual, workspace), expected, `${name} fixture outcome differs from its exact normalized oracle`);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}

console.log("bass d10 technical delivery fixture harness passed");
