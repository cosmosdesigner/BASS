import { existsSync, lstatSync, realpathSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, resolve, sep } from "node:path"
import { type Plugin, tool } from "@opencode-ai/plugin"

type Status = "ready" | "warning" | "blocked"
type ProvenanceSource = { type: string; reference: string; location: string }
type LocalRecord = { path: string; filePath: string; text: string; id: string; title: string; classification: string; confidence: string; source: string; location: string; sources: ProvenanceSource[]; relationReferences: string[]; conflictStatus: string; decisionId: string }

const headings = ["Goal", "State", "Decisions", "Evidence", "Conflicts", "Gaps", "Questions", "Sources"]

function invalidProjectName(value: string) {
  return !value || value.includes("/") || value.includes("\\") || value === "." || value === ".." || value.split(/[\\/]/).some((part) => !part || part === "." || part === "..")
}

function isDirectory(path: string) {
  return existsSync(path) && !lstatSync(path).isSymbolicLink() && statSync(path).isDirectory()
}

function value(text: string, key: string) {
  const match = text.match(new RegExp(`^${key}:\\s*(?:["']([^"']*)["']|(.+?))\\s*$`, "m"))
  const result = (match?.[1] ?? match?.[2] ?? "").trim()
  return /^(null|~)$/i.test(result) || (!match?.[1] && /^false$/i.test(result)) ? "" : result
}

function provenanceValue(text: string, key: string) {
  const provenance = text.match(/^provenance:\s*$([\s\S]*?)(?=^[a-z_]+:|^---\s*$)/m)?.[1] || ""
  const match = provenance.match(new RegExp(`^\\s{2}${key}:\\s*(?:["']([^"']*)["']|(.+?))\\s*$`, "m"))
  const result = (match?.[1] ?? match?.[2] ?? "").trim()
  return /^(null|~)$/i.test(result) ? "" : result
}

function provenanceSources(text: string): ProvenanceSource[] {
  const lines = text.split(/\r?\n/)
  const start = lines.findIndex((line) => /^\s{2}sources:\s*$/.test(line))
  const sourceLines = start < 0 ? [] : lines.slice(start + 1, lines.findIndex((line, index) => index > start && (/^\s{2}[a-z_]+:/.test(line) || line === "---")) || undefined)
  const entries: string[][] = []
  for (const line of sourceLines) {
    if (/^\s*-\s*type:/.test(line)) entries.push([line])
    else if (entries.length) entries[entries.length - 1].push(line)
  }
  return entries.map((entry) => {
    const field = (key: string) => (entry.join("\n").match(new RegExp(`^\\s*(?:-\\s*)?${key}:\\s*(?:["']([^"']*)["']|(.+?))\\s*$`, "m"))?.slice(1).find(Boolean) || "").trim()
    return { type: field("type"), reference: field("reference"), location: field("location") }
  })
}

function listValue(text: string, key: string) {
  const flow = text.match(new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]\\s*$`, "m"))?.[1]
  if (flow !== undefined) return flow.split(",").map((item) => item.trim().replace(/^(?:["'])(.*)(?:["'])$/, "$1")).filter(Boolean)
  const match = text.match(new RegExp(`^${key}:\\s*$([\\s\\S]*?)(?=^[a-z_]+:|^---\\s*$)`, "m"))?.[1] || ""
  return [...match.matchAll(/^\s*-\s*(.+?)\s*$/gm)].map((item) => item[1])
}

function inside(root: string, path: string) {
  const result = relative(root, path)
  return result === "" || (!result.startsWith(`..${sep}`) && result !== "..")
}

function safeFile(root: string, path: string) {
  if (!existsSync(path) || lstatSync(path).isSymbolicLink()) return false
  try { return inside(root, realpathSync(path)) } catch { return false }
}

function conflictValue(text: string, key: string) {
  const conflict = text.match(/^conflict:\s*$([\s\S]*?)(?=^[a-z_]+:|^---\s*$)/m)?.[1] || ""
  const match = conflict.match(new RegExp(`^\\s{2}${key}:\\s*(?:["']([^"']*)["']|(.+?))\\s*$`, "m"))
  const result = (match?.[1] ?? match?.[2] ?? "").trim()
  return /^(null|~)$/i.test(result) ? "" : result
}

function record(root: string, path: string, displayRoot = root): LocalRecord {
  if (!safeFile(root, path)) throw new Error("Unsafe local record path")
  const text = readFileSync(path, "utf8")
  const sources = provenanceSources(text)
  const source = sources[0] || { type: "", reference: "", location: "" }
  return {
    path: relative(displayRoot, path).split(sep).join("/"),
    filePath: path,
    text,
    id: value(text, "id"),
    title: value(text, "title"),
    classification: provenanceValue(text, "classification") || "Unclassified",
    confidence: provenanceValue(text, "confidence") || "unspecified",
    source: source.reference || path,
    location: source.location || "Document",
    sources,
    relationReferences: listValue(text, "ado_relation_references"),
    conflictStatus: conflictValue(text, "status"),
    decisionId: conflictValue(text, "decision_id"),
  }
}

function section(text: string, name: string) {
  const lines = text.split(/\r?\n/)
  const start = lines.findIndex((line) => line === `## ${name}`)
  if (start < 0) return ""
  const end = lines.findIndex((line, index) => index > start && line.startsWith("## "))
  return lines.slice(start + 1, end < 0 ? undefined : end).join("\n").trim()
}

