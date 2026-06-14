import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerFileTools(server: McpServer) {
  server.registerTool(
    "get_file",
    {
      description: "Get file content",
      inputSchema: { path: z.string().describe("File path") },
    },
    async ({ path }) => {
      const client = getClient();
      const response = await client.getFile(path);
      const text = await response.text();
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "put_file",
    {
      description: "Write file content",
      inputSchema: {
        path: z.string().describe("File path"),
        file: z.string().describe("File content"),
        isDir: z
          .boolean()
          .optional()
          .default(false)
          .describe("Whether to create a directory"),
      },
    },
    async ({ path, file, isDir }) => {
      const client = getClient();
      await client.putFile(path, file, isDir);
      return { content: [{ type: "text", text: `File ${path} written` }] };
    },
  );

  server.registerTool(
    "remove_file",
    {
      description: "Remove a file",
      inputSchema: { path: z.string().describe("File path") },
    },
    async ({ path }) => {
      const client = getClient();
      await client.removeFile(path);
      return { content: [{ type: "text", text: `File ${path} removed` }] };
    },
  );

  server.registerTool(
    "read_dir",
    {
      description: "Read directory contents",
      inputSchema: { path: z.string().describe("Directory path") },
    },
    async ({ path }) => {
      const client = getClient();
      const result = await client.readDir(path);
      const entries = result as Array<{
        name: string;
        isDir: boolean;
      }>;
      if (!entries || entries.length === 0) {
        return { content: [{ type: "text", text: "Directory is empty." }] };
      }
      let output = `Contents of ${path}:\n\n`;
      for (const entry of entries) {
        const icon = entry.isDir ? "📁" : "📄";
        output += `- ${icon} ${entry.name}\n`;
      }
      return { content: [{ type: "text", text: output }] };
    },
  );

  server.registerTool(
    "rename_file",
    {
      description: "Rename a file",
      inputSchema: {
        path: z.string().describe("Old path"),
        newPath: z.string().describe("New path"),
      },
    },
    async ({ path, newPath }) => {
      const client = getClient();
      await client.renameFile(path, newPath);
      return {
        content: [
          { type: "text", text: `File renamed from ${path} to ${newPath}` },
        ],
      };
    },
  );
}

export function registerSystemTools(server: McpServer) {
  server.registerTool(
    "system_status",
    {
      description: "Check system status",
      outputSchema: {
        status: z.record(z.string(), z.unknown()),
      },
    },
    async () => {
      const client = getClient();
      const status = (await client.systemStatus()) as Record<string, unknown>;
      const structuredContent = { status };
      return {
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "system_version",
    {
      description: "Check system version",
    },
    async () => {
      const client = getClient();
      const version = await client.version();
      return { content: [{ type: "text", text: `Version: ${version}` }] };
    },
  );

  server.registerTool(
    "workspace_info",
    {
      description: "Get workspace information",
      outputSchema: {
        workspaces: z.array(z.record(z.string(), z.unknown())),
      },
    },
    async () => {
      const client = getClient();
      const info = (await client.workspaceInfo()) as Array<
        Record<string, unknown>
      >;
      const structuredContent = { workspaces: info || [] };
      return {
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "get_current_time",
    {
      description: "Get current system time",
    },
    async () => {
      const client = getClient();
      const time = await client.currentTime();
      const date = new Date(time);
      return {
        content: [
          {
            type: "text",
            text: `${date.toISOString()} (${time})`,
          },
        ],
      };
    },
  );
}
