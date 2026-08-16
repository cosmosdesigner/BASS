# BASS — Phase 1 Plan

## Goal

Deliver, within three weeks, a repository-scoped **Business ASSistant (BASS)** distribution for OpenCode. It enables a Business Analyst to discover, create, review, improve and synchronize work in Azure DevOps (ADO), with evidence and traceability.

**Operating model**

- **OpenCode:** agents, commands, skills and rules.
- **Azure DevOps MCP:** Wiki, Work Items, repositories, pull requests and pipelines.
- **BASS workspace:** project context, evidence, outputs, decisions and action history.

---

## D1 — Phase 1 contract and operating architecture

**Outcome:** A single source of truth for BASS scope, roles and collaboration.

- [ ] Confirm the final taxonomy: BASS, Reader, Explorer, Creator, Reviewer, Editor and Executor.
- [ ] Define BASS as the sole orchestrator: understand intent, load context, select workflow, coordinate agents, request decisions and deliver results.
- [ ] Define that subagents do not invoke each other directly.
- [ ] Define canonical workflows: Understand, Discover, Create, Review, Improve and Sync/Execute ADO.
- [ ] Define inputs, outputs and acceptance criteria for every workflow.
- [ ] Define confirmation rules for destructive, material or batch changes.
- [ ] State Phase 1 exclusions: non-ADO connectors, advanced memory, dashboards and autonomous automation.
- [ ] Write the architecture and operating-flow document.

**Done when:** Anyone can understand each agent's role and choose the appropriate workflow.

## D2 — Workspace structure and context model

**Outcome:** BASS knows where to find project information, evidence and artifacts.

- [ ] Create the BASS root structure.
- [ ] Define project folders: `project-context/`, `features/`, `user-stories/`, `ideas/`, `evidence/`, `outputs/` and `decisions/`.
- [ ] Define the internal structure for Features, User Stories and Ideas.
- [ ] Define ID, naming, date and version conventions.
- [ ] Create templates for functional context, technical context, Feature, User Story, Idea, evidence and decisions.
- [ ] Create `context-registry.md` with official functional and technical ADO Wiki URLs.
- [ ] Define how a local item links to its ADO Work Item.
- [ ] Create a complete demonstration project.

**Done when:** A new BASS project can be created by copying templates, with no implicit decisions.

## D3 — Provenance, evidence and decisions

**Outcome:** BASS never mixes facts, interpretations and proposals.

- [ ] Define the provenance schema.
- [ ] Support mandatory classifications: Fact, Inference, Assumption, Proposal, Question, Conflict and Decision.
- [ ] Define source, location, actor, date, confidence, version and related-item fields.
- [ ] Define references for local files, ADO Wiki, Work Items, comments, PRs and pipelines.
- [ ] Create an Evidence Register, Decision Log and ADO Action Log.
- [ ] Define how absent evidence and source conflicts are presented.
- [ ] Define lineage between original and edited versions.
- [ ] Create correct output examples.

**Done when:** Every important claim and ADO change is traceable.

## D4 — OpenCode foundation

**Outcome:** BASS is installable and usable within an OpenCode repository.

- [ ] Create the BASS distribution structure.
- [ ] Create `.opencode/agents` and `.opencode/commands` in the portable `BASS/integration/opencode/` bundle for end users to copy into a target host `.opencode/` directory.
- [ ] Add BASS rules and templates.
- [ ] Create `AGENTS.md` with BA operating principles.
- [ ] Define each agent's input/output contract.
- [ ] Configure and verify the existing host-owned Azure DevOps MCP in the target environment without shipping credentials or a duplicate server configuration.
- [ ] Define workspace and ADO read/write rules.
- [ ] Create a diagnostic command for configuration, context and MCP availability.
- [ ] Create an installation guide and minimum working example.

**Done when:** BASS can be added to a repository and identify its context and available tools.

## D5 — Reader and context loading

**Outcome:** Every BASS task starts from a consolidated, evidenced view.

- [ ] Define loading order: local project context, item files, local evidence, functional and technical ADO Wiki, ADO Work Item, relations and relevant history.
- [ ] Create the Reader agent.
- [ ] Create `/bass load-context` and `/bass understand`.
- [ ] Define the `Context Brief` format.
- [ ] Include goal, state, decisions, evidence, conflicts, gaps and questions.
- [ ] Link every summary element to a source.
- [ ] Set relevance limits to prevent unnecessary context loading.
- [ ] Handle missing Work Items, unavailable Wiki pages and insufficient permissions.
- [ ] Test complete, incomplete and contradictory contexts.

**Done when:** BASS can correctly explain a Feature or User Story before suggesting changes.

## D6 — Explorer: local and ADO discovery

**Outcome:** BASS finds related context, dependencies and knowledge gaps.

- [ ] Create the Explorer agent and `/bass discover`.
- [ ] Support search by ID, URL, text, type, tag, state, area and iteration.
- [ ] Discover Epic → Feature → User Story → Task/Bug hierarchies.
- [ ] Discover `related`, `predecessor`, `successor` and dependency relations.
- [ ] Locate related local decisions, evidence and artifacts.
- [ ] Read relevant comments and history.
- [ ] Consult Wiki content through `context-registry.md`.
- [ ] Produce an Evidence Map.
- [ ] Produce gaps, conflicts, risks and questions.
- [ ] Distinguish found information from inference.
- [ ] Test against real ADO relationships.

