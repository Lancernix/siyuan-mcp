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

This repository uses GitHub Actions for a complete CI/CD workflow:

### PR Checks (feature.yaml)

When you create a Pull Request, it automatically runs:
- ✅ Code linting (Biome)
- ✅ TypeScript type checking
- ✅ Build verification

### Release Process (main.yaml)

When merged into the `main` branch, it triggers:
- 📦 Automated versioning with [semantic-release](https://semantic-release.gitbook.io/)
- 🏷️ Automatic generation of version numbers and Release Notes based on commits
- 📤 Publishing to NPM (using OIDC Trusted Publishing, no manual token required)
- ✨ Automatic generation of Provenance proof (software supply chain security)

### Commit Message Convention

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat: xxx` - New feature (triggers minor version update)
- `fix: xxx` - Bug fix (triggers patch version update)
- `feat!: xxx` or `BREAKING CHANGE:` - Breaking change (triggers major version update)
- `docs: xxx`, `chore: xxx`, etc. - Maintenance (no release)

Detailed contribution guidelines can be found in [CONTRIBUTING.md](./CONTRIBUTING.md).

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
