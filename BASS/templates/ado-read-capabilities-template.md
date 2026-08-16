# ADO Read Capabilities

Record only target-host tools that the installer has verified cannot mutate Azure
DevOps resources. Leave an entry unmapped when no verified read-only tool exists.

## Wiki

tool_name: <exact_target_host_tool_name>
supported_input: <wiki_page_identifier_or_url>
verified_read_only: false
verification_date: <YYYY-MM-DD>

## Work Item

tool_name: <exact_target_host_tool_name>
supported_input: <work_item_id_or_url>
verified_read_only: false
verification_date: <YYYY-MM-DD>

## Relations

tool_name: <exact_target_host_tool_name>
supported_input: <work_item_id_or_relation_reference>
verified_read_only: false
verification_date: <YYYY-MM-DD>

## History/comments

tool_name: <exact_target_host_tool_name>
supported_input: <work_item_id_or_comment_reference>
verified_read_only: false
verification_date: <YYYY-MM-DD>

## Permission Synchronization

At target installation, use `bass_validate_ado_read_capabilities` to map each
independently valid exact `tool_name` into Reader's ordered front-matter
permissions after the blanket deny: first `"ado_*": deny`, then exact allow
entries for only valid mapped names. Unmapped or invalid categories remain Context
Brief gaps. Do not allow unknown or write-capable ADO tools.
