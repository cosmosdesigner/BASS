---
id: ADO-READ-CAP-001
title: "AgentLab ADO Read Capabilities"
classification: Fact
created_date: 2026-08-18
verification_date: 2026-08-18
verified_read_only: true
---

# AgentLab ADO Read Capabilities

This local mapping defines approved read-only delivery-context capabilities. It does not grant write authority and does not prove current live Azure DevOps connectivity.

## Approved Capabilities

| Capability | Tools | Scope | Authority | Evidence | Confidence |
| --- | --- | --- | --- | --- | --- |
| Backlog and work items | `azure-devops_wit_backlog.list`, `azure-devops_wit_backlog.list_work_items`, `azure-devops_wit_query.wiql`, `azure-devops_wit_work_item.get`, `azure-devops_wit_work_item.get_batch` | Project `IT.DIT`; team backlog `Generative AI` | Read-only | User-supplied backlog URL `https://dev.azure.com/ptbcp/IT.DIT/_backlogs/backlog/Generative%20AI/` | high |
| Pipelines and tests | `azure-devops_pipelines_definition.list`, `azure-devops_pipelines_run.get`, `azure-devops_pipelines_run.list`, `azure-devops_pipelines_build.list`, `azure-devops_pipelines_build.get_status`, `azure-devops_pipelines_build_log.list`, `azure-devops_pipelines_build_log.get_content`, `azure-devops_pipelines_artifact.list`, `azure-devops_testplan_show_test_results_from_build_id` | Project `IT.DIT`; pipeline names prefixed `BCP.GenAI.`; example `BCP.GenAI.Backoffice.Frontend` | Read-only | User-supplied pipeline naming convention | high |
| Repositories and pull requests | `azure-devops_repo_repository.list`, `azure-devops_repo_repository.get`, `azure-devops_repo_branch.list`, `azure-devops_repo_branch.get`, `azure-devops_repo_file.get_content`, `azure-devops_repo_file.list_directory`, `azure-devops_repo_search_commits`, `azure-devops_repo_pull_request.list`, `azure-devops_repo_pull_request.get`, `azure-devops_repo_pull_request_thread.list`, `azure-devops_repo_pull_request_thread.list_comments` | Project `IT.DIT`; repository names prefixed `BCP.GenAI.` | Read-only | User-confirmed repository and pull-request scope | high |
