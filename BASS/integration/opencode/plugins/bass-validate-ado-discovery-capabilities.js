"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BassValidateAdoDiscoveryCapabilitiesPlugin = void 0;
exports.validateAdoDiscoveryCapabilities = validateAdoDiscoveryCapabilities;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const plugin_1 = require("@opencode-ai/plugin");
const categories = ["Work Item Search and Filtering", "Hierarchy and Relations", "Comments and History", "Wiki Search and Read"];
const section = (text, heading) => text.match(new RegExp(`^## ${heading.replace("/", "\\/")}[ \\t]*\\r?\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, "m"))?.[1] || "";
const field = (text, name) => text.match(new RegExp(`^${name}:[ \\t]*(\\S(?:.*\\S)?)[ \\t]*$`, "m"))?.[1].trim() || "";
function validDate(value) { const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (!match)
    return false; const date = new Date(`${value}T00:00:00Z`); return !Number.isNaN(date.valueOf()) && date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() + 1 === Number(match[2]) && date.getUTCDate() === Number(match[3]); }
function parse(text) { return Object.fromEntries(categories.map((category) => { const block = section(text, category), tool_name = field(block, "tool_name"), supported_input = field(block, "supported_input"), verification_date = field(block, "verification_date"), verified_read_only = /^verified_read_only:\s*true\s*$/mi.test(block), wellFormed = block.split(/\r?\n/).every((line) => !line.trim() || /^(tool_name|supported_input|verified_read_only|verification_date):/.test(line.trim())); return [category, { tool_name, supported_input, verified_read_only, verification_date, valid: Boolean(wellFormed && /^[A-Za-z0-9_-]+$/.test(tool_name) && supported_input && verified_read_only && validDate(verification_date)) }]; })); }
function validateAdoDiscoveryCapabilities({ projectDirectory, requiredCategories }) { const path = (0, node_path_1.join)(projectDirectory, "project-context", "ado-discovery-capabilities.md"), mappings = parse((0, node_fs_1.existsSync)(path) ? (0, node_fs_1.readFileSync)(path, "utf8") : ""), valid = categories.filter((category) => mappings[category].valid), required = [...new Set(requiredCategories)].filter((category) => categories.includes(category)); return { mappings, permissionFragment: [`"ado_*": deny`, ...valid.map((category) => `"${mappings[category].tool_name}": allow`)].join("\n"), dispatch: required.filter((category) => mappings[category].valid).map((category) => ({ category, tool_name: mappings[category].tool_name })), unmappedGaps: required.filter((category) => !mappings[category].valid) }; }
const BassValidateAdoDiscoveryCapabilitiesPlugin = async () => ({ tool: { bass_validate_ado_discovery_capabilities: (0, plugin_1.tool)({ description: "Validate independent read-only ADO discovery mappings without MCP calls.", args: { projectDirectory: plugin_1.tool.schema.string(), requiredCategories: plugin_1.tool.schema.array(plugin_1.tool.schema.string()) }, async execute(args) { return validateAdoDiscoveryCapabilities(args); } }) } });
exports.BassValidateAdoDiscoveryCapabilitiesPlugin = BassValidateAdoDiscoveryCapabilitiesPlugin;