function registryWiki(text: string, name: string) {
  const urls = [...section(text, `${name} ADO Wiki`).matchAll(/^\s*-\s*URL:\s*`(https:\/\/dev\.azure\.com\/[^\s`]+\/_[Ww]iki\/[^\s`]+)`\s*$/gm)].map((match) => match[1])
  return urls.length === 1 && !/example[-.]org|placeholder|fictional/i.test(urls[0]) ? urls[0] : ""
}

function summary(text: string, names: string[]) {
  for (const name of names) {
    const content = section(text, name).replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim()
    if (content) return content.split(/(?<=[.!?])\s/)[0]
  }
  return "No material statement was found."
}

function material(item: LocalRecord, statement: string) {
  if (item.classification === "Question" && statement === "No material statement was found.") statement = summary(item.text, ["Question"])
  return `- ${statement} [source: ${item.path}; location: ${item.location}; classification: ${item.classification}; confidence: ${item.confidence}]`
}

function conflictMaterial(item: LocalRecord, statement: string) {
  const sources = item.sources.map((source) => `${source.type}: ${source.reference} (${source.location})`).join("; ") || "none"
  return `${material(item, statement)} [status: ${item.conflictStatus || "unspecified"}; decision_id: ${item.decisionId || "null"}; competing sources: ${sources}]`
}

function links(text: string, sectionNames: string[]) {
  return sectionNames.flatMap((name) => [...section(text, name).matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g)].map((match) => match[1]))
}

function candidates(project: string, root: string) {
  const features = join(project, "features")
  const ideas = join(project, "ideas")
  const found: string[] = []
  if (isDirectory(features)) for (const feature of readdirSync(features)) {
    if (!/^F-[^-]+-.+$/.test(feature)) continue
    const featureRoot = join(features, feature)
    const file = join(featureRoot, "feature.md")
    if (isDirectory(featureRoot) && safeFile(root, file)) found.push(file)
    const stories = join(featureRoot, "user-stories")
    if (isDirectory(stories)) for (const story of readdirSync(stories)) {
      if (!/^US-[^-]+-.+$/.test(story)) continue
      const storyFile = join(stories, story, "user-story.md")
      if (safeFile(root, storyFile)) found.push(storyFile)
    }
  }
  if (isDirectory(ideas)) for (const idea of readdirSync(ideas)) {
    if (!/^IDEA-[^-]+-.+$/.test(idea)) continue
    const file = join(ideas, idea, "idea.md")
    if (safeFile(root, file)) found.push(file)
  }
  return found
}

function parentFeature(project: string, root: string, parentId: string) {
  if (!parentId) return ""
  const features = join(project, "features")
  if (!isDirectory(features)) return ""
  const matches = readdirSync(features)
    .filter((feature) => /^F-[^-]+-.+$/.test(feature))
    .map((feature) => join(features, feature, "feature.md"))
    .filter((path) => safeFile(root, path) && record(root, path).id === parentId)
  return matches.length === 1 ? matches[0] : ""
}

function brief(target: string, status: Status, coverage: string, entries: Partial<globalThis.Record<string, string[]>>) {
  return [`# Context Brief: ${target}`, `Status: ${status}`, `Coverage: ${coverage}`, ...headings.map((heading) => `## ${heading}\n\n${entries[heading]?.join("\n") || "- None."}`)].join("\n\n")
}

