import { defineTool } from "@lovable.dev/mcp-js";

import { MODELS, STYLES } from "../../models";

export default defineTool({
  name: "list_models_and_styles",
  title: "List models and styles",
  description: "List the supported image models (with tips) and visual styles for prompt generation.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const models = MODELS.map((m) => ({ id: m.id, name: m.name, tip: m.tip }));
    const styles = [...STYLES];
    return {
      content: [{ type: "text", text: JSON.stringify({ models, styles }, null, 2) }],
      structuredContent: { models, styles },
    };
  },
});
