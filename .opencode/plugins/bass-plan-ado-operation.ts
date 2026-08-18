import { type Plugin, tool } from "@opencode-ai/plugin"
// Runtime context is captured by the plugin closure; public tool args never carry it.
const runtime = require("./bass-plan-ado-operation.js")
export const planAdoOperation = runtime.planAdoOperation
export const BassPlanAdoOperationPlugin: Plugin = async (context) => runtime.BassPlanAdoOperationPlugin(context)
