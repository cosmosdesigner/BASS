"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BassContextBriefPlugin = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const plugin_1 = { tool: (value) => value }; plugin_1.tool.schema = { string: () => ({ optional: () => ({}) }), object: () => ({ optional: () => ({}) }), array: () => ({ optional: () => ({}) }), boolean: () => ({ optional: () => ({}) }) };
const headings = ["Goal", "State", "Decisions", "Evidence", "Conflicts", "Gaps", "Questions", "Sources"];
function invalidProjectName(value) {
    return !value || value.includes("/") || value.includes("\\") || value === "." || value === ".." || value.split(/[\\/]/).some((part) => !part || part === "." || part === "..");
}
function isDirectory(path) {
    return (0, node_fs_1.existsSync)(path) && !(0, node_fs_1.lstatSync)(path).isSymbolicLink() && (0, node_fs_1.statSync)(path).isDirectory();
}
function value(text, key) {
    const match = text.match(new RegExp(`^${key}:\\s*(?:["']([^"']*)["']|(.+?))\\s*$`, "m"));
    const result = (match?.[1] ?? match?.[2] ?? "").trim();
    return /^(null|~)$/i.test(result) || (!match?.[1] && /^false$/i.test(result)) ? "" : result;
}
function provenanceValue(text, key) {
    const provenance = text.match(/^provenance:\s*$([\s\S]*?)(?=^[a-z_]+:|^---\s*$)/m)?.[1] || "";
    const match = provenance.match(new RegExp(`^\\s{2}${key}:\\s*(?:["']([^"']*)["']|(.+?))\\s*$`, "m"));
    const result = (match?.[1] ?? match?.[2] ?? "").trim();
    return /^(null|~)$/i.test(result) ? "" : result;
}
function provenanceSources(text) {
    const lines = text.split(/\r?\n/);
    const start = lines.findIndex((line) => /^\s{2}sources:\s*$/.test(line));
    const sourceLines = start < 0 ? [] : lines.slice(start + 1, lines.findIndex((line, index) => index > start && (/^\s{2}[a-z_]+:/.test(line) || line === "---")) || undefined);
    const entries = [];
    for (const line of sourceLines) {
        if (/^\s*-\s*type:/.test(line))
            entries.push([line]);
        else if (entries.length)
            entries[entries.length - 1].push(line);
    }
    return entries.map((entry) => {
        const field = (key) => (entry.join("\n").match(new RegExp(`^\\s*(?:-\\s*)?${key}:\\s*(?:["']([^"']*)["']|(.+?))\\s*$`, "m"))?.slice(1).find(Boolean) || "").trim();
        return { type: field("type"), reference: field("reference"), location: field("location") };
    });
}
function listValue(text, key) {
    const flow = text.match(new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]\\s*$`, "m"))?.[1];
    if (flow !== undefined)
        return flow.split(",").map((item) => item.trim().replace(/^(?:["'])(.*)(?:["'])$/, "$1")).filter(Boolean);
    const match = text.match(new RegExp(`^${key}:\\s*$([\\s\\S]*?)(?=^[a-z_]+:|^---\\s*$)`, "m"))?.[1] || "";
    return [...match.matchAll(/^\s*-\s*(.+?)\s*$/gm)].map((item) => item[1]);
}
function inside(root, path) {
    const result = (0, node_path_1.relative)(root, path);
    return result === "" || (!result.startsWith(`..${node_path_1.sep}`) && result !== "..");
}
function safeFile(root, path) {
    if (!(0, node_fs_1.existsSync)(path) || (0, node_fs_1.lstatSync)(path).isSymbolicLink())
        return false;
    try {
        return inside(root, (0, node_fs_1.realpathSync)(path));
    }
    catch {
        return false;
    }
}
function conflictValue(text, key) {
    const conflict = text.match(/^conflict:\s*$([\s\S]*?)(?=^[a-z_]+:|^---\s*$)/m)?.[1] || "";
    const match = conflict.match(new RegExp(`^\\s{2}${key}:\\s*(?:["']([^"']*)["']|(.+?))\\s*$`, "m"));
    const result = (match?.[1] ?? match?.[2] ?? "").trim();
    return /^(null|~)$/i.test(result) ? "" : result;
}
function record(root, path, displayRoot = root) {
    if (!safeFile(root, path))
        throw new Error("Unsafe local record path");
    const text = (0, node_fs_1.readFileSync)(path, "utf8");
    const sources = provenanceSources(text);
    const source = sources[0] || { type: "", reference: "", location: "" };
    return {
        path: (0, node_path_1.relative)(displayRoot, path).split(node_path_1.sep).join("/"),
        filePath: path,
        text,
        id: value(text, "id"),
        title: value(text, "title"),
        classification: provenanceValue(text, "classification") || "Unclassified",
        confidence: provenanceValue(text, "confidence") || "unspecified",
        source: source.reference || path,
        location: source.location || "Document",
        sources,
        relationReferences: listValue(text, "ado_relation_references"),
        conflictStatus: conflictValue(text, "status"),
        decisionId: conflictValue(text, "decision_id"),
    };
}
function section(text, name) {
    const lines = text.split(/\r?\n/);
    const start = lines.findIndex((line) => line === `## ${name}`);
    if (start < 0)
        return "";
    const end = lines.findIndex((line, index) => index > start && line.startsWith("## "));
    return lines.slice(start + 1, end < 0 ? undefined : end).join("\n").trim();
}
function registryWiki(text, name) {
    const urls = [...section(text, `${name} ADO Wiki`).matchAll(/^\s*-\s*URL:\s*`(https:\/\/dev\.azure\.com\/[^\s`]+\/_[Ww]iki\/[^\s`]+)`\s*$/gm)].map((match) => match[1]);
    return urls.length === 1 && !/example[-.]org|placeholder|fictional/i.test(urls[0]) ? urls[0] : "";
}
function summary(text, names) {
    for (const name of names) {
        const content = section(text, name).replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
        if (content)
            return content.split(/(?<=[.!?])\s/)[0];
    }
    return "No material statement was found.";
}
function material(item, statement) {
    if (item.classification === "Question" && statement === "No material statement was found.")
        statement = summary(item.text, ["Question"]);
    return `- ${statement} [source: ${item.path}; location: ${item.location}; classification: ${item.classification}; confidence: ${item.confidence}]`;
}
function conflictMaterial(item, statement) {
    const sources = item.sources.map((source) => `${source.type}: ${source.reference} (${source.location})`).join("; ") || "none";
    return `${material(item, statement)} [status: ${item.conflictStatus || "unspecified"}; decision_id: ${item.decisionId || "null"}; competing sources: ${sources}]`;
}
function links(text, sectionNames) {
    return sectionNames.flatMap((name) => [...section(text, name).matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g)].map((match) => match[1]));
}
function candidates(project, root) {
    const features = (0, node_path_1.join)(project, "features");
    const ideas = (0, node_path_1.join)(project, "ideas");
    const found = [];
    if (isDirectory(features))
        for (const feature of (0, node_fs_1.readdirSync)(features)) {
            if (!/^F-[^-]+-.+$/.test(feature))
                continue;
            const featureRoot = (0, node_path_1.join)(features, feature);
            const file = (0, node_path_1.join)(featureRoot, "feature.md");
            if (isDirectory(featureRoot) && safeFile(root, file))
                found.push(file);
            const stories = (0, node_path_1.join)(featureRoot, "user-stories");
            if (isDirectory(stories))
                for (const story of (0, node_fs_1.readdirSync)(stories)) {
                    if (!/^US-[^-]+-.+$/.test(story))
                        continue;
                    const storyFile = (0, node_path_1.join)(stories, story, "user-story.md");
                    if (safeFile(root, storyFile))
                        found.push(storyFile);
                }
        }
    if (isDirectory(ideas))
        for (const idea of (0, node_fs_1.readdirSync)(ideas)) {
            if (!/^IDEA-[^-]+-.+$/.test(idea))
                continue;
            const file = (0, node_path_1.join)(ideas, idea, "idea.md");
            if (safeFile(root, file))
                found.push(file);
        }
    return found;
}
function parentFeature(project, root, parentId) {
    if (!parentId)
        return "";
    const features = (0, node_path_1.join)(project, "features");
    if (!isDirectory(features))
        return "";
    const matches = (0, node_fs_1.readdirSync)(features)
        .filter((feature) => /^F-[^-]+-.+$/.test(feature))
        .map((feature) => (0, node_path_1.join)(features, feature, "feature.md"))
        .filter((path) => safeFile(root, path) && record(root, path).id === parentId);
    return matches.length === 1 ? matches[0] : "";
}
function brief(target, status, coverage, entries) {
    return [`# Context Brief: ${target}`, `Status: ${status}`, `Coverage: ${coverage}`, ...headings.map((heading) => `## ${heading}\n\n${entries[heading]?.join("\n") || "- None."}`)].join("\n\n");
}
const BassContextBriefPlugin = async () => ({
    tool: {
        bass_context_brief: (0, plugin_1.tool)({
            description: "Deterministically load a bounded local BASS Context Brief without MCP calls or mutations.",
            args: { projectName: plugin_1.tool.schema.string().optional(), target: plugin_1.tool.schema.string() },
            async execute(args, context) {
                const projectName = args.projectName?.trim();
                const target = args.target?.trim();
                if (!target)
                    return brief("invalid target", "blocked", "No filesystem sources loaded.", { Gaps: ["- Target is required. Next action: provide a non-empty typed ID or exact title."] });
                if (projectName && invalidProjectName(projectName))
                    return brief(target, "blocked", "No filesystem sources loaded because projectName failed preflight.", { Gaps: ["- Selected project is invalid. Next action: provide one direct child name under BASS/projects/."] });
                const projectsRoot = (0, node_path_1.join)(context.directory, "BASS", "projects");
                if (!isDirectory(projectsRoot))
                    return brief(target, "blocked", "BASS/projects is unavailable.", { Gaps: ["- Selected project source is unavailable. Next action: restore BASS/projects/."] });
                const names = (0, node_fs_1.readdirSync)(projectsRoot).filter((name) => isDirectory((0, node_path_1.join)(projectsRoot, name)));
                const selected = projectName || (names.length === 1 ? names[0] : "");
                if (!selected || !names.includes(selected))
                    return brief(target, "blocked", "Selected project is unavailable.", { Gaps: [`- Selected project '${selected || "(unspecified)"}' is unavailable. Next action: provide an existing direct child project name.`] });
                const project = (0, node_path_1.join)(projectsRoot, selected);
                if ((0, node_fs_1.lstatSync)(project).isSymbolicLink())
                    return brief(target, "blocked", "Selected project is a symbolic link or junction.", { Gaps: ["- Selected project containment cannot be verified. Next action: use a real direct child project directory."] });
                const projectRoot = (0, node_fs_1.realpathSync)(project);
                const matches = candidates(project, projectRoot).map((path) => record(projectRoot, path, context.directory)).filter((item) => item.id === target || item.title === target);
                if (matches.length !== 1)
                    return brief(target, "blocked", `Local target resolution found ${matches.length} matches in Feature, User Story, and Idea paths.`, { Gaps: [`- Target resolution is ${matches.length ? "ambiguous" : "unavailable"}. Next action: provide a unique typed ID or exact title, or use D6 discovery.`] });
                const resolved = matches[0];
                const loaded = [];
                for (const path of [(0, node_path_1.join)(project, "project-context", "context-registry.md"), (0, node_path_1.join)(project, "project-context", "functional", "functional-context.md"), (0, node_path_1.join)(project, "project-context", "technical", "technical-context.md")])
                    if (safeFile(projectRoot, path))
                        loaded.push(record(projectRoot, path, context.directory));
                loaded.push(resolved);
                const parent = resolved.filePath.includes(`${node_path_1.sep}user-stories${node_path_1.sep}`) ? parentFeature(project, projectRoot, value(resolved.text, "parent_feature_id")) : "";
                if (parent && !loaded.some((item) => item.filePath === parent))
                    loaded.push(record(projectRoot, parent, context.directory));
                for (const link of links(resolved.text, ["Related Evidence and Decisions", "Scope", "Related Items", "Related Evidence and Items"])) {
                    const path = (0, node_path_1.resolve)((0, node_path_1.join)(resolved.filePath, ".."), link);
                    if (safeFile(projectRoot, path) && !loaded.some((item) => item.filePath === path))
                        loaded.push(record(projectRoot, path, context.directory));
                }
                const entries = { Goal: [material(resolved, summary(resolved.text, ["Objective", "User Story", "Problem", "Description", "Summary"]))], State: [], Decisions: [], Evidence: [], Conflicts: [], Gaps: [], Questions: [], Sources: [] };
                for (const item of loaded) {
                    entries.Sources.push(`- ${item.path} [source: ${item.source}; location: ${item.location}; classification: ${item.classification}; confidence: ${item.confidence}]`);
                    if (item === resolved)
                        continue;
                    const entry = material(item, summary(item.text, ["State", "Summary", "Decision", "Findings", "Description", "Scope", "Purpose", "Objective", "Question"]));
                    if (item.classification === "Decision")
                        entries.Decisions.push(entry);
                    else if (item.classification === "Conflict")
                        entries.Conflicts.push(conflictMaterial(item, summary(item.text, ["State", "Summary", "Decision", "Findings", "Description", "Scope", "Purpose"])));
                    else if (item.classification === "Question")
                        entries.Questions.push(entry);
                    else if (item.filePath.includes(`${node_path_1.sep}project-context${node_path_1.sep}`))
                        entries.State.push(entry);
                    else
                        entries.Evidence.push(entry);
                }
                const workItems = [value(resolved.text, "ado_work_item_url"), value(resolved.text, "ado_work_item_id")].filter(Boolean);
                const workItemReferences = [...workItems, ...loaded.flatMap((item) => item.sources.filter((source) => source.type === "ado_work_item").map((source) => source.reference))].filter(Boolean);
                const registry = loaded.find((item) => item.filePath.endsWith(`${node_path_1.sep}project-context${node_path_1.sep}context-registry.md`));
                const adoSources = [
                    ["Functional ADO Wiki", [registry ? registryWiki(registry.text, "Functional") : "", ...loaded.flatMap((item) => item.sources.filter((source) => source.type === "ado_wiki").map((source) => source.reference))].filter(Boolean).join("; ")],
                    ["Technical ADO Wiki", registry ? registryWiki(registry.text, "Technical") : ""],
                    ["ADO Work Item", workItemReferences.join("; ")],
                    ["ADO relations", [...workItemReferences, ...loaded.flatMap((item) => item.relationReferences)].filter(Boolean).join("; ")],
                    ["ADO history", [...workItemReferences, ...loaded.flatMap((item) => item.sources.filter((source) => source.type === "ado_comment").map((source) => source.reference))].filter(Boolean).join("; ")],
                ].filter(([, reference]) => Boolean(reference));
                for (const [name, reference] of adoSources)
                    entries.Gaps.push(`- Expected source: ${name}${reference ? ` (${reference})` : " (no local reference recorded)"}. Reason: not loaded by this local-only tool. Impact: ${name} evidence is absent from this brief. Next action: use an installation-verified read-only ADO capability.`);
                const hasGaps = entries.Gaps.length > 0;
                const status = hasGaps || entries.Conflicts.length ? "warning" : "ready";
                return brief(resolved.id || resolved.title, status, `Loaded ${loaded.length} local source(s); ${entries.Gaps.length} unavailable ADO source(s).`, entries);
            },
        }),
    },
});
exports.BassContextBriefPlugin = BassContextBriefPlugin;
