import { strict as assert } from "node:assert"
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../../../../", import.meta.url))
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8")
const reader = read("../agents/reader.md")
const loadContext = read("../commands/bass/load-context.md")
const understand = read("../commands/bass/understand.md")
const template = read("../../../templates/ado-read-capabilities-template.md")

assert.equal(existsSync(new URL("bass-reader-ado.ts", import.meta.url)), false, "no unusable public ADO plugin may remain")
assert.equal(existsSync(new URL("bass-reader-ado.js", import.meta.url)), false, "no unusable public ADO plugin may remain")
for (const category of ["Wiki", "Work Item", "Relations", "History/comments"]) assert.match(template, new RegExp(`^## ${category.replace("/", "\\/")}\\s*$([\\s\\S]*?)(?=^## |$)`, "m"), `${category} map section must parse through the final section boundary`)
assert.match(reader, /"ado_\*": deny[\s\S]*exact allow rules/i)
assert.match(reader, /synchronized\s+permission allowlist/i)
assert.match(loadContext, /bass_context_brief/i)
assert.match(loadContext, /ado-read-capabilities\.md/i)
assert.match(loadContext, /bass_validate_ado_read_capabilities/i)
assert.match(loadContext, /Reader/i)
assert.doesNotMatch(loadContext, /bass_reader_ado/i)
assert.match(understand, /merged Context Brief/i)
console.log("bass-reader execution-boundary contract passed")
