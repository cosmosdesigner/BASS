import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd(), output = mkdtempSync(join(tmpdir(), "bass-d9-ts-wrapper-")), shimRoot = join(output, "node_modules", "@opencode-ai", "plugin");
mkdirSync(shimRoot, { recursive: true });
writeFileSync(join(shimRoot, "index.js"), `module.exports = require(${JSON.stringify(join(root, "support", "test-support", "d9", "opencode-plugin-runtime-stub.cjs"))});`, "utf8");
const source = join(output, "source"); mkdirSync(source, { recursive: true });
for (const name of ["bass-plan-ado-operation", "bass-execute-confirmed-ado-operation"]) {
  const original = join(root, "adapters", "opencode", "plugins", `${name}.ts`);
  const runtime = join(root, "adapters", "opencode", "plugins", `${name}.js`).replace(/\\/g, "\\\\");
  writeFileSync(join(source, `${name}.ts`), readFileSync(original, "utf8").replace(`require("./${name}.js")`, `require("${runtime}")`), "utf8");
}
const args = ["--module", "node16", "--target", "es2022", "--moduleResolution", "node16", "--skipLibCheck", "--outDir", output, join(source, "bass-plan-ado-operation.ts"), join(source, "bass-execute-confirmed-ado-operation.ts"), join(root, "support", "test-support", "d9", "opencode-plugin-shim.d.ts")];
const compile = process.platform === "win32" ? spawnSync(process.env.ComSpec, ["/d", "/s", "/c", `tsc ${args.join(" ")}`], { encoding: "utf8" }) : spawnSync("tsc", args, { encoding: "utf8" });
assert.equal(compile.status, 0, compile.stderr || compile.stdout);
for (const [file, name] of [["bass-plan-ado-operation", "BassPlanAdoOperationPlugin"], ["bass-execute-confirmed-ado-operation", "BassExecuteConfirmedAdoOperationPlugin"]]) {
  const wrapper = await import(pathToFileURL(join(output, `${file}.js`)).href);
  const plugin = await wrapper[name]({ directory: output, projectId: "ts-wrapper" });
  assert.ok(plugin.tool);
}
console.log("bass D9 TypeScript wrapper load regression passed");
