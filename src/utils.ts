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
 * 移除 Markdown 开头的 YAML 元数据
 */
export function stripMetadata(md: string): string {
  return md.replace(/^---[\s\S]*?---\n*/, "").trim();
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
