# Workflow Examples

**Classification:** Practical usage guidance. **Confidence:** High for portable workflow contracts; target-host ADO examples require recorded `target_ready` evidence.

These examples show what to ask BASS, the workflow it selects, and the gates it applies. Replace `demo-customer-onboarding`, IDs, and paths with values from your project.

## Before You Start

1. Copy the portable OpenCode bundle into the target host repository.
2. Configure only verified target-host ADO capability maps.
3. Run `/bass diagnose <project>`.
4. Treat `source_ready` as portable verification only. Live ADO examples require `target_ready`.

Every BASS response includes Status, Workflow, Result, Evidence, Gaps and Conflicts, and Next Action. Approval or Confirmation appears only when required.

## Understand A Feature

**Request**

```text
Explain F-001 Customer onboarding and tell me what is still unknown.
```

**Expected behavior**

- BASS selects **Understand**.
- Reader loads project context, `F-001`, direct local evidence and decisions, then mapped ADO sources when available.
- Result is a cited Context Brief. Missing Wiki, Work Item, relation, or history evidence remains a gap.
- No artifact or ADO resource is changed.

**Equivalent command**

```text
/bass understand F-001
```

## Inspect Only One User Story

**Request**

```text
What is the current state of US-001 Create account?
```

**Expected behavior**

- BASS resolves the exact nested User Story.
- It returns goal, state, decisions, evidence, conflicts, gaps, questions, and sources.
- If the parent Feature is directly linked, it is included as bounded context.

**Equivalent command**

```text
/bass load-context US-001
```

## Explore An Idea

**Request**

```text
Explore IDEA-001 Guided onboarding. What already exists, what depends on it, and what is missing?
```

**Expected behavior**

- BASS selects **Discover**.
- Explorer returns a Discovery Report with nodes, edges, found information, inferences, gaps, conflicts, risks, questions, and sources.
- Direct Work Item relationships are Facts. Title, branch, tag, or text matches remain Inferences.
- One-hop hierarchy and relationship traversal is the default.

**Equivalent command**

```text
/bass discover id=IDEA-001
```

## Discover With Filters

**Request**

```text
Find active User Stories tagged onboarding in area Customer Experience for iteration Sprint 4.
```

**Expected behavior**

- Supplied filters combine with AND semantics.
- BASS asks a clarification if the target project or scope is ambiguous.
- Repository, PR, and pipeline evidence are excluded from ordinary D6 discovery; use technical delivery instead.

**Equivalent command**

```text
/bass discover type=User Story tag=onboarding state=Active area="Customer Experience" iteration="Sprint 4"
```

## Create A Feature Preview

**Request**

```text
Create a Feature for customer password recovery using the onboarding evidence and decisions.
```

**Expected behavior**

- BASS selects **Create** and requests cited context through Reader and Explorer as needed.
- Creator returns a Feature preview with goal, scope, out of scope, rules, dependencies, risks, assumptions, questions, evidence, and Given/When/Then criteria.
- Feature preview includes a field-level local-only ADO Work Item preview.
- No local file is written until you explicitly approve that preview.

**Equivalent command**

```text
/bass create-feature title="Customer password recovery"
```

## Create A User Story Under A Feature

**Request**

```text
Create a User Story under F-001 so a customer can request a password reset link.
```

**Expected behavior**

- Creator returns a User Story preview in the canonical nested Feature location.
- Each acceptance scenario is Given/When/Then and links to cited evidence or a labeled assumption.
- Explicit approval is required before local persistence.

**Equivalent command**

```text
/bass create-us parent=F-001 title="Request password reset link"
```

## Improve Acceptance Criteria

**Request**

```text
Add testable acceptance criteria to US-001 for invalid email addresses and an expired reset link.
```

**Expected behavior**

- BASS creates a scoped update preview for `US-001`.
- It does not create a standalone acceptance-criteria artifact.
- The preview requires approval before the existing artifact is changed.

**Equivalent command**

```text
/bass create-ac target=US-001
```

## Create A Functional Proposal

**Request**

```text
Create a proposal for a guided password-recovery journey.
```

**Expected behavior**

- Creator proposes a `PRO-.../proposal.md` record.
- The proposal includes problem, proposed change, expected value, scope, out of scope, rules, dependencies, risks, assumptions, questions, evidence, and next step.
- It remains local-only unless you explicitly ask to promote it to a Feature or User Story.

**Equivalent command**

```text
/bass create-proposal title="Guided password recovery"
```

## Review An Artifact

**Request**

```text
Review F-001 for ambiguity, missing dependencies, testability, and provenance.
```

**Expected behavior**

- BASS selects **Review**.
- Reviewer returns cited findings ranked Critical, Major, Minor, or Advisory.
- Critical and Major findings block local approval and ADO publication until resolved or explicitly waived through a Decision record.
- Review does not modify the artifact.

**Equivalent command**

```text
/bass review F-001
```

## Improve And Re-Review

**Request**

```text
Improve US-001 using its latest review findings.
```

**Expected behavior**

