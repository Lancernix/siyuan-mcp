import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerCompositeSearchTools(server: McpServer) {
  server.tool(
    "smart_search",
    "综合搜索文档标题和正文 / Smart search across document titles and content",
    {
      query: z.string().describe("搜索关键词 / Search keyword"),
      limit: z.number().optional().default(10).describe("结果数量限制 / Result limit"),
    },
    async ({ query, limit }: { query: string; limit: number }) => {
      const client = getClient();
      const escaped = query.replace(/'/g, "''");
      
      // Search in both titles and content
      const sql = `
        SELECT id, content, hpath, type, box FROM blocks 
        WHERE (content LIKE '%${escaped}%' OR markdown LIKE '%${escaped}%')
        AND type IN ('d', 'p', 'h')
        ORDER BY updated DESC
        LIMIT ${limit}
      `;
      
      const results = await client.querySql(sql);
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }
  );
}
