import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
  server.prompt(
    "summarize-note",
    { id: z.string().describe("文档 ID / Document ID") },
    ({ id }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `请读取文档 ${id} 的内容，并为我生成一个简洁的摘要。重点提取核心观点和关键信息。`,
          },
        },
      ],
    }),
  );
}
