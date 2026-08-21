# BASS: Your Business Analysis Assistant

BASS helps Business Analysts turn uncertain project information into clear, traceable work. It brings together project context, Azure DevOps evidence, requirements, reviews, and delivery status without hiding gaps or making unsupported decisions.

Use BASS to understand what exists, explore dependencies, shape Features and User Stories, challenge assumptions, review quality, and prepare approved Work Item changes.

## What BASS Helps You Do

| Need | Ask BASS |
| --- | --- |
| Understand a Feature or User Story | "Explain F-001 and show what is unknown." |
| Explore an idea or dependency | "What already exists for IDEA-001, and what depends on it?" |
| Create a requirement | "Create a User Story under F-001 for password reset." |
| Improve quality | "Review US-001 for ambiguity and testability." |
| Challenge an assumption | "Challenge this requirement and show simpler alternatives." |
| See technical delivery state | "Show PR, pipeline, deployment, and blockers for F-001." |
| Prepare an ADO change | "Prepare a Work Item update for US-001." |

## Install in Pi

Install the repository as a Pi package:

```bash
pi install git:git@github.com:cosmosdesigner/BASS.git
```

The Pi adapter provides `/bass init`, `/bass status`, and `/bass understand` as direct local workflows; these commands do not send a prompt to the active model/provider. Review the package before installation because Pi extensions run with the host user's permissions.

## Start Here

1. Create or open a BASS project.

   ```text
   /bass init customer-onboarding
   ```

   Project state is created at runtime under `BASS/projects/`; no project instance is bundled with the source distribution.

2. Ask for a local project health summary.

   ```text
   /bass status customer-onboarding
   ```

3. Build context before changing work.

   ```text
   /bass understand F-001
   ```

BASS responds with evidence, gaps, conflicts, and one safe next action. If the request is ambiguous, BASS asks one focused question instead of guessing.

## Common BA Journeys

### Turn an idea into a review-ready User Story

```text
/bass discover id=IDEA-001
/bass create-feature title="Guided onboarding"
/bass create-us parent=F-001 title="Create account"
/bass review US-001
/bass improve US-001
```

BASS creates previews first. You approve a ready preview before it is saved locally.

### Improve an existing requirement

```text
/bass review US-001
/bass improve US-001
/bass next
```

Critical and Major findings block approval or publication until they are resolved or explicitly waived through a Decision.

### Explore delivery status without changing anything

```text
/bass technical-delivery F-001
```

BASS distinguishes direct Work Item evidence from lower-confidence inferred matches. If PR, pipeline, or deployment evidence is unavailable or conflicting, release state remains `unknown`.

### Prepare a live ADO Work Item change

```text
/bass create-ado type="User Story" source=US-001
```

This requires an isolated target-ready environment. BASS shows the exact field-level plan, then requires confirmation for that one operation. A preview is not publication.

## How BASS Keeps Work Safe

- **Evidence first:** Material claims carry source, location, classification, and confidence.
- **Gaps stay visible:** Missing evidence becomes a question or gap, never a fabricated answer.
- **Conflicts stay open:** BASS records competing sources and asks for a Decision rather than choosing a side.
- **Previews before writes:** Local artifacts require approval. Every ADO Work Item write and local import requires its own confirmation.
- **No technical mutation:** BASS does not change code, repositories, pull requests, pipelines, or deployments.
- **Traceable history:** Evidence, Decisions, improvements, and ADO outcomes are recorded with lineage.

## Readiness

`source_ready` means portable BASS checks passed. It does not prove live Azure DevOps access, permissions, or publication.

`target_ready` requires recorded evidence from an isolated target-host ADO validation run. Until then, live ADO examples remain conditional.

## Source Boundary

This repository contains the BASS source bundle. Runtime source remains under `adapters/`, while fixtures, quality checks, reports, and test harnesses are separated under `support/`. Host installations, project instances, generated packages, and supplemental documentation are intentionally maintained outside this source tree.