**Done when:** BASS can answer: “What already exists, what depends on this, and what is missing?”

## D7 — Creator: BA artifact creation

**Outcome:** BASS produces clear, testable artifacts grounded in evidence.

- [ ] Create the Creator agent.
- [ ] Create `/bass create-feature`, `/bass create-us`, `/bass create-ac` and `/bass create-proposal`.
- [ ] Define Feature, User Story, acceptance-criteria and functional-proposal templates.
- [ ] Include goal, scope, out of scope, rules, dependencies, risks and questions.
- [ ] Require cited evidence and explicit assumptions.
- [ ] Require testable acceptance criteria.
- [ ] Produce local outputs before ADO publication.
- [ ] Generate a preview of the Work Item to create.

**Done when:** BASS creates a User Story ready for review and ADO publication.

## D8 — Reviewer and Editor

**Outcome:** BASS finds real issues and improves artifacts without inventing content.

- [ ] Create Reviewer and Editor agents.
- [ ] Create `/bass review` and `/bass improve`.
- [ ] Define review checks: clarity, ambiguity, completeness, consistency, testability, dependencies, risks and provenance.
- [ ] Define finding severity.
- [ ] Create an actionable review report.
- [ ] Ensure Editor receives the original artifact and review findings.
- [ ] Generate a changelog for every edit.
- [ ] Re-run Reviewer after improvement.
- [ ] Prevent unresolved questions being closed by assumption.

**Done when:** BASS returns an improved, justified and revalidated version.

## D9 — Complete ADO Executor

**Outcome:** BASS turns approved artifacts into operational Azure DevOps work.

- [ ] Create the Executor agent.
- [ ] Create `/bass sync-ado`, `/bass update-ado`, `/bass link-items` and `/bass transition`.
- [ ] Read all relevant Work Item fields.
- [ ] Create Epics, Features, User Stories, Bugs and Tasks.
- [ ] Update title, description, acceptance criteria, priority, effort, assignee, area, iteration and configured fields.
- [ ] Add and remove simple tags.
- [ ] Add structured comments.
- [ ] Create and remove relations.
- [ ] Change state and reason.
- [ ] Synchronize local changes to ADO and import relevant ADO changes locally.
- [ ] Detect local/ADO differences and conflicts.
- [ ] Show a plan or diff before material changes.
- [ ] Request confirmation before material writes, removals or batch operations.
- [ ] Record every operation in the Action Log and link it to its evidence and decision.
- [ ] Handle MCP errors, permissions, partial failures and concurrent changes.
- [ ] Test every operation.

**Done when:** BASS manages Work Items end-to-end with control and auditability.

## D10 — ADO repositories, PRs and pipelines

**Outcome:** BASS uses technical delivery evidence to inform BA work.

- [ ] Define repository information relevant to BA work.
- [ ] Search repositories and files associated with a Feature or User Story.
- [ ] Query related PRs.
- [ ] Collect relevant PR state, comments and links.
- [ ] Associate PRs and commits with Work Items when MCP support exists.
- [ ] Query pipeline and deployment status.
- [ ] Record technical validation and deployment evidence.
- [ ] Surface technical blockers in Feature context.
- [ ] Keep code, PR and pipeline mutation out of Phase 1.
- [ ] Produce implementation and release status reports with ADO sources.

**Done when:** BASS explains a Feature's functional and technical state from ADO evidence.

## D11 — BASS orchestration and complete commands

**Outcome:** The BA does not need to know which specialist to use.

- [ ] Create the primary BASS agent.
- [ ] Define intent detection and workflow selection.
- [ ] Coordinate Reader → Explorer → Creator/Reviewer/Editor → Executor.
- [ ] Implement `/bass understand`, `/bass load-context`, `/bass discover`, `/bass create-feature`, `/bass create-us`, `/bass create-ac`, `/bass review`, `/bass improve`, `/bass sync-ado`, `/bass update-ado`, `/bass link-items`, `/bass transition` and `/bass next`.
- [ ] Define a uniform response format.
- [ ] Define when BASS asks, proposes or executes.
- [ ] Define insufficient-context handling and conflict priorities.
- [ ] Create useful error messages.
- [ ] Validate all workflows end-to-end.

**Done when:** A natural request or command starts and completes the right workflow.

## D12 — Quality, documentation and demo

**Outcome:** BASS is ready for real use and safe evolution.

- [ ] Create a test matrix by agent, command and workflow.
- [ ] Create a safe ADO test project or work-item set.
- [ ] Test Wiki, Work Item, repository, PR and pipeline reading.
- [ ] Test ADO creation, edits, relations, comments and transitions.
- [ ] Test conflicts, MCP failures and permissions.
- [ ] Test traceability for outputs and ADO operations.
- [ ] Test a complete Feature → User Story → review → ADO publication flow.
- [ ] Create a BA quick-start guide.
- [ ] Create a technical installation/configuration guide.
- [ ] Create a command catalogue.
- [ ] Create a context and evidence-structure guide.
- [ ] Create a contribution guide for agents, workflows and templates.
- [ ] Create an end-to-end demo.
- [ ] Create a prioritized Phase 2 backlog.
- [ ] Version, commit and publish the BASS distribution repository.

**Done when:** BASS can be installed, demonstrated end-to-end and trusted to keep work traceable.
