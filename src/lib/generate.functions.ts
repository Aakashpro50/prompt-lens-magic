import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { generateFromTemplates, type IdeaPrompt } from "./templates";
import { STYLES } from "./models";

const inputSchema = z.object({
  idea: z.string().min(1).max(120),
  model: z.enum(["gpt-image", "gemini", "midjourney", "flux"]),
  style: z.enum(STYLES),
});

export const generatePrompts = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ ideas: IdeaPrompt[]; source: "ai" | "template" }> => {
    try {
      const { generateIdeasWithAI } = await import("./generate.server");
      const ideas = await generateIdeasWithAI(data);
      return { ideas, source: "ai" };
    } catch (error) {
      console.error("AI generation failed, falling back to templates:", error);
      return { ideas: generateFromTemplates(data.idea, data.style, data.model), source: "template" };
    }
  });
