export type ModelId = "gpt-image" | "gemini" | "midjourney" | "flux";

export interface ImageModel {
  id: ModelId;
  name: string;
  short: string;
  tip: string;
}

export const MODELS: ImageModel[] = [
  {
    id: "gpt-image",
    name: "GPT Image",
    short: "ChatGPT",
    tip: "Best at following long, detailed instructions and rendering legible text inside images.",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    short: "Nano Banana",
    tip: "Best at realistic edits, consistent characters and blending multiple references.",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    short: "MJ",
    tip: "Best at artistic, stylised visuals with strong mood — use parameters like --ar and --style raw.",
  },
  {
    id: "flux",
    name: "Flux",
    short: "Flux",
    tip: "Best at fast, photorealistic results with natural lighting and sharp detail.",
  },
];

export const STYLES = [
  "Photorealistic",
  "Cinematic",
  "Portrait",
  "Product shot",
  "Anime / Illustration",
  "Viral Instagram look",
] as const;

export type StyleName = (typeof STYLES)[number];

export const SURPRISE_IDEAS = [
  "rainy street",
  "cinematic portrait",
  "ganesh ji",
  "street food",
  "monsoon chai",
  "mumbai local train",
  "neon barbershop",
  "old ambassador car",
  "cricket at dusk",
  "chai tapri",
  "retro bollywood poster",
  "spice market",
  "auto rickshaw at night",
  "rooftop pigeons",
  "wedding sherwani",
  "filter coffee",
  "himalayan trek",
  "desert camel fair",
  "vintage scooter",
  "temple festival",
];
