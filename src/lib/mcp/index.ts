import { defineMcp } from "@lovable.dev/mcp-js";

import generatePrompts from "./tools/generate-prompts";
import listOptions from "./tools/list-options";

export default defineMcp({
  name: "promptspark-studio",
  title: "PromptSpark Studio",
  version: "0.1.0",
  instructions:
    "Generate ready-to-paste AI image prompts. Call `list_models_and_styles` to see options, then `generate_image_prompts` with a short idea and target model.",
  tools: [generatePrompts, listOptions],
});
