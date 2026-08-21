import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);

function loadBassModule<T>(cwd: string, relativePath: string): T {
  return require(join(cwd, relativePath)) as T;
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
        text: `Use the BASS project-local skill to handle this request. Interpret the following as the canonical BASS command or natural-language BASS workflow request: ${args || "status"}`,
      };
    }
    return { action: "continue" as const };
  });

  pi.registerTool({
    name: "bass_init_project",
    label: "BASS Init Project",
    description: "Initialize one contained BASS project scaffold without any Azure DevOps operation.",
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
    description: "Return deterministic local BASS project health without MCP or Azure DevOps calls.",
    parameters: Type.Object({
      projectName: Type.Optional(Type.String({ description: "BASS project slug. Optional when only one project exists." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const { projectStatus } = loadBassModule<{ projectStatus: (input: unknown) => unknown }>(ctx.cwd, "BASS/integration/opencode/plugins/bass-project-status.js");
      return textResult(projectStatus({ ...params, directory: ctx.cwd }));
    },
  });
}
