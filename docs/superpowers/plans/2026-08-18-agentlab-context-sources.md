# AgentLab Context Sources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure local BASS Functional and Technical source references for AgentLab and record the unresolved technical-page read.

**Architecture:** Update the local context registry with the approved source split. Preserve the inability to retrieve the supplied technical overview page as a typed evidence gap rather than deriving technical claims.

**Tech Stack:** Markdown, local BASS evidence records.

## Global Constraints

- Do not mutate Azure DevOps.
- Functional context uses `BCP.GenAI.AgentLab.Wiki` at `/Agent Lab`.
- Technical context uses the supplied `BCP.Generative AI.Wiki` AgentLab Overview URL.
- Record the unresolved direct technical-page retrieval as a `Question`.

---

### Task 1: Configure And Verify Local Context Sources

**Files:**
- Modify: `BASS/projects/agentlab/project-context/context-registry.md:4-27`
- Modify: `BASS/projects/agentlab/evidence-register.md:4-30`

**Interfaces:**
- Consumes: Approved Functional source `https://dev.azure.com/ptbcp/IT.DIT/_wiki/wikis/BCP.GenAI.AgentLab.Wiki?pagePath=%2FAgent%20Lab` and Technical source `https://dev.azure.com/ptbcp/IT.DIT/_wiki/wikis/BCP.Generative%20AI.Wiki/83821/AgentLab-Overview`.
- Produces: A context registry with non-placeholder URLs and a `Question` evidence row that cites the technical source and failed direct lookup.

- [ ] **Step 1: Update the Functional source**

Replace the Functional placeholder with:

```markdown
- URL: `https://dev.azure.com/ptbcp/IT.DIT/_wiki/wikis/BCP.GenAI.AgentLab.Wiki?pagePath=%2FAgent%20Lab`
- Classification: Fact
- Read status: verified directory structure
```

- [ ] **Step 2: Update the Technical source**

Replace the Technical placeholder with:

```markdown
- URL: `https://dev.azure.com/ptbcp/IT.DIT/_wiki/wikis/BCP.Generative%20AI.Wiki/83821/AgentLab-Overview`
- Classification: Fact
- Read status: configured; direct page lookup unresolved
```

- [ ] **Step 3: Add the technical-source evidence gap**

Add this row to the Evidence Register:

```markdown
| EVD-001 | Question | Resolve direct API retrieval of AgentLab Overview technical page. | `https://dev.azure.com/ptbcp/IT.DIT/_wiki/wikis/BCP.Generative%20AI.Wiki/83821/AgentLab-Overview`; Azure DevOps Wiki API returned `Page with id 83821 not found`. | high | `project-context/context-registry.md` | CTX-REG-001 | Technical page remains configured but unread; do not derive technical claims. |
```

- [ ] **Step 4: Verify source configuration**

Run: `rg -n "replace-with-official|BCP\.GenAI\.AgentLab\.Wiki|BCP\.Generative%20AI\.Wiki|EVD-001" "BASS/projects/agentlab/project-context/context-registry.md" "BASS/projects/agentlab/evidence-register.md"`

Expected: no placeholder match; both selected URLs and `EVD-001` are present.

- [ ] **Step 5: Commit**

```bash
git add BASS/projects/agentlab/project-context/context-registry.md BASS/projects/agentlab/evidence-register.md
git commit -m "docs: configure AgentLab context sources"
```
