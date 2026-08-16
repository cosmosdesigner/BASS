# BASS D2 Workspace and Context Model Design

## Status

Approved design for D2. This specification defines the copy-ready BASS distribution scaffold, project workspace model, artifact conventions, templates, and demonstration project.

## Root Scaffold

The distribution root is `BASS/`. D2 creates the complete approved scaffold:

```text
BASS/
├── projects/
│   └── <project-name>/
│       ├── project-context/
│       │   ├── context-registry.md
│       │   ├── functional/
│       │   └── technical/
│       ├── features/
│       ├── ideas/
│       ├── evidence-register.md
│       ├── decision-log.md
│       └── action-log.md
├── .opencode/
│   ├── agents/
│   └── commands/
├── templates/
├── rules/
└── AGENTS.md
```

`BASS/projects/<project-name>/` is an independent BASS project workspace. D2 creates the full scaffold, including the D4-owned `.opencode/`, `rules/`, and `AGENTS.md` placeholders. D4 will populate those placeholders with agents, commands, rules, and BA operating principles.

## Item Model

Features, User Stories, and Ideas use typed-ID directories with lowercase kebab-case names.

```text
features/
└── F-001-customer-onboarding/
    ├── feature.md
    ├── evidence/
    ├── decisions/
    ├── outputs/
    └── user-stories/
        └── US-001-create-account/
            ├── user-story.md
            ├── evidence/
            ├── decisions/
            └── outputs/

ideas/
└── IDEA-001-guided-onboarding/
    ├── idea.md
    ├── evidence/
    ├── decisions/
    └── outputs/
```

The project-root `evidence-register.md`, `decision-log.md`, and `action-log.md` are the canonical project-wide indexes. Item-level `evidence/` and `decisions/` directories contain records scoped to that Feature, User Story, or Idea and are linked from the project registers.

## Artifact Conventions

All templates and project records use Markdown with YAML front matter.

| Record type | ID format | Primary file |
| --- | --- | --- |
| Feature | `F-001` | `feature.md` |
| User Story | `US-001` | `user-story.md` |
| Idea | `IDEA-001` | `idea.md` |
| Evidence | `EVD-001` | `<ID>-<lowercase-kebab-name>.md` |
| Decision | `DEC-001` | `<ID>-<lowercase-kebab-name>.md` |
| Output | `OUT-001` | `<ID>-<lowercase-kebab-name>.md` |

IDs are stable and sequential within their type. Item directory names use `<typed-id>-<lowercase-kebab-name>`. Dates use ISO 8601 (`YYYY-MM-DD`). Versions use `vX.Y`.

Feature and User Story YAML front matter must include both fields below. They are `null` before ADO publication:

```yaml
ado_work_item_id: null
ado_work_item_url: null
```

## Templates and Project Context

`BASS/templates/` contains the canonical templates for:

- Functional context.
- Technical context.
- Feature.
- User Story.
- Idea.
- Evidence.
- Decision.

`project-context/context-registry.md` records the official functional and technical ADO Wiki URLs for a project. The reusable template contains explicit placeholders. The demonstration project uses clearly fictional URLs and does not imply live ADO access.

## Demonstration Project

D2 creates `BASS/projects/demo-customer-onboarding/` as a complete minimal fictional project. It includes:

- Functional and technical context files.
- A populated context registry with fictional functional and technical ADO Wiki URLs.
- Feature `F-001-customer-onboarding`.
- Nested User Story `US-001-create-account`.
- Idea `IDEA-001-guided-onboarding`.
- Item-level evidence and decision records.
- Project-wide evidence, decision, and action registers.
- One output record.

The demonstration project shows the required templates, IDs, naming conventions, project registers, and local-to-ADO links without depending on a live ADO organization or project.

## Acceptance Criteria

A new BASS project can be created by copying the project scaffold and templates, then completing the explicit context registry placeholders. The directory structure, record locations, metadata requirements, naming rules, project registers, and local-to-ADO links require no implicit decisions.
