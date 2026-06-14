# SiYuan MCP

思源笔记的 MCP (Model Context Protocol) 服务器，使 AI 应用能够无缝地与笔记交互。

## 开发

```bash
git clone https://github.com/Lancernix/siyuan-mcp.git
cd siyuan-mcp
pnpm install
pnpm run dev
```

### 启动服务器

```bash
pnpm start
```

### 代码检查

```bash
pnpm run check
```

### 代码格式化

```bash
pnpm run lint
```

### 构建

```bash
pnpm run build
```

## 配置

在 `.env.local` 文件中配置以下变量：

```bash
SIYUAN_API_URL=http://127.0.0.1:6806
SIYUAN_API_TOKEN=your-api-token-here
```

- `SIYUAN_API_URL` - 思源笔记 API 地址（默认：http://127.0.0.1:6806）
- `SIYUAN_API_TOKEN` - 思源笔记 API 认证令牌（必需）

## 工具

### 原子工具（直接封装 API）

**笔记本** - `list_notebooks`, `open_notebook`, `close_notebook`, `rename_notebook`, `create_notebook`, `remove_notebook`, `get_notebook_conf`, `set_notebook_conf`

**文档** - `create_doc`, `rename_doc`, `remove_doc`, `move_docs`, `get_hpath_by_path`, `get_hpath_by_id`, `get_ids_by_hpath`, `get_path_by_id`, `rename_doc_by_id`, `remove_doc_by_id`, `move_docs_by_id`

**块** - `insert_block`, `prepend_block`, `append_block`, `update_block`, `delete_block`, `move_block`, `get_block_kramdown`, `get_child_blocks`, `fold_block`, `unfold_block`, `transfer_block_ref`

**属性** - `get_block_attrs`, `set_block_attrs`

**查询** - `sql_query`, `flush_transaction`, `export_md_content`

**文件** - `get_file`, `put_file`, `remove_file`, `read_dir`, `rename_file`

**系统** - `system_status`, `system_version`, `workspace_info`, `get_current_time`

### 组合工具（高层封装）

- **smart_create_note** - 智能创建笔记（自动匹配笔记本和路径）
- **upsert_note_content** - 更新或创建笔记内容
- **get_todos** - 获取未完成的待办事项（`- [ ]` 语法）
- **find_note** - 按关键词搜索文档标题
- **smart_search** - 综合搜索文档标题和正文内容

## CI/CD

### PR 检查 (feature.yaml)

- 代码格式检查 (Biome)
- TypeScript 类型检查
- 构建验证

### 发布流程 (main.yaml)

- 使用 semantic-release 自动版本管理
- 发布到 NPM

## 许可证

MIT
