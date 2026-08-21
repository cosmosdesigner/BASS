"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BassDiscoveryReportPlugin = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const plugin_1 = require("@opencode-ai/plugin");
const headings = ["Evidence Map", "Found Information", "Inferences", "Gaps", "Conflicts", "Risks", "Questions", "Sources"];
const invalidProject = (name) => !name || name.includes("/") || name.includes("\\") || name === "." || name === "..";
const directory = (path) => (0, node_fs_1.existsSync)(path) && !(0, node_fs_1.lstatSync)(path).isSymbolicLink() && (0, node_fs_1.statSync)(path).isDirectory();
const inside = (root, path) => { const result = (0, node_path_1.relative)(root, path); return result === "" || (!result.startsWith(`..${node_path_1.sep}`) && result !== ".."); };
const safeFile = (root, path) => { try {
    return (0, node_fs_1.existsSync)(path) && !(0, node_fs_1.lstatSync)(path).isSymbolicLink() && inside(root, (0, node_fs_1.realpathSync)(path));
}
catch {
    return false;
} };
const field = (text, name) => (text.match(new RegExp(`^${name}:\\s*(?:["']([^"']*)["']|(.+?))\\s*$`, "m"))?.slice(1).find(Boolean) || "").trim().replace(/^(null|~|false)$/i, "");
const list = (text, name) => { const flow = text.match(new RegExp(`^${name}:\\s*\\[([^\\]]*)\\]\\s*$`, "m"))?.[1]; if (flow !== undefined)
    return flow.split(",").map((value) => value.trim().replace(/^["']|["']$/g, "")).filter(Boolean); const body = text.match(new RegExp(`^${name}:\\s*$([\\s\\S]*?)(?=^[a-z_]+:|^---\\s*$)`, "m"))?.[1] || ""; return [...body.matchAll(/^\s*-\s*(.+?)\s*$/gm)].map((match) => match[1]); };
const provenance = (text, name) => { const block = text.match(/^provenance:\s*$([\s\S]*?)(?=^[a-z_]+:|^---\s*$)/m)?.[1] || ""; return (block.match(new RegExp(`^\\s{2}${name}:\\s*(.+?)\\s*$`, "m"))?.[1] || "").trim(); };
const provenanceSources = (text) => { const lines = text.split(/\r?\n/), start = lines.findIndex((line) => /^\s{2}sources:\s*$/.test(line)), entries = []; if (start < 0)
    return []; for (const line of lines.slice(start + 1)) {
    if (/^\s{2}[a-z_]+:/.test(line) || line === "---")
        break;
    if (/^\s{4}-\s*type:/.test(line))
        entries.push([line]);
    else if (entries.length)
        entries[entries.length - 1].push(line);
} return entries.map((entry) => { const value = (name) => entry.join("\n").match(new RegExp(`^\\s*(?:-\\s*)?${name}:\\s*(.+?)\\s*$`, "m"))?.[1]?.trim() || ""; return { type: value("type"), reference: value("reference"), location: value("location") }; }).filter((source) => source.reference); };
const conflictStatus = (text) => text.match(/^conflict:\s*$([\s\S]*?)(?=^[a-z_]+:|^---\s*$)/m)?.[1].match(/^\s{2}status:\s*(.+?)\s*$/m)?.[1].trim() || "unspecified";
const registryWikiUrls = (text) => ["Functional ADO Wiki", "Technical ADO Wiki"].flatMap((name) => [...section(text, name).matchAll(/^\s*-\s*URL:\s*`(https:\/\/dev\.azure\.com\/[^\s`]+\/_[Ww]iki\/[^\s`]+)`\s*$/gm)].map((match) => ({ category: "Wiki Search and Read", reference: match[1] })));
const section = (text, name) => { const lines = text.split(/\r?\n/), start = lines.findIndex((line) => line === `## ${name}`), end = lines.findIndex((line, index) => index > start && line.startsWith("## ")); return start < 0 ? "" : lines.slice(start + 1, end < 0 ? undefined : end).join("\n"); };
const localLinks = (text) => ["Related Evidence and Decisions", "Related Items", "Related Evidence and Items", "Outputs", "Questions", "Conflicts"].flatMap((name) => [...section(text, name).matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g)].map((match) => match[1]));
const relationDisputedBy = (conflict, relation, target) => conflict.conflict && conflict.conflictStatus.toLowerCase() === "open" && [...conflict.sources.map((source) => source.reference), ...conflict.relations, ...list(conflict.text, "related_items")].some((reference) => reference === relation || (target && reference.endsWith(`/${target.id}`)) || reference === target?.id);
function read(root, file, displayRoot) {
    const text = (0, node_fs_1.readFileSync)(file, "utf8"), sources = provenanceSources(text), source = sources[0];
    return { file, path: (0, node_path_1.relative)(displayRoot, file).split(node_path_1.sep).join("/"), text, id: field(text, "id"), title: field(text, "title"), classification: provenance(text, "classification") || "Unclassified", confidence: provenance(text, "confidence") || "unspecified", source: source?.reference || (0, node_path_1.relative)(displayRoot, file).split(node_path_1.sep).join("/"), location: source?.location || "Document", sources, relations: list(text, "ado_relation_references"), conflict: provenance(text, "classification") === "Conflict", conflictStatus: conflictStatus(text) };
}
function candidates(project, root) {
    const result = [], features = (0, node_path_1.join)(project, "features"), ideas = (0, node_path_1.join)(project, "ideas");
    if (directory(features))
        for (const feature of (0, node_fs_1.readdirSync)(features)) {
            const featureRoot = (0, node_path_1.join)(features, feature), file = (0, node_path_1.join)(featureRoot, "feature.md");
            if (/^F-[^-]+-.+$/.test(feature) && safeFile(root, file))
                result.push(file);
            const stories = (0, node_path_1.join)(featureRoot, "user-stories");
            if (directory(stories))
                for (const story of (0, node_fs_1.readdirSync)(stories)) {
                    const storyFile = (0, node_path_1.join)(stories, story, "user-story.md");
                    if (/^US-[^-]+-.+$/.test(story) && safeFile(root, storyFile))
                        result.push(storyFile);
                }
        }
    if (directory(ideas))
        for (const idea of (0, node_fs_1.readdirSync)(ideas)) {
            const file = (0, node_path_1.join)(ideas, idea, "idea.md");
            if (/^IDEA-[^-]+-.+$/.test(idea) && safeFile(root, file))
                result.push(file);
        }
    return result;
}
function matches(item, filters) {
    return Object.entries(filters).every(([key, raw]) => { const value = String(raw || "").trim().toLowerCase(); if (!value)
        return true; if (key === "id")
        return item.id.toLowerCase() === value; if (key === "text")
        return item.text.toLowerCase().includes(value); if (key === "url")
        return item.text.toLowerCase().includes(value); if (key === "tag")
        return list(item.text, "tags").some((tag) => tag.toLowerCase() === value); return field(item.text, key).toLowerCase() === value; });
}
const cited = (item, directness, relationship) => `[source: ${item.source}; location: ${item.location}; classification: ${item.classification}; confidence: ${item.confidence}; directness: ${directness}; relationship: ${relationship}]`;
function report(scope, status, coverage, entries) { return [`# Discovery Report: ${scope}`, `Status: ${status}`, `Coverage: ${coverage}`, "## Evidence Map", "### Nodes", ...(entries.Nodes || ["- None."]), "### Edges", ...(entries.Edges || ["- None."]), ...headings.slice(1).flatMap((heading) => [`## ${heading}`, ...(entries[heading] || ["- None."])])].join("\n\n"); }
const BassDiscoveryReportPlugin = async () => ({ tool: { bass_discovery_report: (0, plugin_1.tool)({ description: "Deterministically discover bounded local BASS context without MCP calls or mutations.", args: { projectName: plugin_1.tool.schema.string().optional(), filters: plugin_1.tool.schema.object() }, async execute(args, context) {
                const filters = args.filters || {}, allowed = new Set(["id", "url", "text", "type", "tag", "state", "area", "iteration"]), supplied = Object.entries(filters);
                if (!supplied.length || supplied.some(([key, value]) => !allowed.has(key) || typeof value !== "string" || !value.trim()))
                    return report("invalid filters", "blocked", "No filesystem sources loaded.", { Gaps: ["- Supply one or more nonempty string values using only id, url, text, type, tag, state, area, or iteration [source: input; location: filters; classification: Fact; confidence: high; directness: direct]."] });
                const name = args.projectName?.trim(), projects = (0, node_path_1.join)(context.directory, "BASS", "projects");
                if (name && invalidProject(name))
                    return report("invalid project", "blocked", "No filesystem sources loaded because projectName failed preflight.", { Gaps: ["- Selected project is invalid [source: input; location: projectName; classification: Fact; confidence: high; directness: direct]."] });
                if (!directory(projects))
                    return report("unavailable project", "blocked", "BASS/projects is unavailable.", { Gaps: ["- Project root is unavailable [source: BASS/projects; location: filesystem; classification: Fact; confidence: high; directness: direct]."] });
                const names = (0, node_fs_1.readdirSync)(projects).filter((candidate) => directory((0, node_path_1.join)(projects, candidate))), selected = name || (names.length === 1 ? names[0] : "");
                if (!selected || !names.includes(selected))
                    return report(selected || "unspecified", "blocked", "Selected project is unavailable.", { Gaps: ["- Selected project is unavailable [source: BASS/projects; location: filesystem; classification: Fact; confidence: high; directness: direct]."] });
                const project = (0, node_path_1.join)(projects, selected);
                if ((0, node_fs_1.lstatSync)(project).isSymbolicLink())
                    return report(selected, "blocked", "Selected project containment cannot be verified.", { Gaps: ["- Selected project is a symbolic link or junction [source: BASS/projects; location: filesystem; classification: Fact; confidence: high; directness: direct]."] });
                const root = (0, node_fs_1.realpathSync)(project), all = candidates(project, root).map((file) => read(root, file, context.directory)), found = all.filter((item) => matches(item, filters));
                if (!found.length)
                    return report("no local match", "blocked", `Searched ${selected} Feature, User Story, and Idea records; no record matched all supplied filters.`, { Gaps: ["- No local item satisfies every supplied filter [source: local records; location: selected project; classification: Fact; confidence: high; directness: direct]."] });
                const nodes = found.map((item) => ({ item, directness: "direct", relationship: "matched" })), edges = [];
                const add = (item, relationship, origin) => { if (!item)
                    return; edges.push({ origin, item, relationship }); if (!nodes.some((node) => node.item.file === item.file))
                    nodes.push({ item, directness: "one-hop", relationship }); };
                for (const item of found) {
                    const parent = field(item.text, "parent_feature_id"), linked = localLinks(item.text).flatMap((link) => { const file = (0, node_path_1.resolve)((0, node_path_1.join)(item.file, ".."), link); return safeFile(root, file) ? [read(root, file, context.directory)] : []; });
                    if (parent)
                        add(all.find((candidate) => candidate.id === parent), "parent", item);
                    for (const child of all.filter((candidate) => field(candidate.text, "parent_feature_id") === item.id))
                        add(child, "child", item);
                    for (const relation of item.relations) {
                        const target = all.find((candidate) => candidate.id === relation || relation.endsWith(`/${candidate.id}`));
                        if (!linked.some((conflict) => relationDisputedBy(conflict, relation, target)))
                            add(target, "related", item);
                    }
                    for (const artifact of linked)
                        add(artifact, "local artifact", item);
                }
                const entries = { Nodes: nodes.map((node) => `- ${node.item.id || node.item.title} (${node.relationship}) ${cited(node.item, node.directness, node.relationship)}`), Edges: edges.map((edge) => `- ${edge.origin.id || edge.origin.title} -> ${edge.item.id || edge.item.title} (${edge.relationship}) ${cited(edge.item, "one-hop", edge.relationship)}`), "Found Information": found.map((item) => `- ${item.id || item.title} was found locally ${cited(item, "direct", "matched")}`), Inferences: [], Gaps: [], Conflicts: [], Risks: [], Questions: [], Sources: nodes.map((node) => `- ${node.item.path} ${cited(node.item, node.directness, node.relationship)}`) };
                for (const node of nodes.filter((node) => node.item.conflict)) {
                    const sources = node.item.sources.map((source) => `${source.type}: ${source.reference} (${source.location})`).join("; ");
                    entries.Conflicts.push(`- ${node.item.id || node.item.title} status: ${node.item.conflictStatus}; competing sources: ${sources} ${cited(node.item, node.directness, node.relationship)}`);
                    if (node.item.conflictStatus.toLowerCase() === "open") {
                        entries.Risks.push(`- The disputed dependency is isolated and cannot support a dependency conclusion ${cited(node.item, node.directness, node.relationship)}`);
                        entries.Questions.push(`- What decision resolves ${node.item.id || node.item.title}? ${cited(node.item, node.directness, node.relationship)}`);
                    }
                }
                const registry = (0, node_path_1.join)(project, "project-context", "context-registry.md"), required = new Set();
                if (found.some((item) => item.relations.length || field(item.text, "ado_work_item_id") || field(item.text, "ado_work_item_url"))) {
                    required.add("Work Item Search and Filtering");
                    required.add("Hierarchy and Relations");
                }
                if (found.some((item) => item.sources.some((source) => source.type === "ado_comment")))
                    required.add("Comments and History");
                if (found.some((item) => item.sources.some((source) => source.type === "ado_wiki")) || (safeFile(root, registry) && registryWikiUrls((0, node_fs_1.readFileSync)(registry, "utf8")).length))
                    required.add("Wiki Search and Read");
                for (const category of required) {
                    const citation = `[source: local configuration; location: selected records; classification: Fact; confidence: high; directness: direct]`, questionCitation = `[source: none; location: ${category}; classification: Question; confidence: low; directness: direct; evidence_gap: local-only tool did not execute the required category]`;
                    entries.Gaps.push(`- Required ${category} is not executed by this local-only tool ${citation}.`);
                    entries.Risks.push(`- Risk: ${category} remains unexecuted and may leave discovery incomplete ${citation}.`);
                    entries.Questions.push(`- Question: What evidence from ${category} is needed to complete discovery? ${questionCitation}.`);
                }
                const status = entries.Gaps.length || entries.Conflicts.length ? "warning" : "ready";
                return report(found.map((item) => item.id || item.title).join(", "), status, `Searched ${selected} local records; ${required.size} mapped ADO category gap(s) remain unexecuted. [source: local discovery; location: complete local search and unexecuted mapped ADO categories; classification: Fact; confidence: high; directness: direct]`, entries);
            } }) } });
exports.BassDiscoveryReportPlugin = BassDiscoveryReportPlugin;
