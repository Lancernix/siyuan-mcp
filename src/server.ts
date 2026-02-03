#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod";
import { getClient } from "./client.js";
import {
  getString,
  getStringOrDefault,
  parseHPath,
  stripMetadata,
  stripMetadataAndH1,
} from "./utils.js";

const mcpServer = new McpServer({
  name: "SiYuan Note",
  version: "1.0.2",
});

mcpServer.registerTool(
  "list_notebooks",
  {
    description:
      "列出所有**思源笔记**中的笔记本。用于获取工作空间概览及笔记本 ID。\nList all notebooks in **SiYuan Note**. Used to get workspace overview and notebook IDs.",
    inputSchema: {},
  },
  async () => {
    const client = getClient();
    const notebooks = await client.listNotebooks();

    return {
      content: notebooks.map((nb) => ({
        type: "text" as const,
        text: `📚 **${nb.name}** (ID: ${nb.id}) - ${nb.closed ? "已关闭" : "已开启"}`,
      })),
    };
  },
);

mcpServer.registerTool(
  "get_todos",
  {
    description:
      "获取**思源笔记**中未完成的待办事项。可以按笔记本或文档标题缩小搜索范围。\nGet uncompleted todos in **SiYuan Note**. Can narrow search by notebook or document title.",
    inputSchema: {
      scope: z
        .string()
        .optional()
        .describe(
          "搜索范围，可以是笔记本名称、文档标题（支持模糊匹配）或文档完整路径。\nSearch scope, can be notebook name, document title (fuzzy match supported), or full document path.",
        ),
    },
  },
  async ({ scope }: { scope?: string }) => {
    const client = getClient();
    let sql =
      "SELECT * FROM blocks WHERE type = 'i' AND subtype = 't' AND markdown LIKE '%[ ]%' AND markdown NOT LIKE '%[X]%' AND markdown NOT LIKE '%[x]%'";

    if (scope) {
      const notebookId = await client.getNotebookIDByName(scope);
      if (notebookId) {
        sql += ` AND box = '${notebookId}'`;
      } else {
        const { notebookName, hpath } = parseHPath(scope);
        const nbIdFromPath = await client.getNotebookIDByName(notebookName);

        let foundDoc = false;
        if (nbIdFromPath && hpath && hpath !== "/") {
          const ids = await client.getIDsByHPath(hpath, nbIdFromPath);
          if (ids && ids.length > 0) {
            const docInfo = await client.querySql(
              `SELECT path FROM blocks WHERE id = '${ids[0]}' LIMIT 1`,
            );
            if (docInfo.length > 0) {
              const internalPath = getString(docInfo[0], "path").replace(
                ".sy",
                "",
              );
              sql += ` AND path LIKE '${internalPath}%'`;
              foundDoc = true;
            }
          }
        }

        if (!foundDoc) {
          const docSearch = await client.querySql(
            `SELECT path, box FROM blocks WHERE type = 'd' AND content LIKE '%${scope.replace(/'/g, "''")}%' LIMIT 1`,
          );
          if (docSearch.length > 0) {
            const internalPath = getString(docSearch[0], "path").replace(
              ".sy",
              "",
            );
            sql += ` AND path LIKE '${internalPath}%' AND box = '${getString(docSearch[0], "box")}'`;
          }
        }
      }
    }

    sql += " ORDER BY updated DESC LIMIT 100";
    const result = await client.querySql(sql);

    if (result.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "没有找到未完成的待办事项。",
          },
        ],
      };
    }

    let output = `找到 ${result.length} 个待办事项：\n\n`;
    for (const row of result) {
      let content = getStringOrDefault(row, "markdown", "");
      content = content.replace(/\{:.*\}$/, "").trim();
      const hpath = getStringOrDefault(row, "hpath", "");
      const id =
        getStringOrDefault(row, "root_id") || getStringOrDefault(row, "id", "");
      const title = hpath.split("/").pop() || "未命名";
      output += `- ${content} (笔记标题: \`${title}\`, ID: \`${id}\`, 路径: \`${hpath}\`)\n`;
    }

    return { content: [{ type: "text" as const, text: output }] };
  },
);

