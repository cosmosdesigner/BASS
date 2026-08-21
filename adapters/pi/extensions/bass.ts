import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const workflows = new Map([
  ["init", "bass-init"],
  ["status", "bass-status"],
  ["understand", "bass-understand"],
]);

function usage(): string {
  return "Usage: /bass <init|status|understand> [arguments]";
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("bass", {
    description: "Run a BASS local workflow through Pi",
    handler: async (args) => {
      const input = args.trim();
      const [workflow, ...rest] = input.split(/\s+/).filter(Boolean);
      const skill = workflows.get(workflow ?? "");

      if (!skill) {
        pi.sendMessage({
          customType: "bass",
          content: usage(),
          display: true,
          details: { status: "blocked", code: "unsupported_workflow" },
        });
        return;
      }

      const request = `/skill:${skill}${rest.length ? ` ${rest.join(" ")}` : ""}`;
      pi.sendUserMessage(request, { expandPromptTemplates: true });
    },
  });
}
