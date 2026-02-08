# Contributing Guide / 贡献指南

This project welcomes contributions in both English and Chinese. 
本项目欢迎中英文贡献。

- [English Version](#english-version)
- [中文版](#中文版)

---

## English Version

### 🚀 Quick Start

#### Requirements
- [Bun](https://bun.sh/) >= 1.3.0
- Git
- SiYuan Note (for local testing)

#### Local Development Setup
1. Fork and clone the repository
2. `bun install`
3. `cp .env.example .env.local` and fill in your SiYuan API token
4. `bun run dev`

### 📝 Development Workflow

We follow the standard **GitHub Flow**:
1. Create a feature branch: `git checkout -b feature/xxx`
2. Develop and verify locally: `bun run lint`, `bun run build`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` for new features (MINOR)
   - `fix:` for bug fixes (PATCH)
   - `feat!:` for breaking changes (MAJOR)
4. Push and create a Pull Request
5. Wait for CI checks (Lint + Build) to pass
6. Merge after review

### 🎨 Code Style
We use [Biome](https://biomejs.dev/) for formatting and linting:
- Indent: 2 spaces
- Quotes: Double
- Semis: No
- Trailing commas: All
