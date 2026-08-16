import { type Plugin, tool } from "@opencode-ai/plugin"
const runtime = require("./bass-validate-ado-write-capabilities.js")
export const validateAdoWriteCapabilities = runtime.validateAdoWriteCapabilities
export const BassValidateAdoWriteCapabilitiesPlugin: Plugin = async () => ({ tool: { bass_validate_ado_write_capabilities: tool({ description: "Validate exact safe target-host ADO Work Item capability and field mappings.", args: { capabilities: tool.schema.object(), fields: tool.schema.object() }, async execute(args: unknown) { return runtime.validateAdoWriteCapabilities(args) } }) } })
