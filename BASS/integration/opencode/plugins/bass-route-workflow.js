"use strict";
const { createHmac, timingSafeEqual } = require("node:crypto");

const commands = Object.freeze({
  "/bass understand": ["Understand", ["Reader"]],
  "/bass load-context": ["Understand", ["Reader"]],
  "/bass discover": ["Discover", ["Reader", "Explorer"]],
  "/bass technical-delivery": ["Discover", ["Explorer"]],
  "/bass create-feature": ["Create", ["Reader", "Explorer", "Creator"]],
  "/bass create-us": ["Create", ["Reader", "Explorer", "Creator"]],
  "/bass create-ac": ["Create", ["Reader", "Explorer", "Creator"]],
  "/bass create-proposal": ["Create", ["Reader", "Explorer", "Creator"]],
  "/bass review": ["Review", ["Reviewer"]],
  "/bass improve": ["Improve", ["Editor", "Reviewer"]],
  "/bass create-ado": ["Sync/Execute ADO", ["Executor"]],
  "/bass sync-ado": ["Sync/Execute ADO", ["Executor"]],
  "/bass update-ado": ["Sync/Execute ADO", ["Executor"]],
  "/bass link-items": ["Sync/Execute ADO", ["Executor"]],
  "/bass transition": ["Sync/Execute ADO", ["Executor"]],
  "/bass next": ["Next", []],
  "/bass diagnose": ["Diagnose", []]
});
const readOnly = new Set(["Understand", "Discover", "Review", "Diagnose", "Next"]);
const writes = new Set(["Create", "Improve", "Sync/Execute ADO"]);
const intentRules = [
  ["Understand", /\b(understand|explain|context|current state|load)\b/i],
  ["Discover", /\b(discover|find|related|depend|missing|what exists|technical delivery)\b/i],
  ["Review", /\b(review|assess|quality|complete(?:ness)?|consistent|provenance)\b/i],
  ["Create", /\b(create|draft|feature|user story|acceptance criteria|proposal)\b/i],
  ["Improve", /\b(improve|edit|revise|refine)\b/i],
  ["Sync/Execute ADO", /\b(sync|publish|update|link|transition|import|azure devops|ado)\b/i]
];
const routes = Object.freeze({ Understand: ["Reader"], Discover: ["Reader", "Explorer"], Review: ["Reviewer"], Create: ["Reader", "Explorer", "Creator"], Improve: ["Editor", "Reviewer"], "Sync/Execute ADO": ["Executor"], Next: [], Diagnose: [] });
let tool; try { ({ tool } = require("@opencode-ai/plugin")); } catch { tool = (value) => value; tool.schema = { string: () => ({ optional: () => ({}) }), object: () => ({ optional: () => ({}) }) }; }