- Editor receives the original artifact, cited evidence, Decisions, and Review Report.
- Editor returns a revised preview and change summary.
- BASS automatically re-runs Reviewer before asking for persistence approval.
- An unresolved question remains open and is marked `needs_decision`; BASS never invents a resolution.

**Equivalent command**

```text
/bass improve US-001
```

## Ask For The Safest Next Step

**Request**

```text
What should I do next?
```

**Expected behavior**

- BASS reads the latest workflow response.
- It returns one safest recommendation and rationale.
- It never starts a workflow, approves a preview, imports data, consumes a token, or writes ADO.

**Equivalent command**

```text
/bass next
```

## Technical Delivery Evidence

**Request**

```text
Show technical delivery status for F-001, including PRs, pipeline, deployment, and blockers.
```

**Expected behavior**

- Explorer returns a Technical Delivery Report.
- Direct Work Item associations are Facts; branch, title, tag, commit-message, and file-text matches are lower-confidence Inferences.
- Release state is `unknown` if direct pipeline or deployment evidence is incomplete, unavailable, failed, or conflicting.
- No code, PR, pipeline, deployment, or repository resource is mutated.

**Equivalent command**

```text
/bass technical-delivery F-001
```

## Conditional Live ADO Examples

These examples require `target_ready`, an isolated ADO test target, verified capability maps, and a host-owned `BASS_TOKEN_SIGNING_KEY`. They are not runnable from a source-only installation.

### Publish A New Work Item

```text
/bass create-ado type="User Story" source=US-001
```

1. BASS reads the current mapped ADO context and validates the local artifact, evidence, Decisions, and field mappings.
2. Executor returns one field-level Work Item plan token.
3. You inspect the exact type, title, description, criteria, parent, tags, area, iteration, priority, effort, and unavailable mappings.
4. You explicitly confirm that one token.
5. Executor performs exactly the confirmed Work Item operation and records the actual Action Log outcome.

### Update One Work Item Field

```text
/bass update-ado id=1001 field=Priority value=2
```

- BASS requires a current mapped Work Item snapshot.
- It presents the before/after field diff.
- It requires a fresh per-operation confirmation token.
- A stale, altered, expired, replayed, or wrong-target token is blocked.

### Create A Relation Or Transition State

```text
/bass link-items source=1001 relation=related target=1002
```

```text
/bass transition id=1001 state=Active reason="Approved for development"
```

Each is one operation, one preview, and one confirmation. BASS never batches or expands a token.

### Synchronize Local And ADO Changes

```text
/bass sync-ado F-001
```

- Local-only changes become proposed ADO operations.
- ADO-only changes become proposed local imports and require approval.
- Overlapping field changes become D3 Conflicts and block both directions until a Decision resolves them.
- If remote ADO succeeds but local recording fails, BASS records the actual remote outcome through its durable recovery path and stops. It never auto-reverses ADO.

## Failure And Recovery Examples

### Missing Context

**Request**

```text
Create a User Story for password recovery.
```

**Expected response**

- Status is `blocked` if no exact parent Feature or sufficient evidence is available.
- BASS asks for the missing target, context, or evidence.
- It does not produce an approval-eligible artifact or ADO preview.

### Conflicting Evidence

**Request**

```text
Sync F-001 to ADO.
```

**Expected response**

- If the local and ADO fields overlap with different values, BASS records a Conflict with both sources.
- Sync is blocked until a user Decision resolves the conflict.
- BASS does not choose local or ADO silently.

### Critical Or Major Review Finding

**Request**

```text
Publish US-001 to ADO.
```

**Expected response**

- BASS blocks publication when unresolved Critical or Major findings exist.
- Resolve the finding, or create a Decision waiver that names the finding, rationale, and residual risk.

### Unavailable ADO MCP Or Permission

**Request**

```text
Show the live PR and pipeline status for F-001.
```

**Expected response**

- BASS returns a partial Technical Delivery Report with cited gaps.
- Release state remains `unknown`.
- The safest next action is to configure or authorize the verified target-host capability, not to guess the result.

### Expired Or Stale ADO Token

**Request**

```text
Confirm the previous update token.
```

**Expected response**

- Executor blocks an expired, altered, replayed, wrong-target, or stale token.
- Request a fresh current snapshot and a new one-operation preview.

### Remote Success, Local Recording Failure

**Expected response**

- BASS reports the actual remote outcome as a recovery failure state.
- It preserves recovery evidence and stops for manual recovery.
- It never automatically reverses the completed remote Work Item operation.

## Useful Natural Requests

```text
Explain what we know about F-001.
```

```text
What is missing before US-001 can be reviewed?
```

```text
Find all active onboarding User Stories in Sprint 4.
```

```text
Review this proposal and tell me whether it is ready to approve.
```

```text
Improve this Feature without inventing answers to open questions.
```

```text
What is the safest next action after this blocked sync?
```

## Boundaries To Remember

- An ADO preview is not an ADO write.
- Source-only readiness is not live ADO validation.
- Every local persistence action needs workflow-specific approval.
- Every ADO Work Item write and local import needs its own confirmation token.
- BASS does not mutate code, repositories, PRs, pipelines, deployments, or Phase 1 excluded resources.
