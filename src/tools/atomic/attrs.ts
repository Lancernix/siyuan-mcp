import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerAttrTools(server: McpServer) {
  server.registerTool(
    "get_block_attrs",
    {
      description: "Get block attributes",
      inputSchema: { id: z.string().describe("Block ID") },
      outputSchema: {
        attrs: z.record(z.string(), z.string()),
      },
    },
    async ({ id }) => {
      const client = getClient();
      const attrs = await client.getBlockAttrs(id);
      const structuredContent = { attrs };
      return {
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "set_block_attrs",
    {
      description: "Set block attributes",
      inputSchema: {
        id: z.string().describe("Block ID"),
        attrs: z.record(z.string(), z.any()).describe("Attributes object"),
      },
    },
    async ({ id, attrs }) => {
      const client = getClient();
      await client.setBlockAttrs(id, attrs);
      return {
        content: [{ type: "text", text: `Attributes for block ${id} updated` }],
      };
    },
  );
}
