import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";
import { stripMetadataAndH1 } from "../../utils/index.js";

export function registerCompositeNoteTools(server: McpServer) {
  server.tool(
    "smart_create_note",
    "智能创建笔记（自动匹配笔记本和路径） / Smartly create a note (auto-match notebook and path)",
    {
      title: z.string().describe("笔记标题 / Note title"),
      content: z.string().describe("笔记内容 (Markdown) / Note content (Markdown)"),
      notebookName: z
        .string()
        .optional()
        .describe("指定笔记本名称 / Specified notebook name"),
    },
    async ({ title, content, notebookName }) => {
      const client = getClient();
      let notebookId: string | null = null;

      if (notebookName) {
        notebookId = await client.getNotebookIDByName(notebookName);
      }

      if (!notebookId) {
        const notebooks = await client.listNotebooks();
        notebookId = notebooks[0]?.id;
      }

      if (!notebookId) {
        throw new Error("No notebook found");
      }

      const today = new Date().toISOString().split("T")[0];
      const path = `/mcp/${today}/${title}`;

      const id = await client.createDocWithMd(notebookId, path, content);
      return {
        content: [
          { type: "text", text: `Note "${title}" created in path ${path} (ID: ${id})` },
        ],
      };
    },
  );

  server.tool(
    "upsert_note_content",
    "更新或创建笔记内容 / Update or create note content",
    {
      targetId: z.string().describe("目标文档 ID / Target document ID"),
      content: z
        .string()
        .describe("新的 Markdown 内容 / New Markdown content"),
    },
    async ({ targetId, content }) => {
      const client = getClient();

      const cleaned = stripMetadataAndH1(content);
      
      try {
        const children = await client.getChildBlocks(targetId);
        
        if (children.length > 0) {
          // Attempt to delete children. If any fail, we stop to prevent corrupted state.
          await Promise.all(
            children.map((child) => client.deleteBlock(child.id))
          );
        }

        await client.appendBlock(targetId, cleaned);

        return {
          content: [
            {
              type: "text",
              text: `Successfully replaced content of document ${targetId}.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to upsert document ${targetId}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "smart_search",
    "智能搜索（全文搜索 + 路径匹配） / Smart search (full-text + path match)",
    {
      query: z.string().describe("搜索词 / Search query"),
    },
    async ({ query }) => {
      const client = getClient();
      
      // Basic protection against SQL injection by escaping single quotes
      const escapedQuery = query.replace(/'/g, "''");
      const sql = `SELECT * FROM blocks WHERE content LIKE '%${escapedQuery}%' AND type = 'd' LIMIT 10`;
      
      const results = await client.querySql(sql);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    },
  );
}
