# AgentLab Context Sources Design

## Goal

Configure the local `agentlab` BASS project with the user-selected Functional and Technical Azure DevOps Wiki references.

## Source Split

- Functional context uses the dedicated `BCP.GenAI.AgentLab.Wiki` root page at `/Agent Lab`. Its published structure covers access, agent creation and configuration, interactions, versions, and available models.
- Technical context uses the supplied `BCP.Generative AI.Wiki` AgentLab Overview URL. The URL remains the configured technical reference even though the direct Azure DevOps Wiki API lookup for page ID `83821` did not resolve.

## Local Changes

Update `BASS/projects/agentlab/project-context/context-registry.md` to replace both placeholder URLs and record the source split. Add a `Question` evidence record for the unresolved direct retrieval of the supplied technical page. No Azure DevOps mutation is performed.

## Error Handling

The technical source is not treated as successfully read. Its retrieval failure remains an explicit evidence gap; no technical claims are derived from it.

## Verification

Confirm the registry contains both non-placeholder URLs and the Evidence Register contains the technical-source retrieval `Question`.
