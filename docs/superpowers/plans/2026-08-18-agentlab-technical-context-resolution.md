# AgentLab Technical Context Resolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace AgentLab's unresolved Technical Wiki reference with its canonical readable page and record the confirmed read.

**Architecture:** Update the local context registry to point at the canonical technical page. Convert the existing retrieval gap into a Fact that retains the original failed URL as provenance while identifying the successful canonical read.

**Tech Stack:** Markdown, local BASS evidence records.

## Global Constraints

- Do not mutate Azure DevOps.
- Do not derive technical requirements or create artifacts from the page content.
- Establish only that the canonical page was successfully retrieved.

---

### Task 1: Resolve The Local Technical Context Record

**Files:**
- Modify: `BASS/projects/agentlab/project-context/context-registry.md:21-31`
- Modify: `BASS/projects/agentlab/evidence-register.md:21-31`

**Interfaces:**
- Consumes: Canonical page URL `https://dev.azure.com/ptbcp/IT.DIT/_wiki/wikis/5f28c731-c27d-4779-9dd8-1bc57804504c?pagePath=%2FAgentLab%20Overview` and original supplied URL `https://dev.azure.com/ptbcp/IT.DIT/_wiki/wikis/BCP.Generative%20AI.Wiki/83821/AgentLab-Overview`.
- Produces: A resolved Technical context source and `EVD-001` Fact recording both successful and superseded lookup results.

- [ ] **Step 1: Replace the configured Technical URL**

Set the Technical source to:

```markdown
- URL: `https://dev.azure.com/ptbcp/IT.DIT/_wiki/wikis/5f28c731-c27d-4779-9dd8-1bc57804504c?pagePath=%2FAgentLab%20Overview`
- Classification: Fact
- Read status: verified by successful approved read-only ADO Wiki retrieval
```

- [ ] **Step 2: Resolve EVD-001 as a Fact**

Replace the `EVD-001` row with:

```markdown
| EVD-001 | Fact | Canonical AgentLab Overview technical page retrieved. | Canonical: `https://dev.azure.com/ptbcp/IT.DIT/_wiki/wikis/5f28c731-c27d-4779-9dd8-1bc57804504c?pagePath=%2FAgentLab%20Overview` successfully retrieved; superseded lookup: `https://dev.azure.com/ptbcp/IT.DIT/_wiki/wikis/BCP.Generative%20AI.Wiki/83821/AgentLab-Overview` returned `Page with id 83821 not found`. | high | `project-context/context-registry.md` | CTX-REG-001 | Successful read establishes reachability only; no technical requirements derived. |
```

- [ ] **Step 3: Align the Evidence Register summary and changelog**

Replace the introduction with:

```markdown
This register is a local initialization Fact. It contains EVD-001, a Fact confirming retrieval of the canonical AgentLab technical page; no technical requirements have been derived from its content.
```

Add this changelog row:

```markdown
| 2026-08-18 | v1.1 | Resolved EVD-001 with the canonical AgentLab Overview page. | A successful approved read-only ADO Wiki retrieval identified the canonical page path. | EVD-001 |
```

- [ ] **Step 4: Verify the resolved record**

Run: `rg -n "5f28c731-c27d-4779-9dd8-1bc57804504c|EVD-001 \| Fact|unresolved technical retrieval Question" "BASS/projects/agentlab/project-context/context-registry.md" "BASS/projects/agentlab/evidence-register.md"`

Expected: canonical URL and `EVD-001 | Fact` are present; `unresolved technical retrieval Question` has no matches.

- [ ] **Step 5: Commit**

```bash
git add BASS/projects/agentlab/project-context/context-registry.md BASS/projects/agentlab/evidence-register.md
git commit -m "docs: resolve AgentLab technical context"
```
