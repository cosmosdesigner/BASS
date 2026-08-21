import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, cpSync } from "node:fs";

const require = createRequire(import.meta.url);
const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function moduleRoot(cwd: string) {
  const cwdBass = join(cwd, "BASS");
  if (existsSync(cwdBass)) return cwd;
  return packageRoot;
}

function loadBassModule<T>(cwd: string, relativePath: string): T {
  return require(join(moduleRoot(cwd), relativePath)) as T;
}

function textResult(value: unknown) {
  return {
    content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
    details: typeof value === "object" && value !== null ? (value as Record<string, unknown>) : { value },
  };
}

export default function (pi: ExtensionAPI) {
  pi.on("input", (event) => {
    const text = event.text.trim();
    if (text === "/bass" || text.startsWith("/bass ")) {
      const args = text === "/bass" ? "" : text.slice("/bass ".length).trim();
      return {
        action: "transform" as const,
        text: `Use the BASS Pi skill to handle this request. Interpret the following as the canonical BASS command or natural-language BASS workflow request: ${args || "status"}`,
      };
    }
    return { action: "continue" as const };
  });

  pi.registerTool({
    name: "bass_install_distribution",
    label: "BASS Install Distribution",
    description: "Copy the bundled BASS distribution into the current repository root for project-local BASS workflows. Refuses overwrite unless force is true.",
    parameters: Type.Object({
      force: Type.Optional(Type.Boolean({ description: "Overwrite an existing BASS directory. Default false." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const target = join(ctx.cwd, "BASS");
      if (existsSync(target) && !params.force) {
        return textResult({ status: "blocked", reason: "BASS already exists in the current repository root.", nextAction: "Use the existing distribution or rerun with force=true only after reviewing the overwrite risk." });
      }
      cpSync(join(packageRoot, "BASS"), target, { recursive: true, force: Boolean(params.force), errorOnExist: !params.force });
      return textResult({ status: "installed", target: "BASS", nextAction: "Run /bass status or /bass init <project-name>." });
    },
  });

  pi.registerTool({
    name: "bass_init_project",
    label: "BASS Init Project",
    description: "Initialize one contained BASS project scaffold without any Azure DevOps operation. Requires BASS installed in the current repository root.",
    parameters: Type.Object({
      projectName: Type.String({ description: "Lowercase BASS project slug, for example customer-onboarding" }),
      projectTitle: Type.Optional(Type.String({ description: "Human-readable project title" })),
      functionalWikiUrl: Type.Optional(Type.String({ description: "Official Functional Azure DevOps Wiki URL" })),
      technicalWikiUrl: Type.Optional(Type.String({ description: "Official Technical Azure DevOps Wiki URL" })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const { initProject } = loadBassModule<{ initProject: (input: unknown) => unknown }>(ctx.cwd, "BASS/integration/opencode/plugins/bass-init-project.js");
      return textResult(initProject({ ...params, directory: ctx.cwd }));
    },
  });

  pi.registerTool({
    name: "bass_project_status",
    label: "BASS Project Status",
    description: "Return deterministic local BASS project health without MCP or Azure DevOps calls. Requires BASS installed in the current repository root.",
    parameters: Type.Object({
      projectName: Type.Optional(Type.String({ description: "BASS project slug. Optional when only one project exists." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const { projectStatus } = loadBassModule<{ projectStatus: (input: unknown) => unknown }>(ctx.cwd, "BASS/integration/opencode/plugins/bass-project-status.js");
      return textResult(projectStatus({ ...params, directory: ctx.cwd }));
    },
  });
}
