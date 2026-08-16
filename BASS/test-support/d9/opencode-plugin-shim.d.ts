declare module "@opencode-ai/plugin" {
  export type Plugin = (context: { directory?: string; projectId?: string }) => unknown
  export const tool: {
    (value: unknown): unknown
    schema: { object(): { optional(): unknown }; string(): { optional(): unknown }; array(value: unknown): unknown }
  }
}
declare function require(path: string): any
