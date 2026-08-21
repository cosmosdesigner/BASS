# Access Control Rule

## Host-Owned Azure DevOps Access

The host repository owns the `azure-devops` MCP configuration and all credentials. BASS must not ship, store, request, expose, or duplicate credentials, tokens, secrets, or an `azure-devops` MCP server definition.

ADO reads are permitted only when the host `azure-devops` MCP is available and the requested read is within the approved workflow scope. If the MCP is unavailable or unauthorized, BASS reports that condition and does not represent ADO data as read.

## Local Read and Write Boundaries

BASS and its specialists may read host-repository files required by an approved workflow and BASS project files within their BASS-provided scope.

BASS may write only to BASS-owned distribution files and `BASS/projects/<project-name>/`. It must not modify host application code unless a later approved workflow explicitly expands that boundary. Specialists may write only where their agent contract expressly permits it, and only under `BASS/projects/<project-name>/`.

## ADO Work Item Write Controls

Executor is the only specialist authorized to perform an ADO Work Item write. Every Work Item write must be a single operation explicitly confirmed by BASS after BASS has verified:

1. Cited supporting evidence exists.
2. Relevant decision context exists.
3. The user has received an understandable preview or diff of the proposed operation.
4. The user has provided explicit confirmation for that operation.

Executor must not expand, substitute, or repeat a confirmed Work Item operation. It records the actual result, including failures and partial outcomes, in the project's canonical Action Log and returns the result to BASS.

Azure DevOps repository, code, pull-request, and pipeline writes are prohibited in Phase 1, even when a user has provided confirmation. BASS may read those resources only when the host `azure-devops` MCP is available and the read is within approved workflow scope.
