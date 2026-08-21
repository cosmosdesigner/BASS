import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, dirname, join } from "node:path";
import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

const require = createRequire(import.meta.url);
const standaloneRoot = join(dirname(fileURLToPath(import.meta.url)), "standalone");
const load = (name: string) => require(join(standaloneRoot, name));

const initProject = load("bass-init-project.js").initProject;
const projectStatus = load("bass-project-status.js").projectStatus;
const routeWorkflow = load("bass-route-workflow.js").routeWorkflow;
const compareAdoSync = load("bass-compare-ado-sync.js").compareAdoSync;
const composeResponse = load("bass-compose-response.js").composeResponse;
const recommendNext = load("bass-recommend-next.js").recommendNext;
const planAdoOperation = load("bass-plan-ado-operation.js").planAdoOperation;
const executeConfirmedAdoOperation = load("bass-execute-confirmed-ado-operation.js").executeConfirmedAdoOperation;
const validateAdoWriteCapabilities = load("bass-validate-ado-write-capabilities.js").validateAdoWriteCapabilities;
const reviewArtifact = load("bass-review-artifact.js").reviewArtifact;
const improveArtifact = load("bass-improve-artifact.js").improveArtifact;
const technicalDeliveryReport = load("bass-technical-delivery-report.js").technicalDeliveryReport;
const standaloneFactories = [
  ["bass_context_brief", load("bass-context-brief.js").BassContextBriefPlugin],
  ["bass_creator_preview", load("bass-creator-preview.js").BassCreatorPreviewPlugin],
  ["bass_discovery_report", load("bass-discovery-report.js").BassDiscoveryReportPlugin],
  ["bass_persist_approved_artifact", load("bass-persist-approved-artifact.js").BassPersistApprovedArtifactPlugin],
  ["bass_validate_ado_discovery_capabilities", load("bass-validate-ado-discovery-capabilities.js").BassValidateAdoDiscoveryCapabilitiesPlugin],
] as const;

const workflows = new Set([
  "brainstorm", "challenge", "create-ac", "create-ado", "create-feature", "create-proposal",
  "create-us", "diagnose", "discover", "improve", "init", "link-items", "load-context",
  "next", "review", "status", "sync-ado", "technical-delivery", "transition", "understand", "update-ado",
]);
const deterministicWorkflows = new Set(["init", "status", "understand"]);

