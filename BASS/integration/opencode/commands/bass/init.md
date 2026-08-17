---
description: Initialize one new BASS project scaffold without Azure DevOps mutation.
---

## Canonical Workflow

Explicit command entry point for **Initialize**. Interpret `$ARGUMENTS` as a project
slug plus optional project title and official Functional/Technical ADO Wiki URLs.
The project slug must be one lowercase direct-child name such as
`customer-onboarding`.

## Gate And Route

Route: BASS only. Do not delegate to a specialist. Call `bass_init_project` exactly
once after validating the requested project name. The command itself is the explicit
user request to create the local BASS scaffold; it does not authorize any ADO write.
If a supplied Wiki URL is not a valid Azure DevOps Wiki URL, block instead of storing
it. Missing Wiki URLs are allowed and remain explicit configuration gaps.

## Result

Return the uniform BASS response envelope. `Result` must identify the initialized
project and created paths. `Gaps and Conflicts` must preserve missing Functional or
Technical Wiki references. `Next Action` should normally be `/bass status <project>`
or configuration of a missing source.

Never copy fictional demo evidence into the new project. Never call MCP or Azure
DevOps. Never overwrite an existing project. Roll back a partially created scaffold
if initialization fails.
