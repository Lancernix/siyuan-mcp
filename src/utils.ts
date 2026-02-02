import type { SqlRow } from "./client";

/**
 * 辅助函数：解析路径，例如 "/笔记本名/文件夹/笔记"
 * 返回 { notebookName, hpath }
 */
export function parseHPath(path: string) {
  const parts = path.split("/").filter((p) => p.length > 0);
  if (parts.length === 0) return { notebookName: "", hpath: "/" };
  return {
    notebookName: parts[0],
    hpath: `/${parts.slice(1).join("/")}`,
  };
}

/**
 * 移除 Markdown 开头的 YAML 元数据和第一个 H1 标题
 */
export function stripMetadataAndH1(md: string): string {
  // 1. 先移除元数据
  let content = md.replace(/^---[\s\S]*?---\n*/, "").trim();
  // 2. 如果第一行是 H1 (# 开头)，移除它及其后的空行
  if (content.startsWith("# ")) {
    content = content.replace(/^#\s+.*\n*/, "").trim();
  }
  return content;
}

/**
 * 移除 Markdown 开头的 YAML 元数据
 */
export function stripMetadata(md: string): string {
  return md.replace(/^---[\s\S]*?---\n*/, "").trim();
}

/**
 * SQL 行的类型安全访问函数
 * 用于安全地从 SqlRow 中提取字符串值
 */

/**
 * 获取字符串值，如果不存在则返回默认值
 */
export function getStringOrDefault(
  row: SqlRow,
  key: string,
  defaultValue: string = "",
): string {
  const value = row[key];
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  return defaultValue;
}

/**
 * 获取字符串值，如果不存在或无法转换则抛出错误
 */
export function getString(row: SqlRow, key: string): string {
  const value = row[key];
  if (typeof value === "string") return value;
  if (value === null || value === undefined) {
    throw new Error(`Expected string at key "${key}", got ${value}`);
  }
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  throw new Error(`Cannot convert ${typeof value} to string at key "${key}"`);
}
