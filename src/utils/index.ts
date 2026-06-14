export function getString(row: Record<string, unknown>, key: string): string {
  const val = row[key];
  if (val === null || val === undefined) return "";
  return String(val);
}

export function getStringOrDefault(
  row: Record<string, unknown>,
  key: string,
  defaultValue: string,
): string {
  const val = row[key];
  if (val === null || val === undefined) return defaultValue;
  return String(val);
}

export function escapeSqlLike(value: string): string {
  return value.replace(/'/g, "''").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export function parseHPath(fullPath: string) {
  const parts = fullPath.split("/").filter((p) => p !== "");
  if (parts.length === 0) return { notebookName: "", hpath: "/" };
  const notebookName = parts[0];
  const hpath = `/${parts.slice(1).join("/")}`;
  return { notebookName, hpath };
}

export function stripMetadata(content: string) {
  // Remove YAML frontmatter
  return content.replace(/^---[\s\S]*?---/, "").trim();
}

export function stripMetadataAndH1(content: string) {
  let res = stripMetadata(content);
  // Remove first H1 if it exists
  res = res.replace(/^#\s+.*?\n/, "").trim();
  return res;
}
