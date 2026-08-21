---
name: bass-init
description: Initialize one local BASS project scaffold without Azure DevOps mutation. Use for /bass init requests.
---

# BASS Initialize

Use the repository's BASS initialization workflow.

1. Read `AGENTS.md`, `README.md`, and the applicable files under `rules/`.
2. Confirm the requested project name is a lowercase direct-child slug such as `customer-onboarding`.
3. Create only the local scaffold under `BASS/projects/<project-name>/`.
4. Do not clone demo evidence, call Azure DevOps, or overwrite an existing project.
5. Preserve missing Wiki URLs as explicit Questions/evidence gaps.
6. Report created paths, gaps, and exactly one next action.

If the BASS distribution or trusted project root is unavailable, stop and report the evidence gap instead of guessing a location.
