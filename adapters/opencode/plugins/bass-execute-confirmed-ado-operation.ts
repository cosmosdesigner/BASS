import { type Plugin, tool } from "@opencode-ai/plugin"
// Runtime context is captured by the plugin closure; public tool args never carry it.
const runtime = require("./bass-execute-confirmed-ado-operation.js")
export const executeConfirmedAdoOperation = runtime.executeConfirmedAdoOperation
export const BassExecuteConfirmedAdoOperationPlugin: Plugin = async (context) => runtime.BassExecuteConfirmedAdoOperationPlugin(context)
