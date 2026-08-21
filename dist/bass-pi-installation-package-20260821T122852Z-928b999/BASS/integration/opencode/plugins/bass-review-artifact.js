"use strict";
const fs = require("node:fs"), path = require("node:path"), { createHash } = require("node:crypto");
let tool; try { ({ tool } = require("@opencode-ai/plugin")); } catch { tool = (definition) => definition; tool.schema = { string: () => ({ optional: () => ({}) }) }; }
const blocked = (message) => ({ status: "blocked", findings: [], unresolvedQuestions: [], reviewDecision: "blocked", sources: [], message });
const field = (text, key) => text.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"))?.[1].replace(/["']/g, "").trim() || "";
const provenanceClassification = (text) => {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)?.[1];
  return frontmatter?.match(/^provenance:\r?\n  classification:\s*(.+?)\s*$/m)?.[1].replace(/["']/g, "").trim() || "";
};
const within = (root, target) => { const value = path.relative(root, target); return value === "" || (!value.startsWith(`..${path.sep}`) && value !== ".."); };
const safeDirectory = (root, target) => { try { return fs.existsSync(target) && !fs.lstatSync(target).isSymbolicLink() && fs.statSync(target).isDirectory() && within(root, fs.realpathSync(target)); } catch { return false; } };
const safeFile = (root, target) => { try { return fs.existsSync(target) && !fs.lstatSync(target).isSymbolicLink() && fs.statSync(target).isFile() && within(root, fs.realpathSync(target)); } catch { return false; } };
function canonical(input) {
  const directory = String(input.directory || ""), name = String(input.projectName || ""), requested = String(input.artifactPath || "");
  if (!directory || !name || /[\\/]/.test(name) || name === "." || name === ".." || !requested || requested.includes("\\") || requested.split("/").some((part) => !part || part === "." || part === "..") || path.posix.normalize(requested) !== requested) return null;
  const bass = path.join(directory, "BASS"), projects = path.join(bass, "projects"), project = path.join(projects, name);
  if (!safeDirectory(directory, bass) || !safeDirectory(bass, projects) || !safeDirectory(projects, project)) return null;
  const root = fs.realpathSync(project), artifact = path.join(root, ...requested.split("/"));
  if (!safeFile(root, artifact)) return null;
  const parts = requested.split("/"), feature = /^features\/(F-\d+)-[a-z0-9]+(?:-[a-z0-9]+)*\/feature\.md$/.exec(requested), story = /^features\/(F-\d+)-[a-z0-9]+(?:-[a-z0-9]+)*\/user-stories\/(US-\d+)-[a-z0-9]+(?:-[a-z0-9]+)*\/user-story\.md$/.exec(requested), idea = /^ideas\/(IDEA-\d+)-[a-z0-9]+(?:-[a-z0-9]+)*\/idea\.md$/.exec(requested), proposal = /^proposals\/(PRO-\d+)-[a-z0-9]+(?:-[a-z0-9]+)*\/proposal\.md$/.exec(requested), match = feature || story || idea || proposal;
  if (!match) return null;
  const decisionDirs = [path.join(path.dirname(artifact), "decisions")];
  if (story) decisionDirs.push(path.join(root, "features", parts[1], "decisions"));
  decisionDirs.push(path.join(root, "decisions"));
  return { root, artifact, requested, expectedId: match[match.length - 1], type: feature ? "feature" : story ? "userStory" : idea ? "idea" : "proposal", decisionDirs };
}
function lineAt(text, needle) { const index = text.indexOf(needle); return index < 0 ? 1 : text.slice(0, index).split("\n").length; }
function waiver(resolved, finding) {
  const indexed = (id, recordPath) => {
    const log = path.join(resolved.root, "decision-log.md"); if (!safeFile(resolved.root, log)) return false;
    const lines = fs.readFileSync(log, "utf8").replace(/\r/g, "").split("\n"), heading = lines.indexOf("# Decision Log"); if (heading < 0) return false;
    let header = heading + 1; while (header < lines.length && !lines[header].startsWith("|")) header++; if (header >= lines.length) return false;
    const cells = (line) => line.startsWith("|") && line.endsWith("|") ? line.slice(1, -1).split("|").map((cell) => cell.trim()) : null;
    const expected = ["ID", "Decision", "Alternatives", "Supporting evidence", "Actor", "Date", "Related items", "Record"], columns = cells(lines[header]), separator = cells(lines[header + 1]);
    if (!columns || !separator || columns.length !== expected.length || columns.some((value, index) => value !== expected[index]) || separator.length !== expected.length || separator.some((value) => !/^---+$/.test(value))) return false;
    const link = `[${id}](${recordPath})`, matches = [];
    for (let row = header + 2; row < lines.length && lines[row].startsWith("|"); row++) { const values = cells(lines[row]); if (!values || values.length !== expected.length) return false; if (values[0] === id && values[7] === link) matches.push(values); }
    return matches.length === 1;
  }, completeProvenance = (text) => {
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)?.[1] || "";
    return /^provenance:\r?\n(?:  [^\n]*\r?\n)*?  classification:\s*Decision\s*$/m.test(frontmatter) && /^  sources:\r?\n    - type:\s*\S+\r?\n      reference:\s*\S+\r?\n      location:\s*.+\S\r?\n      retrieved_date:\s*\d{4}-\d{2}-\d{2}\s*$/m.test(frontmatter) && /^  actor:\s*\S+/m.test(frontmatter) && /^  date:\s*\d{4}-\d{2}-\d{2}\s*$/m.test(frontmatter) && /^  confidence:\s*\S+/m.test(frontmatter) && /^  source_version:\s*\S+/m.test(frontmatter) && /^  related_items:\r?\n    - \S+/m.test(frontmatter);
  };
  for (const decisions of resolved.decisionDirs) { if (!safeDirectory(resolved.root, decisions)) continue;
    for (const name of fs.readdirSync(decisions)) { const record = path.join(decisions, name); if (!safeFile(decisions, record)) continue; const text = fs.readFileSync(record, "utf8"), id = field(text, "id");
    const section = (heading) => new RegExp(`## ${heading}\\n\\n([^\\n]+)`).exec(text)?.[1].trim(), rationale = /## Rationale\n\n([^\n][\s\S]*?)(?=\n\n## |$)/.exec(text)?.[1].trim(), residualRisk = /## Residual Risk\n\n([^\n][\s\S]*?)(?=\n\n## |$)/.exec(text)?.[1].trim();
      const recordPath = path.relative(resolved.root, record).replace(/\\/g, "/");
      if (provenanceClassification(text) === "Decision" && completeProvenance(text) && id && indexed(id, recordPath) && section("Finding ID") === finding.id && section("Check") === finding.check && section("Location") === finding.location && section("Evidence Fingerprint") === finding.fingerprint && rationale && residualRisk) return { decisionId: id, path: recordPath, rationale, residualRisk };
    }
  } return null;
}
function reviewArtifact(input) {
  const resolved = canonical(input); if (!resolved) return blocked("Canonical artifact containment cannot be verified.");
  const text = typeof input.inMemoryArtifact === "string" ? input.inMemoryArtifact : fs.readFileSync(resolved.artifact, "utf8"), artifactId = field(text, "id"), artifactVersion = field(text, "version");
  if (artifactId !== resolved.expectedId || !/^v\d+\.\d+$/.test(artifactVersion)) return blocked("Canonical artifact ID and vX.Y version are required.");
  const findings = [];
  const add = (check, test, severity, impact, section) => { if (!test) return; const line = lineAt(text, section), location = `${resolved.requested}:${line}`, evidence = `${section} at line ${line} is nonconforming.`, fingerprint = createHash("sha256").update(`${check}\n${location}\n${evidence}`, "utf8").digest("hex"), item = { id: `REV-${fingerprint.slice(0, 16)}`, severity, check, evidence, location, fingerprint, impact, recommendation: "Provide cited canonical artifact content; do not infer missing content.", status: "open" }; const approved = (severity === "Critical" || severity === "Major") && waiver(resolved, item); if (approved) { item.status = "waived"; item.waiver = approved; } findings.push(item); };
  const missing = (heading, noneOk = false) => !new RegExp(`## ${heading}\\n\\n(?:\\s|$)*`, "m").test(text) || (!noneOk && new RegExp(`## ${heading}\\n\\n-?\\s*(?:None\\.|$)`, "m").test(text));
  const section = (heading, check, impact, severity = "Major", noneOk = false) => add(check, missing(heading, noneOk), severity, impact, `## ${heading}`);
  add("ambiguity", /\b(?:TBD|to be determined|etc\.)\b/i.test(text), "Minor", "The artifact contains ambiguous language.", "TBD");
  add("consistency", /\b(?:Conflict|contradict(?:ion|ory))\b/i.test(text), "Major", "The artifact declares an unresolved consistency conflict.", "Conflict");
  if (resolved.type === "feature" || resolved.type === "userStory") {
    section("Goal", "clarity", "The artifact has no clear outcome."); section("Scope", "completeness", "The artifact lacks a canonical scope section.");
    add("testability", /## (?:Given\/When\/Then )?Acceptance Criteria\n\n(?:- None\.|\s*$)/m.test(text), "Major", "The artifact has no testable acceptance criteria.", "## Given/When/Then Acceptance Criteria");
    add("dependencies", !/## Dependencies/.test(text), "Minor", "The artifact lacks a dependencies section.", "#"); add("risks", !/## Risks/.test(text), "Minor", "The artifact lacks a risks section.", "#");
    add("provenance", !/## Cited Evidence/.test(text) || !/\|\s*(?:Fact|Inference|Decision)\s*\|/.test(text), "Critical", "The artifact has no cited Fact, Inference, or Decision evidence.", "## Cited Evidence");
  } else if (resolved.type === "idea") {
    section("Problem or Opportunity", "clarity", "The Idea lacks a problem or opportunity."); section("Proposal", "completeness", "The Idea lacks a proposal."); section("Expected Value", "value", "The Idea lacks expected value."); section("Scope and Considerations", "scope", "The Idea lacks scope and considerations."); section("Next Step", "next_step", "The Idea lacks a next step."); section("Related Evidence and Decisions", "provenance", "The Idea lacks related evidence or decisions.");
  } else {
    section("Problem or Opportunity", "clarity", "The proposal lacks a problem or opportunity."); section("Proposed Change", "completeness", "The proposal lacks a proposed change."); section("Expected Value", "value", "The proposal lacks expected value."); section("Scope", "scope", "The proposal lacks scope."); section("Out of Scope", "out_of_scope", "The proposal lacks out-of-scope content.", "Major", true); section("Rules", "rules", "The proposal lacks rules."); section("Dependencies", "dependencies", "The proposal lacks dependencies.", "Minor", true); section("Risks", "risks", "The proposal lacks risks.", "Minor", true); section("Assumptions", "assumptions", "The proposal lacks assumptions.", "Major", true); section("Questions", "questions", "The proposal lacks questions.", "Major", true); section("Next Step", "next_step", "The proposal lacks a next step.");
    add("provenance", !/## Cited Evidence/.test(text) || !/\|\s*(?:Fact|Inference|Assumption|Proposal|Question|Conflict|Decision)\s*\|/.test(text), "Critical", "The proposal has no cited canonical D3 evidence.", "## Cited Evidence");
  }
  const unresolvedQuestions = /## Questions\n\n([\s\S]*?)(?=\n\n## |$)/.exec(text)?.[1].split("\n").filter((line) => /^- (?!None\.)/.test(line)).map((line) => line.slice(2)) || [];
  const status = findings.some((item) => ["Critical", "Major"].includes(item.severity) && item.status !== "waived") ? "blocked" : findings.length ? "pass_with_advisories" : "pass";
  return { artifactPath: resolved.requested, artifactVersion, status, findings, unresolvedQuestions, reviewDecision: status === "blocked" ? "blocked pending resolution or Decision waiver" : "approval eligible", sources: [{ path: resolved.requested, location: "artifact" }] };
}
const BassReviewArtifactPlugin = async () => ({ tool: { bass_review_artifact: tool({ description: "Review one canonical local BASS artifact without remote operations.", args: { projectName: tool.schema.string(), artifactPath: tool.schema.string() }, async execute(args, context) { return JSON.stringify(reviewArtifact({ ...args, directory: context.directory })); } }) } });
module.exports = { reviewArtifact, BassReviewArtifactPlugin };