mcpServer.registerTool(
  "find_note",
  {
    description:
      "在**思源笔记**中通过关键词模糊搜索文档标题。返回结果包含后续操作所需的 ID 和路径。\nFuzzy search document titles in **SiYuan Note**. Returns IDs and paths required for subsequent operations.",
    inputSchema: {
      query: z
        .string()
        .describe(
          "搜索关键词（如：'工作总结'）。\nSearch keyword (e.g., 'Work Summary').",
        ),
    },
  },
  async ({ query }: { query: string }) => {
    const client = getClient();
    const sql = `SELECT id, content as title, hpath FROM blocks WHERE type = 'd' AND content LIKE '%${query.replace(/'/g, "''")}%' LIMIT 20`;
    const result = await client.querySql(sql);

    if (result.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `未找到标题包含 "${query}" 的文档。`,
          },
        ],
      };
    }

    let output = `找到以下匹配文档：\n\n`;
    for (const row of result) {
      output += `- **${row.title}**\n  - 路径: \`${row.hpath}\`\n  - ID: \`${row.id}\`\n`;
    }

    return { content: [{ type: "text" as const, text: output }] };
  },
);

mcpServer.registerTool(
  "create_note",
  {
    description:
      "在**思源笔记**中智能创建新文档。支持通过文件夹名模糊匹配目标目录，未提供标题时将自动生成。\nSmartly create a new document in **SiYuan Note**. Supports fuzzy folder matching and auto-title generation.",
    inputSchema: {
      notebook: z
        .string()
        .optional()
        .describe(
          "笔记本名称。不提供则尝试匹配现有路径或使用默认笔记本。\nNotebook name. If not provided, will try to match existing path or use default notebook.",
        ),
      folder: z
        .string()
        .optional()
        .describe(
          "目标文件夹名称（如 '工作记录' 或 'Inbox'）。支持模糊匹配。\nTarget folder name. Fuzzy matching supported.",
        ),
      title: z
        .string()
        .optional()
        .describe(
          "笔记标题名。如果不提供，将根据时间戳自动生成。\nNote title. Auto-generated by timestamp if not provided.",
        ),
      content: z
        .string()
        .describe("笔记的 Markdown 内容。\nMarkdown content of the note."),
      path: z
        .string()
        .optional()
        .describe(
          "【高级】手动指定完整路径（格式：'/笔记本/文件夹/标题'）。\n[Advanced] Manually specify full path.",
        ),
    },
  },
  async ({
    notebook,
    folder,
    title,
    content,
    path,
  }: {
    notebook?: string;
    folder?: string;
    title?: string;
    content: string;
    path?: string;
  }) => {
    const client = getClient();
    let targetNotebookId = "";
    let targetHPath = "";

    if (path) {
      const { notebookName, hpath } = parseHPath(path);
      const nbId = await client.getNotebookIDByName(notebookName);
      if (!nbId)
        return {
          content: [
            {
              type: "text" as const,
              text: `错误：未找到笔记本 '${notebookName}'`,
            },
          ],
        };
      targetNotebookId = nbId;
      targetHPath = hpath;
    } else {
      const notebooks = await client.listNotebooks();
      const openNotebooks = notebooks.filter((n) => !n.closed);

      if (notebook) {
        const nb = notebooks.find((n) => n.name === notebook);
        if (nb) targetNotebookId = nb.id;
      }

      if (folder) {
        const folderQuery = folder.replace(/'/g, "''");
        const folders = await client.querySql(
          `SELECT box, hpath FROM blocks WHERE type = 'd' AND content LIKE '%${folderQuery}%' ORDER BY updated DESC LIMIT 1`,
        );

        if (folders.length > 0) {
          targetNotebookId = targetNotebookId || getString(folders[0], "box");
          targetHPath = getString(folders[0], "hpath");
        } else if (folder.startsWith("/")) {
          targetHPath = folder;
        } else {
          targetHPath = `/${folder}`;
        }
      }

      if (!targetNotebookId && openNotebooks.length > 0) {
        targetNotebookId = openNotebooks[0].id;
      }

      const noteTitle =
        title || new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

      if (!targetHPath.endsWith("/")) targetHPath += "/";
      targetHPath += noteTitle;
    }

    if (!targetNotebookId) {
      return {
        content: [
          {
            type: "text" as const,
            text: "错误：无法确定目标笔记本。请开启一个笔记本或显式指定名称。",
          },
        ],
      };
    }

    const docId = await client.createDocWithMd(
      targetNotebookId,
      targetHPath,
      content,
    );
    return {
      content: [
        {
          type: "text" as const,
          text: `✅ 笔记已成功创建！\n- 笔记本ID: \`${targetNotebookId}\`\n- 路径: \`${targetHPath}\`\n- 文档ID: \`${docId}\``,
        },
      ],
    };
  },
);

mcpServer.registerTool(
  "update_note_content",
  {
    description:
      "完全覆盖**思源笔记**中现有笔记的正文内容。执行前会清空旧内容，建议优先使用 ID 定位。\nCompletely overwrite existing note content in **SiYuan Note**. Clears old content; Document ID is preferred for precision.",
    inputSchema: {
      id: z
        .string()
        .optional()
        .describe("文档的唯一 ID。\nUnique Document ID."),
      path: z
        .string()
        .optional()
        .describe(
          "文档的完整路径（如 ID 未知，可使用路径）。\nFull document path.",
        ),
      content: z
        .string()
        .describe(
          "新的 Markdown 文本（将替换旧内容）。\nNew Markdown content.",
        ),
    },
  },
  async ({
    id,
    path,
    content,
  }: {
    id?: string;
    path?: string;
    content: string;
  }) => {
    const client = getClient();
    let targetId = id;

    if (!targetId && path) {
      const { notebookName, hpath } = parseHPath(path);
      const notebookId = await client.getNotebookIDByName(notebookName);
      const ids = await client.getIDsByHPath(hpath, notebookId || "");
      if (ids && ids.length > 0) targetId = ids[0];
    }

    if (!targetId) {
      return {
        content: [
          {
            type: "text" as const,
            text: "错误：必须提供有效的 id 或 path。建议先使用 find_note 查找文档。",
          },
        ],
      };
    }

    const cleanedContent = stripMetadataAndH1(content);
    const childBlocks = await client.getChildBlocks(targetId);

    if (childBlocks && childBlocks.length > 0) {
      for (const block of childBlocks) {
        try {
          await client.deleteBlock(block.id);
        } catch (_e) {}
      }
    }

    await client.appendBlock(targetId, cleanedContent);

    const finalBlocks = await client.getChildBlocks(targetId);
    if (finalBlocks && finalBlocks.length > 1) {
      const firstBlock = finalBlocks[0];
      if (
        firstBlock.type === "p" &&
        (!firstBlock.markdown || firstBlock.markdown.trim() === "")
      ) {
        try {
          await client.deleteBlock(firstBlock.id);
        } catch (_e) {}
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `✅ 文档内容已成功更新（已清理旧内容并重新写入）。`,
        },
      ],
    };
  },
);

