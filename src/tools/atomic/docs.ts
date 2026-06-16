import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerDocTools(server: McpServer) {
  server.registerTool(
    "create_doc",
    {
      description: "Create a document in a notebook",
      inputSchema: {
        notebook: z.string().describe("Notebook ID"),
        path: z
          .string()
          .describe(
            "Document human-readable path (hpath), e.g. /daily/2024-03-20. Creates document with this name.",
          ),
        markdown: z.string().describe("Markdown content"),
      },
    },
    async ({ notebook, path, markdown }) => {
      const client = getClient();
      const id = await client.createDocWithMd(notebook, path, markdown);
      return {
        content: [{ type: "text", text: `Document created (ID: ${id})` }],
      };
    },
  );

  server.registerTool(
    "rename_doc",
    {
      description: "Rename a document by storage path",
      inputSchema: {
        notebook: z.string().describe("Notebook ID"),
        path: z
          .string()
          .describe(
            "Document storage path (must end with .sy), e.g. /20210902210113-0avi12f.sy",
          ),
        title: z.string().describe("New title"),
      },
    },
    async ({ notebook, path, title }) => {
      const client = getClient();
      if (!path.endsWith(".sy")) path += ".sy";
      await client.renameDoc(notebook, path, title);
      return {
        content: [{ type: "text", text: `Document renamed to ${title}` }],
      };
    },
  );

  server.registerTool(
    "remove_doc",
    {
      description: "Remove a document by storage path",
      inputSchema: {
        notebook: z.string().describe("Notebook ID"),
        path: z
          .string()
          .describe(
            "Document storage path (must end with .sy), e.g. /20210902210113-0avi12f.sy",
          ),
      },
    },
    async ({ notebook, path }) => {
      const client = getClient();
      if (!path.endsWith(".sy")) path += ".sy";
      await client.removeDoc(notebook, path);
      return {
        content: [{ type: "text", text: `Document removed: ${path}` }],
      };
    },
  );

  server.registerTool(
    "move_docs",
    {
      description: "Move documents",
      inputSchema: {
        fromPaths: z.array(z.string()).describe("Source paths"),
        toNotebook: z.string().describe("Target notebook ID"),
        toPath: z.string().describe("Target path"),
      },
    },
    async ({ fromPaths, toNotebook, toPath }) => {
      const client = getClient();
      await client.moveDocs(fromPaths, toNotebook, toPath);
      return {
        content: [{ type: "text", text: `Documents moved to ${toPath}` }],
      };
    },
  );

  server.registerTool(
    "get_hpath_by_path",
    {
      description: "Get human-readable path based on storage path",
      inputSchema: {
        notebook: z.string().describe("Notebook ID"),
        path: z.string().describe("Storage path"),
      },
    },
    async ({ notebook, path }) => {
      const client = getClient();
      const hpath = await client.getHPathByPath(notebook, path);
      return { content: [{ type: "text", text: hpath }] };
    },
  );

  server.registerTool(
    "get_hpath_by_id",
    {
      description: "Get human-readable path based on block ID",
      inputSchema: { id: z.string().describe("Block ID") },
    },
    async ({ id }) => {
      const client = getClient();
      const hpath = await client.getHPathByID(id);
      return { content: [{ type: "text", text: hpath }] };
    },
  );

  server.registerTool(
    "get_ids_by_hpath",
    {
      description: "Get document IDs by human-readable path",
      inputSchema: {
        path: z.string().describe("Human-readable path"),
        notebook: z.string().describe("Notebook ID"),
      },
    },
    async ({ path, notebook }) => {
      const client = getClient();
      const ids = await client.getIDsByHPath(path, notebook);
      return { content: [{ type: "text", text: JSON.stringify(ids) }] };
    },
  );

  server.registerTool(
    "get_path_by_id",
    {
      description: "Get storage path and notebook by block ID",
      inputSchema: { id: z.string().describe("Block ID") },
      outputSchema: {
        notebook: z.string(),
        path: z.string(),
      },
    },
    async ({ id }) => {
      const client = getClient();
      const result = await client.getPathByID(id);
      const structuredContent = result;
      return {
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "rename_doc_by_id",
    {
      description: "Rename a document by ID",
      inputSchema: {
        id: z.string().describe("Document ID"),
        title: z.string().describe("New title"),
      },
    },
    async ({ id, title }) => {
      const client = getClient();
      await client.renameDocByID(id, title);
      return {
        content: [{ type: "text", text: `Document renamed to ${title}` }],
      };
    },
  );

  server.registerTool(
    "remove_doc_by_id",
    {
      description: "Remove a document by ID",
      inputSchema: { id: z.string().describe("Document ID") },
    },
    async ({ id }) => {
      const client = getClient();
      await client.removeDocByID(id);
      return {
        content: [{ type: "text", text: `Document removed: ${id}` }],
      };
    },
  );

  server.registerTool(
    "move_docs_by_id",
    {
      description: "Move documents by ID",
      inputSchema: {
        fromIDs: z.array(z.string()).describe("Source document IDs"),
        toID: z.string().describe("Target parent document ID or notebook ID"),
      },
    },
    async ({ fromIDs, toID }) => {
      const client = getClient();
      await client.moveDocsByID(fromIDs, toID);
      return {
        content: [{ type: "text", text: `Documents moved to ${toID}` }],
      };
    },
  );
}
