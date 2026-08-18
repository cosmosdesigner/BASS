# AgentLab ADO Read Capabilities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local read-only Azure DevOps capability mapping for AgentLab delivery context.

**Architecture:** Create one mapping record using the existing ADO read-capabilities template. It will define the `IT.DIT` delivery sources and their read-only operations without testing current availability or authorizing writes.

**Tech Stack:** Markdown, local BASS ADO capability records.

## Global Constraints

- Do not mutate Azure DevOps.
- The mapping grants no write authority.
- The mapping does not establish current live Azure DevOps connectivity.
- Do not infer repository or pipeline names beyond the `BCP.GenAI.` prefix constraint.

---

### Task 1: Create The AgentLab Read Capability Map

**Files:**
- Create: `BASS/projects/agentlab/project-context/ado-read-capabilities.md`
- Reference: `BASS/templates/ado-read-capabilities-template.md`

**Interfaces:**
- Consumes: Project `IT.DIT`; backlog team `Generative AI`; pipeline and repository prefix `BCP.GenAI.`; example eligible target `BCP.GenAI.Backoffice.Frontend`.
- Produces: A local ADO read-capabilities record discoverable by BASS project status.

- [ ] **Step 1: Create the mapping header and scope statement**

Create the record with typed metadata and this scope statement:

```markdown
# AgentLab ADO Read Capabilities

This local mapping defines approved read-only delivery-context capabilities. It does not grant write authority and does not prove current live Azure DevOps connectivity.
```

- [ ] **Step 2: Map the backlog and work-item reads**

Add the capability entry:

```markdown
| Backlog and work items | `azure-devops_wit_backlog.list`, `azure-devops_wit_backlog.list_work_items`, `azure-devops_wit_query.wiql`, `azure-devops_wit_work_item.get`, `azure-devops_wit_work_item.get_batch` | Project `IT.DIT`; team backlog `Generative AI` | Read-only | User-supplied backlog URL `https://dev.azure.com/ptbcp/IT.DIT/_backlogs/backlog/Generative%20AI/` | high |
```

- [ ] **Step 3: Map the pipeline and test reads**

Add the capability entry:

```markdown
| Pipelines and tests | `azure-devops_pipelines_definition.list`, `azure-devops_pipelines_run.get`, `azure-devops_pipelines_run.list`, `azure-devops_pipelines_build.list`, `azure-devops_pipelines_build.get_status`, `azure-devops_pipelines_build_log.list`, `azure-devops_pipelines_build_log.get_content`, `azure-devops_pipelines_artifact.list`, `azure-devops_testplan_show_test_results_from_build_id` | Project `IT.DIT`; pipeline names prefixed `BCP.GenAI.`; example `BCP.GenAI.Backoffice.Frontend` | Read-only | User-supplied pipeline naming convention | high |
```

- [ ] **Step 4: Map repository and pull-request reads**

Add the capability entry:

```markdown
| Repositories and pull requests | `azure-devops_repo_repository.list`, `azure-devops_repo_repository.get`, `azure-devops_repo_branch.list`, `azure-devops_repo_branch.get`, `azure-devops_repo_file.get_content`, `azure-devops_repo_file.list_directory`, `azure-devops_repo_search_commits`, `azure-devops_repo_pull_request.list`, `azure-devops_repo_pull_request.get`, `azure-devops_repo_pull_request_thread.list`, `azure-devops_repo_pull_request_thread.list_comments` | Project `IT.DIT`; repository names prefixed `BCP.GenAI.` | Read-only | User-confirmed repository and pull-request scope | high |
```

- [ ] **Step 5: Verify the mapping**

Run: `rg -n "Generative AI|BCP\.GenAI\.|Read-only|does not prove current live Azure DevOps connectivity|azure-devops_repo_pull_request" "BASS/projects/agentlab/project-context/ado-read-capabilities.md"`

Expected: all scope constraints, read-only authority, connectivity limitation, and pull-request read tool are present.

- [ ] **Step 6: Commit**

```bash
git add BASS/projects/agentlab/project-context/ado-read-capabilities.md
git commit -m "docs: map AgentLab ADO read capabilities"
```
