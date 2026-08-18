import { type Plugin, tool } from "@opencode-ai/plugin"
const runtime = require("./bass-compare-ado-sync.js")
export const compareAdoSync = runtime.compareAdoSync
export const BassCompareAdoSyncPlugin: Plugin = async () => ({ tool: { bass_compare_ado_sync: tool({ description: "Compare local, current ADO, and baseline values without selecting a conflict winner.", args: { fields: tool.schema.array(tool.schema.string()), baseline: tool.schema.object(), local: tool.schema.object(), ado: tool.schema.object() }, async execute(args: unknown) { return runtime.compareAdoSync(args) } }) } })
