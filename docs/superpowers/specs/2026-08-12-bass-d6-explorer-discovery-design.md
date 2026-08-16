# BASS D6 Explorer and Discovery Design

## Status

Approved design for D6. This specification defines bounded local and ADO discovery, capability-mapped Explorer access, the Evidence Map, Discovery Report, and deterministic fixture coverage.

## Discovery Capabilities

Each project has `project-context/ado-discovery-capabilities.md`. It independently maps verified read-only target-host tools for:

- Work Item search and filtering.
- Hierarchy and relation reads.
- Comments and history reads.
- Wiki search and content reads.

Each mapping records the exact tool name, supported input, read-only verification, and verification date. Target installation copies only valid exact tool names into Explorer's ordered `ado_*` deny-then-allow permissions. Explorer invokes only mapped categories and treats unmapped, failed, or unauthorized categories as explicit gaps.

D6 excludes repository, pull-request, and pipeline discovery. D10 owns those technical-delivery categories.

## Search and Traversal

`/bass discover` accepts one or more filters: ID, URL, text, type, tag, state, area, and iteration. Supplied filters combine with AND semantics.

Local discovery searches only the selected BASS project. ADO discovery starts from matched Work Items and traverses one hop in each direction for hierarchy and for `related`, `predecessor`, `successor`, and dependency relations. Broader graph traversal is outside D6 and requires a future explicit option.

Explorer locates directly related local decisions, evidence, outputs, and artifacts. It reads relevant mapped comments, history, and Wiki content through `context-registry.md` where available.

## Evidence Map and Discovery Report

Explorer returns a chat-first Discovery Report with these sections:

```markdown
# Discovery Report: <scope>

Status: ready | warning | blocked
Coverage: <searched and unavailable sources>

## Evidence Map
### Nodes
### Edges
## Found Information
## Inferences
## Gaps
## Conflicts
## Risks
## Questions
## Sources
```

The Evidence Map is a node-and-edge table. Every node and edge includes source, D3 classification, confidence, and directness. Found information is separate from inferences.

When local and ADO evidence disagree, Explorer records an isolated Conflict with both sources and does not derive a dependency conclusion from that relationship until a user decision resolves it.

## Fixture Coverage

D6 adds deterministic local fixtures and tests for:

- AND-combined filters.
- One-hop hierarchy and relation traversal.
- Related local decisions, evidence, outputs, and artifacts.
- Mapped Wiki, comments, and history gaps.
- Conflicts, risks, and questions.
- Separation of found facts from inference.

Live target-host ADO reads are installation-dependent. Source-only tests validate local search, capability-map validation, permission-fragment generation, report format, and gap behavior; they do not claim to execute live ADO reads.

## Acceptance Criteria

BASS can answer what already exists, what directly depends on a scoped item, and what is missing. The answer is a bounded, source-linked Discovery Report that distinguishes found information from inference and isolates unresolved conflicts.
