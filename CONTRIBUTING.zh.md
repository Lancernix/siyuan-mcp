# 贡献指南

感谢你对 SiYuan MCP 的关注！本项目欢迎各种形式的贡献。

## 🚀 快速开始

### 环境要求
- [Bun](https://bun.sh/) >= 1.3.0
- Git
- 思源笔记（用于本地测试）

### 本地开发设置
1. Fork 并克隆仓库
2. `bun install`
3. `cp .env.example .env.local` 并填入你的思源笔记 API Token
4. `bun run dev`

## 📝 开发流程

我们采用标准的 **GitHub Flow** 工作流：

1. **创建分支**：从 `main` 创建功能分支 `feature/xxx`
2. **本地开发**：
   - 使用 `bun run lint` 检查代码
   - 使用 `bun run build` 验证构建
3. **提交代码**：遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
   - `feat:` 新功能
   - `fix:` Bug 修复
   - `docs:` 文档更新
   - `feat!:` 不兼容变更
4. **创建 PR**：推送到 GitHub 并创建 Pull Request
5. **CI 检查**：确保所有自动化检查通过
6. **合并发布**：PR 合并后会自动触发版本发布

## 🎨 代码风格
项目使用 [Biome](https://biomejs.dev/) 进行代码管理。
- 缩进：2 空格
- 分号：不使用
- 尾逗号：始终添加

更多详情请参考英文版 [CONTRIBUTING.md](./CONTRIBUTING.md)。
