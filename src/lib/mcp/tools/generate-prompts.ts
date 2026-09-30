import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { STYLES } from "../../models";
import { generateFromTemplates } from "../../templates";
import { generateIdeasWithAI } from "../../generate.server";

export default defineTool({
  name: "generate_image_prompts",
  title: "Generate image prompts",
  description:
    "Turn a short 1-2 word idea into 4 distinct image concepts, each with a ready-to-paste prompt for the chosen image model.",
  inputSchema: {
    idea: z.string().trim().min(1).max(120).describe("Short idea, e.g. 'rainy street'."),
    model: z
      .enum(["gpt-image", "gemini", "midjourney", "flux"])
      .describe("Target image model."),
    style: z.enum(STYLES).nullable().optional().describe("Optional visual style; omit to let the AI choose."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ idea, model, style }) => {
    const s = style ?? null;
    let ideas;
    let source: "ai" | "template" = "ai";
    try {
      ideas = await generateIdeasWithAI({ idea, model, style: s });
      if (ideas.length < 4) throw new Error("too few");
    } catch {
      ideas = generateFromTemplates(idea, s, model, 0);
      source = "template";
    }
    const list = ideas.map((i) => ({ idea: i.idea, prompt: i.prompt }));
    const text = list.map((i, n) => `${n + 1}. ${i.idea}\n${i.prompt}`).join("\n\n");
    return { content: [{ type: "text", text }], structuredContent: { ideas: list, source } };
  },
});
