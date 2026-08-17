# BASS

BASS is a repository-scoped OpenCode distribution for evidence-first Business
Analysis work with Azure DevOps (ADO).

## Readiness And Guides

`source_ready` means the portable source bundle and its configured local checks have
passed. It does not validate host configuration, credentials, permissions, or live ADO
operations. `target_ready` may be claimed only after `source_ready` and retained,
isolated target-host evidence satisfies the live validation runbook.

- [BA Quick Start](docs/ba-quick-start.md)
- [Technical Installation](docs/technical-installation.md)
- [Command Catalogue](docs/command-catalogue.md)
- [Context And Evidence Guide](docs/context-and-evidence-guide.md)
- [Contribution Guide](docs/contribution-guide.md)
- [Source Demo](docs/source-demo.md) (simulated ADO token only)
- [Target-Host Demo](docs/target-host-demo.md) (operator-run live evidence)
- [Target-Host ADO Provisioning](docs/target-host-ado-provisioning.md)
- [Target-Host Validation](docs/target-host-validation.md)
- [Phase 2 Backlog](docs/phase-2-backlog.md)
- [Release Checklist](docs/release-checklist.md)

## Prerequisites

- OpenCode is installed and available in the target host repository.
- The host repository owns the `azure-devops` MCP server configuration and its
  Azure DevOps credentials and authorization.
- BASS has no Azure DevOps credentials, tokens, secrets, or `azure-devops` MCP
  configuration. Do not add credentials to BASS or duplicate the host MCP server
  configuration here.

## Install BASS

1. Copy the complete `BASS/` directory into the root of the target host
   repository.
2. Copy the contents of `BASS/integration/opencode/` into the target host
    repository's `.opencode/` directory. Preserve `agents/`,
    `commands/bass/`, and `plugins/` at those OpenCode discovery paths.
3. Configure and authorize the host OpenCode environment's `azure-devops` MCP
    server for the Azure DevOps organization and project that BASS will use.
4. For Reader ADO access, map the target host's actual `azure-devops` MCP read
   tools to these four categories: Wiki page read, Work Item read, relation
   read, and history/comment read. Before enabling each mapping, verify that
   the tool is non-mutating and cannot create, update, delete, or otherwise
   change an Azure DevOps resource. Do not enable unknown or write-capable MCP
    tools for Reader.
5. Copy `BASS/templates/ado-read-capabilities-template.md` to the target
    project's `project-context/ado-read-capabilities.md` and fill only verified
    mappings. Use `bass_validate_ado_read_capabilities` to map each independently
    valid exact verified name into Reader front-matter permissions in order:
    `"ado_*": deny` first, followed by exact allow rules for valid mapped names.
    The Reader workflow loads local context first and invokes only mapped required
    ADO categories; unmapped, failed, or unauthorized sources stay as brief gaps.
6. Start OpenCode from the host repository so it can discover the installed
    bundle and use the host-owned MCP configuration.

## Configure D9 Work Item Execution

D9 execution is a separate target-host mapping. Copy
`BASS/templates/ado-write-capabilities-template.md` to the target project's
`project-context/ado-write-capabilities.md`, then copy
`BASS/templates/configured-work-item-fields-template.md` to
`project-context/configured-work-item-fields.md`. Complete only verified mappings.
The write categories are exactly `create`, `fields`, `tags`, `comments`,
`relations`, `transitions`, and `query/import`.

Use `bass_validate_ado_write_capabilities` to validate mappings and synchronize
Executor permissions. Keep `"ado_*": deny` first in Executor front matter, then
add exact allow rules only for verified mapped tool names. Unknown tools, fields,
and custom fields are unavailable: do not guess or write them. Do not map repository,
code, pull-request, or pipeline mutation tools.

`/bass create-ado` plans exactly one mapped `Epic`, `Feature`, `User Story`, `Bug`,
or `Task` create. `/bass update-ado`, `/bass link-items`, and `/bass transition`
each require a current mapped read of the relevant existing Work Item before planning;
they reject a missing, stale, unmapped, failed, or unauthorized snapshot.
`/bass sync-ado` likewise requires a current mapped Work Item snapshot before it
compares the local artifact, current ADO Work Item, and last synchronized baseline.
Local-only changes are proposed for ADO, ADO-only changes are proposed for local
import, and overlapping changes become D3 Conflicts that block both directions until
a user Decision resolves them.

