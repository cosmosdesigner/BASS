import { type Plugin, tool } from "@opencode-ai/plugin"
declare const require: (path: string) => { reviewArtifact: (input: unknown) => unknown }
// The runtime implementation enforces direct-child D3 provenance classification and waiver bindings.
export const reviewArtifact = require("./bass-review-artifact.runtime.js").reviewArtifact
export const BassReviewArtifactPlugin: Plugin = async () => ({ tool: { bass_review_artifact: tool({ description: "Review one canonical local BASS artifact.", args: { projectName: tool.schema.string(), artifactPath: tool.schema.string() }, async execute(args: any, context: any) { return JSON.stringify(reviewArtifact({ ...args, directory: context.directory })) } }) } })
