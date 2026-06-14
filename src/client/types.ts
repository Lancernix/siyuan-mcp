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

export interface SqlRow {
  [key: string]: unknown;
}

export interface BlockRow extends Block {}

export interface BlockOperationResult {
  id: string;
  [key: string]: unknown;
}

export interface ExportResult {
  hPath: string;
  content: string;
}
