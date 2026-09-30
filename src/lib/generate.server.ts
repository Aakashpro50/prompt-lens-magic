import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { createLovableAiGatewayRunIdFetch } from "./run-id";
import type { IdeaPrompt } from "./templates";
import type { ModelId, StyleName } from "./models";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const MODEL_GUIDANCE: Record<ModelId, string> = {
  "gpt-image":
    "Write in natural, descriptive sentences for GPT Image (ChatGPT). It follows long detailed instructions well and can render legible text. No parameter flags.",
  gemini:
    "Write in natural, descriptive sentences for Google Gemini (Nano Banana). Emphasise physical accuracy, consistent textures and realistic lighting. No parameter flags.",
  midjourney:
    "Write in Midjourney style: comma-separated descriptive phrases, then end with parameters like --ar 16:9 --style raw --v 6. Keep it dense and evocative, not full sentences.",
  flux:
    "Write in natural, descriptive sentences for Flux. Emphasise photorealism, natural lighting and sharp detail. No parameter flags.",
};

export async function generateIdeasWithAI(input: {
  idea: string;
  model: ModelId;
  style: StyleName | null;
  variation?: number;
}): Promise<IdeaPrompt[]> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const system = `You are PromptLens, an expert prompt engineer for AI image models. Given a short idea, a target image model and a visual style, you invent 4 distinct, specific image concepts and write one ready-to-paste prompt per concept.

Rules:
- The 4 concepts must take different angles: a close-up/detail, a wide/establishing shot, a creative or surreal twist, and an emotional/story-driven version.
- Each "idea" is ONE line describing a specific, interesting image worth creating.
- Each "prompt" is complete and detailed: subject, environment, lighting, camera angle/lens, mood and detail keywords. Genuinely high quality, never generic filler.
- Prompts are always in English, even if the input idea is Hindi/Hinglish.
- ${MODEL_GUIDANCE[input.model]}
- ${input.style ? `Apply the "${input.style}" style to every prompt.` : "No fixed style: choose the most fitting visual style for each concept."}
- Respond with ONLY valid JSON, no markdown fences: {"ideas":[{"idea":"...","prompt":"..."},{"idea":"...","prompt":"..."},{"idea":"...","prompt":"..."},{"idea":"...","prompt":"..."}]}`;

  const result = streamText({
    model: provider.responses(MODEL),
    system,
    messages: [
      {
        role: "user",
        content: `Idea: "${input.idea}". Target model: ${input.model}. Style: ${input.style ?? "any (your choice)"}.${input.variation ? ` This is regeneration #${input.variation}: give 4 completely fresh concepts, different from the obvious first take.` : ""} Return the JSON now.`,
      },
    ],
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const text = await result.text;
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned) as { ideas?: IdeaPrompt[] };
  if (!parsed.ideas || !Array.isArray(parsed.ideas) || parsed.ideas.length === 0) {
    throw new Error("AI returned no ideas");
  }
  return parsed.ideas
    .filter((item) => item && typeof item.idea === "string" && typeof item.prompt === "string")
    .slice(0, 4);
}
