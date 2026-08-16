"use strict";
const { createHash, randomUUID } = require("node:crypto"), fs = require("node:fs"), path = require("node:path");
const { reviewArtifact } = require("./bass-review-artifact.js");
let tool; try { ({ tool } = require("@opencode-ai/plugin")); } catch { tool = (definition) => definition; tool.schema = { string: () => ({ optional: () => ({}) }), array: () => ({ optional: () => ({}) }), object: () => ({ optional: () => ({}) }) }; }
const issued = globalThis.__bassImprovementPreviews ||= new Map(), digest = (value) => createHash("sha256").update(value, "utf8").digest("hex");
function improveArtifact(input) {
  const originalReport = reviewArtifact(input); if (!originalReport.artifactPath) return { status: "blocked", changes: [], unresolved: [], reReview: originalReport, revisedArtifactMarkdown: "" };
  const artifact = path.join(input.directory, "BASS", "projects", input.projectName, ...originalReport.artifactPath.split("/")), original = fs.readFileSync(artifact, "utf8"), evidence = Array.isArray(input.evidence) ? input.evidence : [], changes = [], unresolved = []; let revised = original;
  for (const item of originalReport.findings) { const source = evidence.find((value) => value && typeof value.claim === "string" && /Then\s+/i.test(value.claim));
    if (item.check === "testability" && source) { revised = revised.replace(/## (?:Given\/When\/Then )?Acceptance Criteria\n\n- None\./, `## Given/When/Then Acceptance Criteria\n\n- Given the cited need\n- When the supported action occurs\n- ${source.claim}\n- Evidence: ${source.source}; ${source.location}`); changes.push({ findingId: item.id, justification: source.claim, source: `${source.source}:${source.location}`, status: "applied" }); }
    else if (item.status !== "waived") unresolved.push({ findingId: item.id, status: "needs_decision", reason: "No evidence-supported edit is available." }); }
  if (unresolved.length) revised += `\n\n## Needs Decision\n\n${unresolved.map((item) => `- needs_decision: ${item.findingId}: ${item.reason}`).join("\n")}\n`;
  const reReview = reviewArtifact({ ...input, inMemoryArtifact: revised }), status = reReview.status === "blocked" ? "blocked" : unresolved.length ? "needs_decision" : "ready_for_approval";
  const previewId = status === "ready_for_approval" ? randomUUID() : "", integrityHash = previewId ? digest(revised) : ""; if (previewId) issued.set(previewId, { ...input, previewId, integrityHash, originalVersion: originalReport.artifactVersion, revisedArtifactMarkdown: revised, reviewReport: originalReport, reReview, changes, unresolved });
  return { status, previewId, integrityHash, revisedArtifactMarkdown: revised, changes, unresolved, reReview };
}
const BassImproveArtifactPlugin = async () => ({ tool: { bass_improve_artifact: tool({ description: "Create an evidence-grounded re-reviewed BASS improvement preview.", args: { projectName: tool.schema.string(), artifactPath: tool.schema.string(), evidence: tool.schema.array(tool.schema.object()).optional() }, async execute(args, context) { return improveArtifact({ ...args, directory: context.directory }); } }) } });
module.exports = { improveArtifact, BassImproveArtifactPlugin, issued };
