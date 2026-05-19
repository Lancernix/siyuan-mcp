import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../../client/index.js";

export function registerBlockTools(server: McpServer) {
  server.tool(
    "insert_block",
    "插入块 / Insert a block",
    {
      data: z.string().describe("数据内容 / Data content"),
      dataType: z.enum(["markdown", "dom"]).optional().default("markdown").describe("数据类型 / Data type"),
      nextID: z.string().optional().describe("后一个块的 ID / ID of the next block"),
      previousID: z.string().optional().describe("前一个块的 ID / ID of the previous block"),
      parentID: z.string().optional().describe("父块 ID / ID of the parent block"),
    },
    async ({ data, dataType, nextID, previousID, parentID }: { data: string; dataType: "markdown" | "dom"; nextID?: string; previousID?: string; parentID?: string }) => {
      const client = getClient();
      const result = await client.insertBlock(data, dataType, nextID, previousID, parentID);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "prepend_block",
    "插入前置子块 / Prepend a child block",
    {
      parentID: z.string().describe("父块 ID / ID of the parent block"),
      data: z.string().describe("数据内容 / Data content"),
      dataType: z.enum(["markdown", "dom"]).optional().default("markdown").describe("数据类型 / Data type"),
    },
    async ({ parentID, data, dataType }: { parentID: string; data: string; dataType: "markdown" | "dom" }) => {
      const client = getClient();
      const result = await client.prependBlock(parentID, data, dataType);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "append_block",
    "插入后置子块 / Append a child block",
    {
      parentID: z.string().describe("父块 ID / ID of the parent block"),
      data: z.string().describe("数据内容 / Data content"),
      dataType: z.enum(["markdown", "dom"]).optional().default("markdown").describe("数据类型 / Data type"),
    },
    async ({ parentID, data, dataType }: { parentID: string; data: string; dataType: "markdown" | "dom" }) => {
      const client = getClient();
      const result = await client.appendBlock(parentID, data, dataType);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "update_block",
    "更新块 / Update a block",
    {
      id: z.string().describe("块 ID / Block ID"),
      data: z.string().describe("新的数据内容 / New data content"),
      dataType: z.enum(["markdown", "dom"]).optional().default("markdown").describe("数据类型 / Data type"),
    },
    async ({ id, data, dataType }: { id: string; data: string; dataType: "markdown" | "dom" }) => {
      const client = getClient();
      const result = await client.updateBlock(id, data, dataType);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "delete_block",
    "删除块 / Delete a block",
    { id: z.string().describe("块 ID / Block ID") },
    async ({ id }: { id: string }) => {
      const client = getClient();
      await client.deleteBlock(id);
      return { content: [{ type: "text", text: `Block ${id} deleted` }] };
    }
  );

  server.tool(
    "move_block",
    "移动块 / Move a block",
    {
      id: z.string().describe("块 ID / Block ID"),
      previousID: z.string().optional().describe("前一个块的 ID / ID of the previous block"),
      parentID: z.string().optional().describe("父块 ID / ID of the parent block"),
    },
    async ({ id, previousID, parentID }: { id: string; previousID?: string; parentID?: string }) => {
      const client = getClient();
      const result = await client.moveBlock(id, previousID, parentID);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_block_kramdown",
    "获取块 kramdown 源码 / Get block kramdown source",
    { id: z.string().describe("块 ID / Block ID") },
    async ({ id }: { id: string }) => {
      const client = getClient();
      const result = await client.getBlockKramdown(id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_child_blocks",
    "获取子块 / Get child blocks",
    { id: z.string().describe("父块 ID / Parent block ID") },
    async ({ id }: { id: string }) => {
      const client = getClient();
      const blocks = await client.getChildBlocks(id);
      return { content: [{ type: "text", text: JSON.stringify(blocks, null, 2) }] };
    }
  );

  server.tool(
    "fold_block",
    "折叠块 / Fold a block",
    { id: z.string().describe("块 ID / Block ID") },
    async ({ id }: { id: string }) => {
      const client = getClient();
      await client.foldBlock(id);
      return { content: [{ type: "text", text: `Block ${id} folded` }] };
    }
  );

  server.tool(
    "unfold_block",
    "展开块 / Unfold a block",
    { id: z.string().describe("块 ID / Block ID") },
    async ({ id }: { id: string }) => {
      const client = getClient();
      await client.unfoldBlock(id);
      return { content: [{ type: "text", text: `Block ${id} unfolded` }] };
    }
  );
}
