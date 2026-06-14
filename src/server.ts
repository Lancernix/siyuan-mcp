#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAttrTools } from "./tools/atomic/attrs.js";
import { registerBlockTools } from "./tools/atomic/blocks.js";
import { registerDocTools } from "./tools/atomic/docs.js";
import { registerNotebookTools } from "./tools/atomic/notebooks.js";
import { registerQueryTools } from "./tools/atomic/query.js";
import {
  registerFileTools,
  registerSystemTools,
} from "./tools/atomic/system-files.js";
import { registerTemplateTools } from "./tools/atomic/template.js";
import { registerCompositeNoteTools } from "./tools/composite/notes.js";
import { registerCompositeSearchTools } from "./tools/composite/search.js";

const server = new McpServer({
  name: "SiYuan Note MCP Server",
  version: "2.0.0",
});

// Register Atomic Tools
registerNotebookTools(server);
registerDocTools(server);
registerBlockTools(server);
registerAttrTools(server);
registerQueryTools(server);
registerTemplateTools(server);
registerFileTools(server);
registerSystemTools(server);

// Register Composite Tools
registerCompositeNoteTools(server);
registerCompositeSearchTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SiYuan MCP Server started");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
