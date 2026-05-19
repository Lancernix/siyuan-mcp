import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerDocTools(server: McpServer) {
  server.tool(
    "create_doc",
    "在指定笔记本中新建文档 / Create a document in a notebook",
    {
      notebook: z.string().describe("笔记本 ID / Notebook ID"),
      path: z
        .string()
        .describe("文档路径 / Document path (e.g., /daily/2024-03-20)"),
      markdown: z.string().describe("Markdown 内容 / Markdown content"),
    },
    async ({
      notebook,
      path,
      markdown,
    }: {
      notebook: string;
      path: string;
      markdown: string;
    }) => {
      const client = getClient();
      const id = await client.createDocWithMd(notebook, path, markdown);
      return {
        content: [{ type: "text", text: `Document created with ID: ${id}` }],
      };
    },
  );

  server.tool(
    "rename_doc",
    "重命名文档 / Rename a document",
    {
      notebook: z.string().describe("笔记本 ID / Notebook ID"),
      path: z.string().describe("文档路径 / Document path"),
      title: z.string().describe("新标题 / New title"),
    },
    async ({
      notebook,
      path,
      title,
    }: {
      notebook: string;
      path: string;
      title: string;
    }) => {
      const client = getClient();
      await client.renameDoc(notebook, path, title);
      return {
        content: [
          { type: "text", text: `Document at ${path} renamed to ${title}` },
        ],
      };
    },
  );

  server.tool(
    "remove_doc",
    "删除文档 / Remove a document",
    {
      notebook: z.string().describe("笔记本 ID / Notebook ID"),
      path: z.string().describe("文档路径 / Document path"),
    },
    async ({ notebook, path }: { notebook: string; path: string }) => {
      const client = getClient();
      await client.removeDoc(notebook, path);
      return {
        content: [{ type: "text", text: `Document at ${path} removed` }],
      };
    },
  );

  server.tool(
    "move_docs",
    "移动文档 / Move documents",
    {
      fromPaths: z
        .array(z.string())
        .describe("源路径列表 / List of source paths"),
      toNotebook: z.string().describe("目标笔记本 ID / Target notebook ID"),
      toPath: z.string().describe("目标路径 / Target path"),
    },
    async ({
      fromPaths,
      toNotebook,
      toPath,
    }: {
      fromPaths: string[];
      toNotebook: string;
      toPath: string;
    }) => {
      const client = getClient();
      await client.moveDocs(fromPaths, toNotebook, toPath);
      return {
        content: [{ type: "text", text: `Documents moved to ${toPath}` }],
      };
    },
  );

  server.tool(
    "get_hpath_by_path",
    "根据路径获取人类可读路径 / Get human-readable path based on path",
    {
      notebook: z.string().describe("笔记本 ID / Notebook ID"),
      path: z.string().describe("路径 / Path"),
    },
    async ({ notebook, path }: { notebook: string; path: string }) => {
      const client = getClient();
      const hpath = await client.getHPathByPath(notebook, path);
      return { content: [{ type: "text", text: hpath }] };
    },
  );

  server.tool(
    "get_hpath_by_id",
    "根据 ID 获取人类可读路径 / Get human-readable path based on ID",
    { id: z.string().describe("块 ID / Block ID") },
    async ({ id }: { id: string }) => {
      const client = getClient();
      const hpath = await client.getHPathByID(id);
      return { content: [{ type: "text", text: hpath }] };
    },
  );

  server.tool(
    "get_ids_by_hpath",
    "根据人类可读路径获取 IDs / Get IDs by human-readable path",
    {
      path: z.string().describe("人类可读路径 / Human-readable path"),
      notebook: z.string().describe("笔记本 ID / Notebook ID"),
    },
    async ({ path, notebook }: { path: string; notebook: string }) => {
      const client = getClient();
      const ids = await client.getIDsByHPath(path, notebook);
      return { content: [{ type: "text", text: JSON.stringify(ids) }] };
    },
  );

  server.tool(
    "get_path_by_id",
    "根据 ID 获取存储路径 / Get storage path based on ID",
    { id: z.string().describe("块 ID / Block ID") },
    async ({ id }: { id: string }) => {
      const client = getClient();
      const path = await client.getPathByID(id);
      return { content: [{ type: "text", text: path }] };
    },
  );
}
