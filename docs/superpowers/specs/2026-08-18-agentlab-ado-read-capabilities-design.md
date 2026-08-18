# AgentLab ADO Read Capabilities Design

## Goal

Create a local, read-only Azure DevOps capability mapping for AgentLab delivery context.

## Scope

The mapping covers project `IT.DIT`:

- Generative AI team backlog and work-item reads.
- Pipeline definition, run, status, log, artifact, and test-result reads constrained to names prefixed `BCP.GenAI.`.
- Repository, branch, file, commit, and pull-request reads constrained to repositories prefixed `BCP.GenAI.`.
- `BCP.GenAI.Backoffice.Frontend` is documented as an example eligible target, not an exclusive scope.

## Record Format

Create one local ADO read-capabilities record that lists the Azure DevOps tool operation, target scope, read-only authority, validation source, confidence, and validation date for each capability category.

## Constraints

- Do not mutate Azure DevOps.
- The mapping grants no write authority.
- The mapping does not establish current live Azure DevOps connectivity.
- Do not infer additional repository or pipeline names beyond the `BCP.GenAI.` prefix constraint.

## Verification

Confirm the mapping file includes backlog, pipeline, repository, and pull-request read categories; specifies `IT.DIT`, the Generative AI backlog, and the `BCP.GenAI.` prefix; and states both read-only authority and the live-connectivity limitation.