Every ADO write and every local import displays a field-level preview and requires
explicit confirmation of one exact, unexpired plan token. A multi-operation sync
shows operations in order but pauses for separate confirmation before each one.
Executor never expands, batches, substitutes, repeats, or replays a confirmed token.
Before enabling D9 execution, configure a non-empty `BASS_TOKEN_SIGNING_KEY` only in
the target-host secret environment. BASS uses it to HMAC-sign issuer-owned token
records under the runtime-owned host project's `.bass/issued-tokens/<project ID>/`.
The issuer path is derived only from OpenCode runtime context and is not a planner or
executor tool argument; invalid or symlink-escaping storage fails closed. Never put
this key in BASS files, prompts, plan tokens, Action Logs, or MCP configuration.
Missing key material blocks planning and execution.
Only planner issuance creates the canonical issuer store after trusted-context and
signing preflight. Executor resolution is read-only: a missing issuer store or record
blocks without creating files or directories.
Direct planner calls without runtime-owned trusted context are blocked before a token,
issuer-cache entry, or issuer-store path is created.
The non-portable `BASS/test-support/d9/executor-harness.mjs` exists only for
source-only tests and is outside the portable target-host plugin bundle.
Each actual outcome is recorded in the Action Log with its evidence and Decision
links. If remote ADO succeeds but local recording fails, BASS records
`remote_succeeded_local_recording_failed` through its available durable recovery
path, stops for manual recovery, and never automatically reverses the remote change.

D9 excludes any repository, code, pull-request, or pipeline mutation. These portable
source files do not install host `.opencode/` configuration, credentials, MCP servers,
or call Azure DevOps; the Task 1 command contracts only define planning and
confirmation boundaries.

## Configure D6 Discovery

D6 discovery is a separate, target-host installation mapping. Copy
`BASS/templates/ado-discovery-capabilities-template.md` to the target project's
`project-context/ado-discovery-capabilities.md`. For each category, record only
an independently verified, exact safe read-only tool name, supported input, and
verification date:

- Work Item search and filtering
- Hierarchy and relation reads
- Comments and history reads
- Wiki search and content reads

Use `bass_validate_ado_discovery_capabilities` to validate each mapping
independently and synchronize Explorer's permissions. Preserve `"ado_*": deny`
first in Explorer front matter, then add exact allow rules only for valid mapped
names. Do not use wildcards, unknown tools, or tools that can create, update,
delete, or otherwise change Azure DevOps resources.

Run `/bass discover <scope and filters>` for a bounded Discovery Report. It first
searches the selected BASS project, validates the target-host mapping, and sends
only required mapped categories to Explorer. Unmapped, failed, or unauthorized
categories remain explicit Discovery Report gaps; partial mappings are valid.

D6 excludes repository, pull-request, and pipeline discovery. Those
technical-delivery categories belong to D10.

## Configure D10 Technical Delivery

D10 technical delivery is a separate, target-host installation mapping. Copy
`BASS/templates/ado-technical-delivery-capabilities-template.md` to the target
project's `project-context/ado-technical-delivery-capabilities.md`. Record only
independently verified exact read-only tool names, supported inputs, and
verification dates for repository/file search, pull-request details/comments/links,
Work Item association, and pipeline/deployment status.

Use `bass_validate_ado_technical_delivery_capabilities` to validate each mapping
independently and synchronize Explorer permissions. Preserve `"ado_*": deny`
first in Explorer front matter, then add exact allow rules only for valid mapped
names. Partial mappings are valid; unmapped, failed, or unauthorized categories
remain cited Technical Delivery Report gaps. Never map a tool that can create,
update, delete, merge, approve, complete, abandon, queue, cancel, retry, deploy,
release, or otherwise mutate an ADO resource.

Run `/bass technical-delivery <Feature-or-User-Story>` to return a chat-first,
read-only Technical Delivery Report. Direct Work Item links or IDs in technical
evidence are Facts. Title, branch, tag, commit-message, and file-text matches
are lower-confidence Inferences that state their matching basis; they never
become confirmed associations. Missing, unauthorized, unavailable, or
contradictory required pipeline/deployment evidence yields `Release State:
unknown`, not a release inference from repository or pull-request evidence.

