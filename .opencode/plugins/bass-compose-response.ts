import { type Plugin, tool } from "@opencode-ai/plugin"
declare const require: (path: string) => { composeResponse: (input: unknown) => unknown }

export const composeResponse = (input: unknown) => require("./bass-compose-response.js").composeResponse(input)
export const BassComposeResponsePlugin: Plugin = async () => ({ tool: { bass_compose_response: tool({ description: "Compose one evidenced BASS response envelope.", args: { workflowResult: tool.schema.object() }, async execute(args: unknown) { return JSON.stringify(composeResponse(args)) } }) } })
