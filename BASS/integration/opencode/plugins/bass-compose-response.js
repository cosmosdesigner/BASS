"use strict";

const sections = Object.freeze(["Status", "Workflow", "Result", "Evidence", "Gaps and Conflicts", "Next Action"]);
const classifications = new Set(["Fact", "Inference", "Assumption", "Proposal", "Question", "Conflict", "Decision"]);
const types = new Set(["local_file", "ado_wiki", "ado_work_item", "ado_comment", "ado_pull_request", "ado_pipeline", "ado_repository", "ado_commit"]);
let tool; try { ({ tool } = require("@opencode-ai/plugin")); } catch { tool = (value) => value; tool.schema = { object: () => ({}) }; }
function blocked(message, code = "invalid_provenance") { return { status: "blocked", sections, markdown: `## Status\n\nblocked\n\n## Workflow\n\nUnavailable\n\n## Result\n\n${message}\n\n## Evidence\n\n- None.\n\n## Gaps and Conflicts\n\n- ${message}\n\n## Next Action\n\nProvide a valid workflow result.`, sources: [], error: { code, message } }; }
function citation(item) { return `[source: ${item.source}; location: ${item.location}; classification: ${item.classification}; confidence: ${item.confidence}]`; }
function typed(item) { return Boolean(item && typeof item === "object" && !Array.isArray(item) && types.has(item.type) && String(item.source || "").trim() && String(item.location || "").trim() && classifications.has(item.classification) && String(item.confidence || "").trim() && String(item.actor || "").trim() && /^\d{4}-\d{2}-\d{2}$/.test(String(item.date || "")) && String(item.source_version || "").trim() && Array.isArray(item.related_items) && item.related_items.every((value) => typeof value === "string" && value.trim()) && String(item.claim || "").trim()); }
function composeResponse(input) {
  const result = input && input.workflowResult;
  if (!result || typeof result !== "object" || !String(result.workflow || "").trim()) return blocked("Workflow result is required.");
  const evidence = Array.isArray(result.evidence) ? result.evidence : [];
  if (!typed(result.result) || evidence.some((item) => !typed(item))) return blocked("Every material result and evidence item requires typed D3 provenance.");
  const gaps = Array.isArray(result.gaps) ? result.gaps : [], conflicts = Array.isArray(result.conflicts) ? result.conflicts : [];
  if (gaps.some((item) => !typed(item)) || conflicts.some((item) => !typed(item))) return blocked("Every material gap and conflict requires typed D3 provenance.");
  const waiver = result.approvalGate === "decision_waiver";
  if ((result.requiresApproval && result.requiresConfirmation) || (result.requiresApproval && !["Create", "Improve"].includes(result.workflow) && !waiver) || (waiver && result.requiresApproval !== true) || (result.requiresConfirmation && result.workflow !== "Sync/Execute ADO")) return blocked("Approval and Confirmation flags are conflicting or inapplicable to the workflow.", "invalid_gate");
  const items = [...gaps, ...conflicts]; let resultText = `${result.result.claim} ${citation(result.result)}`, gapLines = items.length ? items.map((item) => `- ${item.claim} ${citation(item)}`) : ["- None."], nextAction = String(result.nextAction || "No action is available.");
  if (result.specialistFailure) { const failure = result.specialistFailure; if (!failure.stage || !failure.reason || !failure.impact || !failure.safeNextAction || !Array.isArray(failure.availableEvidence) || failure.availableEvidence.some((item) => !typed(item))) return blocked("Specialist failures require stage, reason, available typed evidence, impact, and safe next action."); resultText += `\n\nStage: ${failure.stage}\nReason: ${failure.reason}\nAvailable evidence: ${failure.availableEvidence.map(citation).join("; ")}`; gapLines = [...gapLines.filter((item) => item !== "- None."), `- Impact: ${failure.impact}`]; nextAction = `Safe next action: ${failure.safeNextAction}`; }
  const lines = ["## Status", String(result.status || "ready"), "## Workflow", String(result.workflow), "## Result", resultText, "## Evidence", ...(evidence.length ? evidence.map((item) => `- ${item.claim} ${citation(item)}`) : ["- None."]), "## Gaps and Conflicts", ...gapLines, "## Next Action", nextAction];
  if (result.requiresApproval) lines.push("## Approval", "Explicit approval of this local preview is required before persistence.");
  if (result.requiresConfirmation) lines.push("## Confirmation", "Explicit confirmation of the exact displayed ADO operation is required.");
  return { status: String(result.status || "ready"), workflow: String(result.workflow), sections, markdown: lines.join("\n\n"), sources: evidence, result: result.result, gaps, conflicts, nextAction: String(result.nextAction || "No action is available."), gates: Array.isArray(result.gates) ? result.gates : [], requiresApproval: result.requiresApproval === true, requiresConfirmation: result.requiresConfirmation === true };
}

const BassComposeResponsePlugin = async () => ({ tool: { bass_compose_response: tool({ description: "Compose one evidenced BASS response envelope.", args: { workflowResult: tool.schema.object() }, async execute(args) { return composeResponse(args); } }) } });
module.exports = { composeResponse, BassComposeResponsePlugin };