D10 does not persist local technical evidence automatically. BASS may update a
D3-provenanced evidence record and the canonical Evidence Register only after
the user explicitly approves the specific technical-evidence preview. D10 never
mutates code, repositories, files, pull requests, commits, pipelines, builds,
environments, deployments, releases, or Work Items.

## Minimum Working Example

Create a real project from the included demonstration project. Replace
`customer-onboarding` with a direct child directory name suitable for your
project.

1. Copy `BASS/projects/demo-customer-onboarding/` to
   `BASS/projects/customer-onboarding/`.
2. Open
   `BASS/projects/customer-onboarding/project-context/context-registry.md`.
3. Replace both fictional `example-org` URLs with the official, non-placeholder
   Azure DevOps Wiki URLs for the project's Functional ADO Wiki and Technical
   ADO Wiki.
4. In OpenCode, run:

   ```text
   /bass diagnose customer-onboarding
   ```

The demo registry is intentionally fictional. Do not use its URLs as evidence of
a live Azure DevOps project.

## Interpret The Diagnostic

`bass_diagnose` is the authoritative, read-only diagnostic API: it does not
change local files or Azure DevOps resources and returns the fixed,
machine-parseable four-section report. Each section reports `ready`, `warning`,
or `blocked`, the observed condition, and a next step. Target users and
automations requiring that exact fixed output must invoke `bass_diagnose`
directly. `/bass diagnose <project-name>` is a conversational convenience that
calls the tool once and bases its response exclusively on the result; it does
not promise verbatim or machine-parseable output.

| Section | What it checks | Expected result after the example |
| --- | --- | --- |
| Distribution Structure | Required BASS files, rules, project directories, and portable `BASS/integration/opencode/` bundle artifacts | `ready` |
| Project Context | The selected project, its context registry, and both non-placeholder Azure DevOps Wiki URL values | `ready` after both URL values are replaced with non-placeholder Azure DevOps Wiki URLs |
| Azure DevOps MCP | Host ownership boundary only; live availability is checked by later workflows and host setup | `warning` until a later ADO-backed workflow checks it |
| Effective Access Policy | BASS workspace and Azure DevOps read/write boundaries | `ready` when all policy sources are available |

A `warning` identifies an incomplete or unconfirmed condition that needs review.
A `blocked` result stops the dependent check or operation. In particular, a
`blocked` **Azure DevOps MCP** result means the host must configure or authorize
its `azure-devops` MCP server before any ADO-backed work can proceed. BASS must
not work around this by adding credentials or a duplicate MCP configuration.

The deterministic D4 tool verifies the portable source bundle under
`BASS/integration/opencode/`. It does not inspect a target host `.opencode/`
directory because that installation location is host-specific; copying the bundle
into target `.opencode/` remains the installation step above.

A `ready` **Project Context** result validates only the local registry's URL
presence, non-placeholder status, and Azure DevOps Wiki URL form. It does not
verify that either Wiki URL is live, reachable, official, for the correct
project, or readable.

## Access Boundary

BASS can read host-repository files required by an approved workflow and write
only BASS-owned files and `BASS/projects/<project-name>/`. ADO reads require an
available host `azure-devops` MCP server. Only Executor may perform a confirmed
ADO Work Item write after cited evidence, relevant decisions, a preview or diff,
and explicit user confirmation; the outcome is recorded in the project Action
Log. Azure DevOps repository, code, pull-request, and pipeline writes are
prohibited.

## BASS Command Routing

For copyable end-to-end scenarios, approval gates, conditional live ADO operations,
and recovery behavior, see the [Workflow Examples](docs/workflow-examples.md).

BASS is the only user-facing orchestrator. It selects and coordinates Reader,
Explorer, Creator, Reviewer, Editor, and Executor; specialists receive bounded inputs
from BASS and return only to BASS.

An explicit `/bass` command selects its workflow and takes precedence over natural
language. BASS still validates the command target, context, evidence, capability, and
any approval or confirmation gate. For natural-language requests, BASS uses the least
mutating workflow that can answer the request: Understand, Discover, Review, Create,
Improve, then Sync/Execute ADO. If a target, scope, or write request is ambiguous,
BASS asks one focused question rather than guessing.

