"use strict";
const fs = require("node:fs");
const path = require("node:path");
let tool; try { ({ tool } = require("@opencode-ai/plugin")); } catch { tool = (definition) => definition; tool.schema = { string: () => ({ optional: () => ({}) }) }; }

function blocked(code, message, nextAction) {
  return { status: "blocked", error: { code, message }, created: [], nextAction };
}
function validProjectName(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ""));
}
function validWikiUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.origin === "https://dev.azure.com" && /^\/[^/]+\/[^/]+\/_wiki\/wikis\/[^/]+(?:\/.*)?$/.test(url.pathname);
  } catch { return false; }
}
function within(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== "..");
}
function safeDirectory(root, target) {
  try {
    if (!fs.existsSync(root) || !fs.existsSync(target) || fs.lstatSync(root).isSymbolicLink() || fs.lstatSync(target).isSymbolicLink() || !fs.statSync(root).isDirectory() || !fs.statSync(target).isDirectory()) return false;
    return within(fs.realpathSync(root), fs.realpathSync(target));
  } catch { return false; }
}
function titleFromName(name) {
  return name.split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(" ");
}
function starterRegistry(projectTitle, functionalWikiUrl, technicalWikiUrl, date) {
  const functional = functionalWikiUrl || "<replace-with-official-functional-wiki-url>";
  const technical = technicalWikiUrl || "<replace-with-official-technical-wiki-url>";
  return `---\nid: CTX-REG-001\ntitle: "${projectTitle} Context Registry"\nversion: v1.0\ncreated_date: ${date}\nupdated_date: ${date}\nderived_from: null\nsupersedes: null\n---\n\n# Context Registry\n\nThis registry contains configured source references. A configured URL is not evidence that the source is reachable, authoritative, or readable until an approved read workflow verifies it.\n\n## Functional ADO Wiki\n\n- URL: \`${functional}\`\n\n## Technical ADO Wiki\n\n- URL: \`${technical}\`\n\n## Changelog\n\n| Date | Version | Change | Reason | Related records |\n| --- | --- | --- | --- | --- |\n| ${date} | v1.0 | Initialized project context registry. | Explicit BASS project initialization. | None |\n`;
}
function starterLog(kind, heading, columns, date) {
  const id = kind === "evidence" ? "REG-EVD-001" : kind === "decision" ? "REG-DEC-001" : "ACT-001";
  const title = kind === "evidence" ? "Project evidence register" : kind === "decision" ? "Project decision log" : "Project action log";
  const separator = columns.map(() => "---");
  return `---\nid: ${id}\ntitle: ${title}\nversion: v1.0\ncreated_date: ${date}\nupdated_date: ${date}\nderived_from: null\nsupersedes: null\nprovenance:\n  classification: Fact\n  sources: []\n  actor: BASS\n  date: ${date}\n  confidence: high\n  source_version: v1.0\n  related_items: []\n---\n\n# ${heading}\n\nThis empty register is a local initialization Fact. It contains no source evidence until records are added through an approved workflow.\n\n| ${columns.join(" | ")} |\n| ${separator.join(" | ")} |\n\n## Changelog\n\n| Date | Version | Change | Reason | Related records |\n| --- | --- | --- | --- | --- |\n| ${date} | v1.0 | Initialized empty ${heading.toLowerCase()}. | Explicit BASS project initialization. | None |\n`;
}
function starterContext(title, heading, date, sections) {
  return `---\ntitle: "${title}"\nversion: v1.0\ncreated_date: ${date}\nupdated_date: ${date}\n---\n\n# ${heading}\n\n${sections.map((section) => `## ${section}\n\n`).join("")}## Changelog\n\n| Date | Version | Change | Reason | Related records |\n| --- | --- | --- | --- | --- |\n| ${date} | v1.0 | Initialized empty context file. | Explicit BASS project initialization. | None |\n`;
}
function normalizeInitProjectInput(args, directory) {
  return {
    ...args,
    directory,
    functionalWikiUrl: args.functionalWikiUrl ?? "",
    technicalWikiUrl: args.technicalWikiUrl ?? ""
  };
}
function initProject(input) {
  if (!input || typeof input !== "object") return blocked("invalid_input", "Initialization input must be an object.", "Provide one project name.");
  const directory = String(input.directory || "");
  const projectName = String(input.projectName || "").trim();
  const projectTitle = String(input.projectTitle || "").trim() || titleFromName(projectName);
  const functionalWikiUrl = String(input.functionalWikiUrl || "").trim();
  const technicalWikiUrl = String(input.technicalWikiUrl || "").trim();
  if (!directory) return blocked("missing_runtime_directory", "OpenCode runtime directory is required.", "Run BASS from the host repository root.");
  if (!validProjectName(projectName)) return blocked("invalid_project_name", "Project name must be a lowercase direct-child slug using letters, numbers, and hyphens only.", "Use a name such as customer-onboarding.");
  if (!validWikiUrl(functionalWikiUrl)) return blocked("invalid_functional_wiki_url", "Functional Wiki URL must be an Azure DevOps Wiki URL when supplied.", "Provide an official https://dev.azure.com/.../_wiki/wikis/... URL or omit it for now.");
  if (!validWikiUrl(technicalWikiUrl)) return blocked("invalid_technical_wiki_url", "Technical Wiki URL must be an Azure DevOps Wiki URL when supplied.", "Provide an official https://dev.azure.com/.../_wiki/wikis/... URL or omit it for now.");

  const bassRoot = path.join(directory, "BASS");
  const projectsRoot = path.join(bassRoot, "projects");
  if (!safeDirectory(directory, bassRoot)) return blocked("invalid_distribution", "BASS is unavailable or outside the trusted runtime root.", "Install the complete BASS distribution before initializing a project.");
  try {
    if (!fs.existsSync(projectsRoot)) fs.mkdirSync(projectsRoot);
  } catch (error) {
    return blocked("invalid_distribution", `BASS/projects could not be created: ${error.message}`, "Restore a writable BASS distribution root and rerun /bass init.");
  }
  if (!safeDirectory(bassRoot, projectsRoot)) return blocked("invalid_distribution", "BASS/projects is unavailable or outside the trusted BASS root.", "Restore a writable BASS distribution root before initializing a project.");
  const projectRoot = path.join(projectsRoot, projectName);
  if (!within(projectsRoot, projectRoot)) return blocked("path_escape", "Project path failed containment validation.", "Use a direct-child project slug.");
  if (fs.existsSync(projectRoot)) return blocked("project_exists", `Project '${projectName}' already exists.`, `Run /bass status ${projectName} or choose a different project name.`);

  const date = new Date().toISOString().slice(0, 10);
  const directories = [
    "project-context/functional", "project-context/technical", "ideas", "features", "proposals", "decisions"
  ];
  const files = new Map([
    ["project-context/context-registry.md", starterRegistry(projectTitle, functionalWikiUrl, technicalWikiUrl, date)],
    ["project-context/functional/functional-context.md", starterContext(`${projectTitle} Functional Context`, "Functional Context", date, ["Purpose", "Scope", "Business Process", "Users and Stakeholders", "Business Rules", "Assumptions and Constraints", "Source Links"])],
    ["project-context/technical/technical-context.md", starterContext(`${projectTitle} Technical Context`, "Technical Context", date, ["Purpose", "System Landscape", "Architecture and Integrations", "Data and Interfaces", "Security and Compliance", "Technical Constraints", "Source Links"])],
    ["evidence-register.md", starterLog("evidence", "Evidence Register", ["ID", "Classification", "Title", "Sources", "Confidence", "Location", "Related items", "Record"], date)],
    ["decision-log.md", starterLog("decision", "Decision Log", ["ID", "Decision", "Alternatives", "Supporting evidence", "Actor", "Date", "Related items", "Record"], date)],
    ["action-log.md", starterLog("action", "Action Log", ["ID", "Operation", "Target", "Before/after or result", "Supporting evidence", "Decision", "Actor", "Date", "Status", "Record"], date)]
  ]);

  const created = [];
  try {
    fs.mkdirSync(projectRoot, { recursive: false }); created.push(`BASS/projects/${projectName}/`);
    for (const relative of directories) { fs.mkdirSync(path.join(projectRoot, relative), { recursive: true }); created.push(`BASS/projects/${projectName}/${relative}/`); }
    for (const [relative, content] of files) { fs.writeFileSync(path.join(projectRoot, relative), content, { encoding: "utf8", flag: "wx" }); created.push(`BASS/projects/${projectName}/${relative}`); }
  } catch (error) {
    try { fs.rmSync(projectRoot, { recursive: true, force: true }); } catch {}
    return blocked("initialization_failed", `Project initialization failed and was rolled back: ${error.message}`, "Resolve the filesystem issue and rerun /bass init.");
  }

  const missingSources = [!functionalWikiUrl ? "Functional ADO Wiki" : null, !technicalWikiUrl ? "Technical ADO Wiki" : null].filter(Boolean);
  return {
    status: missingSources.length ? "warning" : "ready",
    projectName,
    projectRoot: `BASS/projects/${projectName}`,
    created,
    gaps: missingSources.map((source) => ({ classification: "Question", claim: `${source} is not configured yet.` })),
    nextAction: missingSources.length ? `Configure ${missingSources.join(" and ")} in project-context/context-registry.md, then run /bass status ${projectName}.` : `Run /bass status ${projectName}.`
  };
}
const BassInitProjectPlugin = async () => ({ tool: { bass_init_project: tool({ description: "Initialize one contained BASS project scaffold without any Azure DevOps operation.", args: { projectName: tool.schema.string(), projectTitle: tool.schema.string().optional(), functionalWikiUrl: tool.schema.string().optional(), technicalWikiUrl: tool.schema.string().optional() }, async execute(args, context) { return JSON.stringify(initProject(normalizeInitProjectInput(args, context.directory))); } }) } });
module.exports = { initProject, normalizeInitProjectInput, BassInitProjectPlugin };
