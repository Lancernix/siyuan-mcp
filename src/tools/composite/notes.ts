import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";
import {
  escapeSqlLike,
  getString,
  getStringOrDefault,
  parseHPath,
  stripMetadataAndH1,
} from "../../utils/index.js";

export function registerCompositeNoteTools(server: McpServer) {
  server.registerTool(
    "smart_create_note",
    {
      description: "Smartly create a note (auto-match notebook and path)",
      inputSchema: {
        title: z.string().describe("Note title"),
        content: z.string().describe("Note content (Markdown)"),
        notebookName: z.string().optional().describe("Notebook name"),
      },
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
      let path = `/mcp/${today}/${title}`;

      const existingIds = await client.getIDsByHPath(path, notebookId);
      if (existingIds && existingIds.length > 0) {
        const ts = Date.now();
        path = `/mcp/${today}/${title}-${ts}`;
      }

      const id = await client.createDocWithMd(notebookId, path, content);
      return {
        content: [
          {
            type: "text",
            text: `Note "${title}" created at ${path} (ID: ${id})`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "upsert_note_content",
    {
      description: "Update or create note content (clears old content first)",
      inputSchema: {
        targetId: z.string().describe("Target document ID"),
        content: z.string().describe("New Markdown content"),
      },
    },
    async ({ targetId, content }) => {
      const client = getClient();

      const cleaned = stripMetadataAndH1(content);

      try {
        const children = await client.getChildBlocks(targetId);

        if (children.length > 0) {
          await Promise.all(
            children.map((child) => client.deleteBlock(child.id)),
          );
        }

        await client.appendBlock(targetId, cleaned);

        return {
          content: [
            {
              type: "text",
              text: `Document ${targetId} content updated`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to update document ${targetId}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "get_todos",
    {
      description:
        "Get uncompleted todo items (- [ ] syntax), filterable by notebook or path",
      inputSchema: {
        scope: z
          .string()
          .optional()
          .describe(
            "Search scope: notebook name, document title, or full path",
          ),
      },
    },
    async ({ scope }) => {
      const client = getClient();
      let sql =
        "SELECT * FROM blocks WHERE type = 'i' AND subtype = 't' AND markdown LIKE '%[ ]%' AND markdown NOT LIKE '%[X]%' AND markdown NOT LIKE '%[x]%'";

      if (scope) {
        const notebookId = await client.getNotebookIDByName(scope);
        if (notebookId) {
          sql += ` AND box = '${notebookId}'`;
        } else {
          const { notebookName, hpath } = parseHPath(scope);
          const nbIdFromPath = await client.getNotebookIDByName(notebookName);

          let foundDoc = false;
          if (nbIdFromPath && hpath && hpath !== "/") {
            const ids = await client.getIDsByHPath(hpath, nbIdFromPath);
            if (ids && ids.length > 0) {
              const docInfo = await client.querySql(
                `SELECT path FROM blocks WHERE id = '${ids[0]}' LIMIT 1`,
              );
              if (docInfo.length > 0) {
                const internalPath = getString(docInfo[0], "path").replace(
                  ".sy",
                  "",
                );
                sql += ` AND path LIKE '${internalPath}%'`;
                foundDoc = true;
              }
            }
          }

          if (!foundDoc) {
            const escapedScope = escapeSqlLike(scope);
            const docSearch = await client.querySql(
              `SELECT path, box FROM blocks WHERE type = 'd' AND content LIKE '%${escapedScope}%' LIMIT 1`,
            );
            if (docSearch.length > 0) {
              const internalPath = getString(docSearch[0], "path").replace(
                ".sy",
                "",
              );
              sql += ` AND path LIKE '${internalPath}%' AND box = '${getString(docSearch[0], "box")}'`;
            }
          }
        }
      }

      sql += " ORDER BY updated DESC LIMIT 100";
      const result = await client.querySql(sql);

      if (result.length === 0) {
        return {
          content: [{ type: "text", text: "No uncompleted todos found." }],
        };
      }

      let output = `Found ${result.length} uncompleted todos:\n\n`;
      for (const row of result) {
        let content = getStringOrDefault(row, "markdown", "");
        content = content.replace(/\{:.*\}$/, "").trim();
        const hpath = getStringOrDefault(row, "hpath", "");
        const id =
          getStringOrDefault(row, "root_id", "") ||
          getStringOrDefault(row, "id", "");
        const title = hpath.split("/").pop() || "untitled";
        output += `- ${content} (note: \`${title}\`, ID: \`${id}\`, path: \`${hpath}\`)\n`;
      }

      return { content: [{ type: "text", text: output }] };
    },
  );

  server.registerTool(
    "find_note",
    {
      description: "Search document titles by keyword",
      inputSchema: {
        query: z.string().describe("Search keyword"),
      },
    },
    async ({ query }) => {
      const client = getClient();
      const escapedQuery = escapeSqlLike(query);
      const sql = `SELECT id, content as title, hpath FROM blocks WHERE type = 'd' AND content LIKE '%${escapedQuery}%' LIMIT 20`;
      const result = await client.querySql(sql);

      if (result.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No documents found matching "${query}".`,
            },
          ],
        };
      }

      let output = `Found ${result.length} matching documents:\n\n`;
      for (const row of result) {
        output += `- **${row.title}**\n  - path: \`${row.hpath}\`\n  - ID: \`${row.id}\`\n`;
      }

      return { content: [{ type: "text", text: output }] };
    },
  );
}
