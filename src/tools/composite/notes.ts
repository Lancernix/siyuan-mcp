import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";
import { parseHPath, stripMetadataAndH1 } from "../../utils/index.js";

export function registerCompositeNoteTools(server: McpServer) {
  server.tool(
    "smart_create_note",
    "智能创建笔记，支持路径自动匹配和标题自动生成 / Smartly create a note with path matching and auto-title",
    {
      notebook: z.string().optional().describe("笔记本名称 / Notebook name"),
      folder: z.string().optional().describe("目标文件夹 / Target folder"),
      title: z.string().optional().describe("标题 / Title"),
      content: z.string().describe("Markdown 内容 / Markdown content"),
    },
    async ({ notebook, folder, title, content }: { notebook?: string; folder?: string; title?: string; content: string }) => {
      const client = getClient();
      let targetNbId = "";
      let targetHPath = "";

      const notebooks = await client.listNotebooks();
      const openNotebooks = notebooks.filter((n) => !n.closed);

      if (notebook) {
        const nb = notebooks.find((n) => n.name === notebook);
        if (nb) targetNbId = nb.id;
      }

      if (folder) {
        const escapedFolder = folder.replace(/'/g, "''");
        const folders = await client.querySql(
          `SELECT box, hpath FROM blocks WHERE type = 'd' AND content LIKE '%${escapedFolder}%' ORDER BY updated DESC LIMIT 1`
        );
        if (folders.length > 0) {
          targetNbId = targetNbId || (folders[0].box as string);
          targetHPath = folders[0].hpath as string;
        } else {
          targetHPath = folder.startsWith("/") ? folder : `/${folder}`;
        }
      }

      if (!targetNbId && openNotebooks.length > 0) {
        targetNbId = openNotebooks[0].id;
      }

      if (!targetNbId) {
        throw new Error("No target notebook found or specified.");
      }

      const noteTitle = title || new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      if (!targetHPath.endsWith("/")) targetHPath += "/";
      targetHPath += noteTitle;

      const docId = await client.createDocWithMd(targetNbId, targetHPath, content);
      return {
        content: [{ type: "text", text: `✅ Note created!\nID: ${docId}\nPath: ${targetHPath}` }],
      };
    }
  );

  server.tool(
    "move_to_inbox",
    "将内容归档到收件箱 / Archive content to Inbox",
    { content: z.string().describe("Markdown 内容 / Markdown content") },
    async ({ content }: { content: string }) => {
      const client = getClient();
      const notebooks = await client.listNotebooks();
      const openNotebooks = notebooks.filter((n) => !n.closed);

      let inboxNbId = "";
      let inboxPath = "/Inbox";

      // Try finding an Inbox notebook
      const inboxNb = notebooks.find(n => n.name.toLowerCase() === "inbox");
      if (inboxNb) {
        inboxNbId = inboxNb.id;
        inboxPath = "/";
      } else {
        // Try finding an Inbox document/folder
        const folders = await client.querySql(
          "SELECT box, hpath FROM blocks WHERE type = 'd' AND content LIKE 'Inbox' LIMIT 1"
        );
        if (folders.length > 0) {
          inboxNbId = folders[0].box as string;
          inboxPath = folders[0].hpath as string;
        } else {
          inboxNbId = openNotebooks[0]?.id;
        }
      }

      if (!inboxNbId) throw new Error("No open notebooks found.");

      const title = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      if (!inboxPath.endsWith("/")) inboxPath += "/";
      const finalPath = inboxPath + title;

      const docId = await client.createDocWithMd(inboxNbId, finalPath, content);
      return { content: [{ type: "text", text: `✅ Archived to Inbox!\nID: ${docId}\nPath: ${finalPath}` }] };
    }
  );
  
  server.tool(
    "upsert_note_content",
    "更新或创建笔记内容 / Update or create note content",
    {
      id: z.string().optional().describe("文档 ID / Document ID"),
      path: z.string().optional().describe("人类可读路径 / Human-readable path"),
      content: z.string().describe("Markdown 内容 / Markdown content"),
    },
    async ({ id, path, content }: { id?: string; path?: string; content: string }) => {
      const client = getClient();
      let targetId = id;

      if (!targetId && path) {
        const { notebookName, hpath } = parseHPath(path);
        const nbId = await client.getNotebookIDByName(notebookName);
        if (nbId) {
          const ids = await client.getIDsByHPath(hpath, nbId);
          if (ids.length > 0) targetId = ids[0];
        }
      }

      if (!targetId) {
        throw new Error("Could not find document ID to update.");
      }

      const cleaned = stripMetadataAndH1(content);
      const children = await client.getChildBlocks(targetId);
      for (const child of children) {
        await client.deleteBlock(child.id);
      }
      await client.appendBlock(targetId, cleaned);

      return { content: [{ type: "text", text: "✅ Document content updated." }] };
    }
  );
}
