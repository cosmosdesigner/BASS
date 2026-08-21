# ADO Technical Delivery Capabilities

Record only target-host tools that the installer has independently verified cannot
mutate Azure DevOps resources. Every `toolName` must use the approved `ado_`
namespace followed by a safe identifier (`[A-Za-z0-9_-]+`). Leave a category
unmapped when no verified read-only tool exists.

## Repository and File Search

toolName: <exact_target_host_tool_name>
supportedInput: <repository_identifier_branch_path_or_search_text>
verifiedReadOnly: false
verificationDate: <YYYY-MM-DD>
resourceType: repository

## Pull Request Details, Comments, and Links

toolName: <exact_target_host_tool_name>
supportedInput: <pull_request_id_repository_identifier_or_work_item_reference>
verifiedReadOnly: false
verificationDate: <YYYY-MM-DD>
resourceType: pull_request

## Work Item Association

toolName: <exact_target_host_tool_name>
supportedInput: <work_item_id_pull_request_id_commit_id_or_association_reference>
verifiedReadOnly: false
verificationDate: <YYYY-MM-DD>
resourceType: commit

## Pipeline and Deployment Status

toolName: <exact_target_host_tool_name>
supportedInput: <pipeline_run_build_release_environment_or_deployment_identifier>
verifiedReadOnly: false
verificationDate: <YYYY-MM-DD>
resourceType: deployment

## Permission Synchronization

At target installation, use `bass_validate_ado_technical_delivery_capabilities`
to validate each category independently and synchronize Explorer permissions.
Keep `"ado_*": deny` first in Explorer front matter, then add exact allow
entries only for validated `ado_`-prefixed `toolName` values. Do not use
wildcards, unknown tools, non-ADO tool names, or tools that can create, update,
delete, merge, approve, queue, cancel, deploy, or otherwise mutate an Azure
DevOps resource. Unmapped, invalid, failed, or unauthorized categories remain
Technical Delivery Report gaps.

Each capability section uses the exact validator schema keys: `toolName`,
`supportedInput`, `verifiedReadOnly`, `verificationDate`, and `resourceType`.
Permitted `resourceType` values are category-bound: Repository and File Search
uses `repository`; Pull Request Details, Comments, and Links uses
`pull_request`; Work Item Association uses `commit` or `pull_request`; Pipeline
and Deployment Status uses `pipeline` or `deployment`. Do not add an `operation`
key unless it is read-only: mutation terms invalidate the mapping.