function runtimeDirectory(cwd: string): string {
  return basename(cwd) === "BASS" ? dirname(cwd) : cwd;
}
function text(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}
function content(value: unknown) {
  return { content: [{ type: "text" as const, text: text(value) }], details: {} };
}
function objectSchema() {
  return Type.Object({}, { additionalProperties: true });
}
function notify(ctx: ExtensionCommandContext, value: unknown) {
  ctx.ui.notify(text(value), "info");
}
function usage() {
  return "Usage: /bass <brainstorm|challenge|create-ac|create-ado|create-feature|create-proposal|create-us|diagnose|discover|improve|init|link-items|load-context|next|review|status|sync-ado|technical-delivery|transition|understand|update-ado> [arguments]";
}

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event) => {
    try {
      const orchestrator = await readFile(new URL("../skills/bass-agent-bass/SKILL.md", import.meta.url), "utf8");
      return { systemPrompt: `${event.systemPrompt}\n\n${orchestrator}` };
    } catch {
      return undefined;
    }
  });

  pi.registerTool({
    name: "bass_init_project", label: "BASS initialize project",
    description: "Initialize one contained BASS project without Azure DevOps operations.",
    parameters: Type.Object({ projectName: Type.String(), projectTitle: Type.Optional(Type.String()), functionalWikiUrl: Type.Optional(Type.String()), technicalWikiUrl: Type.Optional(Type.String()) }),
    async execute(_id, args, _signal, _update, ctx) { return content(initProject({ ...args, directory: runtimeDirectory(ctx.cwd) })); },
  });
  pi.registerTool({
    name: "bass_project_status", label: "BASS project status",
    description: "Return deterministic local BASS project health without MCP or Azure DevOps.",
    parameters: Type.Object({ projectName: Type.Optional(Type.String()) }),
    async execute(_id, args, _signal, _update, ctx) { return content(projectStatus({ ...args, directory: runtimeDirectory(ctx.cwd) })); },
  });
  pi.registerTool({
    name: "bass_route_workflow", label: "BASS route workflow",
    description: "Route one bounded BASS command or natural-language request without executing it.",
    parameters: Type.Object({ command: Type.Optional(Type.String()), request: Type.Optional(Type.String()), context: Type.Optional(objectSchema()) }),
    async execute(_id, args) { return content(routeWorkflow(args)); },
  });
  pi.registerTool({
    name: "bass_compare_ado_sync", label: "BASS compare ADO sync",
    description: "Compare local, current ADO, and baseline values without selecting a conflict winner.",
    parameters: Type.Object({ fields: Type.Array(Type.String()), baseline: objectSchema(), local: objectSchema(), ado: objectSchema() }),
    async execute(_id, args) { return content(compareAdoSync(args)); },
  });
  pi.registerTool({
    name: "bass_compose_response", label: "BASS compose response",
    description: "Compose one evidenced BASS response envelope.",
    parameters: Type.Object({ workflowResult: objectSchema() }),
    async execute(_id, args) { return content(composeResponse(args)); },
  });
  pi.registerTool({
    name: "bass_recommend_next", label: "BASS recommend next",
    description: "Recommend one safe non-executing BASS next action.",
    parameters: Type.Object({ envelope: objectSchema(), request: Type.Optional(Type.String()) }),
    async execute(_id, args) { return content(recommendNext(args)); },
  });
  pi.registerTool({
    name: "bass_validate_ado_write_capabilities", label: "BASS validate ADO writes",
    description: "Validate exact safe target-host ADO Work Item capability and field mappings.",
    parameters: Type.Object({ capabilities: objectSchema(), fields: objectSchema() }),
    async execute(_id, args) { return content(validateAdoWriteCapabilities(args)); },
  });
  pi.registerTool({
    name: "bass_plan_ado_operation", label: "BASS plan ADO operation",
    description: "Create one signed issuer-bound approval-required ADO Work Item operation plan.",
    parameters: Type.Object({ validation: objectSchema(), operation: objectSchema(), evidence: Type.Array(objectSchema()), decisionIds: Type.Array(Type.String()) }),
    async execute(_id, args, _signal, _update, ctx) { return content(planAdoOperation({ ...args, directory: runtimeDirectory(ctx.cwd) })); },
  });
  pi.registerTool({
    name: "bass_execute_confirmed_ado_operation", label: "BASS execute confirmed ADO operation",
    description: "Execute exactly one confirmed signed operation through a host-provided adapter.",
    parameters: Type.Object({ token: objectSchema(), confirmation: Type.String(), validation: objectSchema(), adapter: objectSchema(), actionLogPath: Type.Optional(Type.String()), recoveryRoot: Type.Optional(Type.String()), recoveryPath: Type.Optional(Type.String()), dispatchDurability: Type.Optional(objectSchema()), recoveryDurability: Type.Optional(objectSchema()), outcomeDurability: Type.Optional(objectSchema()) }),
    async execute(_id, args, _signal, _update, ctx) { return content(executeConfirmedAdoOperation({ ...args, directory: runtimeDirectory(ctx.cwd) })); },
  });
  pi.registerTool({
    name: "bass_review_artifact", label: "BASS review artifact",
    description: "Review one canonical local BASS artifact without remote operations.",
    parameters: Type.Object({ projectName: Type.String(), artifactPath: Type.String() }),
    async execute(_id, args, _signal, _update, ctx) { return content(reviewArtifact({ ...args, directory: runtimeDirectory(ctx.cwd) })); },
  });
  pi.registerTool({
    name: "bass_improve_artifact", label: "BASS improve artifact",
    description: "Create an evidence-grounded re-reviewed BASS improvement preview.",
    parameters: Type.Object({ projectName: Type.String(), artifactPath: Type.String(), evidence: Type.Optional(Type.Array(objectSchema())) }),
    async execute(_id, args, _signal, _update, ctx) { return content(improveArtifact({ ...args, directory: runtimeDirectory(ctx.cwd) })); },
  });
  pi.registerTool({
    name: "bass_technical_delivery_report", label: "BASS technical delivery report",
    description: "Generate a fixed technical-delivery report from local context and read-only extracts.",
    parameters: Type.Object({ projectName: Type.String(), target: Type.String(), extracts: Type.Array(objectSchema()) }),
    async execute(_id, args, _signal, _update, ctx) { return content(technicalDeliveryReport({ ...args, directory: runtimeDirectory(ctx.cwd) })); },
  });

  for (const [name, factory] of standaloneFactories) {
    void Promise.resolve(factory()).then((bundle: any) => {
      const definition = bundle?.tool?.[name];
      if (!definition?.execute) return;
      pi.registerTool({
        name, label: `BASS ${name.replaceAll("_", " ")}`,
        description: definition.description ?? `Standalone Pi BASS tool: ${name}`,
        parameters: objectSchema(),
        async execute(_id, args, _signal, _update, ctx) {
          return content(await definition.execute({ ...args, directory: runtimeDirectory(ctx.cwd) }, { directory: runtimeDirectory(ctx.cwd) }));
        },
      });
    });
  }

  pi.registerCommand("bass", {
    description: "Run any BASS workflow; deterministic workflows use Pi-native tools and others use their standalone Pi skill.",
    handler: async (args, ctx) => {
      const [workflow, ...rest] = args.trim().split(/\s+/).filter(Boolean);
      if (!workflows.has(workflow ?? "")) { notify(ctx, usage()); return; }
      if (workflow === "init") { notify(ctx, initProject({ projectName: rest[0], directory: runtimeDirectory(ctx.cwd) })); return; }
      if (workflow === "status") { notify(ctx, projectStatus({ projectName: rest[0], directory: runtimeDirectory(ctx.cwd) })); return; }
      if (workflow === "understand") {
        pi.sendUserMessage(`/skill:bass-understand${rest.length ? ` ${rest.join(" ")}` : ""}`, { expandPromptTemplates: true });
        return;
      }
      pi.sendUserMessage(`/skill:bass-${workflow}${rest.length ? ` ${rest.join(" ")}` : ""}`, { expandPromptTemplates: true });
    },
  });
}
