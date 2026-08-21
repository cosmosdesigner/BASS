# BASS Pi Installation Package

This is a Pi package for the BASS Business Analysis Support System.

## Install into Pi

From the target repository:

```bash
pi install ./path/to/bass-pi-installation-package
# or project-local settings:
pi install -l ./path/to/bass-pi-installation-package
```

Then start/reload Pi and run:

```text
/bass install
/bass init customer-onboarding
/bass status customer-onboarding
```

## What this package provides

- Pi extension: `/bass` input transform plus local BASS tools.
- Pi skill: BASS workflow instructions and safety boundaries.
- Pi prompt template: `/bass` prompt expansion where supported.
- Bundled portable `BASS/` distribution.

## Safety

No Azure DevOps credentials are included. Live ADO readiness is not claimed by this package. BASS Work Item writes require preview and explicit confirmation; repository/code/PR/pipeline/deployment mutations remain prohibited.
