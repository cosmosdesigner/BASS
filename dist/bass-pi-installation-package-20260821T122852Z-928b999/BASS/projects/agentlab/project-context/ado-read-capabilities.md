---
id: ADO-READ-CAP-001
title: "AgentLab ADO Read Capabilities"
version: v1.1
created_date: 2026-08-18
updated_date: 2026-08-18
derived_from: ADO-READ-CAP-001@v1.0
supersedes: ADO-READ-CAP-001@v1.0
verified_read_only: false
provenance:
  classification: Assumption
  sources:
    - type: local_file
      reference: BASS/projects/agentlab/project-context/ado-read-capabilities.md@v1.0
      location: "Approved Capabilities table"
      retrieved_date: 2026-08-18
  actor: BASS
  date: 2026-08-18
  confidence: medium
  source_version: v1.0
  related_items: []
---

# AgentLab ADO Read Capabilities

This local mapping records user-confirmed approved read-only delivery-context scope as an Assumption. Target-host validation is pending because the validator failed internally and produced no validation result. It does not grant write authority, permit Azure DevOps mutation, or make any live Azure DevOps connectivity claim.

## Approved Capabilities

| Capability | Tools | Scope | Authority | Evidence | Confidence |
| --- | --- | --- | --- | --- | --- |
| Backlog and work items | `azure-devops_wit_backlog.list`, `azure-devops_wit_backlog.list_work_items`, `azure-devops_wit_query.wiql`, `azure-devops_wit_work_item.get`, `azure-devops_wit_work_item.get_batch` | Project `IT.DIT`; team backlog `Generative AI` | Read-only; no write authority | User-supplied backlog URL `https://dev.azure.com/ptbcp/IT.DIT/_backlogs/backlog/Generative%20AI/` | medium |
| Pipelines and tests | `azure-devops_pipelines_definition.list`, `azure-devops_pipelines_run.get`, `azure-devops_pipelines_run.list`, `azure-devops_pipelines_build.list`, `azure-devops_pipelines_build.get_status`, `azure-devops_pipelines_build_log.list`, `azure-devops_pipelines_build_log.get_content`, `azure-devops_pipelines_artifact.list`, `azure-devops_testplan_show_test_results_from_build_id` | Project `IT.DIT`; pipeline names prefixed `BCP.GenAI.`; example `BCP.GenAI.Backoffice.Frontend` | Read-only; no write authority | User-supplied pipeline naming convention | medium |
| Repositories and pull requests | `azure-devops_repo_repository.list`, `azure-devops_repo_repository.get`, `azure-devops_repo_branch.list`, `azure-devops_repo_branch.get`, `azure-devops_repo_file.get_content`, `azure-devops_repo_file.list_directory`, `azure-devops_repo_search_commits`, `azure-devops_repo_pull_request.list`, `azure-devops_repo_pull_request.get`, `azure-devops_repo_pull_request_thread.list`, `azure-devops_repo_pull_request_thread.list_comments` | Project `IT.DIT`; repository names prefixed `BCP.GenAI.` | Read-only; no write authority | User-confirmed repository and pull-request scope | medium |

## Validation Status

Target-host validation remains pending. The target-host validator failed internally and produced no validation result; therefore, this record does not verify host capability and no live connectivity is claimed.

## Changelog

| Date | Version | Change | Reason | Related records |
| --- | --- | --- | --- | --- |
| 2026-08-18 | v1.1 | Reclassified the mapping as an Assumption and marked target-host read-only validation as pending. | Review findings identified that the internal validator failure cannot establish host capability. | ADO-READ-CAP-001@v1.0 |
| 2026-08-18 | v1.0 | Created the approved AgentLab read-scope mapping. | User-confirmed scope. | None |
