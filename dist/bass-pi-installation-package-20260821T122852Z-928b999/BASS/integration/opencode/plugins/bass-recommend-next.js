"use strict";
const sections = ["Status", "Workflow", "Result", "Evidence", "Gaps and Conflicts", "Next Action"];
let tool; try { ({ tool } = require("@opencode-ai/plugin")); } catch { tool = (value) => value; tool.schema = { object: () => ({}), string: () => ({ optional: () => ({}) }) }; }

function recommendNext(input) {
  if (!input || typeof input !== "object" || !input.envelope || typeof input.envelope !== "object") return { status: "blocked", error: { code: "invalid_input", message: "A latest workflow envelope is required." } };
  if (/\b(execute|perform|do|run|apply|persist|import|write|publish|sync(?:hronize)?|confirm|dispatch|trigger|submit|invoke|send|delete|remove)\b/i.test(String(input.request || ""))) return { status: "blocked", error: { code: "execution_not_allowed", message: "Next can recommend only; it cannot execute, perform, do, run, apply, persist, import, write, publish, synchronize, confirm, dispatch, trigger, submit, invoke, send, delete, or remove." } };
  if (Object.keys(input).some((key) => !["envelope", "request"].includes(key))) return { status: "blocked", error: { code: "invalid_input", message: "Next accepts only a composed envelope and optional advisory request text." } };
  const envelope = input.envelope;
  if (!Array.isArray(envelope.sections) || sections.some((section, index) => envelope.sections[index] !== section) || !envelope.result || !Array.isArray(envelope.sources) || !Array.isArray(envelope.gaps) || !Array.isArray(envelope.conflicts) || typeof envelope.nextAction !== "string") return { status: "blocked", error: { code: "invalid_envelope", message: "Next requires a complete six-section composed envelope." } };
  const workflow = String(envelope.workflow || "workflow"), gates = Array.isArray(envelope.gates) ? envelope.gates : [], gaps = envelope.gaps, conflicts = envelope.conflicts;
  let recommendation, rationale;
  if (conflicts.length) { recommendation = `Resolve the cited conflict before continuing ${workflow}.`; rationale = "Mutations cannot proceed while a conflict is unresolved."; }
  else if (gates.some((gate) => gate && gate.state === "blocked") || gaps.length) { recommendation = `Provide the cited context required to unblock ${workflow}.`; rationale = "The current workflow is blocked by an evidence gap or gate."; }
  else if (envelope.requiresApproval) { recommendation = `Approve the specific ${workflow} preview before persistence.`; rationale = "The next safe step is explicit local approval."; }
  else if (envelope.requiresConfirmation) { recommendation = `Confirm the exact displayed ${workflow} operation token.`; rationale = "The next safe step is per-operation confirmation."; }
  else if (envelope.status === "warning") { recommendation = `Review the bounded warning evidence before continuing ${workflow}.`; rationale = "Partial read evidence must remain explicit."; }
  else { recommendation = `Review the ${workflow} result and choose the next bounded workflow.`; rationale = "No blocking gate is reported."; }
  return { status: "ready", recommendation, rationale, nonExecuting: true, source: { workflow, status: String(envelope.status || "unknown") } };
}

const BassRecommendNextPlugin = async () => ({ tool: { bass_recommend_next: tool({ description: "Recommend one safe non-executing BASS next action.", args: { envelope: tool.schema.object(), request: tool.schema.string().optional() }, async execute(args) { return JSON.stringify(recommendNext(args)); } }) } });
module.exports = { recommendNext, BassRecommendNextPlugin };
