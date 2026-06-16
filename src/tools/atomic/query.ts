import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerQueryTools(server: McpServer) {
  server.registerTool(
    "sql_query",
    {
      description: "Execute a SQL query",
      inputSchema: { sql: z.string().describe("SQL statement") },
      outputSchema: {
        rows: z.array(z.record(z.string(), z.unknown())),
      },
    },
    async ({ sql }) => {
      const client = getClient();
      const result = await client.querySql(sql);
      const structuredContent = { rows: result };
      return {
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "flush_transaction",
    {
      description: "Flush all pending transactions",
    },
    async () => {
      const client = getClient();
      await client.flushTransaction();
      return { content: [{ type: "text", text: "Transactions flushed" }] };
    },
  );

  server.registerTool(
    "export_md_content",
    {
      description: "Export document content as Markdown",
      inputSchema: { id: z.string().describe("Document ID") },
      outputSchema: {
        hPath: z.string(),
        content: z.string(),
      },
    },
    async ({ id }) => {
      const client = getClient();
      const result = await client.exportMdContent(id);
      const structuredContent = {
        hPath: result.hPath,
        content: result.content,
      };
      return {
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "export_resources",
    {
      description: "Export files or directories as a zip archive",
      inputSchema: {
        paths: z
          .array(z.string())
          .describe(
            "Full storage paths, e.g. /data/20210817205410-2kvfpfn/xxx.sy",
          ),
        name: z
          .string()
          .optional()
          .describe(
            "Zip filename without extension (auto-generated if omitted)",
          ),
      },
      outputSchema: {
        path: z.string(),
      },
    },
    async ({ paths, name }) => {
      const client = getClient();
      const result = await client.exportResources(paths, name);
      const structuredContent = { path: result.path };
      return {
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
        structuredContent,
      };
    },
  );
}
