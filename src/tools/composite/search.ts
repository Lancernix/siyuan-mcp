import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";
import { escapeSqlLike } from "../../utils/index.js";

export function registerCompositeSearchTools(server: McpServer) {
  server.registerTool(
    "smart_search",
    {
      description: "Smart search across document titles and content",
      inputSchema: {
        query: z.string().describe("Search keyword"),
        limit: z.number().optional().default(10).describe("Result limit"),
      },
    },
    async ({ query, limit }) => {
      const client = getClient();
      const escaped = escapeSqlLike(query);

      const sql = `
        SELECT id, content, hpath, type, box FROM blocks
        WHERE (content LIKE '%${escaped}%' OR markdown LIKE '%${escaped}%')
        AND type IN ('d', 'p', 'h')
        ORDER BY updated DESC
        LIMIT ${limit}
      `;

      const results = await client.querySql(sql);

      if (results.length === 0) {
        return {
          content: [{ type: "text", text: `No results found for "${query}".` }],
        };
      }

      let output = `Found ${results.length} matching results:\n\n`;
      for (const row of results) {
        const title = String(row.content || "").substring(0, 80);
        const typeMap: Record<string, string> = {
          d: "doc",
          p: "paragraph",
          h: "heading",
        };
        const typeName = typeMap[String(row.type)] || String(row.type);
        output += `- [${typeName}] **${title}**\n  - path: \`${row.hpath}\`\n  - ID: \`${row.id}\`\n`;
      }

      return { content: [{ type: "text", text: output }] };
    },
  );
}
