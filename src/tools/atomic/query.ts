import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerQueryTools(server: McpServer) {
  server.tool(
    "sql_query",
    "执行 SQL 查询 / Execute SQL query",
    { sql: z.string().describe("SQL 语句 / SQL statement") },
    async ({ sql }: { sql: string }) => {
      const client = getClient();
      const result = await client.querySql(sql);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "flush_transaction",
    "提交所有未决事务 / Flush all pending transactions",
    {},
    async () => {
      const client = getClient();
      await client.flushTransaction();
      return { content: [{ type: "text", text: "Transactions flushed" }] };
    }
  );

  server.tool(
    "export_md_content",
    "导出 Markdown 文本 / Export Markdown content",
    { id: z.string().describe("文档 ID / Document ID") },
    async ({ id }: { id: string }) => {
      const client = getClient();
      const result = await client.exportMdContent(id);
      return { content: [{ type: "text", text: result.content }] };
    }
  );
}
