import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerTemplateTools(server: McpServer) {
  server.registerTool(
    "render_template",
    {
      description: "Render a SiYuan template file",
      inputSchema: {
        id: z.string().describe("Document ID to render the template in"),
        path: z.string().describe("Absolute path to the template file"),
      },
      outputSchema: {
        content: z.string(),
        path: z.string(),
      },
    },
    async ({ id, path }) => {
      const client = getClient();
      const result = await client.renderTemplate(id, path);
      const structuredContent = result;
      return {
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "render_sprig",
    {
      description: "Render a Sprig template string (e.g. date path templates)",
      inputSchema: {
        template: z
          .string()
          .describe(
            'Sprig template, e.g. /daily note/{{now | date "2006/01"}}/{{now | date "2006-01-02"}}',
          ),
      },
    },
    async ({ template }) => {
      const client = getClient();
      const result = await client.renderSprig(template);
      return {
        content: [{ type: "text", text: result }],
      };
    },
  );
}
