import { type Plugin, tool } from "@opencode-ai/plugin"
declare const require: (path: string) => { initProject: (input: unknown) => unknown }
export const initProject = (input: unknown) => require("./bass-init-project.js").initProject(input)
export const BassInitProjectPlugin: Plugin = async () => ({
  tool: {
    bass_init_project: tool({
      description: "Initialize one contained BASS project scaffold without any Azure DevOps operation.",
      args: {
        projectName: tool.schema.string(),
        projectTitle: tool.schema.string().optional(),
        functionalWikiUrl: tool.schema.string().optional(),
        technicalWikiUrl: tool.schema.string().optional(),
      },
      async execute(args: any, context: any) { return initProject({ ...args, directory: context.directory }) },
    }),
  },
})
