import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerFileTools(server: McpServer) {
  server.tool(
    "get_file",
    "获取文件 / Get a file",
    { path: z.string().describe("文件路径 / File path") },
    async ({ path }: { path: string }) => {
      const client = getClient();
      const response = await client.getFile(path);
      const text = await response.text();
      return { content: [{ type: "text", text }] };
    }
  );

  server.tool(
    "remove_file",
    "删除文件 / Remove a file",
    { path: z.string().describe("文件路径 / File path") },
    async ({ path }: { path: string }) => {
      const client = getClient();
      await client.removeFile(path);
      return { content: [{ type: "text", text: `File ${path} removed` }] };
    }
  );

  server.tool(
    "read_dir",
    "读取目录 / Read a directory",
    { path: z.string().describe("目录路径 / Directory path") },
    async ({ path }: { path: string }) => {
      const client = getClient();
      const result = await client.readDir(path);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "rename_file",
    "重命名文件 / Rename a file",
    {
      path: z.string().describe("旧路径 / Old path"),
      newPath: z.string().describe("新路径 / New path"),
    },
    async ({ path, newPath }: { path: string; newPath: string }) => {
      const client = getClient();
      await client.renameFile(path, newPath);
      return { content: [{ type: "text", text: `File renamed from ${path} to ${newPath}` }] };
    }
  );
}

export function registerSystemTools(server: McpServer) {
  server.tool(
    "system_status",
    "查看系统状态 / Check system status",
    {},
    async () => {
      const client = getClient();
      const status = await client.systemStatus();
      return { content: [{ type: "text", text: JSON.stringify(status, null, 2) }] };
    }
  );

  server.tool(
    "system_version",
    "查看系统版本 / Check system version",
    {},
    async () => {
      const client = getClient();
      const version = await client.version();
      return { content: [{ type: "text", text: version }] };
    }
  );

  server.tool(
    "workspace_info",
    "获取工作空间信息 / Get workspace information",
    {},
    async () => {
      const client = getClient();
      const info = await client.workspaceInfo();
      return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
    }
  );
}
