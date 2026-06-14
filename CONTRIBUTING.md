# Contributing Guide

## Quick Start

### Requirements
- Node.js >= 24.0.0
- pnpm >= 11.0.0
- Git

### Local Development Setup
1. Fork and clone the repository
2. `pnpm install`
3. `cp .env.example .env.local` and fill in your SiYuan API token
4. `pnpm run dev`

## Development Workflow

We follow the standard **GitHub Flow**:
1. Create a feature branch: `git checkout -b feature/xxx`
2. Develop and verify locally: `pnpm run check`, `pnpm run build`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` for new features (MINOR)
   - `fix:` for bug fixes (PATCH)
   - `feat!:` for breaking changes (MAJOR)
4. Push and create a Pull Request
5. Wait for CI checks (Lint + Build) to pass
6. Merge after review

## Code Style
We use [Biome](https://biomejs.dev/) for formatting and linting:
- Indent: 2 spaces
- Quotes: Double
- Semis: No
- Trailing commas: All
