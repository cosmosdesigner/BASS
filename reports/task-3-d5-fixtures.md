# Task 3 D5 Fixtures Report

## Changes

- Added the question-preservation fixture and exact expected Context Brief.
- The fixture proves a directly linked Question retains its source, location,
  classification, confidence, and unresolved wording.
- Added parser behavior coverage for both block and flow relation lists.

## Verification

- `node BASS/integration/opencode/plugins/bass-context-brief.behavior-test.mjs`

The fixture comparison and JavaScript/TypeScript parity checks passed.

## Execution-Boundary Revision

- Added standard context-registry coverage proving valid Functional and Technical
  Wiki URLs create distinct required local brief gaps.

## Validator Correction

- Registry parsing now requires exactly one canonical `- URL:` ADO Wiki field in
  each named section; missing, duplicate, placeholder, and incidental URLs do not
  create Wiki gaps.
