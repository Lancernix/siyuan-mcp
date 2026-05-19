import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerAttrTools(server: McpServer) {
  server.tool(
    "get_block_attrs",
    "获取块属性 / Get block attributes",
    {
      id: z.string().describe("块 ID / Block ID"),
    },
    async ({ id }: { id: string }) => {
      const client = getClient();
      const attrs = await client.getBlockAttrs(id);
      return { content: [{ type: "text", text: JSON.stringify(attrs, null, 2) }] };
    }
  );

  server.tool(
    "set_block_attrs",
    "设置块属性 / Set block attributes",
    {
      id: z.string().describe("块 ID / Block ID"),
      attrs: z.any().describe("属性对象 / Attributes object"),
    },
    async ({ id, attrs }: { id: string; attrs: any }) => {
      const client = getClient();
      await client.setBlockAttrs(id, attrs);
      return { content: [{ type: "text", text: `Attributes for block ${id} updated` }] };
    }
  );
}
