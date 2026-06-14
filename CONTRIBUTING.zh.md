# 贡献指南

## 快速开始

### 环境要求
- Node.js >= 24.0.0
- pnpm >= 11.0.0
- Git

### 本地开发设置
1. Fork 并克隆仓库
2. `pnpm install`
3. `cp .env.example .env.local` 并填入你的思源笔记 API Token
4. `pnpm run dev`

## 开发流程

我们采用标准的 **GitHub Flow** 工作流：

1. **创建分支**：从 `main` 创建功能分支 `feature/xxx`
2. **本地开发**：
   - 使用 `pnpm run check` 检查代码
   - 使用 `pnpm run build` 验证构建
3. **提交代码**：遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
   - `feat:` 新功能
   - `fix:` Bug 修复
   - `docs:` 文档更新
   - `feat!:` 不兼容变更
4. **创建 PR**：推送到 GitHub 并创建 Pull Request
5. **CI 检查**：确保所有自动化检查通过
6. **合并发布**：PR 合并后会自动触发版本发布

## 代码风格
项目使用 [Biome](https://biomejs.dev/) 进行代码管理。
- 缩进：2 空格
- 分号：不使用
- 尾逗号：始终添加
