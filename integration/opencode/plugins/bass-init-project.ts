import { type Plugin, tool } from "@opencode-ai/plugin"
export type InitProjectInput = {
  projectName: string
  projectTitle?: string
  functionalWikiUrl?: string
  technicalWikiUrl?: string
  directory?: string
}
declare const require: (path: string) => {
  initProject: (input: InitProjectInput) => unknown
  normalizeInitProjectInput: (args: InitProjectInput, directory: string) => InitProjectInput
}
const runtime = require("./bass-init-project.js")
export const initProject = (input: InitProjectInput) => runtime.initProject(input)
export const normalizeInitProjectInput = (args: InitProjectInput, directory: string) => runtime.normalizeInitProjectInput(args, directory)
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
      async execute(args: InitProjectInput, context: { directory: string }) { return JSON.stringify(initProject(normalizeInitProjectInput(args, context.directory))) },
    }),
  },
})
