import { type Plugin, tool } from "@opencode-ai/plugin"
declare const require: (path: string) => { recommendNext: (input: unknown) => unknown }

export const recommendNext = (input: unknown) => require("./bass-recommend-next.js").recommendNext(input)
export const BassRecommendNextPlugin: Plugin = async () => ({ tool: { bass_recommend_next: tool({ description: "Recommend one safe non-executing BASS next action.", args: { envelope: tool.schema.object(), request: tool.schema.string().optional() }, async execute(args: unknown) { return JSON.stringify(recommendNext(args)) } }) } })
