import { strict as assert } from "node:assert"
import { cpSync, existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath, pathToFileURL } from "node:url"

const pluginRoot = new URL(".", import.meta.url)
const root = mkdtempSync(join(tmpdir(), "bass-d10-"))
const fixtureRoot = join(root, "workspace")
const copy = (name) => cpSync(fileURLToPath(new URL(name, pluginRoot)), join(fixtureRoot, "BASS", "integration", "opencode", "plugins", name))
const load = async (name) => import(`${pathToFileURL(join(fixtureRoot, "BASS", "integration", "opencode", "plugins", name)).href}?${Math.random()}`)

try {
  cpSync(fileURLToPath(new URL("../../../..", pluginRoot)), fixtureRoot, { recursive: true })
  const project = join(fixtureRoot, "BASS", "projects", "demo-customer-onboarding")
  const feature = join(project, "features", "F-001-customer-onboarding")
  mkdirSync(join(feature, "user-stories"), { recursive: true })
  mkdirSync(join(project, "project-context"), { recursive: true })
  writeFileSync(join(feature, "feature.md"), "---\nid: F-001\ntitle: Customer onboarding\nado_work_item_id: 1001\n---\n# Feature\n")
  const capabilities = `# ADO Technical Delivery Capabilities

## Repository and File Search
toolName: ado_repo_search
supportedInput: repository path query
verifiedReadOnly: true
verificationDate: 2026-08-15
resourceType: repository

## Pull Request Details, Comments, and Links
toolName: ado_pr_read
supportedInput: pull request id
verifiedReadOnly: true
verificationDate: 2026-08-15
resourceType: pull_request

## Work Item Association
toolName: ado_association_read
supportedInput: work item id
verifiedReadOnly: true
verificationDate: 2026-08-15
resourceType: commit

## Pipeline and Deployment Status
toolName: ado_delivery_read
supportedInput: run id
verifiedReadOnly: true
verificationDate: 2026-08-15
resourceType: deployment
`
  writeFileSync(join(project, "project-context", "ado-technical-delivery-capabilities.md"), capabilities)
  writeFileSync(join(project, "evidence-register.md"), "# Evidence Register\n\n| ID | Classification | Title | Sources | Confidence | Location | Related items | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n")
  const validator = await load("bass-validate-ado-technical-delivery-capabilities.js")
  const reportTool = await load("bass-technical-delivery-report.js")
  const persist = await load("bass-persist-approved-technical-evidence.js")
  const template = readFileSync(join(fixtureRoot, "BASS", "templates", "ado-technical-delivery-capabilities-template.md"), "utf8")
    .replaceAll("<exact_target_host_tool_name>", "ado_template_read")
    .replaceAll("<repository_identifier_branch_path_or_search_text>", "repository path")
    .replaceAll("<pull_request_id_repository_identifier_or_work_item_reference>", "pull request id")
    .replaceAll("<work_item_id_pull_request_id_commit_id_or_association_reference>", "work item id")
    .replaceAll("<pipeline_run_build_release_environment_or_deployment_identifier>", "deployment id")
    .replaceAll("false", "true")
    .replaceAll("<YYYY-MM-DD>", "2026-08-15")
  const templateProject = join(fixtureRoot, "BASS", "projects", "template-derived")
  mkdirSync(join(templateProject, "project-context"), { recursive: true })
  writeFileSync(join(templateProject, "project-context", "ado-technical-delivery-capabilities.md"), template)
  const templateValidated = validator.validateAdoTechnicalDeliveryCapabilities({ projectDirectory: templateProject, requiredCategories: ["Repository and File Search", "Pull Request Details, Comments, and Links", "Work Item Association", "Pipeline and Deployment Status"] })
  assert.equal(templateValidated.unmappedGaps.length, 0, "a completed capability template must produce four valid mappings")
   const validated = validator.validateAdoTechnicalDeliveryCapabilities({ projectDirectory: project, requiredCategories: ["Repository and File Search", "Pipeline and Deployment Status"] })
   assert.deepEqual(validated.dispatch, [{ category: "Repository and File Search", toolName: "ado_repo_search" }, { category: "Pipeline and Deployment Status", toolName: "ado_delivery_read" }])
   assert.match(validated.permissionFragment, /^"ado_\*": deny/m)
   assert.doesNotMatch(validated.permissionFragment, /write|create|update|delete|queue|cancel|deploy/i)
   writeFileSync(join(project, "project-context", "ado-technical-delivery-capabilities.md"), capabilities.replace("toolName: ado_repo_search", "toolName: arbitrary_shell"))
   const nonAdoTool = validator.validateAdoTechnicalDeliveryCapabilities({ projectDirectory: project, requiredCategories: ["Repository and File Search"] })
   assert.equal(nonAdoTool.mappings["Repository and File Search"].valid, false, "a non-ADO tool name must be invalid")
   assert.deepEqual(nonAdoTool.dispatch, [], "a non-ADO tool name must receive no dispatch permission")
   assert.doesNotMatch(nonAdoTool.permissionFragment, /arbitrary_shell/, "a non-ADO tool name must receive no permission")
   writeFileSync(join(project, "project-context", "ado-technical-delivery-capabilities.md"), capabilities)
  writeFileSync(join(project, "project-context", "ado-technical-delivery-capabilities.md"), capabilities.replace("resourceType: deployment", "resourceType: repository\noperation: deploy"))
  assert.equal(validator.validateAdoTechnicalDeliveryCapabilities({ projectDirectory: project, requiredCategories: ["Pipeline and Deployment Status"] }).mappings["Pipeline and Deployment Status"].valid, false, "mutation mappings must be rejected")
  writeFileSync(join(project, "project-context", "ado-technical-delivery-capabilities.md"), capabilities.replace("resourceType: repository", "resourceType: deployment"))
  assert.equal(validator.validateAdoTechnicalDeliveryCapabilities({ projectDirectory: project }).mappings["Repository and File Search"].valid, false, "cross-category resource types must be rejected")
  writeFileSync(join(project, "project-context", "ado-technical-delivery-capabilities.md"), capabilities)

  const direct = reportTool.technicalDeliveryReport({ directory: fixtureRoot, projectName: "demo-customer-onboarding", target: "F-001", extracts: [
    { category: "pull_request", source: "ADO PR", location: "PR 44", workItemIds: ["1001"], state: "completed", url: "https://example.test/pr/44" },
    { category: "pipeline", source: "ADO Pipeline", location: "Run 8", workItemIds: ["1001"], status: "succeeded" },
    { category: "deployment", source: "ADO Deployment", location: "Deploy 8", workItemIds: ["1001"], status: "succeeded" }
  ] })
  assert.match(direct.markdown, /# Technical Delivery Report: F-001/)
    assert.match(direct.markdown, /classification: Fact; confidence: high/)
    assert.match(direct.markdown, /Release State\n\n- released \[sources: \[ado_pipeline: ADO Pipeline @ Run 8, ado_pipeline: ADO Deployment @ Deploy 8\]; classification: Fact; confidence: high\]/)
   const incompleteDelivery = reportTool.technicalDeliveryReport({ directory: fixtureRoot, projectName: "demo-customer-onboarding", target: "F-001", extracts: [{ category: "pipeline", source: "ADO Pipeline", location: "Run complete", workItemIds: ["1001"], status: "succeeded" }, { category: "deployment", source: "", location: "", workItemIds: ["1001"] }, { category: "pipeline", source: "ADO Pipeline", location: "Run statusless", workItemIds: ["1001"] }] })
   assert.equal(incompleteDelivery.releaseState, "unknown", "incomplete direct delivery evidence must not establish release")
   assert.equal(incompleteDelivery.releaseAttribution.classification, "Question")
   assert.deepEqual(incompleteDelivery.releaseAttribution.sources, [])
   assert.match(incompleteDelivery.markdown, /Incomplete direct pipeline or deployment evidence is unavailable \[sources: \[\]; location: delivery record; classification: Question; confidence: low; evidence_gap: Every direct pipeline and deployment record requires status, source, and location\]/)
   assert.doesNotMatch(incompleteDelivery.markdown, /- released \[/)
   const linkedDelivery = reportTool.technicalDeliveryReport({ directory: fixtureRoot, projectName: "demo-customer-onboarding", target: "F-001", extracts: [{ category: "pipeline", source: "ADO Pipeline", location: "Run linked", links: ["https://example.test/_workitems/edit/1001"], status: "succeeded" }, { category: "deployment", source: "ADO Deployment", location: "Deploy linked", links: ["1001"], status: "succeeded" }] })
   assert.equal(linkedDelivery.releaseState, "released", "exact Work Item URL/ID links must establish direct release evidence")
   assert.match(linkedDelivery.markdown, /Run linked[\s\S]*classification: Fact; confidence: high/)
  const unrelatedDelivery = reportTool.technicalDeliveryReport({ directory: fixtureRoot, projectName: "demo-customer-onboarding", target: "F-001", extracts: [{ category: "pipeline", source: "ADO Pipeline", location: "Run unrelated", workItemIds: ["9999"], status: "succeeded" }, { category: "deployment", source: "ADO Deployment", location: "Deploy unrelated", workItemIds: ["9999"], status: "succeeded" }] })
   assert.equal(unrelatedDelivery.releaseState, "unknown", "unrelated delivery evidence must not establish release state")
   assert.match(unrelatedDelivery.markdown, /Required direct associated pipeline or deployment evidence is unavailable/)
   assert.match(unrelatedDelivery.markdown, /Release State\n\n- unknown \[sources: \[\]; classification: Question; confidence: low; evidence_gap: Direct associated pipeline and deployment evidence is required to determine release state\]/)
  const prefixedUrl = reportTool.technicalDeliveryReport({ directory: fixtureRoot, projectName: "demo-customer-onboarding", target: "F-001", extracts: [{ category: "pipeline", source: "ADO Pipeline", location: "Run prefix", workItemUrl: "https://example.test/_workitems/edit/10010", status: "succeeded" }, { category: "deployment", source: "ADO Deployment", location: "Deploy prefix", workItemUrl: "https://example.test/_workitems/edit/10010", status: "succeeded" }] })
  assert.equal(prefixedUrl.releaseState, "unknown", "a Work Item URL ID prefix is not an exact association")
  const inferred = reportTool.technicalDeliveryReport({ directory: fixtureRoot, projectName: "demo-customer-onboarding", target: "F-001", extracts: [{ category: "repository", source: "ADO Repository", location: "branch", branch: "feature/customer-onboarding" }] })
  assert.match(inferred.markdown, /classification: Inference; confidence: low; basis: branch/)
  assert.match(inferred.markdown, /Release State\n\n- unknown/)
  const inferredDelivery = reportTool.technicalDeliveryReport({ directory: fixtureRoot, projectName: "demo-customer-onboarding", target: "F-001", extracts: [{ category: "pipeline", source: "ADO Pipeline", location: "Run inferred", title: "Customer onboarding", status: "succeeded", classification: "Fact", confidence: "high" }, { category: "deployment", source: "ADO Deployment", location: "Deploy inferred", branch: "feature/customer-onboarding", status: "succeeded", classification: "Fact", confidence: "high" }] })
  assert.equal(inferredDelivery.releaseState, "unknown", "inferred pipeline and deployment evidence must not establish release state")
  assert.match(inferredDelivery.markdown, /Required direct associated pipeline or deployment evidence is unavailable/)
  assert.match(inferredDelivery.markdown, /classification: Inference; confidence: medium; basis: title/)
  assert.match(inferredDelivery.markdown, /classification: Inference; confidence: low; basis: branch/)
   const conflicting = reportTool.technicalDeliveryReport({ directory: fixtureRoot, projectName: "demo-customer-onboarding", target: "F-001", extracts: [{ category: "pipeline", source: "ADO Pipeline", location: "Run 9", workItemIds: ["1001"], status: "succeeded" }, { category: "deployment", source: "ADO Deployment", location: "Deploy 9", workItemIds: ["1001"], status: "failed" }] })
   assert.match(conflicting.markdown, /## Gaps and Conflicts[\s\S]*classification: Conflict/)
    assert.match(conflicting.markdown, /Release State\n\n- unknown \[sources: \[ado_pipeline: ADO Pipeline @ Run 9, ado_pipeline: ADO Deployment @ Deploy 9\]; classification: Conflict; confidence: low; conflict: Direct associated delivery statuses disagree\]/)
   const failedCanceled = reportTool.technicalDeliveryReport({ directory: fixtureRoot, projectName: "demo-customer-onboarding", target: "F-001", extracts: [{ category: "pipeline", source: "ADO Pipeline", location: "Run failed", workItemIds: ["1001"], status: "failed" }, { category: "deployment", source: "ADO Deployment", location: "Deploy canceled", workItemIds: ["1001"], status: "canceled" }] })
   assert.match(failedCanceled.markdown, /Pipeline and deployment evidence is contradictory[\s\S]*classification: Conflict/, "distinct direct delivery statuses must be a D3 Conflict")
   assert.equal(failedCanceled.releaseState, "unknown")
   const failedDelivery = reportTool.technicalDeliveryReport({ directory: fixtureRoot, projectName: "demo-customer-onboarding", target: "F-001", extracts: [{ category: "pipeline", source: "ADO Pipeline", location: "Run failed", workItemIds: ["1001"], status: "failed" }, { category: "deployment", source: "ADO Deployment", location: "Deploy failed", workItemIds: ["1001"], status: "failed" }] })
   assert.equal(failedDelivery.status, "warning", "direct failed delivery evidence must not report ready")
   assert.equal(failedDelivery.releaseState, "unknown")
   assert.match(failedDelivery.markdown, /Direct associated pipeline or deployment evidence is non-success[\s\S]*classification: Question/, "direct non-success delivery evidence must be a cited gap")
   const unknownCategory = reportTool.technicalDeliveryReport({ directory: fixtureRoot, projectName: "demo-customer-onboarding", target: "F-001", extracts: [{ category: "unknown_technical", source: "Unknown technical source", location: "unknown location", workItemIds: ["1001"], status: "observed" }] })
   assert.equal(unknownCategory.evidence.length, 0, "unknown technical categories must not become evidence")
   assert.match(unknownCategory.markdown, /Unknown technical extract category was rejected \[sources: \[\]; location: category: unknown_technical; classification: Question; confidence: low; evidence_gap: A supported technical category is required because unknown_technical is unavailable\]/, "unknown technical categories must become D3 Question gaps with no sources and an explicit evidence gap")
   assert.doesNotMatch(unknownCategory.markdown, /Unknown technical source; unknown location \[source:/, "unknown technical categories must not receive a fallback source citation")

  const preview = persist.issueTechnicalEvidencePreview({ projectName: "demo-customer-onboarding", target: "F-001", markdown: direct.markdown, evidence: direct.evidence })
  const before = readFileSync(join(project, "evidence-register.md"), "utf8")
  assert.equal(persist.persistApprovedTechnicalEvidence({ directory: fixtureRoot, projectName: "demo-customer-onboarding", previewId: preview.previewId, approved: false, integrityHash: preview.integrityHash, approvedEvidenceMarkdown: direct.markdown }).status, "blocked")
  assert.equal(readFileSync(join(project, "evidence-register.md"), "utf8"), before)
  assert.equal(persist.persistApprovedTechnicalEvidence({ directory: fixtureRoot, projectName: "demo-customer-onboarding", previewId: preview.previewId, approved: true, integrityHash: preview.integrityHash, approvedEvidenceMarkdown: direct.markdown, failAt: "register" }).status, "blocked")
  assert.equal(readFileSync(join(project, "evidence-register.md"), "utf8"), before, "failed persistence must restore the canonical register")
  const saved = persist.persistApprovedTechnicalEvidence({ directory: fixtureRoot, projectName: "demo-customer-onboarding", previewId: preview.previewId, approved: true, integrityHash: preview.integrityHash, approvedEvidenceMarkdown: direct.markdown })
  assert.equal(saved.status, "persisted")
  assert.match(readFileSync(join(project, "evidence-register.md"), "utf8"), /Approved technical delivery evidence/)
  assert.match(readFileSync(saved.path, "utf8"), /source: ADO PR[\s\S]*location: PR 44[\s\S]*classification: Fact[\s\S]*confidence: high[\s\S]*related_items:[\s\S]*F-001/, "persisted evidence must retain approved evidence provenance")
  assert.match(readFileSync(saved.path, "utf8"), /provenance:[\s\S]*classification: Fact[\s\S]*sources:[\s\S]*type: ado_pull_request[\s\S]*type: ado_pipeline[\s\S]*actor: BASS[\s\S]*date: \d{4}-\d{2}-\d{2}[\s\S]*confidence: high[\s\S]*source_version: v1.0[\s\S]*related_items:/, "persisted evidence must have D3 provenance frontmatter")
  assert.doesNotMatch(readFileSync(saved.path, "utf8"), /type: (pull_request|pipeline|deployment|repository|commit)\b/, "persisted record must use only D3 source types")
  assert.match(readFileSync(join(project, "evidence-register.md"), "utf8"), /\| EVD-TECH-[^|]+-1 \| Fact \| Approved technical delivery evidence \| ado_pull_request: ADO PR \| high \| PR 44 \| F-001, 1001 \|/, "Evidence Register must preserve D3 pull-request provenance")
  assert.match(readFileSync(join(project, "evidence-register.md"), "utf8"), /\| EVD-TECH-[^|]+-2 \| Fact \| Approved technical delivery evidence \| ado_pipeline: ADO Pipeline \| high \| Run 8 \| F-001, 1001 \|/, "Evidence Register must preserve D3 pipeline provenance")
  const datedPreview = persist.issueTechnicalEvidencePreview({ projectName: "demo-customer-onboarding", target: "F-001", markdown: direct.markdown, evidence: [{ category: "pipeline", source: "dated pipeline", location: "Run dated", classification: "Fact", confidence: "high", retrievedDate: "2026-03-02" }], extractedAt: "2026-03-01", approvedAt: "2026-03-03" })
  const dated = persist.persistApprovedTechnicalEvidence({ directory: fixtureRoot, projectName: "demo-customer-onboarding", previewId: datedPreview.previewId, approved: true, integrityHash: datedPreview.integrityHash, approvedEvidenceMarkdown: direct.markdown, approvedAt: "2026-03-03" })
  const datedRecord = readFileSync(dated.path, "utf8")
  assert.equal(dated.status, "persisted", "explicitly dated technical evidence must persist")
  assert.match(datedRecord, /created_date: 2026-03-03[\s\S]*updated_date: 2026-03-03[\s\S]*retrieved_date: 2026-03-02[\s\S]*date: 2026-03-03/, "persistence must retain approved and source retrieval dates")
  const unknownPreview = persist.issueTechnicalEvidencePreview({ projectName: "demo-customer-onboarding", target: "F-001", markdown: direct.markdown, evidence: [{ category: "unknown", source: "Unknown", location: "Unknown" }] })
  assert.equal(persist.persistApprovedTechnicalEvidence({ directory: fixtureRoot, projectName: "demo-customer-onboarding", previewId: unknownPreview.previewId, approved: true, integrityHash: unknownPreview.integrityHash, approvedEvidenceMarkdown: direct.markdown }).status, "blocked", "unknown technical categories must not persist an untyped D3 source")
  for (const [category, type] of Object.entries({ repository: "ado_repository", file: "ado_repository", pull_request: "ado_pull_request", commit: "ado_commit", work_item: "ado_work_item", pipeline: "ado_pipeline", deployment: "ado_pipeline" })) {
    const mappedPreview = persist.issueTechnicalEvidencePreview({ projectName: "demo-customer-onboarding", target: "F-001", markdown: direct.markdown, evidence: [{ category, source: `source-${category}`, location: `location-${category}`, classification: "Fact", confidence: "high" }] })
    const mapped = persist.persistApprovedTechnicalEvidence({ directory: fixtureRoot, projectName: "demo-customer-onboarding", previewId: mappedPreview.previewId, approved: true, integrityHash: mappedPreview.integrityHash, approvedEvidenceMarkdown: direct.markdown })
    assert.equal(mapped.status, "persisted", `${category} must persist`)
    assert.match(readFileSync(mapped.path, "utf8"), new RegExp(`type: ${type}`), `${category} must use ${type}`)
  }
  for (const category of ["unknown", "toString", "constructor", "__proto__"]) {
    const registerBefore = readFileSync(join(project, "evidence-register.md")), evidenceBefore = existsSync(join(project, "technical-evidence")) ? readdirSync(join(project, "technical-evidence")).sort().map(file => [file, readFileSync(join(project, "technical-evidence", file))]) : []
    const rejectedPreview = persist.issueTechnicalEvidencePreview({ projectName: "demo-customer-onboarding", target: "F-001", markdown: direct.markdown, evidence: [{ category, source: "rejected", location: "rejected" }] })
    assert.equal(persist.persistApprovedTechnicalEvidence({ directory: fixtureRoot, projectName: "demo-customer-onboarding", previewId: rejectedPreview.previewId, approved: true, integrityHash: rejectedPreview.integrityHash, approvedEvidenceMarkdown: direct.markdown }).status, "blocked", `${category} must fail closed`)
    assert.deepEqual(readFileSync(join(project, "evidence-register.md")), registerBefore, `${category} must not change register bytes`)
    const evidenceAfter = readdirSync(join(project, "technical-evidence")).sort().map(file => [file, readFileSync(join(project, "technical-evidence", file))])
    assert.deepEqual(evidenceAfter, evidenceBefore, `${category} must not create or alter evidence records`)
  }
  const secondPreview = persist.issueTechnicalEvidencePreview({ projectName: "demo-customer-onboarding", target: "F-001", markdown: direct.markdown, evidence: direct.evidence })
  const second = persist.persistApprovedTechnicalEvidence({ directory: fixtureRoot, projectName: "demo-customer-onboarding", previewId: secondPreview.previewId, approved: true, integrityHash: secondPreview.integrityHash, approvedEvidenceMarkdown: direct.markdown })
  assert.equal(second.status, "persisted", "an existing canonical technical-evidence directory must allow another unique record")
  assert.notEqual(second.path, saved.path)
  const collisionProject = join(fixtureRoot, "BASS", "projects", "record-collision")
  cpSync(project, collisionProject, { recursive: true })
  const collisionPreview = persist.issueTechnicalEvidencePreview({ projectName: "record-collision", target: "F-001", markdown: direct.markdown, evidence: direct.evidence })
  mkdirSync(join(collisionProject, "technical-evidence"), { recursive: true })
  writeFileSync(join(collisionProject, "technical-evidence", `${collisionPreview.recordId}.md`), "collision")
  assert.equal(persist.persistApprovedTechnicalEvidence({ directory: fixtureRoot, projectName: "record-collision", previewId: collisionPreview.previewId, approved: true, integrityHash: collisionPreview.integrityHash, approvedEvidenceMarkdown: direct.markdown }).status, "blocked", "a predicted canonical record collision must block persistence")
  const linkedEvidenceProject = join(fixtureRoot, "BASS", "projects", "linked-evidence")
  cpSync(project, linkedEvidenceProject, { recursive: true })
  const linkedEvidenceRoot = join(fixtureRoot, "linked-evidence-root")
  mkdirSync(linkedEvidenceRoot)
  rmSync(join(linkedEvidenceProject, "technical-evidence"), { recursive: true, force: true })
  symlinkSync(linkedEvidenceRoot, join(linkedEvidenceProject, "technical-evidence"), "junction")
  const linkedEvidencePreview = persist.issueTechnicalEvidencePreview({ projectName: "linked-evidence", target: "F-001", markdown: direct.markdown, evidence: direct.evidence })
  assert.equal(persist.persistApprovedTechnicalEvidence({ directory: fixtureRoot, projectName: "linked-evidence", previewId: linkedEvidencePreview.previewId, approved: true, integrityHash: linkedEvidencePreview.integrityHash, approvedEvidenceMarkdown: direct.markdown }).status, "blocked", "a symlinked technical-evidence directory must block persistence")
  assert.equal(existsSync(join(linkedEvidenceRoot, `${linkedEvidencePreview.recordId}.md`)), false)
  const malformed = join(fixtureRoot, "BASS", "projects", "malformed-register")
  cpSync(project, malformed, { recursive: true })
  writeFileSync(join(malformed, "evidence-register.md"), "# Evidence Register\n\ntext\n\n# Evidence Register\n\n| ID | Classification | Title | Sources | Confidence | Location | Related items | Record |\n")
  const malformedPreview = persist.issueTechnicalEvidencePreview({ projectName: "malformed-register", target: "F-001", markdown: direct.markdown, evidence: direct.evidence })
  assert.equal(persist.persistApprovedTechnicalEvidence({ directory: fixtureRoot, projectName: "malformed-register", previewId: malformedPreview.previewId, approved: true, integrityHash: malformedPreview.integrityHash, approvedEvidenceMarkdown: direct.markdown }).status, "blocked", "a decoy Evidence Register heading must block persistence")
  const blockedLink = join(fixtureRoot, "BASS", "projects", "linked-project")
  symlinkSync(project, blockedLink, "junction")
  assert.equal(reportTool.technicalDeliveryReport({ directory: fixtureRoot, projectName: "linked-project", target: "F-001", extracts: [] }).status, "blocked")
  const linkedArtifact = join(fixtureRoot, "BASS", "projects", "linked-artifact")
  cpSync(project, linkedArtifact, { recursive: true })
  const featureRoot = join(linkedArtifact, "features", "F-001-customer-onboarding")
  const featureTarget = join(fixtureRoot, "feature-target")
  cpSync(featureRoot, featureTarget, { recursive: true })
  rmSync(featureRoot, { recursive: true, force: true })
  symlinkSync(featureTarget, featureRoot, "junction")
  assert.equal(reportTool.technicalDeliveryReport({ directory: fixtureRoot, projectName: "linked-artifact", target: "F-001", extracts: [] }).status, "blocked", "a symlinked intermediate artifact directory must be rejected")
  console.log("bass technical delivery behavioral contract passed")
} finally {
  rmSync(root, { recursive: true, force: true })
}