function failure(code, message, stage) { return { status: "blocked", error: { code, message, ...(stage ? { stage } : {}) }, workflow: null, specialistRoute: [], gates: [] }; }
function canonicalTarget(value) { return /^(?:[A-Z][A-Z0-9]*-\d+|(?:features\/[A-Z][A-Z0-9]*-[-a-z0-9]+\/feature|features\/[A-Z][A-Z0-9]*-[-a-z0-9]+\/user-stories\/[A-Z][A-Z0-9]*-[-a-z0-9]+\/user-story|proposals\/PRO-\d+-[-a-z0-9]+\/proposal)\.md)$/.test(String(value || "")); }
function gateAttestation(context, workflow) { const key = process.env.BASS_TOKEN_SIGNING_KEY, all = Array.isArray(context.attestations) ? context.attestations : []; if (!key) return null; const item = all.find((candidate) => candidate && candidate.workflow === workflow && candidate.target === context.target); if (!item || typeof item.status !== "string" || typeof item.expiresAt !== "string" || typeof item.integrity !== "string" || !Number.isFinite(Date.parse(item.expiresAt)) || Date.parse(item.expiresAt) <= Date.now()) return null; const payload = JSON.stringify({ workflow: item.workflow, target: item.target, status: item.status, expiresAt: item.expiresAt }), expected = createHmac("sha256", key).update(payload).digest("hex"); try { return expected.length === item.integrity.length && timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(item.integrity, "hex")) ? item : null; } catch { return null; } }
function routeWorkflow(input) {
  if (!input || typeof input !== "object") return failure("invalid_input", "Routing input must be an object.");
  const context = input.context && typeof input.context === "object" && !Array.isArray(input.context) ? input.context : {};
  let workflow, specialistRoute, confidence = "explicit";
  if (input.command !== undefined) {
    if (typeof input.command !== "string" || !Object.hasOwn(commands, input.command)) return failure("invalid_command", "Command must be one supported exact /bass command.");
    [workflow, specialistRoute] = commands[input.command];
  } else {
    if (typeof input.request !== "string" || !input.request.trim()) return failure("invalid_request", "A non-empty natural-language request is required.");
    const matches = intentRules.filter(([, rule]) => rule.test(input.request)).map(([name]) => name);
    if (!matches.length) return { status: "clarification_required", workflow: null, intentConfidence: "none", clarification: "What would you like BASS to understand, discover, review, create, improve, or synchronize?", specialistRoute: [], gates: [] };
    if (matches.some((name) => readOnly.has(name)) && matches.some((name) => writes.has(name))) return { status: "clarification_required", workflow: null, intentConfidence: "mixed", clarification: "Should BASS perform the read-only request or the write-capable request?", specialistRoute: [], gates: [] };
    workflow = intentRules.map(([name]) => name).find((name) => matches.includes(name));
    specialistRoute = routes[workflow]; confidence = matches.length === 1 ? "high" : "mixed";
  }
  if (workflow === "Next") return { status: "ready", workflow, intentConfidence: confidence, specialistRoute, gates: [], nonExecuting: true };
  if (writes.has(workflow) && !canonicalTarget(context.target)) return { status: "clarification_required", workflow, intentConfidence: confidence, clarification: "Which one canonical item ID or canonical artifact path should BASS use before starting this write-capable workflow?", specialistRoute, gates: [] };
  if (writes.has(workflow) && !["ready", "warning", "blocked", "partial"].includes(context.contextStatus)) return { status: "blocked", workflow, intentConfidence: confidence, specialistRoute: [], gates: [{ state: "blocked", reason: "An exact accepted context status is required before mutation." }], error: { code: "context_missing", message: "An exact accepted context status is required before mutation." } };
  const state = String(context.contextStatus || "ready");
  if (!["ready", "partial", "missing", "conflict"].includes(state)) return failure("invalid_context", "Context status must be ready, partial, missing, or conflict.");
  const gates = [];
  if (state === "partial" && readOnly.has(workflow)) gates.push({ state: "warning", reason: "Context is partial; results remain bounded to available evidence." });
  if ((state === "missing" || state === "partial" || state === "conflict") && writes.has(workflow)) gates.push({ state: "blocked", reason: state === "conflict" ? "Resolve cited conflicts before mutation." : "Required cited context is unavailable for mutation." });
  for (const specialist of specialistRoute) { const result = context.specialist && context.specialist[specialist]; if (result && result.status === "failed") { const complete = result.stage === specialist && typeof result.reason === "string" && Array.isArray(result.availableEvidence) && typeof result.impact === "string" && typeof result.safeNextAction === "string"; return { status: "blocked", workflow, intentConfidence: confidence, specialistRoute, gates, error: complete ? { code: "specialist_failure", stage: result.stage, reason: result.reason, availableEvidence: result.availableEvidence, impact: result.impact, safeNextAction: result.safeNextAction } : { code: "incomplete_specialist_failure", stage: specialist, reason: typeof result.reason === "string" ? result.reason : "Specialist failure reason was unavailable.", availableEvidence: [], impact: "BASS cannot safely continue because specialist failure context is incomplete.", safeNextAction: "Provide the complete specialist failure context: stage, reason, available evidence, impact, and safe next action." } }; } }
  if (gates.some((gate) => gate.state === "blocked")) return { status: "blocked", workflow, intentConfidence: confidence, specialistRoute, gates };
  if (writes.has(workflow)) { const attestation = gateAttestation(context, workflow), route = workflow === "Sync/Execute ADO" ? [] : specialistRoute; if (!attestation) return { status: "blocked", workflow, intentConfidence: confidence, specialistRoute: route, gates: [...gates, { state: "blocked", reason: "A valid target-host signed gate attestation is required." }] }; if (["approval_required", "waiver_required"].includes(attestation.status)) return { status: "awaiting_approval", workflow, intentConfidence: confidence, specialistRoute: route, gates: [...gates, { state: "approval_required", reason: "Signed gate attestation requires explicit approval." }] }; if (attestation.status === "confirmation_required") return { status: "awaiting_confirmation", workflow, intentConfidence: confidence, specialistRoute: [], gates: [...gates, { state: "confirmation_required", reason: "Signed gate attestation requires exact operation confirmation." }] }; if (!(["approved", "confirmed"].includes(attestation.status))) return { status: "blocked", workflow, intentConfidence: confidence, specialistRoute: route, gates: [...gates, { state: "blocked", reason: "Signed gate attestation status cannot route this mutation." }] }; }
  return { status: gates.length ? "warning" : "ready", workflow, intentConfidence: confidence, specialistRoute, gates };
}

const BassRouteWorkflowPlugin = async () => ({ tool: { bass_route_workflow: tool({ description: "Route one bounded BASS command or request without executing it.", args: { command: tool.schema.string().optional(), request: tool.schema.string().optional(), context: tool.schema.object().optional() }, async execute(args) { return routeWorkflow(args); } }) } });
module.exports = { routeWorkflow, BassRouteWorkflowPlugin };
