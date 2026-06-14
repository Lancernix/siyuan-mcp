import type {
  BlockOperationResult,
  BlockRow,
  ExportResult,
  Notebook,
  SiyuanConfig,
  SqlRow,
} from "./types.js";

export class SiyuanClient {
  private config: SiyuanConfig;

  constructor(config: SiyuanConfig) {
    this.config = config;
  }

  private async request<T>(
    path: string,
    params: Record<string, unknown> = {},
  ): Promise<T> {
    const response = await fetch(`${this.config.apiUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${this.config.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(
        `SiYuan HTTP Error: ${response.status} ${response.statusText}`,
      );
    }

    const { code, msg, data } = (await response.json()) as {
      code: number;
      msg: string;
      data: T;
    };

    if (code !== 0) {
      throw new Error(`SiYuan API Error [${code}]: ${msg}`);
    }

    return data;
  }

  // --- Notebook APIs ---
  async listNotebooks(): Promise<Notebook[]> {
    const result = await this.request<{ notebooks: Notebook[] }>(
      "/api/notebook/lsNotebooks",
    );
    return result.notebooks;
  }

  async getNotebookIDByName(name: string): Promise<string | null> {
    const notebooks = await this.listNotebooks();
    const nb = notebooks.find((n) => n.name === name);
    return nb ? nb.id : null;
  }

  async openNotebook(notebook: string): Promise<void> {
    await this.request("/api/notebook/openNotebook", { notebook });
  }

  async closeNotebook(notebook: string): Promise<void> {
    await this.request("/api/notebook/closeNotebook", { notebook });
  }

  async renameNotebook(notebook: string, name: string): Promise<void> {
    await this.request("/api/notebook/renameNotebook", { notebook, name });
  }

  async createNotebook(name: string): Promise<{ notebook: Notebook }> {
    return this.request<{ notebook: Notebook }>(
      "/api/notebook/createNotebook",
      { name },
    );
  }

  async removeNotebook(notebook: string): Promise<void> {
    await this.request("/api/notebook/removeNotebook", { notebook });
  }

  async getNotebookConf(notebook: string): Promise<unknown> {
    return this.request("/api/notebook/getNotebookConf", { notebook });
  }

  async setNotebookConf(notebook: string, conf: unknown): Promise<void> {
    await this.request("/api/notebook/setNotebookConf", { notebook, conf });
  }

  // --- Document APIs ---
  async createDocWithMd(
    notebook: string,
    path: string,
    markdown: string,
  ): Promise<string> {
    return this.request<string>("/api/filetree/createDocWithMd", {
      notebook,
      path,
      markdown,
    });
  }

  async renameDoc(
    notebook: string,
    path: string,
    title: string,
  ): Promise<void> {
    await this.request("/api/filetree/renameDoc", { notebook, path, title });
  }

  async removeDoc(notebook: string, path: string): Promise<void> {
    await this.request("/api/filetree/removeDoc", { notebook, path });
  }

  async moveDocs(
    fromPaths: string[],
    toNotebook: string,
    toPath: string,
  ): Promise<void> {
    await this.request("/api/filetree/moveDocs", {
      fromPaths,
      toNotebook,
      toPath,
    });
  }

  async renameDocByID(id: string, title: string): Promise<void> {
    await this.request("/api/filetree/renameDocByID", { id, title });
  }

  async removeDocByID(id: string): Promise<void> {
    await this.request("/api/filetree/removeDocByID", { id });
  }

  async moveDocsByID(fromIDs: string[], toID: string): Promise<void> {
    await this.request("/api/filetree/moveDocsByID", { fromIDs, toID });
  }

  async getHPathByPath(notebook: string, path: string): Promise<string> {
    return this.request<string>("/api/filetree/getHPathByPath", {
      notebook,
      path,
    });
  }

  async getHPathByID(id: string): Promise<string> {
    return this.request<string>("/api/filetree/getHPathByID", { id });
  }

  async getIDsByHPath(path: string, notebook: string): Promise<string[]> {
    return this.request<string[]>("/api/filetree/getIDsByHPath", {
      path,
      notebook,
    });
  }

  async getPathByID(id: string): Promise<{ notebook: string; path: string }> {
    return this.request<{ notebook: string; path: string }>(
      "/api/filetree/getPathByID",
      { id },
    );
  }

  // --- Block APIs ---
  async insertBlock(
    data: string,
    dataType: "markdown" | "dom" = "markdown",
    nextID?: string,
    previousID?: string,
    parentID?: string,
  ): Promise<BlockOperationResult[]> {
    return this.request<BlockOperationResult[]>("/api/block/insertBlock", {
      data,
      dataType,
      nextID,
      previousID,
      parentID,
    });
  }

  async prependBlock(
    parentID: string,
    data: string,
    dataType: "markdown" | "dom" = "markdown",
  ): Promise<BlockOperationResult[]> {
    return this.request<BlockOperationResult[]>("/api/block/prependBlock", {
      parentID,
      data,
      dataType,
    });
  }

  async appendBlock(
    parentID: string,
    data: string,
    dataType: "markdown" | "dom" = "markdown",
  ): Promise<BlockOperationResult[]> {
    return this.request<BlockOperationResult[]>("/api/block/appendBlock", {
      parentID,
      data,
      dataType,
    });
  }

  async updateBlock(
    id: string,
    data: string,
    dataType: "markdown" | "dom" = "markdown",
  ): Promise<BlockOperationResult[]> {
    return this.request<BlockOperationResult[]>("/api/block/updateBlock", {
      id,
      data,
      dataType,
    });
  }

  async deleteBlock(id: string): Promise<void> {
    await this.request("/api/block/deleteBlock", { id });
  }

  async moveBlock(
    id: string,
    previousID?: string,
    parentID?: string,
  ): Promise<BlockOperationResult[]> {
    return this.request<BlockOperationResult[]>("/api/block/moveBlock", {
      id,
      previousID,
      parentID,
    });
  }

  async getBlockKramdown(
    id: string,
  ): Promise<{ id: string; kramdown: string }> {
    return this.request<{ id: string; kramdown: string }>(
      "/api/block/getBlockKramdown",
      { id },
    );
  }

  async getChildBlocks(id: string): Promise<BlockRow[]> {
    return this.request<BlockRow[]>("/api/block/getChildBlocks", { id });
  }

  async foldBlock(id: string): Promise<void> {
    await this.request("/api/block/foldBlock", { id });
  }

  async unfoldBlock(id: string): Promise<void> {
    await this.request("/api/block/unfoldBlock", { id });
  }

  async transferBlockRef(
    fromID: string,
    toID: string,
    refIDs?: string[],
  ): Promise<void> {
    await this.request("/api/block/transferBlockRef", { fromID, toID, refIDs });
  }

  // --- Attribute APIs ---
  async getBlockAttrs(id: string): Promise<Record<string, string>> {
    return this.request<Record<string, string>>("/api/attr/getBlockAttrs", {
      id,
    });
  }

  async setBlockAttrs(
    id: string,
    attrs: Record<string, unknown>,
  ): Promise<void> {
    await this.request<void>("/api/attr/setBlockAttrs", { id, attrs });
  }

  // --- SQL & Search APIs ---
  async querySql(sql: string): Promise<SqlRow[]> {
    return this.request<SqlRow[]>("/api/query/sql", { stmt: sql });
  }

  async flushTransaction(): Promise<void> {
    await this.request("/api/sqlite/flushTransaction");
  }

  // --- Export APIs ---
  async exportMdContent(id: string): Promise<ExportResult> {
    return this.request<ExportResult>("/api/export/exportMdContent", { id });
  }

  async exportResources(
    paths: string[],
    name?: string,
  ): Promise<{ path: string }> {
    return this.request<{ path: string }>("/api/export/exportResources", {
      paths,
      name,
    });
  }

  // --- Template APIs ---
  async renderTemplate(
    id: string,
    path: string,
  ): Promise<{ content: string; path: string }> {
    return this.request<{ content: string; path: string }>(
      "/api/template/render",
      { id, path },
    );
  }

  async renderSprig(template: string): Promise<string> {
    return this.request<string>("/api/template/renderSprig", { template });
  }

  // --- File APIs ---
  async getFile(path: string): Promise<Response> {
    const response = await fetch(`${this.config.apiUrl}/api/file/getFile`, {
      method: "POST",
      headers: {
        Authorization: `Token ${this.config.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
    });
    return response;
  }

