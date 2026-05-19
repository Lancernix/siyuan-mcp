import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerNotebookTools(server: McpServer) {
  server.tool(
    "list_notebooks",
    "列出所有笔记本 / List all notebooks",
    {},
    async () => {
      const client = getClient();
      const notebooks = await client.listNotebooks();
      return {
        content: [{ type: "text", text: JSON.stringify(notebooks, null, 2) }],
      };
    },
  );

  server.tool(
    "open_notebook",
    "打开指定笔记本 / Open a notebook",
    { notebook: z.string().describe("笔记本 ID / Notebook ID") },
    async ({ notebook }) => {
      const client = getClient();
      await client.openNotebook(notebook);
      return {
        content: [{ type: "text", text: `Notebook ${notebook} opened` }],
      };
    },
  );

  server.tool(
    "close_notebook",
    "关闭指定笔记本 / Close a notebook",
    { notebook: z.string().describe("笔记本 ID / Notebook ID") },
    async ({ notebook }) => {
      const client = getClient();
      await client.closeNotebook(notebook);
      return {
        content: [{ type: "text", text: `Notebook ${notebook} closed` }],
      };
    },
  );

  server.tool(
    "rename_notebook",
    "重命名笔记本 / Rename a notebook",
    {
      notebook: z.string().describe("笔记本 ID / Notebook ID"),
      name: z.string().describe("新名称 / New name"),
    },
    async ({ notebook, name }) => {
      const client = getClient();
      await client.renameNotebook(notebook, name);
      return {
        content: [
          { type: "text", text: `Notebook ${notebook} renamed to ${name}` },
        ],
      };
    },
  );

  server.tool(
    "create_notebook",
    "创建新笔记本 / Create a new notebook",
    { name: z.string().describe("笔记本名称 / Notebook name") },
    async ({ name }) => {
      const client = getClient();
      const nb = await client.createNotebook(name);
      return { content: [{ type: "text", text: JSON.stringify(nb, null, 2) }] };
    },
  );

  server.tool(
    "remove_notebook",
    "删除笔记本 / Remove a notebook",
    { notebook: z.string().describe("笔记本 ID / Notebook ID") },
    async ({ notebook }) => {
      const client = getClient();
      await client.removeNotebook(notebook);
      return {
        content: [{ type: "text", text: `Notebook ${notebook} removed` }],
      };
    },
  );

  server.tool(
    "get_notebook_conf",
    "获取笔记本配置 / Get notebook configuration",
    { notebook: z.string().describe("笔记本 ID / Notebook ID") },
    async ({ notebook }) => {
      const client = getClient();
      const conf = await client.getNotebookConf(notebook);
      return {
        content: [{ type: "text", text: JSON.stringify(conf, null, 2) }],
      };
    },
  );

  server.tool(
    "set_notebook_conf",
    "保存笔记本配置 / Save notebook configuration",
    {
      notebook: z.string().describe("笔记本 ID / Notebook ID"),
      conf: z
        .object({})
        .passthrough()
        .describe("配置对象 / Configuration object"),
    },
    async ({ notebook, conf }) => {
      const client = getClient();
      await client.setNotebookConf(notebook, conf);
      return {
        content: [
          { type: "text", text: `Configuration for ${notebook} updated` },
        ],
      };
    },
  );
}
