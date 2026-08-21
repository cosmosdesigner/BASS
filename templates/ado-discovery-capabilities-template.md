# ADO Discovery Capabilities

Record only target-host tools that the installer has verified cannot mutate Azure
DevOps resources. Leave an entry unmapped when no verified read-only tool exists.

## Work Item Search and Filtering

tool_name: <exact_target_host_tool_name>
supported_input: <id_url_text_type_tag_state_area_or_iteration_filter>
verified_read_only: false
verification_date: <YYYY-MM-DD>

## Hierarchy and Relations

tool_name: <exact_target_host_tool_name>
supported_input: <work_item_id_or_relation_reference>
verified_read_only: false
verification_date: <YYYY-MM-DD>

## Comments and History

tool_name: <exact_target_host_tool_name>
supported_input: <work_item_id_or_comment_or_history_reference>
verified_read_only: false
verification_date: <YYYY-MM-DD>

## Wiki Search and Read

tool_name: <exact_target_host_tool_name>
supported_input: <wiki_search_text_page_identifier_or_url>
verified_read_only: false
verification_date: <YYYY-MM-DD>

## Permission Synchronization

At target installation, use `bass_validate_ado_discovery_capabilities` to map
each independently valid exact `tool_name` into Explorer's ordered front-matter
permissions after the blanket deny: first `"ado_*": deny`, then exact allow
entries for only valid mapped names. Unmapped or invalid categories remain
Discovery Report gaps. Do not allow unknown or write-capable ADO tools.
