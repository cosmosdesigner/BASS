import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { type Plugin, tool } from "@opencode-ai/plugin"

type Section = { status: "ready" | "warning" | "blocked"; observed: string; next: string }
function report(sections: [Section, Section, Section, Section]) {
  const headings = ["Distribution Structure", "Project Context", "Azure DevOps MCP", "Effective Access Policy"]
  return sections.map((section, index) => `## ${headings[index]}\nStatus: ${section.status}\nObserved condition: ${section.observed}\nNext step: ${section.next}`).join("\n\n")
}
function invalidProjectName(value: string) { return value.includes("/") || value.includes("\\") || value === "." || value === ".." || value.split(/[\\/]/).some((part) => part === "" || part === "." || part === "..") }
function isDirectory(path: string) { return existsSync(path) && statSync(path).isDirectory() }
function isAzureDevOpsWikiUrl(value: string) { try { const url = new URL(value); return url.origin === "https://dev.azure.com" && /^\/[^/]+\/[^/]+\/_wiki\/wikis\/[^/]+(?:\/.*)?$/.test(url.pathname) } catch { return false } }
function requiredWikiUrl(text: string, section: "Functional ADO Wiki" | "Technical ADO Wiki") {
  const lines = text.split(/\r?\n/), start = lines.findIndex((line) => line === `## ${section}`), end = lines.findIndex((line, index) => index > start && line.startsWith("## "))
  const values = start < 0 ? [] : lines.slice(start + 1, end < 0 ? undefined : end).map((line) => line.match(/^- URL:\s*`?([^`\s]+)`?\s*$/)?.[1]).filter((value): value is string => Boolean(value))
  return values.length === 1 ? values[0] : undefined
}
export const BassDiagnosePlugin: Plugin = async () => ({
  tool: {
    bass_diagnose: tool({
      description: "Deterministically inspect local BASS distribution, project context, and policy files without mutations or MCP calls.",
      args: { projectName: tool.schema.string().optional() },
      async execute(args, context) {
        const projectName = args.projectName?.trim()
        if (projectName && invalidProjectName(projectName)) return report([
          { status: "warning", observed: "Not inspected because projectName failed deterministic preflight before filesystem access.", next: "Provide a single direct child directory name under BASS/projects/." },
          { status: "blocked", observed: "The supplied project name is not a direct child directory name under BASS/projects/.", next: "Provide a single direct child directory name, not a path such as ../BASS." },
          { status: "warning", observed: "Live MCP availability is checked by later workflows and host setup, not this deterministic local tool.", next: "Configure and authorize azure-devops in the target host before ADO-backed work." },
          { status: "warning", observed: "Not inspected because projectName failed deterministic preflight before filesystem access.", next: "Provide a valid project name and rerun the diagnostic." },
        ])
        const bassRoot = join(context.directory, "BASS")
        const required = [
          "AGENTS.md", "projects", "rules", "rules/orchestration.md", "rules/access-control.md", "rules/provenance.md",
          "adapters/opencode/agents/bass.md", "adapters/opencode/agents/reader.md", "adapters/opencode/agents/explorer.md", "adapters/opencode/agents/creator.md", "adapters/opencode/agents/reviewer.md", "adapters/opencode/agents/editor.md", "adapters/opencode/agents/executor.md",
          "adapters/opencode/commands/bass/diagnose.md", "adapters/opencode/commands/bass/init.md", "adapters/opencode/commands/bass/status.md", "adapters/opencode/commands/bass/brainstorm.md", "adapters/opencode/commands/bass/challenge.md",
          "adapters/opencode/plugins/bass-diagnose.ts", "adapters/opencode/plugins/bass-init-project.ts", "adapters/opencode/plugins/bass-project-status.ts", "adapters/opencode/plugins/bass-route-workflow.ts",
        ]
        const missing = required.filter((entry) => !existsSync(join(bassRoot, entry)))
        const distribution: Section = missing.length ? { status: "blocked", observed: `Missing required BASS path(s): ${missing.join(", ")}.`, next: "Copy the complete BASS directory into the target project root." } : { status: "ready", observed: "Required local BASS distribution paths, P0 workflows, and portable OpenCode bundle artifacts are present.", next: "Keep the BASS distribution and portable integration bundle intact when creating projects." }
        let project: Section
        const projectsRoot = join(bassRoot, "projects")
        if (!isDirectory(projectsRoot)) project = { status: "blocked", observed: "BASS/projects is missing or not a directory.", next: "Restore the BASS projects directory." }
        else {
          const names = readdirSync(projectsRoot).filter((name) => isDirectory(join(projectsRoot, name))), selected = projectName || (names.length === 1 ? names[0] : undefined)
          if (!selected) project = { status: "blocked", observed: names.length ? "Multiple project directories require explicit selection." : "No project directory is available for selection.", next: "Run /bass diagnose <project-name> with one direct child project name." }
          else if (!names.includes(selected)) project = { status: "blocked", observed: `Project '${selected}' does not exist as a direct child of BASS/projects/.`, next: "Provide an existing direct child project name." }
          else {
            const registry = join(projectsRoot, selected, "project-context", "context-registry.md")
            if (!existsSync(registry)) project = { status: "blocked", observed: `Project '${selected}' is missing project-context/context-registry.md.`, next: "Restore the project context registry." }
            else {
              const text = readFileSync(registry, "utf8"), functionalUrl = requiredWikiUrl(text, "Functional ADO Wiki"), technicalUrl = requiredWikiUrl(text, "Technical ADO Wiki"), unresolved = !functionalUrl || !technicalUrl || [functionalUrl, technicalUrl].some((url) => !isAzureDevOpsWikiUrl(url) || /example|placeholder|fictional|</i.test(url))
              project = unresolved ? { status: "warning", observed: `Project '${selected}' must have exactly one non-placeholder Azure DevOps Wiki URL in each required Functional and Technical ADO Wiki section.`, next: "Replace both required section URL values with official non-placeholder Azure DevOps Wiki URLs." } : { status: "ready", observed: `Project '${selected}' has a local context registry with two non-placeholder Azure DevOps Wiki URL values.`, next: "Use approved workflow scope before reading ADO content." }
            }
          }
        }
        const mcp: Section = { status: "warning", observed: "Live MCP availability is checked by later workflows and host setup, not this deterministic local tool.", next: "Configure and authorize azure-devops in the target host before ADO-backed work." }
        const policyFiles = ["AGENTS.md", "rules/access-control.md", "rules/orchestration.md", "rules/provenance.md"], missingPolicy = policyFiles.filter((entry) => !existsSync(join(bassRoot, entry)))
        const policy: Section = missingPolicy.length ? { status: "blocked", observed: `Missing required policy source(s): ${missingPolicy.join(", ")}.`, next: "Restore the missing BASS policy files before dependent work." } : { status: "ready", observed: "Local BASS policy sources are present; BASS writes only BASS-owned paths and Executor alone performs confirmed Work Item writes.", next: "Apply the policy sources to approved workflows." }
        return JSON.stringify(report([distribution, project, mcp, policy]))
      },
    }),
  },
})
