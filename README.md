# SiYuan MCP

An MCP (Model Context Protocol) server for SiYuan Note, enabling AI applications to seamlessly interact with your notes.

This server implements 10 tools for note operations including listing notebooks, finding notes, creating/updating content, reading notes, managing TODOs, and searching by tags.

## Installation

```bash
npm install siyuan-mcp
```

Or use with bun:

```bash
bun install siyuan-mcp
```

## Development

To get started, clone the repository and install the dependencies.

```bash
git clone https://github.com/yourusername/siyuan-mcp.git
cd siyuan-mcp
bun install
bun run dev
```

### Start the server

```bash
bun run start
```

### Inspect with MCP Inspector

To test the server interactively, use MCP Inspector:

```bash
bun run inspect
```

This will start the server with the MCP Inspector interface.

### Linting

```bash
bun run lint
```

### Formatting

```bash
bun run format
```

### Building

```bash
bun run build
```

The build output is optimized and minified, resulting in a ~450KB bundle.

### Testing

The project includes comprehensive tests for functionality verification.

#### Run All Tests

```bash
bun run lint
```

This runs linting and TypeScript type checking.

#### Test Coverage

- **Type Safety** - TypeScript compilation ensures type safety throughout
- **Linting** - Code quality checks with Biome

## GitHub Actions

This repository has a GitHub Actions workflow that runs linting and publishes package updates to NPM using [semantic-release](https://semantic-release.gitbook.io/semantic-release/).

To enable publishing, set up:

1. Add `NPM_TOKEN` to the repository secrets
2. Grant write access to the workflow (Settings → Actions → General → Workflow permissions → "Read and write permissions")

## Tools

The server implements the following tools:

- **list_notebooks** - List all notebooks in SiYuan
- **get_todos** - Get uncompleted TODO items
- **find_note** - Search for notes by title
- **create_note** - Create new notes with intelligent path matching
- **update_note_content** - Update note content completely
- **read_note_content** - Read note content by ID
- **read_note_by_path** - Read note content by path
- **get_tagged_todos** - Get items marked with #TODO# tag
- **list_category_notes** - List notes with specific category tags
- **find_tag_mentions** - Find references to specific tags
