"use strict";
let tool = (value) => value; tool.schema = { string: () => ({ optional: () => ({}) }), object: () => ({ optional: () => ({}) }), array: () => ({ optional: () => ({}) }), boolean: () => ({ optional: () => ({}) }), number: () => ({ optional: () => ({}) }) };
const categories = ["create", "fields", "tags", "comments", "relations", "transitions", "query/import"];
const expected = { create: ["create_work_item"], fields: ["update_field"], tags: ["add_tag", "remove_tag"], comments: ["add_comment"], relations: ["add_relation", "remove_relation"], transitions: ["transition"], "query/import": ["import_field"] };
const workItemTypes = new Set(["Epic", "Feature", "User Story", "Bug", "Task"]);
const safeTool = (value) => /^ado_[a-z0-9_]+$/.test(value) && !/(repo|repository|code|pull_request|pipeline|build|release)/.test(value);
function validateAdoWriteCapabilities(input = {}) {
  const capabilities = input.capabilities && typeof input.capabilities === "object" ? input.capabilities : {}, fields = input.fields && typeof input.fields === "object" ? input.fields : {}, errors = [], available = {};
  for (const category of Object.keys(capabilities)) {
    const entries = Array.isArray(capabilities[category]) ? capabilities[category] : [capabilities[category]];
    for (const entry of entries) {
      const key = `${category}:${entry && entry.operation}`;
      if (!categories.includes(category) || !entry || typeof entry !== "object" || entry.resourceType !== "work_item" || !safeTool(entry.toolName) || !expected[category].includes(entry.operation) || typeof entry.supportedInput !== "string" || !entry.supportedInput.trim() || entry.verifiedReadWrite !== true || !/^\d{4}-\d{2}-\d{2}$/.test(entry.verificationDate || "")) errors.push(`Invalid ${category} capability.`);
      else available[key] = { category, toolName: entry.toolName, operation: entry.operation, resourceType: entry.resourceType, supportedInput: entry.supportedInput, verificationDate: entry.verificationDate };
    }
  }
  for (const [name, entry] of Object.entries(fields)) {
    if (!/^[a-z][a-z0-9_]*$/.test(name) || !entry || typeof entry !== "object" || typeof entry.adoFieldReference !== "string" || !entry.adoFieldReference.trim() || !Array.isArray(entry.supportedWorkItemTypes) || !entry.supportedWorkItemTypes.length || entry.supportedWorkItemTypes.some((type) => !workItemTypes.has(type)) || entry.verificationStatus !== "verified") errors.push(`Invalid ${name} field mapping.`);
  }
  const executorPermissions = ["ado_*: deny", ...Object.values(available).map((entry) => `${entry.toolName}: allow`).sort()];
  return { status: errors.length ? "blocked" : "ready", errors, capabilities: available, fields, executorPermissions, availableOperations: Object.values(available) };
}
const BassValidateAdoWriteCapabilitiesPlugin = async () => ({ tool: { bass_validate_ado_write_capabilities: tool({ description: "Validate exact safe target-host ADO Work Item capability and field mappings.", args: { capabilities: tool.schema.object(), fields: tool.schema.object() }, async execute(args) { return JSON.stringify(validateAdoWriteCapabilities(args)); } }) } });
module.exports = { validateAdoWriteCapabilities, BassValidateAdoWriteCapabilitiesPlugin, categories, workItemTypes };
