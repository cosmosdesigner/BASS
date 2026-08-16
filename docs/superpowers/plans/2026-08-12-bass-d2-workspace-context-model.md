# BASS D2 Workspace and Context Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a copy-ready BASS distribution scaffold, canonical templates, and a complete fictional project that demonstrates the workspace and context model.

**Architecture:** `BASS/` is the distribution root. Each project lives under `BASS/projects/<project-name>/` and owns its context, typed item directories, and project-wide registers; `BASS/templates/` supplies reusable Markdown templates. D4-owned OpenCode, rules, and agent-principle paths are created as empty placeholders only.

**Tech Stack:** Markdown with YAML front matter, filesystem conventions, Azure DevOps URL examples.

## Global Constraints

- The distribution root is exactly `BASS/`.
- Create `.opencode/agents/`, `.opencode/commands/`, `rules/`, and `AGENTS.md` placeholders but do not populate D4 behavior.
- Each project is located at `BASS/projects/<project-name>/`.
- Project roots contain `project-context/`, `features/`, `ideas/`, `evidence-register.md`, `decision-log.md`, and `action-log.md`.
- Features, User Stories, and Ideas use typed-ID directories with lowercase kebab-case names.
- Each Feature contains `feature.md`, `evidence/`, `decisions/`, `outputs/`, and `user-stories/`; each User Story contains `user-story.md`, `evidence/`, `decisions/`, and `outputs/`; each Idea contains `idea.md`, `evidence/`, `decisions/`, and `outputs/`.
- All records use Markdown with YAML front matter; dates use `YYYY-MM-DD`; versions use `vX.Y`.
- Feature and User Story front matter must include `ado_work_item_id` and `ado_work_item_url`, set to `null` before publication.
- Project-root evidence, decision, and action logs are canonical indexes; item-level records link to them.
- Reusable registry templates have explicit functional and technical Wiki URL placeholders; the demo uses fictional URLs only.

---

### Task 1: Distribution and Project Scaffold

**Files:**
- Create: `BASS/.opencode/agents/.gitkeep`
- Create: `BASS/.opencode/commands/.gitkeep`
- Create: `BASS/rules/.gitkeep`
- Create: `BASS/AGENTS.md`
- Create: `BASS/projects/demo-customer-onboarding/project-context/functional/.gitkeep`
- Create: `BASS/projects/demo-customer-onboarding/project-context/technical/.gitkeep`
- Create: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/evidence/.gitkeep`
- Create: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/decisions/.gitkeep`
- Create: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/outputs/.gitkeep`
- Create: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/user-stories/US-001-create-account/evidence/.gitkeep`
- Create: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/user-stories/US-001-create-account/decisions/.gitkeep`
- Create: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/user-stories/US-001-create-account/outputs/.gitkeep`
- Create: `BASS/projects/demo-customer-onboarding/ideas/IDEA-001-guided-onboarding/evidence/.gitkeep`
- Create: `BASS/projects/demo-customer-onboarding/ideas/IDEA-001-guided-onboarding/decisions/.gitkeep`
- Create: `BASS/projects/demo-customer-onboarding/ideas/IDEA-001-guided-onboarding/outputs/.gitkeep`

**Interfaces:**
- Produces: The copy-ready directory hierarchy consumed by templates and demo records in Tasks 2 and 3.

- [ ] **Step 1: Create all scaffold directories using tracked marker files**

Create each listed `.gitkeep` file. Use an empty file for directory markers.

- [ ] **Step 2: Create the D4 placeholder document**

Create `BASS/AGENTS.md` with exactly:

```markdown
# BASS Agent Instructions

This placeholder is reserved for D4 BA operating principles.
```

- [ ] **Step 3: Verify the scaffold tree**

Run: `rg --files BASS`

Expected: The output includes the listed marker files and `BASS/AGENTS.md`, proving every required empty directory is materialized.

### Task 2: Canonical Templates and Registry Template

**Files:**
- Create: `BASS/templates/functional-context-template.md`
- Create: `BASS/templates/technical-context-template.md`
- Create: `BASS/templates/feature-template.md`
- Create: `BASS/templates/user-story-template.md`
- Create: `BASS/templates/idea-template.md`
- Create: `BASS/templates/evidence-template.md`
- Create: `BASS/templates/decision-template.md`
- Create: `BASS/templates/context-registry-template.md`

**Interfaces:**
- Consumes: The D2 global artifact and ADO-link conventions.
- Produces: Canonical files that a new project copies into its D2 scaffold.

- [ ] **Step 1: Create the Feature and User Story templates with required ADO fields**

Use this Feature front matter shape:

```yaml
---
id: F-001
title: ""
version: v1.0
created_date: YYYY-MM-DD
updated_date: YYYY-MM-DD
ado_work_item_id: null
ado_work_item_url: null
---
```

Use this User Story front matter shape:

```yaml
---
id: US-001
title: ""
version: v1.0
created_date: YYYY-MM-DD
updated_date: YYYY-MM-DD
parent_feature_id: F-001
ado_work_item_id: null
ado_work_item_url: null
---
```

Include clear Markdown sections appropriate to each artifact type.

- [ ] **Step 2: Create context, Idea, evidence, and decision templates**

Use YAML front matter with `id`, `title`, `version`, `created_date`, and `updated_date` where applicable. Include sections that make each template usable without implicit decisions.

