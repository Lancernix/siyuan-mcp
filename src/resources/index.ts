import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../client/index.js";

export function registerResources(server: McpServer) {
  server.resource(
    "notebooks",
    "siyuan://notebooks",
    { mimeType: "application/json" },
    async () => {
      const client = getClient();
      const notebooks = await client.listNotebooks();
      return {
        contents: [
          {
            uri: "siyuan://notebooks",
            text: JSON.stringify(notebooks, null, 2),
          },
        ],
      };
    }
  );
}
