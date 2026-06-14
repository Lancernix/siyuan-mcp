import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerNotebookTools(server: McpServer) {
  server.registerTool(
    "list_notebooks",
    {
      description: "List all notebooks",
      outputSchema: {
        notebooks: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            icon: z.string(),
            sort: z.number(),
            closed: z.boolean(),
          }),
        ),
      },
    },
    async () => {
      const client = getClient();
      const notebooks = await client.listNotebooks();
      const structuredContent = { notebooks };
      return {
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "open_notebook",
    {
      description: "Open a notebook",
      inputSchema: { notebook: z.string().describe("Notebook ID") },
    },
    async ({ notebook }) => {
      const client = getClient();
      await client.openNotebook(notebook);
      return {
        content: [{ type: "text", text: `Notebook ${notebook} opened` }],
      };
    },
  );

  server.registerTool(
    "close_notebook",
    {
      description: "Close a notebook",
      inputSchema: { notebook: z.string().describe("Notebook ID") },
    },
    async ({ notebook }) => {
      const client = getClient();
      await client.closeNotebook(notebook);
      return {
        content: [{ type: "text", text: `Notebook ${notebook} closed` }],
      };
    },
  );

  server.registerTool(
    "rename_notebook",
    {
      description: "Rename a notebook",
      inputSchema: {
        notebook: z.string().describe("Notebook ID"),
        name: z.string().describe("New name"),
      },
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

  server.registerTool(
    "create_notebook",
    {
      description: "Create a new notebook",
      inputSchema: { name: z.string().describe("Notebook name") },
      outputSchema: {
        notebook: z.object({
          id: z.string(),
          name: z.string(),
          icon: z.string(),
          sort: z.number(),
          closed: z.boolean(),
        }),
      },
    },
    async ({ name }) => {
      const client = getClient();
      const nb = await client.createNotebook(name);
      const structuredContent = nb;
      return {
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "remove_notebook",
    {
      description: "Remove a notebook",
      inputSchema: { notebook: z.string().describe("Notebook ID") },
    },
    async ({ notebook }) => {
      const client = getClient();
      await client.removeNotebook(notebook);
      return {
        content: [{ type: "text", text: `Notebook ${notebook} removed` }],
      };
    },
  );

  server.registerTool(
    "get_notebook_conf",
    {
      description: "Get notebook configuration",
      inputSchema: { notebook: z.string().describe("Notebook ID") },
      outputSchema: {
        box: z.string(),
        name: z.string(),
        conf: z.record(z.string(), z.unknown()),
      },
    },
    async ({ notebook }) => {
      const client = getClient();
      const {
        box,
        conf: confObj,
        name,
      } = (await client.getNotebookConf(notebook)) as {
        box: string;
        conf: Record<string, unknown>;
        name: string;
      };
      const structuredContent = { box, name, conf: confObj };
      return {
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "set_notebook_conf",
    {
      description: "Save notebook configuration",
      inputSchema: {
        notebook: z.string().describe("Notebook ID"),
        conf: z.object({}).passthrough().describe("Configuration object"),
      },
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