- [ ] **Step 3: Create the context registry template**

Use exactly these explicit fields:

```markdown
# Context Registry

## Functional ADO Wiki

- URL: `<replace-with-official-functional-wiki-url>`

## Technical ADO Wiki

- URL: `<replace-with-official-technical-wiki-url>`
```

- [ ] **Step 4: Verify template metadata and registry placeholders**

Run: `rg -n "ado_work_item_id: null|ado_work_item_url: null|replace-with-official-functional-wiki-url|replace-with-official-technical-wiki-url" BASS/templates`

Expected: Both ADO fields occur in Feature and User Story templates; both explicit registry placeholders occur in the context registry template.

### Task 3: Complete Demonstration Project

**Files:**
- Create: `BASS/projects/demo-customer-onboarding/project-context/context-registry.md`
- Create: `BASS/projects/demo-customer-onboarding/project-context/functional/functional-context.md`
- Create: `BASS/projects/demo-customer-onboarding/project-context/technical/technical-context.md`
- Create: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/feature.md`
- Create: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/evidence/EVD-001-customer-research.md`
- Create: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/decisions/DEC-001-account-creation-scope.md`
- Create: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/outputs/OUT-001-feature-summary.md`
- Create: `BASS/projects/demo-customer-onboarding/features/F-001-customer-onboarding/user-stories/US-001-create-account/user-story.md`
- Create: `BASS/projects/demo-customer-onboarding/ideas/IDEA-001-guided-onboarding/idea.md`
- Create: `BASS/projects/demo-customer-onboarding/evidence-register.md`
- Create: `BASS/projects/demo-customer-onboarding/decision-log.md`
- Create: `BASS/projects/demo-customer-onboarding/action-log.md`

**Interfaces:**
- Consumes: The scaffold from Task 1 and artifact conventions/templates from Task 2.
- Produces: A minimal complete project demonstrating project context, nested work items, scoped records, project registers, output, and fictional ADO links.

- [ ] **Step 1: Create fictional project context and ADO Wiki registry**

Set the registry URLs to:

```markdown
- URL: `https://dev.azure.com/example-org/demo-customer-onboarding/_wiki/wikis/demo-functional.wiki`
```

and:

```markdown
- URL: `https://dev.azure.com/example-org/demo-customer-onboarding/_wiki/wikis/demo-technical.wiki`
```

State in both context files that the content is fictional demonstration data.

- [ ] **Step 2: Create linked Feature and User Story artifacts**

Give `feature.md` front matter `id: F-001`, `version: v1.0`, `ado_work_item_id: 1001`, and `ado_work_item_url: https://dev.azure.com/example-org/demo-customer-onboarding/_workitems/edit/1001`.

Give `user-story.md` front matter `id: US-001`, `parent_feature_id: F-001`, `version: v1.0`, `ado_work_item_id: 1002`, and `ado_work_item_url: https://dev.azure.com/example-org/demo-customer-onboarding/_workitems/edit/1002`.

Include explicit Feature/User Story linkage in both documents.

- [ ] **Step 3: Create the Idea, evidence, decision, and output records**

Create `IDEA-001`, `EVD-001`, `DEC-001`, and `OUT-001` records with YAML front matter, `v1.0`, `2026-08-12` dates, and links to `F-001` where applicable.

- [ ] **Step 4: Create canonical project registers**

`evidence-register.md` must link to `EVD-001-customer-research.md`; `decision-log.md` must link to `DEC-001-account-creation-scope.md`; `action-log.md` must state that no ADO write was performed because this is fictional demonstration data.

- [ ] **Step 5: Verify the complete demonstration**

Run: `rg -n "F-001|US-001|IDEA-001|EVD-001|DEC-001|OUT-001|example-org|No ADO write" BASS/projects/demo-customer-onboarding`

Expected: Each ID, fictional ADO source, and no-write action-log statement is present in the correct project records.

### Task 4: D2 Acceptance Verification

**Files:**
- Verify: `BASS/`
- Verify: `docs/superpowers/specs/2026-08-12-bass-d2-workspace-context-model-design.md`

**Interfaces:**
- Consumes: Tasks 1 through 3.
- Produces: Evidence that a new BASS project can be created from templates without implicit structural decisions.

- [ ] **Step 1: Check the implemented tree against the approved scaffold**

Run: `rg --files BASS | sort`

Expected: The result contains all distribution placeholders, templates, project context, typed item folders, item-scoped evidence/decisions/outputs, and project registers required by the D2 specification.

- [ ] **Step 2: Check front matter and required registry fields**

Run: `rg -n "^id: (F-001|US-001|IDEA-001|EVD-001|DEC-001|OUT-001)$|^version: v1.0$|^ado_work_item_id:|^ado_work_item_url:" BASS/projects/demo-customer-onboarding`

Expected: Every demo artifact has an ID and `v1.0`; Feature and User Story include both ADO link fields.

- [ ] **Step 3: Check the no-implicit-decisions rule**

Read `BASS/templates/` and `BASS/projects/demo-customer-onboarding/` together. Confirm that templates define locations and headings, registry placeholders are explicit, and the demo illustrates each record type and link.

- [ ] **Step 4: Check Git availability without initializing a repository**

Run: `git status --short`

Expected: The command reports that the workspace is not a Git repository. Do not initialize Git; report that D2 cannot be committed from this workspace.