mcpServer.registerTool(
  "read_note_content",
  {
    description:
      "通过文档 ID 精准读取**思源笔记**中的 Markdown 内容。请先使用 find_note 获取目标 ID。\nPrecisely read Markdown content in **SiYuan Note** via Document ID. Use find_note to get ID first.",
    inputSchema: {
      id: z.string().describe("文档的唯一 ID。\nUnique Document ID."),
    },
  },
  async ({ id }: { id: string }) => {
    const client = getClient();
    const markdown = await client.exportMdContent(id);

    return {
      content: [{ type: "text" as const, text: stripMetadata(markdown) }],
    };
  },
);

mcpServer.registerTool(
  "read_note_by_path",
  {
    description:
      "如果你知道完整的笔记路径，可以直接通过路径读取**思源笔记**中的内容。\nIf you know the full note path, you can directly read the content in **SiYuan Note**.",
    inputSchema: {
      path: z
        .string()
        .describe(
          "人类可读的路径（如：'/笔记本/分类/文件名'）。\nHuman-readable path.",
        ),
    },
  },
  async ({ path }: { path: string }) => {
    const client = getClient();
    const { notebookName, hpath } = parseHPath(path);
    const notebookId = await client.getNotebookIDByName(notebookName);

    if (!notebookId) {
      return {
        content: [
          {
            type: "text" as const,
            text: `错误：未找到笔记本 '${notebookName}'。`,
          },
        ],
      };
    }

    const ids = await client.getIDsByHPath(hpath, notebookId);
    if (!ids || ids.length === 0) {
      return {
        content: [
          { type: "text" as const, text: `错误：未找到文档 '${path}'。` },
        ],
      };
    }

    const markdown = await client.exportMdContent(ids[0]);
    return {
      content: [{ type: "text" as const, text: stripMetadata(markdown) }],
    };
  },
);

