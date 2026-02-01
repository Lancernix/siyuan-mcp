export interface SiyuanConfig {
  apiUrl: string;
  apiToken: string;
}

export interface Notebook {
  id: string;
  name: string;
  icon: string;
  sort: number;
  closed: boolean;
}

export interface Doc {
  id: string;
  title: string;
  type: string;
  subtype: string;
  content: string;
  path: string;
  icon: string;
  sort: number;
  closed: boolean;
  leaf: boolean;
  bookmark: string;
  name: string;
}

export interface Block {
  id: string;
  parent_id: string;
  root_id: string;
  hash: string;
  box: string;
  path: string;
  hpath: string;
  name: string;
  alias: string;
  memo: string;
  tag: string;
  content: string;
  fcontent: string;
  markdown: string;
  type: string;
  subtype: string;
  ial: string;
  sort: number;
  created: string;
  updated: string;
}

export interface SqlResult {
  columns: string[];
  rows: any[][];
}

export interface ExportResult {
  hPath: string;
  content: string;
}

export class SiyuanClient {
  private config: SiyuanConfig;

  constructor(config: SiyuanConfig) {
    this.config = config;
  }

  private async request<T>(
    path: string,
    params: Record<string, unknown>,
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

  async listNotebooks(): Promise<Notebook[]> {
    const result = await this.request<{ notebooks: Notebook[] }>(
      "/api/notebook/lsNotebooks",
      {},
    );
    return result.notebooks;
  }

  async getNotebookIDByName(name: string): Promise<string | null> {
    const notebooks = await this.listNotebooks();
    const nb = notebooks.find((n) => n.name === name);
    return nb ? nb.id : null;
  }

  async listDocsByPath(path: string): Promise<Doc[]> {
    return this.request<Doc[]>("/api/filetree/listDocsByPath", { path });
  }

  async getIDsByHPath(path: string, notebook: string): Promise<string[]> {
    return this.request<string[]>("/api/filetree/getIDsByHPath", {
      path,
      notebook,
    });
  }

  async getHPathByID(id: string): Promise<string> {
    return this.request<string>("/api/filetree/getHPathByID", { id });
  }

  async exportMdContent(id: string): Promise<string> {
    const result = await this.request<ExportResult>(
      "/api/export/exportMdContent",
      { id },
    );
    return result.content;
  }

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

  async appendBlock(parentID: string, markdown: string): Promise<any> {
    return this.request<any>("/api/block/appendBlock", {
      parentID,
      data: markdown,
      dataType: "markdown",
    });
  }

  async prependBlock(parentID: string, markdown: string): Promise<any> {
    return this.request<any>("/api/block/prependBlock", {
      parentID,
      data: markdown,
      dataType: "markdown",
    });
  }

  async updateBlock(id: string, markdown: string): Promise<any> {
    return this.request<any>("/api/block/updateBlock", {
      id,
      data: markdown,
      dataType: "markdown",
    });
  }

  async deleteBlock(id: string): Promise<any> {
    return this.request<any>("/api/block/deleteBlock", { id });
  }

  async getChildBlocks(id: string): Promise<any[]> {
    return this.request<any[]>("/api/block/getChildBlocks", { id });
  }

  async getBlockAttrs(id: string): Promise<Record<string, string>> {
    return this.request<Record<string, string>>("/api/attr/getBlockAttrs", {
      id,
    });
  }

  async setBlockAttrs(
    id: string,
    attrs: Record<string, string>,
  ): Promise<void> {
    await this.request<void>("/api/attr/setBlockAttrs", { id, attrs });
  }

  async querySql(sql: string): Promise<any[]> {
    return this.request<any[]>("/api/query/sql", { stmt: sql });
  }
}

let clientInstance: SiyuanClient | null = null;

export function getClient(): SiyuanClient {
  if (!clientInstance) {
    const apiUrl = process.env.SIYUAN_API_URL || "http://127.0.0.1:6806";
    const apiToken = process.env.SIYUAN_API_TOKEN;

    if (!apiToken) {
      throw new Error(
        "SIYUAN_API_TOKEN environment variable is not set. Please set it before running the server.",
      );
    }

    clientInstance = new SiyuanClient({ apiUrl, apiToken });
  }

  return clientInstance;
}

export function initClient(config: SiyuanConfig): SiyuanClient {
  clientInstance = new SiyuanClient(config);
  return clientInstance;
}
