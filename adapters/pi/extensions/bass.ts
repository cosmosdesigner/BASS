import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

const workflows = new Set([
  "brainstorm", "challenge", "create-ac", "create-ado", "create-feature", "create-proposal",
  "create-us", "diagnose", "discover", "improve", "init", "link-items", "load-context",
  "next", "review", "status", "sync-ado", "technical-delivery", "transition", "understand",
  "update-ado",
]);

function usage(): string {
  return "Usage: /bass <brainstorm|challenge|create-ac|create-ado|create-feature|create-proposal|create-us|diagnose|discover|improve|init|link-items|load-context|next|review|status|sync-ado|technical-delivery|transition|understand|update-ado> [arguments]";
}

function message(ctx: ExtensionCommandContext, content: string, details: Record<string, unknown> = {}) {
  ctx.ui.notify(content, "info");
}

function projectPath(ctx: ExtensionCommandContext, name: string): string {
  return join(ctx.cwd, "projects", name);
}

function validSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

async function initialize(ctx: ExtensionCommandContext, name?: string): Promise<void> {
  if (!name || !validSlug(name)) {
    message(ctx, "Blocked: project name must be a lowercase direct-child slug, for example customer-onboarding.");
    return;
  }

  const root = projectPath(ctx, name);
  try {
    await stat(root);
    message(ctx, `Blocked: project already exists: ${relative(ctx.cwd, root)}`);
    return;
  } catch {
    // The project does not exist; continue with the one-time scaffold.
  }

  const date = new Date().toISOString().slice(0, 10);
  const files: Record<string, string> = {
    "project-context/context-registry.md": `---\nid: CTX-REG-001\ntitle: "${name} Context Registry"\nversion: v1.0\ncreated_date: ${date}\nupdated_date: ${date}\nderived_from: null\nsupersedes: null\n---\n\n# Context Registry\n\nThis registry contains configured source references. A configured URL is not evidence that the source is reachable, authoritative, or readable until an approved read workflow verifies it.\n\n## Functional ADO Wiki\n\n- URL: \`<replace-with-official-functional-wiki-url>\`\n\n## Technical ADO Wiki\n\n- URL: \`<replace-with-official-technical-wiki-url>\`\n`,
    "evidence-register.md": `---\nid: REG-EVD-001\ntitle: Project evidence register\nversion: v1.0\ncreated_date: ${date}\nupdated_date: ${date}\nprovenance:\n  classification: Fact\n  sources: []\n  actor: BASS\n  date: ${date}\n  confidence: high\n  source_version: v1.0\n  related_items: []\n---\n\n# Evidence Register\n\nThis empty register is a local initialization Fact. It contains no source evidence until records are added through an approved workflow.\n\n| ID | Classification | Title | Sources | Confidence | Location | Related items | Record |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n`,
    "decision-log.md": `# Decision Log\n\nNo decisions recorded.\n`,
    "action-log.md": `# Action Log\n\nNo actions recorded.\n`,
  };

  for (const [file, content] of Object.entries(files)) {
    const target = join(root, file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content, "utf8");
  }

  message(ctx, `Created ${relative(ctx.cwd, root)} with ${Object.keys(files).length} local files. Gap: official Wiki URLs are not configured. Next action: configure the project context registry.`, { status: "created" });
}

async function allFiles(root: string): Promise<string[]> {
  const result: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else result.push(path);
    }
  }
  await visit(root);
  return result;
}

async function status(ctx: ExtensionCommandContext, name?: string): Promise<void> {
  if (!name || !validSlug(name)) {
    message(ctx, "Usage: /bass status <project-name>");
    return;
  }
  const root = projectPath(ctx, name);
  try {
    const files = await allFiles(root);
    const markdown = files.filter((file) => file.endsWith(".md"));
    message(ctx, `Project: ${name}\nFiles: ${files.length} (${markdown.length} Markdown)\nAzure DevOps: unknown (no live read performed)\nNext action: inspect or configure the project context.`, { status: "ok" });
  } catch {
    message(ctx, `Evidence gap: project does not exist: ${relative(ctx.cwd, root)}`);
  }
}

async function understand(ctx: ExtensionCommandContext, query?: string): Promise<void> {
  if (!query) {
    message(ctx, "Usage: /bass understand <relative-file-path>");
    return;
  }
  const target = join(ctx.cwd, query);
  try {
    const content = await readFile(target, "utf8");
    message(ctx, `Fact: ${query}\n\n${content}\n\nNext action: resolve any explicit evidence gaps in this record.`, { status: "ok", source: query });
  } catch {
    message(ctx, `Evidence gap: local file not found: ${query}\nNext action: provide an existing BASS artifact path.`);
  }
}

const deterministicWorkflows = new Set(["init", "status", "understand"]);

function skillName(workflow: string): string {
  return `bass-${workflow}`;
}

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event) => {
    try {
      const orchestrator = await readFile(new URL("../../skills/bass-agent-bass/SKILL.md", import.meta.url), "utf8");
      return { systemPrompt: `${event.systemPrompt}\n\n${orchestrator}` };
    } catch {
      return undefined;
    }
  });

  pi.registerCommand("bass", {
    description: "Run any BASS workflow; deterministic local workflows stay local and all other workflows use their BASS skill.",
    handler: async (args, ctx) => {
      const [workflow, ...rest] = args.trim().split(/\s+/).filter(Boolean);
      if (!workflows.has(workflow ?? "")) {
        message(ctx, usage());
        return;
      }

      if (deterministicWorkflows.has(workflow!)) {
        if (workflow === "init") await initialize(ctx, rest[0]);
        else if (workflow === "status") await status(ctx, rest[0]);
        else await understand(ctx, rest[0]);
        return;
      }

      const argumentsText = rest.join(" ");
      pi.sendUserMessage(`/skill:${skillName(workflow!)}${argumentsText ? ` ${argumentsText}` : ""}`, {
        expandPromptTemplates: true,
      });
    },
  });
}
