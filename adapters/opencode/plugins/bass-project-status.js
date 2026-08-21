"use strict";
const fs = require("node:fs");
const path = require("node:path");
let tool; try { ({ tool } = require("@opencode-ai/plugin")); } catch { tool = (definition) => definition; tool.schema = { string: () => ({ optional: () => ({}) }) }; }
let reviewArtifact; try { ({ reviewArtifact } = require("./bass-review-artifact.runtime.js")); } catch { try { ({ reviewArtifact } = require("./bass-review-artifact.js")); } catch {} }

function invalidProjectName(value) { return /[\\/]/.test(value) || value === "." || value === ".." || !value; }
function within(root, target) { const relative = path.relative(root, target); return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".."); }
function safeDirectory(root, target) { try { if (!fs.existsSync(root) || !fs.existsSync(target) || fs.lstatSync(root).isSymbolicLink() || fs.lstatSync(target).isSymbolicLink() || !fs.statSync(root).isDirectory() || !fs.statSync(target).isDirectory()) return false; return within(fs.realpathSync(root), fs.realpathSync(target)); } catch { return false; } }
function safeFile(root, target) { try { return fs.existsSync(root) && fs.existsSync(target) && !fs.lstatSync(root).isSymbolicLink() && !fs.lstatSync(target).isSymbolicLink() && fs.statSync(target).isFile() && within(fs.realpathSync(root), fs.realpathSync(target)); } catch { return false; } }
function wikiUrl(text, section) {
  const lines = text.split(/\r?\n/), start = lines.findIndex((line) => line === `## ${section}`), end = lines.findIndex((line, index) => index > start && line.startsWith("## "));
  const values = start < 0 ? [] : lines.slice(start + 1, end < 0 ? undefined : end).map((line) => line.match(/^- URL:\s*`?([^`\s]+)`?\s*$/)?.[1]).filter(Boolean);
  return values.length === 1 ? values[0] : undefined;
}
function validWikiUrl(value) { if (!value || /replace-with|example|placeholder|fictional|</i.test(value)) return false; try { const url = new URL(value); return url.origin === "https://dev.azure.com" && /^\/[^/]+\/[^/]+\/_wiki\/wikis\/[^/]+(?:\/.*)?$/.test(url.pathname); } catch { return false; } }
function walk(root, current = root, out = []) {
  if (!safeDirectory(root, current)) return out;
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const target = path.join(current, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) walk(root, target, out);
    else if (entry.isFile() && safeFile(root, target)) out.push(target);
  }
  return out;
}
function tableRows(text) { return text.split(/\r?\n/).filter((line) => /^\|/.test(line)).slice(2); }
function countEvidence(text) {
  const counts = { total: 0, facts: 0, inferences: 0, assumptions: 0, questions: 0, conflicts: 0, decisions: 0 };
  for (const row of tableRows(text)) {
    const cells = row.slice(1, -1).split("|").map((cell) => cell.trim()); if (cells.length < 2) continue;
    counts.total++; const classification = cells[1].toLowerCase();
    if (classification === "fact") counts.facts++; else if (classification === "inference") counts.inferences++; else if (classification === "assumption") counts.assumptions++; else if (classification === "question") counts.questions++; else if (classification === "conflict") counts.conflicts++; else if (classification === "decision") counts.decisions++;
  }
  return counts;
}
function projectStatus(input) {
  if (!input || typeof input !== "object") return { status: "blocked", error: { code: "invalid_input", message: "Status input must be an object." } };
  const directory = String(input.directory || ""), requested = String(input.projectName || "").trim(), bassRoot = path.join(directory, "BASS"), projectsRoot = path.join(bassRoot, "projects");
  if (!directory || !safeDirectory(directory, bassRoot) || !safeDirectory(bassRoot, projectsRoot)) return { status: "blocked", error: { code: "invalid_distribution", message: "Trusted BASS/projects root is unavailable." } };
  if (requested && invalidProjectName(requested)) return { status: "blocked", error: { code: "invalid_project_name", message: "Project name must be one direct child name under BASS/projects/." } };
  const names = fs.readdirSync(projectsRoot).filter((name) => safeDirectory(projectsRoot, path.join(projectsRoot, name)));
  const projectName = requested || (names.length === 1 ? names[0] : undefined);
  if (!projectName) return { status: "blocked", error: { code: "project_selection_required", message: names.length ? "Multiple BASS projects exist; select one." : "No BASS project exists." }, projects: names };
  const projectRoot = path.join(projectsRoot, projectName);
  if (!names.includes(projectName) || !safeDirectory(projectsRoot, projectRoot)) return { status: "blocked", error: { code: "project_not_found", message: `Project '${projectName}' was not found.` }, projects: names };

  const registryPath = path.join(projectRoot, "project-context", "context-registry.md");
  let functional = { configured: false, value: null }, technical = { configured: false, value: null };
  if (safeFile(projectRoot, registryPath)) {
    const registry = fs.readFileSync(registryPath, "utf8"), f = wikiUrl(registry, "Functional ADO Wiki"), t = wikiUrl(registry, "Technical ADO Wiki");
    functional = { configured: validWikiUrl(f), value: f || null }; technical = { configured: validWikiUrl(t), value: t || null };
  }
  const files = walk(projectRoot), relative = (file) => path.relative(projectRoot, file).replace(/\\/g, "/");
  const featurePaths = files.map(relative).filter((item) => /^features\/F-\d+-[a-z0-9]+(?:-[a-z0-9]+)*\/feature\.md$/.test(item));
  const storyPaths = files.map(relative).filter((item) => /^features\/F-\d+-[a-z0-9]+(?:-[a-z0-9]+)*\/user-stories\/US-\d+-[a-z0-9]+(?:-[a-z0-9]+)*\/user-story\.md$/.test(item));
  const ideaPaths = files.map(relative).filter((item) => /^ideas\/IDEA-\d+-[a-z0-9]+(?:-[a-z0-9]+)*\/idea\.md$/.test(item));
  const proposalPaths = files.map(relative).filter((item) => /^proposals\/PRO-\d+-[a-z0-9]+(?:-[a-z0-9]+)*\/proposal\.md$/.test(item));
  const artifactPaths = [...featurePaths, ...storyPaths, ...ideaPaths, ...proposalPaths];
  const evidencePath = path.join(projectRoot, "evidence-register.md");
  const evidence = safeFile(projectRoot, evidencePath) ? countEvidence(fs.readFileSync(evidencePath, "utf8")) : { total: 0, facts: 0, inferences: 0, assumptions: 0, questions: 0, conflicts: 0, decisions: 0 };

  const reviews = { checked: 0, blocked: 0, advisory: 0, pass: 0, unavailable: 0, blockedArtifacts: [] };
  if (typeof reviewArtifact === "function") {
    for (const artifactPath of artifactPaths) {
      const result = reviewArtifact({ directory, projectName, artifactPath }); reviews.checked++;
      if (result.status === "blocked") { reviews.blocked++; reviews.blockedArtifacts.push(artifactPath); }
      else if (result.status === "pass_with_advisories") reviews.advisory++;
      else if (result.status === "pass") reviews.pass++;
      else reviews.unavailable++;
    }
  } else reviews.unavailable = artifactPaths.length;

  const capabilityFiles = ["ado-read-capabilities.md", "ado-discovery-capabilities.md", "ado-write-capabilities.md"].map((name) => path.join(projectRoot, "project-context", name));
  const adoConfigured = capabilityFiles.some((file) => safeFile(projectRoot, file));
  const gaps = [];
  if (!functional.configured) gaps.push("Functional ADO Wiki is not configured with a valid non-placeholder URL.");
  if (!technical.configured) gaps.push("Technical ADO Wiki is not configured with a valid non-placeholder URL.");
  if (!adoConfigured) gaps.push("No ADO capability mapping file is configured; live ADO connectivity remains unverified.");

  let nextAction = "No blocking local project issue was detected; continue with the user's current BA goal.";
  if (!functional.configured || !technical.configured) nextAction = "Configure the missing Functional/Technical ADO Wiki references in project-context/context-registry.md.";
  else if (evidence.conflicts > 0) nextAction = "Resolve the highest-impact cited Conflict before creating or publishing dependent artifacts.";
  else if (reviews.blocked > 0) nextAction = `Review and improve ${reviews.blockedArtifacts[0]} before publication.`;
  else if (evidence.questions > 0) nextAction = "Investigate the highest-impact open Question/evidence gap.";

  return {
    status: gaps.length || evidence.conflicts || reviews.blocked ? "warning" : "ready",
    projectName,
    context: { functionalWiki: functional, technicalWiki: technical },
    ado: { capabilityMappingPresent: adoConfigured, liveConnectivity: "unknown", note: "This deterministic status tool does not call MCP or Azure DevOps." },
    artifacts: { ideas: ideaPaths.length, features: featurePaths.length, userStories: storyPaths.length, proposals: proposalPaths.length, total: artifactPaths.length },
    evidence,
    reviewHealth: reviews,
    gaps,
    nextAction
  };
}
const BassProjectStatusPlugin = async () => ({ tool: { bass_project_status: tool({ description: "Return deterministic local BASS project health without MCP or Azure DevOps calls.", args: { projectName: tool.schema.string().optional() }, async execute(args, context) { return JSON.stringify(projectStatus({ ...args, directory: context.directory })); } }) } });
module.exports = { projectStatus, BassProjectStatusPlugin };
