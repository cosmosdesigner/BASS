# AgentLab Technical Context Resolution Design

## Goal

Replace AgentLab's unresolved Technical Wiki reference with the canonical readable page and record the confirmed read as local evidence.

## Scope

Update the Technical URL in `BASS/projects/agentlab/project-context/context-registry.md` to:

`https://dev.azure.com/ptbcp/IT.DIT/_wiki/wikis/5f28c731-c27d-4779-9dd8-1bc57804504c?pagePath=%2FAgentLab%20Overview`

Replace `EVD-001` in `BASS/projects/agentlab/evidence-register.md` from a `Question` to a `Fact`. The record will cite both the canonical successful read and the originally supplied URL whose page-ID lookup failed, preserving the discovery lineage.

## Constraints

- Do not mutate Azure DevOps.
- Do not derive technical requirements or create artifacts from the page content.
- The evidence change only establishes that the canonical page was successfully retrieved.

## Verification

Confirm the configured Technical URL uses the canonical path and `EVD-001` has classification `Fact` with no remaining unresolved-retrieval language.
