# BASS D11 Orchestration and Complete Commands Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a deterministic BASS router that selects and coordinates the appropriate Phase 1 workflow from natural requests or explicit commands.

**Architecture:** A portable orchestration router maps command paths and natural-language intent to one canonical workflow, validates gates, composes the uniform response envelope, and produces non-executing next-step recommendations. It delegates only through BASS's existing hub-and-spoke contracts and never bypasses specialist approvals, D8 review gates, or D9 confirmation tokens.

**Tech Stack:** TypeScript OpenCode plugin tools, Markdown BASS agent/commands, existing D5-D10 specialist tools and source-only fixtures.

## Global Constraints

- Explicit commands select their workflow; BASS still validates all workflow gates.
- Natural language chooses least-mutating workflow: Understand, Discover, Review, Create, Improve, Sync/Execute ADO.
- Ambiguity affecting target, scope, or writes produces one focused clarification, not a guessed workflow.
- BASS is sole user-facing orchestrator; specialist sequence is bounded and BASS-mediated only.
- Every response has Status, Workflow, Result, Evidence, Gaps and Conflicts, Next Action; Approval/Confirmation only when required.
- Mutation routing consumes HMAC-signed D8/D9 gate attestations using target-host `BASS_TOKEN_SIGNING_KEY`; missing, expired, altered, or wrong-target attestations fail closed.
- Understand, Discover, Review may return partial warnings; Create, Improve, Sync, Execute block on unresolved required context/conflicts.
- `/bass next` never executes, persists, imports, or writes ADO.
- All runtime artifacts are portable under `BASS/integration/opencode/`; no host installation or live ADO execution in source-only tests.

---

### Task 1: Primary BASS Contract and Complete Command Surface

**Files:**
- Modify: `BASS/integration/opencode/agents/bass.md`
- Create: `BASS/integration/opencode/commands/bass/next.md`
- Modify: `BASS/integration/opencode/commands/bass/{understand,load-context,discover,create-feature,create-us,create-ac,create-proposal,review,improve,create-ado,sync-ado,update-ado,link-items,transition,technical-delivery}.md`
- Modify: `BASS/README.md`

**Interfaces:**
- Produces: BASS workflow-selection/response rules, complete command contracts, and documented `next` behavior.

- [ ] **Step 1: Update BASS agent contract**

Add intent precedence, least-mutating natural routing, one-question ambiguity rule, workflow gates, uniform response envelope, specialist output validation, and no-bypass approval/confirmation controls.

- [ ] **Step 2: Normalize command workflow declarations**

Every Phase 1 command declares its canonical workflow, required target/context, read/write gate, specialist route, and uniform response requirement. Commands remain explicit-intent entry points.

- [ ] **Step 3: Create `/bass next`**

Use latest workflow result supplied by BASS, return one safest recommendation and rationale. Explicitly prohibit workflow execution, local persistence, imports, ADO writes, and confirmation consumption.

- [ ] **Step 4: Update README command routing guide**

Document natural-language routing, command precedence, response envelope, partial read-only warnings, mutation blocks, and `/bass next` non-executing behavior.

### Task 2: Deterministic Orchestration Router and Response Tools

**Files:**
- Create: `BASS/integration/opencode/plugins/bass-route-workflow.ts`
- Create: `BASS/integration/opencode/plugins/bass-route-workflow.js`
- Create: `BASS/integration/opencode/plugins/bass-compose-response.ts`
- Create: `BASS/integration/opencode/plugins/bass-compose-response.js`
- Create: `BASS/integration/opencode/plugins/bass-recommend-next.ts`
- Create: `BASS/integration/opencode/plugins/bass-recommend-next.js`
- Create: `BASS/integration/opencode/plugins/bass-orchestration.behavior-test.mjs`

**Interfaces:**
- Router consumes explicit command or natural request plus bounded context metadata; returns workflow, intent confidence, clarification requirement, specialist route, and gates.
- Response composer consumes workflow result and returns exact six-section envelope plus conditional Approval/Confirmation.
- Next recommender consumes latest workflow envelope and returns one non-executing recommendation.

- [ ] **Step 1: Implement command routing**

Map every Phase 1 command to canonical workflow. Reject unknown commands and malformed command arguments with structured safe errors.

