import type { ModelId, StyleName } from "./models";

export interface IdeaPrompt {
  idea: string;
  prompt: string;
}

const ANGLES = [
  {
    label: (idea: string) => `Extreme close-up of ${idea}, every tiny texture in focus`,
    shot: "extreme close-up macro shot",
    camera: "100mm macro lens, shallow depth of field, f/2.8",
  },
  {
    label: (idea: string) => `Wide establishing shot of ${idea} with a sense of place and scale`,
    shot: "sweeping wide establishing shot",
    camera: "24mm wide-angle lens, deep focus, eye-level perspective",
  },
  {
    label: (idea: string) => `A creative twist on ${idea} — unexpected, dreamlike, slightly surreal`,
    shot: "imaginative conceptual composition",
    camera: "50mm lens, dramatic low angle, rule-of-thirds framing",
  },
  {
    label: (idea: string) => `An emotional, story-driven moment built around ${idea}`,
    shot: "intimate candid moment full of emotion",
    camera: "85mm portrait lens, soft bokeh background, f/1.8",
  },
];

const STYLE_MODIFIERS: Record<StyleName, { look: string; lighting: string; mood: string }> = {
  Photorealistic: {
    look: "ultra-photorealistic, true-to-life detail, natural skin and surface textures",
    lighting: "soft natural window light with gentle shadows",
    mood: "quiet, authentic, lived-in",
  },
  Cinematic: {
    look: "cinematic film still, teal-and-amber grade",
    lighting: "dramatic low-key lighting with a single motivated key light",
    mood: "tense, atmospheric, larger than life",
  },
  Portrait: {
    look: "refined editorial portrait, crisp focus on the eyes, elegant composition",
    lighting: "Rembrandt lighting with a soft rim light separating subject from background",
    mood: "intimate, confident, timeless",
  },
  "Product shot": {
    look: "premium commercial product photography, flawless reflections, studio-clean backdrop",
    lighting: "controlled three-point studio lighting with soft gradients",
    mood: "polished, aspirational, luxurious",
  },
  "Anime / Illustration": {
    look: "detailed anime illustration, painterly backgrounds, expressive linework, vibrant cel shading",
    lighting: "glowing golden-hour light with soft bloom",
    mood: "nostalgic, whimsical, heartfelt",
  },
  "Viral Instagram look": {
    look: "trendy social-media aesthetic, bold colors, high contrast, scroll-stopping composition",
    lighting: "bright punchy lighting with a warm golden glow",
    mood: "energetic, fun, instantly shareable",
  },
};

function buildPrompt(idea: string, style: StyleName | null, model: ModelId, angleIndex: number, variation: number): IdeaPrompt {
  const angle = ANGLES[angleIndex % ANGLES.length]!;
  const styleKeys = Object.keys(STYLE_MODIFIERS) as StyleName[];
  const mod = STYLE_MODIFIERS[style ?? styleKeys[(angleIndex + variation) % styleKeys.length]!];
  const ideaText = angle.label(idea);

  const base = `${angle.shot.charAt(0).toUpperCase() + angle.shot.slice(1)} of ${idea}. ${mod.look}. Lighting: ${mod.lighting}. Camera: ${angle.camera}. Mood: ${mod.mood}.`;

  let prompt: string;
  switch (model) {
    case "midjourney":
      prompt = `${angle.shot} of ${idea}, ${mod.look}, ${mod.lighting}, ${angle.camera}, ${mod.mood} mood --ar 16:9 --style raw --v 6`;
      break;
    case "gpt-image":
      prompt = `Create an image: ${base} Render any visible text cleanly and accurately.`;
      break;
    case "gemini":
      prompt = `Generate a photo of ${idea}: ${base} Keep textures and lighting physically accurate and consistent.`;
      break;
    case "flux":
      prompt = base;
      break;
  }

  return { idea: ideaText, prompt };
}

export function generateFromTemplates(
  idea: string,
  style: StyleName | null,
  model: ModelId,
  variation = 0,
): IdeaPrompt[] {
  return [0, 1, 2, 3].map((i) => buildPrompt(idea, style, model, i, variation));
}