| Request or command | Canonical workflow | Route | Gate |
| --- | --- | --- | --- |
| `/bass understand`, `/bass load-context` | Understand | BASS -> Reader -> optional Explorer | Partial read gaps return `warning`. |
| `/bass discover`, `/bass technical-delivery` | Discover | BASS -> Explorer -> optional Reader | Partial read gaps return `warning`. |
| `/bass create-feature`, `/bass create-us`, `/bass create-ac`, `/bass create-proposal` | Create | BASS -> Reader/Explorer as needed -> Creator | Required context or material conflicts block; local persistence needs approval. |
| `/bass review` | Review | BASS -> Reviewer | Partial read gaps return `warning`; findings remain visible. |
| `/bass improve` | Improve | BASS -> Editor -> Reviewer | Required context, unresolved conflicts, or unresolved Critical/Major findings block persistence. |
| `/bass create-ado`, `/bass sync-ado`, `/bass update-ado`, `/bass link-items`, `/bass transition` | Sync/Execute ADO | BASS -> Executor | Current mapped context, evidence, Decisions, and a per-operation confirmed token are required. |
| `/bass diagnose` | Read-only diagnostic utility | BASS only | No mutation or specialist delegation. |

Every BASS response contains `Status`, `Workflow`, `Result`, `Evidence`, `Gaps and
Conflicts`, and `Next Action`. Material results retain cited source, location, D3
classification, and confidence. `Approval` appears only for a required local-write
approval or Decision waiver. `Confirmation` appears only for a local import or ADO
Work Item plan token. Errors identify the failed stage, reason, available evidence,
impact, and safe next action.

Create, Improve, and Sync/Execute ADO do not turn missing evidence or conflicts into
assumptions. Every ADO Work Item write and local import needs explicit confirmation of
the exact valid operation token. BASS never mutates code, repositories, pull requests,
pipelines, deployments, or other Phase 1 excluded resources.

`/bass next` reads the latest BASS workflow response and returns one safest contextual
recommendation with its rationale. It never starts a workflow, delegates to a
specialist, persists an artifact, imports data, invokes ADO or MCP tools, issues or
consumes a token, or writes Azure DevOps.

## Create BA Artifacts

The portable commands `/bass create-feature`, `/bass create-us`, `/bass create-ac`,
and `/bass create-proposal` return evidence-grounded local previews first. Each
preview preserves cited sources, classifications, assumptions, questions, conflicts,
and gaps. `create-ac` previews a scoped update to an existing Feature or User Story;
it does not create a standalone record.

No preview writes a local artifact. BASS can request local persistence only after the
user explicitly approves that specific ready preview; blocked previews cannot be
persisted. Feature and User Story previews can include a field-level, local-only ADO
Work Item preview. An ADO preview is not publication and does not call ADO. Functional
proposals receive that preview only when explicitly promoted to a Feature or User
Story.

D9 owns actual confirmed ADO Work Item operations. As with every ADO write, only
Executor may perform the D9-confirmed operation after cited evidence, relevant
decisions, a clear preview or diff, and explicit user confirmation. D7 does not
create, update, or otherwise mutate ADO resources.

## Review And Improve Artifacts

Use `/bass review <artifact>` to return a cited Review Report without changing the
artifact. Reviewer evaluates clarity, ambiguity, completeness, consistency,
testability, dependencies, risks, and provenance. Findings are `Critical`, `Major`,
`Minor`, or `Advisory`.

Critical and Major findings block local approval and ADO publication until they are
resolved or explicitly waived by a user Decision record. A waiver must identify the
finding, user rationale, and residual risk; BASS retains the finding and waiver in
the review result. Minor and Advisory findings remain visible but do not block.

Use `/bass improve <artifact>` to produce an evidence-grounded, non-persisted
revision preview. Editor receives the original artifact, cited evidence, Decision
records, and Review Report. It never invents content; unresolved issues remain
open and are labeled `needs_decision`. BASS automatically re-reviews the revised
preview and returns the original findings, changes, unresolved items, and re-review
result before it requests explicit local-write approval.

After explicit approval of a revalidated preview, BASS persists the improved
version with D3 lineage and a changelog entry, and creates an immutable `OUT-...`
improvement record containing the review, applied changes, unresolved or waived
findings, Decision references, approval context, revised version, and re-review
result. D8 does not call or mutate ADO.