  async putFile(
    path: string,
    file: Blob | string,
    isDir = false,
  ): Promise<void> {
    const formData = new FormData();
    formData.append("path", path);
    formData.append("file", file);
    formData.append("isDir", isDir.toString());

    const response = await fetch(`${this.config.apiUrl}/api/file/putFile`, {
      method: "POST",
      headers: {
        Authorization: `Token ${this.config.apiToken}`,
      },
      body: formData,
    });

    const result = (await response.json()) as {
      code: number;
      msg: string;
      [key: string]: unknown;
    };
    if (result.code !== 0) {
      throw new Error(`SiYuan API Error [${result.code}]: ${result.msg}`);
    }
  }

  async removeFile(path: string): Promise<void> {
    await this.request("/api/file/removeFile", { path });
  }

  async readDir(path: string): Promise<unknown> {
    return this.request("/api/file/readDir", { path });
  }

  async renameFile(path: string, newPath: string): Promise<void> {
    await this.request("/api/file/renameFile", { path, newPath });
  }

  // --- Asset APIs ---
  async uploadAsset(assetsDirPath: string, files: unknown[]): Promise<unknown> {
    const formData = new FormData();
    formData.append("assetsDirPath", assetsDirPath);
    for (const file of files) {
      formData.append("file[]", file as Blob);
    }

    const response = await fetch(`${this.config.apiUrl}/api/asset/upload`, {
      method: "POST",
      headers: {
        Authorization: `Token ${this.config.apiToken}`,
      },
      body: formData,
    });

    const result = (await response.json()) as {
      code: number;
      msg: string;
      data: unknown;
    };
    if (result.code !== 0) {
      throw new Error(`SiYuan API Error [${result.code}]: ${result.msg}`);
    }
    return result.data;
  }

  // --- System APIs ---
  async systemStatus(): Promise<unknown> {
    return this.request("/api/system/status");
  }

  async version(): Promise<string> {
    return this.request<string>("/api/system/version");
  }

  async currentTime(): Promise<number> {
    return this.request<number>("/api/system/currentTime");
  }

  async workspaceInfo(): Promise<unknown> {
    return this.request("/api/system/getWorkspaces");
  }
}

let clientInstance: SiyuanClient | null = null;

export function getClient(): SiyuanClient {
  if (!clientInstance) {
    const apiUrl = process.env.SIYUAN_API_URL || "http://127.0.0.1:6806";
    const apiToken = process.env.SIYUAN_API_TOKEN;

    if (!apiToken) {
      throw new Error("SIYUAN_API_TOKEN environment variable is not set.");
    }

    clientInstance = new SiyuanClient({ apiUrl, apiToken });
  }
  return clientInstance;
}
