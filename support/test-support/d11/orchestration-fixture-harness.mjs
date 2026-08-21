import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { routeWorkflow } from "../../../integration/opencode/plugins/bass-route-workflow.js";
import { composeResponse } from "../../../integration/opencode/plugins/bass-compose-response.js";
import { recommendNext } from "../../../integration/opencode/plugins/bass-recommend-next.js";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const fixtures = join(root, "support", "fixtures", "d11-orchestration");
const signingKey = "d11-fixture-attestation-key";
process.env.BASS_TOKEN_SIGNING_KEY = signingKey;
const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const normalize = (value) => JSON.parse(JSON.stringify(value));
const normalizeEnvelope = (envelope) => envelope && {
  status: envelope.status,
  workflow: envelope.workflow,
  sections: envelope.sections,
  provenance: envelope.sources,
  gaps: envelope.gaps,
  conflicts: envelope.conflicts,
  nextAction: envelope.nextAction,
  requiresApproval: envelope.requiresApproval,
  requiresConfirmation: envelope.requiresConfirmation
};

for (const suite of ["natural", "commands", "blocked", "next"]) {
  const scenarios = read(join(fixtures, suite, "scenarios.json"));
  const expected = read(join(fixtures, "expected", `${suite}.json`));
  const actual = scenarios.map((scenario) => {
    const priorKey = process.env.BASS_TOKEN_SIGNING_KEY; if (scenario.key === "missing") delete process.env.BASS_TOKEN_SIGNING_KEY;
    const route = routeWorkflow(scenario.route);
    if (priorKey === undefined) delete process.env.BASS_TOKEN_SIGNING_KEY; else process.env.BASS_TOKEN_SIGNING_KEY = priorKey;
    const envelope = scenario.workflowResult ? composeResponse({ workflowResult: scenario.workflowResult }) : null;
    const next = scenario.next && envelope ? recommendNext({ envelope, ...scenario.next }) : null;
    return { name: scenario.name, route, envelope: normalizeEnvelope(envelope), next };
  });
  const normalized = normalize(actual);
  assert.deepEqual(normalized, expected.outcomes, `${suite} fixture outcome differs from its inspectable normalized oracle`);
}

console.log("bass d11 orchestration fixture harness passed");
