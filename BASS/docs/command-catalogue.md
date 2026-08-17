# Command Catalogue

**Classification:** Fact for portable command contracts. **Confidence:** High.

| Command | Purpose | Mutation gate |
| --- | --- | --- |
| `/bass init <project>` | Initialize one clean BASS project scaffold. | Local BASS-only mutation explicitly requested by this command; never overwrites; no ADO. |
| `/bass status [project]` | Show local project context, artifacts, evidence health, review health, gaps, and one next action. | Read-only; never implies live ADO connectivity. |
| `/bass diagnose <project>` | Inspect portable structure, project context, and policy. | Read-only. |
| `/bass understand`, `/bass load-context` | Build cited context. | Read-only; gaps remain visible. |
| `/bass discover`, `/bass technical-delivery` | Retrieve bounded ADO discovery or technical evidence. | Verified read-only host mappings required. |
| `/bass brainstorm <problem-or-scope>` | Explore facts, assumptions, questions, options, risks, and candidate Features/User Stories. | Read-only/non-persisting; candidates remain Proposal/Assumption content. |
| `/bass create-feature`, `/bass create-us`, `/bass create-ac`, `/bass create-proposal` | Produce evidence-grounded previews. | Explicit approval is required for local persistence. |
| `/bass review <artifact>` | Report cited quality findings. | Read-only. |
| `/bass challenge <artifact>` | Stress-test necessity, value, assumptions, alternatives, edge cases, and success criteria. | Read-only; no automatic Review-state mutation. |
| `/bass improve <artifact>` | Produce and re-review an improvement preview. | Explicit approval required for persistence. |
| `/bass create-ado`, `/bass update-ado`, `/bass link-items`, `/bass transition`, `/bass sync-ado` | Plan one Work Item operation. | Current mapping/evidence, preview, valid token, and explicit per-operation confirmation; Executor only. |
| `/bass next` | Recommend one safest next action. | Read-only. |

Natural language is the primary interface. BASS routes the user's goal to these same workflows and asks one focused question only when target, scope, artifact type, or mutation intent cannot be resolved safely.

An ADO preview is not publication. Unmapped, unauthorized, stale, or failed host access is a gap or blocker, never a reason to guess or broaden access. `source_ready` does not validate any command against live ADO.
