/**
 * 构建验证脚本
 * 验证项目编译、构建和配置是否正确
 */

import { existsSync, statSync } from "fs";
import { execSync } from "child_process";
import { resolve } from "path";

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

function check(condition: boolean, message: string): boolean {
  if (condition) {
    console.log(`${GREEN}✅${RESET} ${message}`);
  } else {
    console.log(`${RED}❌${RESET} ${message}`);
  }
  return condition;
}

function section(title: string) {
  console.log(`\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${CYAN}${title}${RESET}`);
  console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);
}

function main() {
  console.log(`\n${CYAN}🔍 SiYuan MCP 构建验证${RESET}\n`);

  let allPassed = true;

  // 检查环境
  section("环境配置");
  allPassed = allPassed && check(existsSync(".env.local"), "`.env.local` 配置文件存在");
  allPassed = allPassed && check(existsSync("package.json"), "`package.json` 存在");
  allPassed = allPassed && check(existsSync("tsconfig.json"), "`tsconfig.json` 存在");

  // 检查源代码
  section("源代码结构");
  allPassed = allPassed && check(existsSync("src"), "`src/` 目录存在");
  allPassed = allPassed && check(existsSync("src/server.ts"), "`src/server.ts` 文件存在");
  allPassed = allPassed && check(existsSync("src/client.ts"), "`src/client.ts` 文件存在");
  allPassed = allPassed && check(existsSync("src/utils.ts"), "`src/utils.ts` 文件存在");

  // 检查测试
  section("测试文件");
  allPassed = allPassed && check(existsSync("test"), "`test/` 目录存在");
  allPassed = allPassed && check(
    existsSync("test/sql-injection.test.ts"),
    "`test/sql-injection.test.ts` 测试文件存在",
  );

  // 检查构建产物
  section("构建产物");
  const distExists = existsSync("dist/server.js");
  allPassed = allPassed && check(distExists, "`dist/server.js` 构建产物存在");
  if (distExists) {
    const stats = statSync("dist/server.js");
    const sizeKB = (stats.size / 1024).toFixed(0);
    console.log(`   ${CYAN}📦 文件大小: ${sizeKB}KB${RESET}`);
  }

  // 检查TypeScript编译
  section("TypeScript 编译");
  try {
    execSync("bun x tsc --noEmit", { stdio: "pipe" });
    allPassed = allPassed && check(true, "TypeScript 编译通过（0 errors）");
  } catch (error) {
    allPassed = allPassed && check(false, "TypeScript 编译存在错误");
  }

  // 检查依赖
  section("依赖检查");
  const packageJson = require("../package.json");
  allPassed = allPassed && check(
    "@modelcontextprotocol/sdk" in packageJson.dependencies,
    "官方 SDK 已安装 (@modelcontextprotocol/sdk)",
  );
  allPassed = allPassed && check(
    !("fastmcp" in packageJson.dependencies),
    "fastmcp 已移除",
  );

  // 最终结果
  section("验证结果");
  if (allPassed) {
    console.log(`${GREEN}✅ 所有检查通过！${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}❌ 部分检查失败，请查看上面的错误信息${RESET}\n`);
    process.exit(1);
  }
}

main();
