# BASS D5 Reader and Context Loading Design

## Status

Approved design for D5. This specification defines the Reader workflow, bounded context-loading order, Context Brief, portable commands, and fixture coverage.

## Reader Loading Workflow

Reader loads approved context in this order:

1. Local project context.
2. Resolved Feature, User Story, or Idea file.
3. Directly linked local evidence, decisions, and outputs.
4. Functional and technical ADO Wiki content.
5. ADO Work Item.
6. Direct ADO relations.
7. Relevant ADO history.

The default relevance boundary is the target plus direct links only. Reader does not perform broad discovery, indirect hierarchy traversal, or unrelated repository search. D6 owns broader discovery.

Reader resolves target-host ADO tools by read-capability category at installation time. Allowed categories are Wiki page read, Work Item read, relation read, and history/comment read. Reader rejects any write-capable ADO tool and must not use an unknown or unverified tool name.

Each project contains `project-context/ado-read-capabilities.md`. It records the exact verified read-only target-host tool name, supported input, and verification date for Wiki, Work Item, relations, and history/comments. Target installation synchronizes those names into Reader's ordered `ado_*` deny-then-allow permission list. Reader invokes only mapped required categories; an unmapped, failed, or unauthorized read remains an explicit gap.

`bass_validate_ado_read_capabilities` is a deterministic portable tool. It parses the project map, independently validates each configured category, returns the exact Reader permission fragment, and produces a required-category dispatch plan from local Context Brief gaps. Categories are independently optional: a valid mapped Work Item category can be enabled while other categories remain unmapped gaps.

## Target Resolution and Unavailable Sources

Reader accepts a typed ID or exact title. It searches only the selected BASS project's Feature directories, nested User Story directories, and Idea directories. A zero-match or multi-match result returns a blocked Context Brief and directs the user to provide an exact target or use D6 discovery.

Reader returns a partial Context Brief when a locally configured ADO Work Item is missing, a configured Wiki page is unavailable, or permissions are insufficient. Required categories are determined only from structural front matter: provenance source `type: ado_wiki` requires Wiki read. An item Work Item ID/URL or provenance `type: ado_work_item` requires Work Item, direct relations, and relevant history reads using that Work Item reference. YAML `ado_relation_references` and provenance `type: ado_comment` are supplemental relation and history references or scope. Body text does not configure an ADO category. Each unavailable required source is recorded as a source-linked gap with the expected source, failure reason, impact on the brief, and required next action. Reader must not convert unavailable evidence into an assumption.

## Context Brief

The Context Brief is returned in chat by default. BASS saves it as an `OUT-...` project output only when the user requests persistence.

The fixed format is:

```markdown
# Context Brief: <target>

Status: ready | warning | blocked
Coverage: <loaded and unavailable sources>

## Goal
## State
## Decisions
## Evidence
## Conflicts
## Gaps
## Questions
## Sources
```

Every material statement includes a local path or ADO reference, precise source location, D3 classification, and confidence. The brief preserves unresolved conflicts and questions; it does not resolve them by inference.

## Portable Commands

The portable bundle adds:

- `/bass load-context <target>`
- `/bass understand <target>`

Both commands use the same Reader workflow. `load-context` returns the full Context Brief. `understand` returns a concise, sourced explanation derived only from the Context Brief. Neither command creates a local output unless the user explicitly asks to save the brief.

`load-context` first obtains the deterministic bounded local brief, then delegates mapped required ADO reads to Reader. Reader invokes only its target-installed, synchronized read-only MCP allowlist and replaces only the corresponding local ADO gaps with read results. The deterministic local tool does not invoke MCP tools. The merged brief retains any unmapped, failed, or unauthorized read as a gap.

## Fixture Coverage

D5 adds local fixtures for:

- Complete context: resolved target, linked local records, and all required sources available.
- Incomplete context: unavailable or missing ADO sources represented as explicit gaps.
- Contradictory context: competing source claims represented as an unresolved conflict.
- Question preservation: a directly linked Question remains source-linked, classified, confident, and unresolved in the Questions section.

Fixtures verify exact target resolution, relevance boundaries, source-linked material claims, status selection, partial-result behavior, preservation of conflicts and questions, and both block and flow-style `ado_relation_references` lists.

## Acceptance Criteria

BASS can explain a uniquely resolved Feature or User Story before proposing changes. Its explanation is based on a bounded, ordered, source-linked Context Brief that distinguishes loaded evidence, conflicts, questions, and unavailable required sources.
