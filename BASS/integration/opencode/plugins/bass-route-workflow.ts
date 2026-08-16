import { type Plugin, tool } from "@opencode-ai/plugin"
declare const require: (path: string) => { routeWorkflow: (input: unknown) => unknown }

export const routeWorkflow = (input: unknown) => require("./bass-route-workflow.js").routeWorkflow(input)
export const BassRouteWorkflowPlugin: Plugin = async () => ({ tool: { bass_route_workflow: tool({ description: "Route one bounded BASS command or request without executing it.", args: { command: tool.schema.string().optional(), request: tool.schema.string().optional(), context: tool.schema.object().optional() }, async execute(args: unknown) { return routeWorkflow(args) } }) } })
