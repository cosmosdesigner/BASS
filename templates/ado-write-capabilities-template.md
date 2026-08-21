# ADO Write Capabilities

Record only exact target-host tools that the installer has verified for the stated Azure DevOps Work Item operation. Leave a category unmapped when no verified tool exists. Unknown tools are unavailable. Do not map repository, code, pull-request, or pipeline mutation tools.

## Create

toolName: <exact_target_host_tool_name>
operation: <create_epic_feature_user_story_bug_or_task>
resourceType: work_item
supportedInput: <work_item_type_and_mapped_fields>
verifiedReadWrite: false
verificationDate: <YYYY-MM-DD>

## Fields

toolName: <exact_target_host_tool_name>
operation: <update_one_mapped_field>
resourceType: work_item
supportedInput: <work_item_id_mapped_field_reference_before_after>
verifiedReadWrite: false
verificationDate: <YYYY-MM-DD>

## Tags

toolName: <exact_target_host_tool_name>
operation: <add_tag_or_remove_tag>
resourceType: work_item
supportedInput: <work_item_id_one_tag>
verifiedReadWrite: false
verificationDate: <YYYY-MM-DD>

## Comments

toolName: <exact_target_host_tool_name>
operation: <add_structured_comment>
resourceType: work_item
supportedInput: <work_item_id_structured_comment>
verifiedReadWrite: false
verificationDate: <YYYY-MM-DD>

## Relations

toolName: <exact_target_host_tool_name>
operation: <create_relation_or_remove_relation>
resourceType: work_item
supportedInput: <work_item_id_one_relation_reference>
verifiedReadWrite: false
verificationDate: <YYYY-MM-DD>

## Transitions

toolName: <exact_target_host_tool_name>
operation: <change_state_and_reason>
resourceType: work_item
supportedInput: <work_item_id_state_reason_before_after>
verifiedReadWrite: false
verificationDate: <YYYY-MM-DD>

## Query/Import

toolName: <exact_target_host_tool_name>
operation: <query_current_work_item_or_import_one_approved_ado_only_change>
resourceType: work_item
supportedInput: <work_item_id_or_query_and_one_mapped_field_before_after>
verifiedReadWrite: false
verificationDate: <YYYY-MM-DD>

## Permission Synchronization

At target installation, use `bass_validate_ado_write_capabilities` to validate each entry independently. Entries use the validator's exact camelCase keys: `toolName`, `resourceType`, `supportedInput`, `verifiedReadWrite`, and `verificationDate`. Every permitted entry must declare exactly `resourceType: work_item`; missing, unknown, or non-Work-Item resource types are blocked regardless of tool name. Keep `"ado_*": deny` first in Executor front matter, then add exact allow rules only for mapped entries with `verifiedReadWrite: true`. Preserve the categories exactly as `create`, `fields`, `tags`, `comments`, `relations`, `transitions`, and `query/import`; do not add wildcard allows. An unmapped, invalid, or unknown tool remains denied and unavailable.

Executor may use an allowed tool only for one exact, unexpired, integrity-valid plan token after its field-level preview and explicit user confirmation. Each write and each approved local import requires a separate token and confirmation.
