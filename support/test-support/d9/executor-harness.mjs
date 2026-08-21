import planner from "../../../adapters/opencode/plugins/bass-plan-ado-operation.js";
import executor from "../../../adapters/opencode/plugins/bass-execute-confirmed-ado-operation.js";
import { createHash } from "node:crypto";

export const createPlannerHarness = (trustedContext) => {
  const plugin = planner.BassPlanAdoOperationPlugin(trustedContext);
  return (input) => plugin.tool.bass_plan_ado_operation.execute(input);
};
export const createExecutorHarness = (trustedContext) => {
  const plugin = executor.BassExecuteConfirmedAdoOperationPlugin(trustedContext);
  return (input) => plugin.tool.bass_execute_confirmed_ado_operation.execute(input);
};
export const canonical = (token) => ({ tokenId: token.tokenId, operation: token.operation, evidence: token.evidence, decisionIds: token.decisionIds, capability: token.capability, createdAt: token.createdAt, expiresAt: token.expiresAt });
export const hash = (value) => createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
