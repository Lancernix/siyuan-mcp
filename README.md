# SiYuan MCP

An MCP (Model Context Protocol) server for SiYuan Note, enabling AI applications to seamlessly interact with your notes.

## Installation

```bash
pnpm add siyuan-mcp
```

## Development

```bash
git clone https://github.com/Lancernix/siyuan-mcp.git
cd siyuan-mcp
pnpm install
pnpm run dev
```

### Start the server

```bash
pnpm start
```

### Lint and type check

```bash
pnpm run check
```

### Format code

```bash
pnpm run lint
```

### Build

```bash
pnpm run build
```

## Configuration

Create a `.env.local` file with the following variables:

```bash
SIYUAN_API_URL=http://127.0.0.1:6806
SIYUAN_API_TOKEN=your-api-token-here
```

- `SIYUAN_API_URL` - SiYuan API endpoint (default: http://127.0.0.1:6806)
- `SIYUAN_API_TOKEN` - SiYuan API authentication token (required)

## Tools

### Atomic Tools (low-level API wrappers)

**Notebooks** - `list_notebooks`, `open_notebook`, `close_notebook`, `rename_notebook`, `create_notebook`, `remove_notebook`, `get_notebook_conf`, `set_notebook_conf`

**Documents** - `create_doc`, `rename_doc`, `remove_doc`, `move_docs`, `get_hpath_by_path`, `get_hpath_by_id`, `get_ids_by_hpath`, `get_path_by_id`, `rename_doc_by_id`, `remove_doc_by_id`, `move_docs_by_id`

**Blocks** - `insert_block`, `prepend_block`, `append_block`, `update_block`, `delete_block`, `move_block`, `get_block_kramdown`, `get_child_blocks`, `fold_block`, `unfold_block`, `transfer_block_ref`

**Attributes** - `get_block_attrs`, `set_block_attrs`

**Query** - `sql_query`, `flush_transaction`, `export_md_content`

**Files** - `get_file`, `put_file`, `remove_file`, `read_dir`, `rename_file`

**System** - `system_status`, `system_version`, `workspace_info`, `get_current_time`

### Composite Tools (high-level)

- **smart_create_note** - Smartly create a note (auto-match notebook and path)
- **upsert_note_content** - Update or create note content
- **get_todos** - Get uncompleted todo items (`- [ ]` syntax)
- **find_note** - Search document titles by keyword
- **smart_search** - Smart search across document titles and content

## CI/CD

### PR Checks (feature.yaml)

- Code formatting (Biome)
- TypeScript type checking
- Build verification

### Release (main.yaml)

- Automatic versioning with semantic-release
- Publish to NPM

## License

MIT