mcpServer.registerTool(
  "get_tagged_todos",
  {
    description:
      "获取**思源笔记**正文中通过 #TODO# 标签标记的待办事项。\nGet todo items marked with #TODO# tags in the body of **SiYuan Note** documents.",
    inputSchema: {
      scope: z
        .string()
        .optional()
        .describe(
          "缩小范围，可以是笔记本名称或文档标题/路径。\nNarrow search scope, can be notebook name or document title/path.",
        ),
    },
  },
  async ({ scope }: { scope?: string }) => {
    const client = getClient();
    let sql = `
       SELECT * FROM blocks 
       WHERE type IN ('p', 'h', 'c') 
       AND (markdown LIKE '%#TODO#%' OR tag LIKE '%#TODO#%')
     `;

    if (scope) {
      const notebookId = await client.getNotebookIDByName(scope);
      if (notebookId) {
        sql += ` AND box = '${notebookId}'`;
      } else {
        const docSearch = await client.querySql(
          `SELECT path, box FROM blocks WHERE type = 'd' AND content LIKE '%${scope.replace(/'/g, "''")}%' LIMIT 1`,
        );
        if (docSearch.length > 0) {
          const internalPath = getString(docSearch[0], "path").replace(
            ".sy",
            "",
          );
          sql += ` AND path LIKE '${internalPath}%' AND box = '${getString(docSearch[0], "box")}'`;
        }
      }
    }

    sql += " LIMIT 100";
    const result = await client.querySql(sql);

    if (result.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "没有找到通过 #TODO# 标签标记的事项。",
          },
        ],
      };
    }

    const uniqueContent = new Map();
    for (const row of result) {
      let content = getStringOrDefault(row, "content", "");
      content = content.replace(/#TODO#/g, "").trim();
      if (content && !uniqueContent.has(content)) {
        uniqueContent.set(content, {
          hpath: getStringOrDefault(row, "hpath", ""),
          id:
            getStringOrDefault(row, "root_id") ||
            getStringOrDefault(row, "id", ""),
        });
      }
    }

    let output = `找到 ${uniqueContent.size} 条 #TODO# 事项：\n\n`;
    for (const [content, info] of uniqueContent) {
      const lines = content.split("\n");
      const targetLine =
        lines.find((l: string) => l.includes("TODO")) || lines[0];
      const cleanedLine = targetLine.replace(/#.*?#/g, "").trim();
      const title = info.hpath.split("/").pop() || "未命名";
      output += `- [ ] ${cleanedLine} (笔记标题: \`${title}\`, ID: \`${info.id}\`, 路径: \`${info.hpath}\`)\n`;
    }

    return { content: [{ type: "text" as const, text: output }] };
  },
);

