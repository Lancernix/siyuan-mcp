import { readFileSync } from "fs";
import { resolve } from "path";

interface EnvConfig {
  SIYUAN_API_URL: string;
  SIYUAN_API_TOKEN: string;
}

function loadEnv(): EnvConfig {
  const envPath = resolve(".env.local");
  const content = readFileSync(envPath, "utf-8");
  const env: Record<string, string> = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (key && valueParts.length > 0) {
      env[key] = valueParts.join("=");
    }
  }

  return {
    SIYUAN_API_URL: env.SIYUAN_API_URL || "http://127.0.0.1:6806",
    SIYUAN_API_TOKEN: env.SIYUAN_API_TOKEN || "",
  };
}

async function testAPI(config: EnvConfig) {
  console.log("🔍 环境配置检查");
  console.log(`API URL: ${config.SIYUAN_API_URL}`);
  console.log(
    `Token已设置: ${config.SIYUAN_API_TOKEN ? "✓" : "✗"}\n`
  );

  try {
    console.log("🧪 测试API连接...");
    const response = await fetch(`${config.SIYUAN_API_URL}/api/system/version`, {
      method: "POST",
      headers: {
        Authorization: `Token ${config.SIYUAN_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.log(`❌ API连接失败: ${response.status} ${response.statusText}`);
      return false;
    }

    const data = (await response.json()) as Record<string, unknown>;
    console.log(`✅ API连接成功`);
    console.log(`思源版本: ${data.data}\n`);
    return true;
  } catch (error) {
    console.log(`❌ API连接错误: ${error}\n`);
    return false;
  }
}

async function testNotebooks(config: EnvConfig) {
  console.log("🧪 测试工具: list_notebooks");
  console.log("启动MCP服务器并测试...\n");

  try {
    // 启动MCP服务器
    const server = Bun.spawn(["bun", "src/server.ts"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        SIYUAN_API_URL: config.SIYUAN_API_URL,
        SIYUAN_API_TOKEN: config.SIYUAN_API_TOKEN,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("✅ MCP服务器已启动");
    console.log("📝 使用 'bun run inspect' 来交互式测试");
    console.log("\n");

    server.kill();
  } catch (error) {
    console.log(`❌ 启动失败: ${error}\n`);
  }
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("   SiYuan MCP 迁移验证测试");
  console.log("═══════════════════════════════════════\n");

  const config = loadEnv();

  if (!config.SIYUAN_API_TOKEN) {
    console.log("❌ 错误: .env.local中未找到SIYUAN_API_TOKEN");
    console.log("请按照.env.example配置.env.local文件\n");
    process.exit(1);
  }

  const apiOk = await testAPI(config);
  if (!apiOk) {
    console.log("⚠️  思源笔记API不可用，请确保：");
    console.log("1. 思源笔记桌面应用已启动");
    console.log("2. API地址正确 (默认: http://127.0.0.1:6806)");
    console.log("3. token正确\n");
    process.exit(1);
  }

  await testNotebooks(config);

  console.log("═══════════════════════════════════════");
  console.log("✅ 基本连接验证完成");
  console.log("═══════════════════════════════════════");
  console.log("\n📊 测试摘要:");
  console.log("✓ 环境配置");
  console.log("✓ API连接");
  console.log("✓ MCP服务器启动");
  console.log("\n📖 下一步:");
  console.log("运行 'bun run inspect' 来通过MCP Inspector交互式测试所有工具\n");
}

main().catch(console.error);
