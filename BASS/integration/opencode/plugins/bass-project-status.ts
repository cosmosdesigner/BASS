import { type Plugin, tool } from "@opencode-ai/plugin"
declare const require: (path: string) => { projectStatus: (input: unknown) => unknown }
export const projectStatus = (input: unknown) => require("./bass-project-status.js").projectStatus(input)
export const BassProjectStatusPlugin: Plugin = async () => ({
  tool: {
    bass_project_status: tool({
      description: "Return deterministic local BASS project health without MCP or Azure DevOps calls.",
      args: { projectName: tool.schema.string().optional() },
      async execute(args: any, context: any) { return projectStatus({ ...args, directory: context.directory }) },
    }),
  },
})