- [ ] **Step 2: Implement natural-language intent routing**

Use deterministic phrase/intent rules for Understand, Discover, Review, Create, Improve, and Sync/Execute. Resolve ties to least-mutating workflow; return clarification when target/scope/write ambiguity remains.

- [ ] **Step 3: Implement specialist route and gate plan**

Return bounded Reader/Explorer/Creator/Reviewer/Editor/Executor route. Enforce partial-warning gates for read workflows and blocked mutation gates for context/conflict/review/approval/token failures.

Validate D8/D9 HMAC-signed gate attestations against target-host key material before routing Improve, Sync, or Execute steps. Verify workflow, target, gate status, expiry, and integrity; reject caller status booleans.

- [ ] **Step 4: Implement response envelope**

Generate exact required sections and validate material claims carry source/location/classification/confidence. Add Approval/Confirmation only for required approval, waiver, local import, or ADO token confirmation.

- [ ] **Step 5: Implement next recommendation**

Read latest workflow status/gaps/conflicts/gates and select one safest non-executing action. Reject inputs that request execution or write behavior.

- [ ] **Step 6: Build JS and behavior tests**

Generate JS from TS. Test command routing, natural intents, tie/ambiguity clarification, gates, specialist failures, response sections/provenance, approval/confirmation, and non-executing next behavior.

### Task 3: D11 End-to-End Fixtures

**Files:**
- Create: `BASS/fixtures/d11-orchestration/natural/`
- Create: `BASS/fixtures/d11-orchestration/commands/`
- Create: `BASS/fixtures/d11-orchestration/blocked/`
- Create: `BASS/fixtures/d11-orchestration/expected/`
- Create: `BASS/test-support/d11/orchestration-fixture-harness.mjs`

**Interfaces:**
- Consumes: Router, response composer, next recommender, normalized specialist result doubles.
- Produces: Exact workflow and response oracles.

- [ ] **Step 1: Create natural-language fixtures**

Cover each canonical workflow, least-mutating tie, and focused clarification for ambiguous target/scope/write requests.

- [ ] **Step 2: Create explicit command fixtures**

Cover all commands, command-overrides-natural-intent, required context/snapshot requirements, and malformed command errors.

- [ ] **Step 3: Create gate and failure fixtures**

Cover partial read warning, blocked create/improve/sync, D8 approval/waiver, D9 per-operation confirmation, specialist failure propagation, and conflict escalation.

- [ ] **Step 4: Create next fixtures**

Cover recommendations after warning, blocked conflict, approval required, confirmation required, and completed workflow. Assert no execution/persistence action occurs.

- [ ] **Step 5: Verify exact normalized outputs**

Normalize dynamic IDs/timestamps only. Compare workflow, route, gates, six-section response, conditional approval/confirmation, evidence metadata, and one next recommendation.

### Task 4: D11 Acceptance Verification

**Files:**
- Verify: `BASS/integration/opencode/agents/bass.md`
- Verify: `BASS/integration/opencode/commands/bass/`
- Verify: `BASS/integration/opencode/plugins/bass-{route-workflow,compose-response,recommend-next}.*`
- Verify: `BASS/fixtures/d11-orchestration/`

**Interfaces:**
- Consumes: Tasks 1 through 3.
- Produces: Evidence that natural requests and commands start the right Phase 1 workflow safely.

- [ ] **Step 1: Run D11 source-only suites**

Run router/composer/next/harness tests. Confirm emitted-TS/shipped-JS parity where feasible; otherwise qualify JS-only evidence.

- [ ] **Step 2: Verify workflow selection and coordination**

Confirm commands take precedence, natural ambiguity clarifies, least-mutating selection holds, routes are BASS-only, and specialist outputs are gate-validated.

- [ ] **Step 3: Verify response and gate behavior**

Confirm six required sections, source metadata, partial read warnings, mutation blocks, approval/confirmation sections, useful errors, and no inferred resolution.

- [ ] **Step 4: Verify next behavior and boundaries**

Confirm next returns one safe recommendation only and no execution/write occurs. Confirm no real ADO/MCP or host `.opencode/` installation occurs. Run `git status --short`; do not initialize Git.
