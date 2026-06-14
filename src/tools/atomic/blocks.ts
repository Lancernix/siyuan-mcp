import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerBlockTools(server: McpServer) {
  server.registerTool(
    "insert_block",
    {
      description: "Insert a block",
      inputSchema: {
        data: z.string().describe("Content data"),
        dataType: z
          .enum(["markdown", "dom"])
          .optional()
          .default("markdown")
          .describe("Data type"),
        nextID: z.string().optional().describe("ID of the next block"),
        previousID: z.string().optional().describe("ID of the previous block"),
        parentID: z.string().optional().describe("Parent block ID"),
      },
    },
    async ({ data, dataType, nextID, previousID, parentID }) => {
      const client = getClient();
      await client.insertBlock(data, dataType, nextID, previousID, parentID);
      return {
        content: [{ type: "text", text: "Block inserted" }],
      };
    },
  );

  server.registerTool(
    "prepend_block",
    {
      description: "Prepend a child block to a parent block",
      inputSchema: {
        parentID: z.string().describe("Parent block ID"),
        data: z.string().describe("Content data"),
        dataType: z
          .enum(["markdown", "dom"])
          .optional()
          .default("markdown")
          .describe("Data type"),
      },
    },
    async ({ parentID, data, dataType }) => {
      const client = getClient();
      await client.prependBlock(parentID, data, dataType);
      return {
        content: [{ type: "text", text: "Block prepended" }],
      };
    },
  );

  server.registerTool(
    "append_block",
    {
      description: "Append a child block to a parent block",
      inputSchema: {
        parentID: z.string().describe("Parent block ID"),
        data: z.string().describe("Content data"),
        dataType: z
          .enum(["markdown", "dom"])
          .optional()
          .default("markdown")
          .describe("Data type"),
      },
    },
    async ({ parentID, data, dataType }) => {
      const client = getClient();
      await client.appendBlock(parentID, data, dataType);
      return {
        content: [{ type: "text", text: "Block appended" }],
      };
    },
  );

  server.registerTool(
    "update_block",
    {
      description: "Update a block's content",
      inputSchema: {
        id: z.string().describe("Block ID"),
        data: z.string().describe("New content data"),
        dataType: z
          .enum(["markdown", "dom"])
          .optional()
          .default("markdown")
          .describe("Data type"),
      },
    },
    async ({ id, data, dataType }) => {
      const client = getClient();
      await client.updateBlock(id, data, dataType);
      return {
        content: [{ type: "text", text: `Block ${id} updated` }],
      };
    },
  );

  server.registerTool(
    "delete_block",
    {
      description: "Delete a block",
      inputSchema: { id: z.string().describe("Block ID") },
    },
    async ({ id }) => {
      const client = getClient();
      await client.deleteBlock(id);
      return { content: [{ type: "text", text: `Block ${id} deleted` }] };
    },
  );

  server.registerTool(
    "move_block",
    {
      description: "Move a block to a new position",
      inputSchema: {
        id: z.string().describe("Block ID"),
        previousID: z.string().optional().describe("ID of the previous block"),
        parentID: z.string().optional().describe("Parent block ID"),
      },
    },
    async ({ id, previousID, parentID }) => {
      const client = getClient();
      await client.moveBlock(id, previousID, parentID);
      return {
        content: [{ type: "text", text: `Block ${id} moved` }],
      };
    },
  );

  server.registerTool(
    "get_block_kramdown",
    {
      description: "Get block kramdown source",
      inputSchema: { id: z.string().describe("Block ID") },
      outputSchema: {
        id: z.string(),
        kramdown: z.string(),
      },
    },
    async ({ id }) => {
      const client = getClient();
      const result = await client.getBlockKramdown(id);
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
    "get_child_blocks",
    {
      description: "Get child blocks of a parent block",
      inputSchema: { id: z.string().describe("Parent block ID") },
      outputSchema: {
        blocks: z.array(
          z.object({
            id: z.string(),
            type: z.string(),
            subtype: z.string().optional(),
          }),
        ),
      },
    },
    async ({ id }) => {
      const client = getClient();
      const blocks = await client.getChildBlocks(id);
      const structuredContent = {
        blocks: blocks.map((b) => ({
          id: b.id,
          type: b.type,
          subtype: b.subtype || undefined,
        })),
      };
      return {
        content: [
          { type: "text", text: JSON.stringify(structuredContent, null, 2) },
        ],
        structuredContent,
      };
    },
  );

  server.registerTool(
    "fold_block",
    {
      description: "Fold a block",
      inputSchema: { id: z.string().describe("Block ID") },
    },
    async ({ id }) => {
      const client = getClient();
      await client.foldBlock(id);
      return { content: [{ type: "text", text: `Block ${id} folded` }] };
    },
  );

  server.registerTool(
    "unfold_block",
    {
      description: "Unfold a block",
      inputSchema: { id: z.string().describe("Block ID") },
    },
    async ({ id }) => {
      const client = getClient();
      await client.unfoldBlock(id);
      return { content: [{ type: "text", text: `Block ${id} unfolded` }] };
    },
  );

  server.registerTool(
    "transfer_block_ref",
    {
      description: "Transfer block references from one block to another",
      inputSchema: {
        fromID: z.string().describe("Source block ID"),
        toID: z.string().describe("Target block ID"),
        refIDs: z
          .array(z.string())
          .optional()
          .describe("Specific reference block IDs to transfer"),
      },
    },
    async ({ fromID, toID, refIDs }) => {
      const client = getClient();
      await client.transferBlockRef(fromID, toID, refIDs);
      return {
        content: [
          {
            type: "text",
            text: `References transferred from ${fromID} to ${toID}`,
          },
        ],
      };
    },
  );
}
