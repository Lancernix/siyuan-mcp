# SiYuan MCP

一个为思源笔记设计的 MCP (Model Context Protocol) 服务器，使 AI 应用能够无缝地与你的笔记交互。

本服务器实现了 10 个工具，用于笔记操作，包括列出笔记本、查找笔记、创建/更新内容、读取笔记、管理待办事项和按标签搜索。

## 安装

```bash
npm install siyuan-mcp
```

或使用 bun：

```bash
bun install siyuan-mcp
```

## 开发

首先克隆仓库并安装依赖。

```bash
git clone https://github.com/yourusername/siyuan-mcp.git
cd siyuan-mcp
bun install
bun run dev
```

### 启动服务器

```bash
bun run start
```

### 使用 MCP Inspector 检查

要以交互方式测试服务器，请使用 MCP Inspector：

```bash
bun run inspect
```

这将启动带有 MCP Inspector 界面的服务器。

### 代码检查

```bash
bun run lint
```

### 代码格式化

```bash
bun run format
```

### 构建

```bash
bun run build
```

构建输出经过优化和压缩，产生约 450KB 的包。

### 测试

项目包含用于功能验证的综合测试。

#### 运行所有测试

```bash
bun test test/
```

#### 运行所有检查

```bash
bun run lint
```

这将运行代码检查和 TypeScript 类型检查。

#### 测试覆盖范围

- **类型安全** - TypeScript 编译检查确保项目的类型安全
- **代码质量** - 使用 Biome 进行代码质量检查

## GitHub Actions

此仓库有一个 GitHub Actions 工作流，它运行代码检查并使用 [semantic-release](https://semantic-release.gitbook.io/semantic-release/) 将包更新发布到 NPM。

要启用发布，请进行以下设置：

1. 在仓库机密中添加 `NPM_TOKEN`
2. 授予工作流写入权限（设置 → Actions → General → Workflow permissions → "Read and write permissions"）

## 工具

服务器实现了以下工具：

- **list_notebooks** - 列出思源中的所有笔记本
- **get_todos** - 获取未完成的待办事项
- **find_note** - 按标题搜索笔记
- **create_note** - 创建新笔记，具有智能路径匹配
- **update_note_content** - 完全更新笔记内容
- **read_note_content** - 按 ID 读取笔记内容
- **read_note_by_path** - 按路径读取笔记内容
- **get_tagged_todos** - 获取标记为 #TODO# 标签的项目
- **list_category_notes** - 列出具有特定类别标签的笔记
- **find_tag_mentions** - 查找对特定标签的引用

## 配置

### 环境变量

在 `.env.local` 文件中配置以下变量：

```bash
SIYUAN_API_URL=http://127.0.0.1:6806
SIYUAN_API_TOKEN=your-api-token-here
```

- `SIYUAN_API_URL` - 思源笔记 API 的地址（默认：http://127.0.0.1:6806）
- `SIYUAN_API_TOKEN` - 思源笔记的 API 认证令牌（必需）

## 快速开始

1. **安装依赖**
   ```bash
   bun install
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 并添加你的 API Token
   ```

3. **启动开发服务器**
   ```bash
   bun run dev
   ```

4. **使用 MCP Inspector 测试**
   ```bash
   bun run inspect
   ```

5. **构建生产版本**
   ```bash
   bun run build
   ```

## 项目结构

```
siyuan-mcp/
├── src/
│   ├── server.ts       # MCP 服务器实现
│   ├── client.ts       # 思源 API 客户端
│   └── utils.ts        # 工具函数
├── test/
│   ├── run-mcp-tests.ts     # MCP 工具测试
│   └── test-tools.ts        # 测试工具库
├── dist/               # 编译输出
├── package.json
├── tsconfig.json
└── README.md
```

## 许可证

MIT
