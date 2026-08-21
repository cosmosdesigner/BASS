"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BassPersistApprovedArtifactPlugin = void 0;
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const plugin_1 = require("@opencode-ai/plugin");
const issued = (globalThis.__bassCreatorIssuedPreviews ||= new Map());
const hash = (v) => (0, node_crypto_1.createHash)("sha256").update(v, "utf8").digest("hex");
const badProject = (v) => !v || /[\\/]/.test(v) || v === "." || v === "..";
const within = (root, p) => { const r = (0, node_path_1.relative)(root, p); return r === "" || (!r.startsWith(`..${node_path_1.sep}`) && r !== ".."); };
const safe = (root, p) => { try {
    return (0, node_fs_1.existsSync)(root) && (0, node_fs_1.existsSync)(p) && !(0, node_fs_1.lstatSync)(root).isSymbolicLink() && !(0, node_fs_1.lstatSync)(p).isSymbolicLink() && within((0, node_fs_1.realpathSync)(root), (0, node_fs_1.realpathSync)(p));
}
catch {
    return false;
} };
const blocked = (message) => ({ status: "blocked", message });
const field = (text, key) => text.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m"))?.[1].replace(/["']/g, "").trim() || "";
const nextVersion = (version) => { const match = version.match(/^v(\d+)\.(\d+)$/); return match ? `v${match[1]}.${Number(match[2]) + 1}` : "v1.1"; };
const BassPersistApprovedArtifactPlugin = async () => ({ tool: { bass_persist_approved_artifact: (0, plugin_1.tool)({ description: "Persist one matching approved local BASS preview without remote operations.", args: { projectName: plugin_1.tool.schema.string(), previewId: plugin_1.tool.schema.string(), approved: plugin_1.tool.schema.boolean(), integrityHash: plugin_1.tool.schema.string(), approvedArtifactMarkdown: plugin_1.tool.schema.string() }, async execute(args, context) {
                const name = String(args.projectName || "").trim(), preview = issued.get(args.previewId), markdown = String(args.approvedArtifactMarkdown || ""), projects = (0, node_path_1.join)(context.directory, "BASS", "projects");
                if (badProject(name) || !safe(context.directory, (0, node_path_1.join)(context.directory, "BASS")) || !safe((0, node_path_1.join)(context.directory, "BASS"), projects))
                    return blocked("Project root is unavailable.");
                const project = (0, node_path_1.join)(projects, name);
                if (!safe(projects, project))
                    return blocked("Selected project containment cannot be verified.");
                const root = (0, node_fs_1.realpathSync)(project);
                if (!args.approved || !preview || preview.projectName !== name || preview.hash !== args.integrityHash || preview.hash !== hash(markdown) || preview.markdown !== markdown)
                    return blocked("Approval, preview identity, and complete payload hash must match an issued ready preview.");
                if (preview.artifactType === "acceptance_criteria") {
                    const artifact = preview.parent?.file, registers = [(0, node_path_1.join)(project, "evidence-register.md"), (0, node_path_1.join)(project, "decision-log.md"), (0, node_path_1.join)(project, "action-log.md")], criteria = markdown.match(/## Acceptance Criteria\n\n([\s\S]*?)(?=\n\n## Changelog)/)?.[1];
                    if (!artifact || !criteria || !safe(root, artifact) || registers.some((p) => !safe(root, p)))
                        return blocked("Canonical target, register, or containment preflight failed.");
                    const original = (0, node_fs_1.readFileSync)(artifact, "utf8"), previousVersion = field(original, "version"), version = nextVersion(previousVersion), id = field(original, "id") || preview.id, changelog = `| 2026-08-14 | ${version} | Approved acceptance-criteria update. | Explicit approval for preview ${args.previewId}. | ${id} |`, updated = original.replace(/(## (?:Given\/When\/Then )?Acceptance Criteria\n\n)[\s\S]*?(?=\n\n## Changelog)/, `$1${criteria}`).replace(/^version:\s*.+$/m, `version: ${version}`).replace(/^updated_date:\s*.+$/m, "updated_date: 2026-08-14").replace(/^derived_from:\s*.+$/m, `derived_from: ${id}@${previousVersion}`).replace(/^supersedes:\s*.+$/m, `supersedes: ${id}@${previousVersion}`).replace(/(## Changelog\n\n[\s\S]*)$/, `$1\n${changelog}\n`);
                    if (updated === original)
                        return blocked("Canonical target lacks replaceable Acceptance Criteria and Changelog sections.");
                    const rel = (0, node_path_1.relative)(root, artifact).split(node_path_1.sep).join("/"), sources = preview.evidence.map((e) => `${e.type}: ${e.source}`).join("; "), rows = [`\n| ${preview.id} | Proposal | ${preview.title} | ${sources} | high | approved acceptance criteria update | ${preview.id} | [${preview.id}](${rel}) |\n`, `\n| APPROVAL-${preview.id} | Approved acceptance criteria update ${preview.id}. | Do not persist. | ${sources} | BASS | 2026-08-14 | ${preview.id} | [${preview.id}](${rel}) |\n`, `\n| ACT-${preview.id} | acceptance criteria persistence | ${preview.id} | Approved acceptance criteria update persisted locally. | ${sources} | APPROVAL-${preview.id} | BASS | 2026-08-14 | completed | [${preview.id}](${rel}) |\n`], files = [artifact, ...registers], temps = files.map((p) => `${p}.tmp-${args.previewId}`), backups = [], originals = [original, ...registers.map((p) => (0, node_fs_1.readFileSync)(p, "utf8"))];
                    try {
                        (0, node_fs_1.writeFileSync)(temps[0], updated, { encoding: "utf8", flag: "wx" });
                        for (let i = 0; i < registers.length; i++)
                            (0, node_fs_1.writeFileSync)(temps[i + 1], originals[i + 1] + rows[i], { encoding: "utf8", flag: "wx" });
                        for (let i = 0; i < files.length; i++) {
                            const backup = `${files[i]}.bak-${args.previewId}`;
                            (0, node_fs_1.renameSync)(files[i], backup);
                            backups.push(backup);
                        }
                        ;
                        for (let i = 0; i < files.length; i++)
                            (0, node_fs_1.renameSync)(temps[i], files[i]);
                        backups.forEach((backup) => (0, node_fs_1.rmSync)(backup, { force: true }));
                        issued.delete(args.previewId);
                        return { status: "persisted", path: artifact, id: preview.id };
                    }
                    catch {
                        for (const temp of temps)
                            (0, node_fs_1.rmSync)(temp, { force: true });
                        for (let i = 0; i < backups.length; i++)
                            if ((0, node_fs_1.existsSync)(backups[i])) {
                                (0, node_fs_1.rmSync)(files[i], { force: true });
                                (0, node_fs_1.renameSync)(backups[i], files[i]);
                            }
                        for (let i = 0; i < files.length; i++)
                            (0, node_fs_1.writeFileSync)(files[i], originals[i], "utf8");
                        return blocked("Atomic persistence failed; all staged writes were rolled back.");
                    }
                }
                const parent = preview.artifactType === "proposal" ? (0, node_path_1.join)(project, "proposals") : preview.artifactType === "user_story" ? (0, node_path_1.join)(preview.parent?.directory || "", "user-stories") : (0, node_path_1.join)(project, "features");
                if (!preview.parent && preview.artifactType === "user_story")
                    return blocked("User Story preview lacks its canonical parent Feature.");
                if (preview.artifactType === "user_story" ? !safe(root, preview.parent.directory) : !safe(root, parent))
                    return blocked("Required canonical artifact parent is unavailable or unsafe.");
                const directory = (0, node_path_1.join)(parent, preview.directory), artifact = (0, node_path_1.join)(directory, preview.artifactType === "proposal" ? "proposal.md" : preview.artifactType === "user_story" ? "user-story.md" : "feature.md"), registers = [(0, node_path_1.join)(project, "evidence-register.md"), (0, node_path_1.join)(project, "decision-log.md"), (0, node_path_1.join)(project, "action-log.md")];
                if (registers.some((p) => !safe(root, p)) || !within(root, parent) || !within(root, directory) || (0, node_fs_1.existsSync)(directory) || (0, node_fs_1.existsSync)(artifact))
                    return blocked("Canonical target, register, collision, or containment preflight failed.");
                const rel = (0, node_path_1.relative)(root, artifact).split(node_path_1.sep).join("/"), approval = `\n\n<!-- Approval recorded: explicit local approval for preview ${args.previewId}; payload sha256 ${preview.hash} -->\n`, rows = [`\n| ${preview.id} | Proposal | ${preview.title} | ${preview.evidence.map((e) => `${e.type}: ${e.source}`).join("; ")} | high | approved preview | ${preview.id} | [${preview.id}](${rel}) |\n`, `\n| APPROVAL-${preview.id} | Approved local artifact ${preview.id}. | Do not persist. | ${preview.evidence.map((e) => `${e.type}: ${e.source}`).join("; ")} | BASS | 2026-08-14 | ${preview.id} | [${preview.id}](${rel}) |\n`, `\n| ACT-${preview.id} | local artifact persistence | ${preview.id} | Approved preview persisted locally. | ${preview.evidence.map((e) => `${e.type}: ${e.source}`).join("; ")} | APPROVAL-${preview.id} | BASS | 2026-08-14 | completed | [${preview.id}](${rel}) |\n`];
                const temps = [artifact, ...registers].map((p) => `${p}.tmp-${args.previewId}`), backups = [];
                let originals = [], createdContainer = false;
                try {
                    originals = registers.map((p) => (0, node_fs_1.readFileSync)(p, "utf8"));
                    if (preview.artifactType === "user_story" && !(0, node_fs_1.existsSync)(parent)) {
                        (0, node_fs_1.mkdirSync)(parent, { recursive: false });
                        createdContainer = true;
                    }
                    if (!safe(root, parent))
                        throw new Error("unsafe canonical container");
                    (0, node_fs_1.mkdirSync)(directory, { recursive: false });
                    (0, node_fs_1.writeFileSync)(temps[0], markdown + approval, { encoding: "utf8", flag: "wx" });
                    for (let i = 0; i < registers.length; i++)
                        (0, node_fs_1.writeFileSync)(temps[i + 1], originals[i] + rows[i], { encoding: "utf8", flag: "wx" });
                    for (let i = 0; i < registers.length; i++) {
                        const backup = `${registers[i]}.bak-${args.previewId}`;
                        (0, node_fs_1.renameSync)(registers[i], backup);
                        backups.push(backup);
                    }
                    (0, node_fs_1.renameSync)(temps[0], artifact);
                    for (let i = 0; i < registers.length; i++)
                        (0, node_fs_1.renameSync)(temps[i + 1], registers[i]);
                    for (const backup of backups)
                        (0, node_fs_1.rmSync)(backup, { force: true });
                    issued.delete(args.previewId);
                    return { status: "persisted", path: artifact, id: preview.id };
                }
                catch {
                    for (const temp of temps)
                        (0, node_fs_1.rmSync)(temp, { force: true });
                    if ((0, node_fs_1.existsSync)(artifact))
                        (0, node_fs_1.rmSync)(artifact, { force: true });
                    for (let i = 0; i < backups.length; i++)
                        if ((0, node_fs_1.existsSync)(backups[i])) {
                            (0, node_fs_1.rmSync)(registers[i], { force: true });
                            (0, node_fs_1.renameSync)(backups[i], registers[i]);
                        }
                    for (let i = 0; i < originals.length; i++)
                        (0, node_fs_1.writeFileSync)(registers[i], originals[i], "utf8");
                    (0, node_fs_1.rmSync)(directory, { recursive: true, force: true });
                    if (createdContainer)
                        (0, node_fs_1.rmSync)(parent, { recursive: false, force: true });
                    return blocked("Atomic persistence failed; all staged writes were rolled back.");
                }
            } }) } });
exports.BassPersistApprovedArtifactPlugin = BassPersistApprovedArtifactPlugin;
