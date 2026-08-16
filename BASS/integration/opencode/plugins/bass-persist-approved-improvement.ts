import { type Plugin, tool } from "@opencode-ai/plugin"
declare const require: (path: string) => { issueImprovementPreview: (input: unknown) => unknown; persistApprovedImprovement: (input: unknown) => unknown }
const runtime = require("./bass-persist-approved-improvement.runtime.js")
export const issueImprovementPreview = runtime.issueImprovementPreview
export const persistApprovedImprovement = runtime.persistApprovedImprovement
export const BassPersistApprovedImprovementPlugin: Plugin = async () => ({ tool: { bass_persist_approved_improvement: tool({ description: "Persist an explicitly approved re-reviewed BASS improvement locally.", args: { projectName: tool.schema.string(), previewId: tool.schema.string(), approved: tool.schema.boolean(), integrityHash: tool.schema.string(), approvedArtifactMarkdown: tool.schema.string() }, async execute(args: any, context: any) { return persistApprovedImprovement({ ...args, directory: context.directory }) } }) } })
