import { type Plugin, tool } from "@opencode-ai/plugin"
declare const require: (path: string) => { improveArtifact: (input: unknown) => unknown }
export const improveArtifact = require("./bass-improve-artifact.runtime.js").improveArtifact
export const BassImproveArtifactPlugin: Plugin = async () => ({ tool: { bass_improve_artifact: tool({ description: "Create an evidence-grounded re-reviewed BASS improvement preview.", args: { projectName: tool.schema.string(), artifactPath: tool.schema.string(), evidence: tool.schema.array(tool.schema.object()).optional() }, async execute(args: any, context: any) { return JSON.stringify(improveArtifact({ ...args, directory: context.directory })) } }) } })
