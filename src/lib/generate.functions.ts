import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { STYLES } from "./models";
import { generateFromTemplates, type IdeaPrompt } from "./templates";
import { generateIdeasWithAI } from "./generate.server";

const InputSchema = z.object({
  idea: z.string().trim().min(1).max(120),
  model: z.enum(["gpt-image", "gemini", "midjourney", "flux"]),
  style: z.enum(STYLES).nullable(),
  variation: z.number().int().min(0).max(1000).default(0),
});

export const generatePrompts = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<{ ideas: IdeaPrompt[]; source: "ai" | "template" }> => {
    try {
      const ideas = await generateIdeasWithAI(data);
      if (ideas.length >= 4) {
        console.log(`AI generation succeeded: ${ideas.length} ideas`);
        return { ideas, source: "ai" };
      }
      throw new Error("AI returned fewer than 4 ideas");
    } catch (err) {
      console.error("AI generation failed, falling back to templates:", err);
      return { ideas: generateFromTemplates(data.idea, data.style, data.model, data.variation), source: "template" };
    }
  });