mcpServer.registerTool(
  "list_category_notes",
  {
    description:
      "列出**思源笔记**中分类标签（文档属性中定义）为指定值的笔记文档。\nList notes in **SiYuan Note** whose category tag (defined in attributes) matches the value.",
    inputSchema: {
      tag: z
        .string()
        .describe("分类标签名称（不带 #）。\nCategory tag name (without #)."),
    },
  },
  async ({ tag }: { tag: string }) => {
    const client = getClient();
    const escapedTag = tag.replace(/'/g, "''");
    const sql = `
      SELECT content AS title, hpath FROM blocks 
      WHERE type = 'd' 
      AND (tag LIKE '%#${escapedTag}#%' OR ial LIKE '%tags="%${escapedTag}%"%')
      LIMIT 100
    `;
    const result = await client.querySql(sql);

    if (result.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `未找到分类标签为 #${tag}# 的笔记。`,
          },
        ],
      };
    }

    let output = `找到 ${result.length} 篇分类为 #${tag}# 的笔记：\n\n`;
    for (const row of result) {
      const title = row.title || "未命名文档";
      const hpath = row.hpath || "";
      output += `- **${title}** (路径: \`${hpath}\`)\n`;
    }

    return { content: [{ type: "text" as const, text: output }] };
  },
);

mcpServer.registerTool(
  "find_tag_mentions",
  {
    description:
      "在**思源笔记**的正文块（段落、标题等）中查找提及了指定标签的记录。\nFind records mentioning specific tags in the body blocks (paragraphs, headers, etc.) of **SiYuan Note**.",
    inputSchema: {
      tag: z.string().describe("标签名称（不带 #）。\nTag name (without #)."),
      scope: z
        .string()
        .optional()
        .describe(
          "缩小范围，可以是笔记本名称或文档标题/路径。\nNarrow search scope, can be notebook name or document title/path.",
        ),
    },
  },
  async ({ tag, scope }: { tag: string; scope?: string }) => {
    const client = getClient();
    const escapedTag = tag.replace(/'/g, "''");
    let sql = `
       SELECT * FROM blocks 
       WHERE type IN ('p', 'h', 'c') 
       AND (markdown LIKE '%#${escapedTag}#%' OR tag LIKE '%#${escapedTag}#%')
     `;

    if (scope) {
      const notebookId = await client.getNotebookIDByName(scope);
      if (notebookId) {
        sql += ` AND box = '${notebookId}'`;
      } else {
        const docSearch = await client.querySql(
          `SELECT path, box FROM blocks WHERE type = 'd' AND content LIKE '%${scope.replace(/'/g, "''")}%' LIMIT 1`,
        );
        if (docSearch.length > 0) {
          const internalPath = getString(docSearch[0], "path").replace(
            ".sy",
            "",
          );
          sql += ` AND path LIKE '${internalPath}%' AND box = '${getString(docSearch[0], "box")}'`;
        }
      }
    }

    sql += " LIMIT 100";
    const result = await client.querySql(sql);

    if (result.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `在指定范围内未找到提及 #${tag}# 的事项。`,
          },
        ],
      };
    }

    const uniqueContent = new Map();
    for (const row of result) {
      let content = getStringOrDefault(row, "content", "");
      content = content.replace(/#.*?#/g, "").trim();
      if (content && !uniqueContent.has(content)) {
        uniqueContent.set(content, {
          hpath: getStringOrDefault(row, "hpath", ""),
          id:
            getStringOrDefault(row, "root_id") ||
            getStringOrDefault(row, "id", ""),
        });
      }
    }

    let output = `找到 ${uniqueContent.size} 条提及 #${tag}# 的记录：\n\n`;
    for (const [content, info] of uniqueContent) {
      const lines = content.split("\n");
      const targetLine =
        lines.find((l: string) => l.includes(`#${tag}#`)) || lines[0];
      const cleanedLine = targetLine.replace(/#.*?#/g, "").trim();
      const title = info.hpath.split("/").pop() || "未命名";
      output += `- ${cleanedLine.substring(0, 200)} (笔记标题: \`${title}\`, ID: \`${info.id}\`, 路径: \`${info.hpath}\`)\n`;
    }

    return { content: [{ type: "text" as const, text: output }] };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