export const BassContextBriefPlugin: Plugin = async () => ({
  tool: {
    bass_context_brief: tool({
      description: "Deterministically load a bounded local BASS Context Brief without MCP calls or mutations.",
      args: { projectName: tool.schema.string().optional(), target: tool.schema.string() },
      async execute(args, context) {
        const projectName = args.projectName?.trim()
        const target = args.target?.trim()
        if (!target) return brief("invalid target", "blocked", "No filesystem sources loaded.", { Gaps: ["- Target is required. Next action: provide a non-empty typed ID or exact title."] })
        if (projectName && invalidProjectName(projectName)) return brief(target, "blocked", "No filesystem sources loaded because projectName failed preflight.", { Gaps: ["- Selected project is invalid. Next action: provide one direct child name under BASS/projects/."] })

        const projectsRoot = join(context.directory, "BASS", "projects")
        if (!isDirectory(projectsRoot)) return brief(target, "blocked", "BASS/projects is unavailable.", { Gaps: ["- Selected project source is unavailable. Next action: restore BASS/projects/."] })
        const names = readdirSync(projectsRoot).filter((name) => isDirectory(join(projectsRoot, name)))
        const selected = projectName || (names.length === 1 ? names[0] : "")
        if (!selected || !names.includes(selected)) return brief(target, "blocked", "Selected project is unavailable.", { Gaps: [`- Selected project '${selected || "(unspecified)"}' is unavailable. Next action: provide an existing direct child project name.`] })

        const project = join(projectsRoot, selected)
        if (lstatSync(project).isSymbolicLink()) return brief(target, "blocked", "Selected project is a symbolic link or junction.", { Gaps: ["- Selected project containment cannot be verified. Next action: use a real direct child project directory."] })
        const projectRoot = realpathSync(project)
        const matches = candidates(project, projectRoot).map((path) => record(projectRoot, path, context.directory)).filter((item) => item.id === target || item.title === target)
        if (matches.length !== 1) return brief(target, "blocked", `Local target resolution found ${matches.length} matches in Feature, User Story, and Idea paths.`, { Gaps: [`- Target resolution is ${matches.length ? "ambiguous" : "unavailable"}. Next action: provide a unique typed ID or exact title, or use D6 discovery.`] })

        const resolved = matches[0]
        const loaded: LocalRecord[] = []
        for (const path of [join(project, "project-context", "context-registry.md"), join(project, "project-context", "functional", "functional-context.md"), join(project, "project-context", "technical", "technical-context.md")]) if (safeFile(projectRoot, path)) loaded.push(record(projectRoot, path, context.directory))
        loaded.push(resolved)
        const parent = resolved.filePath.includes(`${sep}user-stories${sep}`) ? parentFeature(project, projectRoot, value(resolved.text, "parent_feature_id")) : ""
        if (parent && !loaded.some((item) => item.filePath === parent)) loaded.push(record(projectRoot, parent, context.directory))
        for (const link of links(resolved.text, ["Related Evidence and Decisions", "Scope", "Related Items", "Related Evidence and Items"])) {
          const path = resolve(join(resolved.filePath, ".."), link)
          if (safeFile(projectRoot, path) && !loaded.some((item) => item.filePath === path)) loaded.push(record(projectRoot, path, context.directory))
        }

        const entries: Partial<globalThis.Record<string, string[]>> = { Goal: [material(resolved, summary(resolved.text, ["Objective", "User Story", "Problem", "Description", "Summary"]))], State: [], Decisions: [], Evidence: [], Conflicts: [], Gaps: [], Questions: [], Sources: [] }
        for (const item of loaded) {
          entries.Sources!.push(`- ${item.path} [source: ${item.source}; location: ${item.location}; classification: ${item.classification}; confidence: ${item.confidence}]`)
          if (item === resolved) continue
          const entry = material(item, summary(item.text, ["State", "Summary", "Decision", "Findings", "Description", "Scope", "Purpose", "Objective", "Question"]))
          if (item.classification === "Decision") entries.Decisions!.push(entry)
          else if (item.classification === "Conflict") entries.Conflicts!.push(conflictMaterial(item, summary(item.text, ["State", "Summary", "Decision", "Findings", "Description", "Scope", "Purpose"])))
          else if (item.classification === "Question") entries.Questions!.push(entry)
          else if (item.filePath.includes(`${sep}project-context${sep}`)) entries.State!.push(entry)
          else entries.Evidence!.push(entry)
        }
        const workItems = [value(resolved.text, "ado_work_item_url"), value(resolved.text, "ado_work_item_id")].filter(Boolean)
        const workItemReferences = [...workItems, ...loaded.flatMap((item) => item.sources.filter((source) => source.type === "ado_work_item").map((source) => source.reference))].filter(Boolean)
        const registry = loaded.find((item) => item.filePath.endsWith(`${sep}project-context${sep}context-registry.md`))
        const adoSources = [
          ["Functional ADO Wiki", [registry ? registryWiki(registry.text, "Functional") : "", ...loaded.flatMap((item) => item.sources.filter((source) => source.type === "ado_wiki").map((source) => source.reference))].filter(Boolean).join("; ")],
          ["Technical ADO Wiki", registry ? registryWiki(registry.text, "Technical") : ""],
          ["ADO Work Item", workItemReferences.join("; ")],
          ["ADO relations", [...workItemReferences, ...loaded.flatMap((item) => item.relationReferences)].filter(Boolean).join("; ")],
          ["ADO history", [...workItemReferences, ...loaded.flatMap((item) => item.sources.filter((source) => source.type === "ado_comment").map((source) => source.reference))].filter(Boolean).join("; ")],
        ].filter(([, reference]) => Boolean(reference))
        for (const [name, reference] of adoSources) entries.Gaps!.push(`- Expected source: ${name}${reference ? ` (${reference})` : " (no local reference recorded)"}. Reason: not loaded by this local-only tool. Impact: ${name} evidence is absent from this brief. Next action: use an installation-verified read-only ADO capability.`)
        const hasGaps = entries.Gaps!.length > 0
        const status: Status = hasGaps || entries.Conflicts!.length ? "warning" : "ready"
        return brief(resolved.id || resolved.title, status, `Loaded ${loaded.length} local source(s); ${entries.Gaps!.length} unavailable ADO source(s).`, entries)
      },
    }),
  },
})
