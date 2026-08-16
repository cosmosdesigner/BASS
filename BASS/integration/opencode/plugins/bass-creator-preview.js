"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BassCreatorPreviewPlugin = void 0;
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const plugin_1 = require("@opencode-ai/plugin");
const issued = (globalThis.__bassCreatorIssuedPreviews ||= new Map());
const types = new Set(["feature", "user_story", "acceptance_criteria", "proposal"]), evidenceTypes = new Set(["local_file", "ado_wiki", "ado_work_item", "ado_comment", "ado_pull_request", "ado_pipeline"]), classes = new Set(["Fact", "Inference", "Assumption", "Proposal", "Question", "Conflict", "Decision"]);
const badProject = (v) => !v || /[\\/]/.test(v) || v === "." || v === "..";
const dir = (p) => (0, node_fs_1.existsSync)(p) && !(0, node_fs_1.lstatSync)(p).isSymbolicLink() && (0, node_fs_1.statSync)(p).isDirectory();
const within = (root, p) => { const r = (0, node_path_1.relative)(root, p); return r === "" || (!r.startsWith(`..${node_path_1.sep}`) && r !== ".."); };
const file = (root, p) => { try {
    return (0, node_fs_1.existsSync)(p) && !(0, node_fs_1.lstatSync)(p).isSymbolicLink() && within(root, (0, node_fs_1.realpathSync)(p));
}
catch {
    return false;
} };
const field = (text, key) => text.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"))?.[1].replace(/["']/g, "").trim() || "";
const slug = (v) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled";
const digest = (v) => (0, node_crypto_1.createHash)("sha256").update(v, "utf8").digest("hex");
function records(project, root) { const out = [], features = (0, node_path_1.join)(project, "features"); if (!dir(features))
    return out; for (const name of (0, node_fs_1.readdirSync)(features)) {
    const folder = (0, node_path_1.join)(features, name), feature = (0, node_path_1.join)(folder, "feature.md");
    if (!file(root, feature))
        continue;
    const id = field((0, node_fs_1.readFileSync)(feature, "utf8"), "id");
    out.push({ id, type: "feature", file: feature, directory: folder });
    const stories = (0, node_path_1.join)(folder, "user-stories");
    if (dir(stories))
        for (const story of (0, node_fs_1.readdirSync)(stories)) {
            const storyFile = (0, node_path_1.join)(stories, story, "user-story.md");
            if (file(root, storyFile))
                out.push({ id: field((0, node_fs_1.readFileSync)(storyFile, "utf8"), "id"), type: "user_story", file: storyFile, directory: (0, node_path_1.join)(stories, story) });
        }
} return out; }
function id(type, project, root) { const prefix = type === "feature" ? "F" : type === "user_story" ? "US" : "PRO", source = type === "proposal" ? (() => { const out = [], proposals = (0, node_path_1.join)(project, "proposals"); if (!dir(proposals))
    return out; for (const name of (0, node_fs_1.readdirSync)(proposals)) {
    const proposal = (0, node_path_1.join)(proposals, name, "proposal.md");
    if (file(root, proposal))
        out.push(Number(field((0, node_fs_1.readFileSync)(proposal, "utf8"), "id").match(/^PRO-(\d+)$/)?.[1] || 0));
} return out; })() : records(project, root).map((r) => Number(r.id.match(new RegExp(`^${prefix}-(\\d+)$`))?.[1] || 0)); return `${prefix}-${String(Math.max(0, ...source) + 1).padStart(3, "0")}`; }
const blocked = (message, markdown = "", gaps = [message], questions = [], conflicts = []) => ({ previewId: "", writeStatus: "blocked", artifactMarkdown: markdown, gaps, questions, conflicts });
function render(id, type, title, evidence, assumptions, related, artifact = "", target = "") {
    const basis = evidence.find((e) => e.classification === "Fact" || e.classification === "Inference") || evidence[0] || assumptions[0], claim = basis.claim || "the cited context applies", citations = evidence.map((e) => `- ${e.claim || "No claim supplied."} [source: ${e.source}; type: ${e.type}; location: ${e.location}; classification: ${e.classification}; confidence: ${e.confidence}]`).join("\n"), rows = evidence.map((e) => `| ${e.classification} | ${e.type} | ${e.source} | ${e.location} | ${e.confidence} | ${e.claim || "No claim supplied."} |`).join("\n"), criteria = `### AC-001: ${title}\n\n- Given ${claim}\n- When the user performs the proposed action\n- Then the observable outcome meets the cited need\n- Evidence or assumption: ${basis.classification} [source: ${basis.source}; type: ${basis.type}; location: ${basis.location}; confidence: ${basis.confidence}]`;
    if (type === "acceptance_criteria")
        return `# Acceptance Criteria Update: ${target}\n\n## Acceptance Criteria\n\n${criteria}${[...evidence.filter((e) => e.classification === "Assumption"), ...assumptions].map((e) => `\n\n### Assumptions\n\n- ${e.claim || e.source} [classification: Assumption; source: ${e.source}; location: ${e.location}; confidence: ${e.confidence}]`).join("")}\n\n## Changelog\n\n- 2026-08-14: Proposed approval-bound update for ${target}.`;
    const front = [`---`, `id: ${id}`, `title: "${title.replace(/"/g, "'")}"`, "version: v1.0", "created_date: 2026-08-14", "updated_date: 2026-08-14", "derived_from: null", "supersedes: null", ...(type === "user_story" ? [`parent_feature_id: ${target}`] : []), "ado_work_item_id: null", "ado_work_item_url: null", "provenance:", "  classification: Proposal", "  sources:", ...evidence.map((e) => `    - type: ${e.type}\n      reference: ${e.source}\n      location: "${e.location}"\n      retrieved_date: 2026-08-14`), "  actor: BASS", "  date: 2026-08-14", "  confidence: high", "  source_version: v1.0", ...(related.length ? ["  related_items:", ...related.map((r) => `    - ${r.id}`)] : []), "---"].join("\n");
    const proposal = type === "proposal" ? `## Problem or Opportunity\n\n${claim}\n\n## Proposed Change\n\n${title}\n\n## Expected Value\n\nAddress the cited opportunity.\n\n## Scope\n\n${citations}\n\n## Out of Scope\n\n- None identified.\n\n## Rules\n\n- None identified.\n\n## Dependencies\n\n- None identified.\n\n## Risks\n\n- None identified.\n\n## Next Step\n\n- Review this proposal with the cited evidence.` : `${type === "user_story" ? `## User Story\n\nAs a user, I want ${title.toLowerCase()} so that the cited need is addressed.\n\n` : ""}## Goal\n\n${claim}\n\n## Scope\n\n${citations}\n\n## Out of Scope\n\n- None identified.\n\n## Business Rules\n\n- None identified.\n\n## Dependencies\n\n- None identified.\n\n## Risks\n\n- None identified.`;
    return `${front}\n\n# ${type === "feature" ? "Feature" : type === "user_story" ? "User Story" : "Functional Proposal"}: ${title}\n\n${proposal}\n\n## Assumptions\n\n${[...evidence.filter((e) => e.classification === "Assumption"), ...assumptions].map((e) => `- ${e.claim || e.source} [classification: Assumption; source: ${e.source}; location: ${e.location}; confidence: ${e.confidence}]`).join("\n") || "- None."}\n\n## Questions\n\n${evidence.filter((e) => e.classification === "Question").map((e) => `- ${e.claim || e.source}`).join("\n") || "- None."}\n\n## Cited Evidence\n\n| Classification | Source type | Source | Location | Confidence | Claim or relevance |\n| --- | --- | --- | --- | --- | --- |\n${rows}\n\n## Given/When/Then Acceptance Criteria\n\n${criteria}\n\n## ADO Link\n\n- Local preview only; no ADO operation occurred.\n\n## Related Evidence and Decisions\n\n${related.map((r) => `- [${r.id}](${(0, node_path_1.relative)((0, node_path_1.dirname)(artifact), r.file).split(node_path_1.sep).join("/")})`).join("\n") || citations}\n\n## Changelog\n\n| Date | Version | Change | Reason | Related records |\n| --- | --- | --- | --- | --- |\n| 2026-08-14 | v1.0 | Initial preview. | Awaiting explicit approval. | ${related.map((r) => r.id).join(", ") || evidence.map((e) => e.source).join(", ")} |`;
}
const BassCreatorPreviewPlugin = async () => ({ tool: { bass_creator_preview: (0, plugin_1.tool)({ description: "Create deterministic local-only BASS previews without network or remote operations.", args: { projectName: plugin_1.tool.schema.string().optional(), artifactType: plugin_1.tool.schema.string(), title: plugin_1.tool.schema.string(), evidence: plugin_1.tool.schema.array(plugin_1.tool.schema.object()), assumptions: plugin_1.tool.schema.array(plugin_1.tool.schema.string()).optional(), targetId: plugin_1.tool.schema.string().optional(), promoteTo: plugin_1.tool.schema.string().optional() }, async execute(args, context) {
                const name = String(args.projectName || "").trim(), type = String(args.artifactType || ""), title = String(args.title || "").trim(), evidence = Array.isArray(args.evidence) ? args.evidence : [], assumptions = args.assumptions === undefined ? [] : Array.isArray(args.assumptions) ? args.assumptions.map((assumption) => String(assumption).trim()) : [], explicitAssumptions = assumptions.map((claim) => ({ type: "explicit_input", source: "explicit_input", location: "assumptions", classification: "Assumption", confidence: "unverified", claim })), projects = (0, node_path_1.join)(context.directory, "BASS", "projects");
                if (badProject(name) || !dir(projects))
                    return blocked("Selected project is invalid or unavailable.");
                const project = (0, node_path_1.join)(projects, name);
                if (!dir(project) || (0, node_fs_1.lstatSync)(project).isSymbolicLink())
                    return blocked("Selected project containment cannot be verified.");
                const root = (0, node_fs_1.realpathSync)(project);
                if (!types.has(type) || !title || (!evidence.length && !assumptions.length) || evidence.some((e) => !e || !evidenceTypes.has(e.type) || !e.source || !e.location || !classes.has(e.classification) || !e.confidence) || assumptions.some((assumption) => !assumption))
                    return blocked("Input requires a supported artifact type, title, and typed complete cited evidence or explicit assumptions.");
                const ungroundedQuestions = evidence.filter((e) => e.classification === "Question").map((e) => e.claim || e.source), ungroundedConflicts = evidence.filter((e) => e.classification === "Conflict").map((e) => e.claim || e.source);
                const all = records(project, root), parent = type === "user_story" ? all.filter((r) => r.type === "feature" && r.id === args.targetId) : [], target = type === "acceptance_criteria" ? all.filter((r) => r.id === args.targetId) : [], newId = type === "acceptance_criteria" ? String(args.targetId) : id(type, project, root), artifactFile = type === "proposal" ? (0, node_path_1.join)(project, "proposals", `${newId}-${slug(title)}`, "proposal.md") : type === "user_story" ? (0, node_path_1.join)(parent[0]?.directory || "", "user-stories", `${newId}-${slug(title)}`, "user-story.md") : (0, node_path_1.join)(project, "features", `${newId}-${slug(title)}`, "feature.md"), related = evidence.map((e) => { const candidate = (0, node_path_1.join)(root, e.source), actual = file(root, candidate) ? field((0, node_fs_1.readFileSync)(candidate, "utf8"), "id") : "", requested = String(e.relatedItemId || ""); return /^(?:EVD|DEC)-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(actual) && (requested === actual || (!requested && new RegExp(`\\b${actual}\\b`).test(`${e.source} ${e.claim || ""}`))) ? { id: actual, type: "related", file: candidate, directory: (0, node_path_1.dirname)(candidate) } : undefined; }).filter(Boolean).filter((r, i, values) => values.findIndex((other) => other.id === r.id) === i);
                if (!evidence.some((e) => e.classification === "Fact" || e.classification === "Inference"))
                    return blocked("Evidence requires at least one Fact or Inference.", render(newId, type, title, evidence, explicitAssumptions, related, artifactFile, String(args.targetId || "")), ["Evidence has no Fact or Inference."], ungroundedQuestions, ungroundedConflicts);
                if ((type === "user_story" && parent.length !== 1) || (type === "acceptance_criteria" && target.length !== 1))
                    return blocked("Target must resolve to one canonical existing record.");
                const conflicts = evidence.filter((e) => e.classification === "Conflict").map((e) => e.claim || e.source), questions = evidence.filter((e) => e.classification === "Question").map((e) => e.claim || e.source), gaps = conflicts.length ? ["Resolve cited conflicts before approval or ADO preview."] : [], artifact = render(newId, type, title, evidence, explicitAssumptions, related, artifactFile, String(args.targetId || ""));
                if (conflicts.length)
                    return blocked("Preview is incomplete or conflicted.", artifact, gaps, questions, conflicts);
                const previewId = (0, node_crypto_1.randomUUID)(), integrityHash = digest(artifact), adoPreview = (type === "feature" || type === "user_story" || (type === "proposal" && ["feature", "user_story"].includes(args.promoteTo))) ? { type: type === "proposal" ? (args.promoteTo === "user_story" ? "User Story" : "Feature") : type === "user_story" ? "User Story" : "Feature", title, description: artifact.match(/## (?:Goal|Problem or Opportunity)\n\n([^\n]+)/)?.[1] || title, acceptanceCriteria: artifact.match(/## Given\/When\/Then Acceptance Criteria\n\n([\s\S]*?)(?=\n\n## )/)?.[1] || "", parentOrLinkTarget: parent[0]?.id || null, tags: [], area: null, iteration: null, priority: null, effort: null, unavailableMappings: ["tags", "area", "iteration", "priority", "effort"] } : undefined;
                issued.set(previewId, { projectName: name, artifactType: type, id: newId, title, directory: `${newId}-${slug(title)}`, markdown: artifact, hash: integrityHash, evidence, parent: type === "acceptance_criteria" ? target[0] : parent[0] });
                return { previewId, writeStatus: "ready_for_approval", artifactMarkdown: artifact, integrityHash, adoPreview, gaps, questions, conflicts };
            } }) } });
exports.BassCreatorPreviewPlugin = BassCreatorPreviewPlugin;
