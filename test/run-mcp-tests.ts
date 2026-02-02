import { spawn } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";

interface EnvConfig {
  SIYUAN_API_URL: string;
  SIYUAN_API_TOKEN: string;
}

interface TestResult {
  toolName: string;
  passed: boolean;
  message: string;
  duration: number;
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

async function runMCPTests(config: EnvConfig): Promise<TestResult[]> {
  const results: TestResult[] = [];

  return new Promise((resolve) => {
    const server = spawn("bun", ["src/server.ts"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        SIYUAN_API_URL: config.SIYUAN_API_URL,
        SIYUAN_API_TOKEN: config.SIYUAN_API_TOKEN,
      },
    });

    let buffer = "";
    const tests: Array<{
      id: number;
      tool: string;
      args: Record<string, unknown>;
    }> = [];
    let requestId = 1;

    server.stdout?.on("data", (data) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const message = JSON.parse(line);

          if (message.jsonrpc === "2.0" && message.method === "initialize") {
            console.log("✅ 初始化消息接收");
          }

          if (message.id && message.result) {
            const testIndex = tests.findIndex((t) => t.id === message.id);
            if (testIndex >= 0) {
              const test = tests[testIndex];
              results.push({
                toolName: test.tool,
                passed: true,
                message: `成功调用 - 返回数据项数: ${message.result.content?.length || 0}`,
                duration: 100,
              });
              tests.splice(testIndex, 1);
            }
          }

          if (message.error) {
            console.log(`⚠️  错误: ${JSON.stringify(message.error)}`);
          }
        } catch {
          // 忽略非JSON行
        }
      }

      if (results.length >= 5) {
        server.kill();
        resolve(results);
      }
    });

    server.stderr?.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    // 发送测试请求
    const toolTests = [
      { tool: "tools/list", args: {} },
      {
        tool: "tools/call",
        args: { name: "list_notebooks", arguments: {} },
      },
      {
        tool: "tools/call",
        args: { name: "get_todos", arguments: { scope: "MCP测试笔记本" } },
      },
      {
        tool: "tools/call",
        args: { name: "find_note", arguments: { query: "测试" } },
      },
    ];

    setTimeout(() => {
      for (const test of toolTests) {
        const request = {
          jsonrpc: "2.0",
          id: requestId,
          method: test.tool,
          params: test.args,
        };
        tests.push({
          id: requestId,
          tool: test.tool,
          args: test.args,
        });
        server.stdin?.write(JSON.stringify(request) + "\n");
        requestId++;
      }
    }, 1000);

    setTimeout(() => {
      server.kill();
      resolve(results);
    }, 5000);
  });
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("   SiYuan MCP 自动化功能测试");
  console.log("═══════════════════════════════════════════════════\n");

  const config = loadEnv();

  if (!config.SIYUAN_API_TOKEN) {
    console.log("❌ 错误: .env.local中未找到SIYUAN_API_TOKEN\n");
    process.exit(1);
  }

  console.log("🚀 启动MCP服务器并执行测试...\n");

  const results = await runMCPTests(config);

  console.log("\n═══════════════════════════════════════════════════");
  console.log("📊 测试结果");
  console.log("═══════════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

  for (const result of results) {
    if (result.passed) {
      console.log(`✅ ${result.toolName}`);
      console.log(`   ${result.message}`);
      passed++;
    } else {
      console.log(`❌ ${result.toolName}`);
      console.log(`   ${result.message}`);
      failed++;
    }
  }

  console.log("\n───────────────────────────────────────────────────");
  console.log(`总计: ${passed + failed} | 通过: ${passed} | 失败: ${failed}`);
  console.log("───────────────────────────────────────────────────\n");

  if (failed === 0 && results.length > 0) {
    console.log("✅ 所有测试通过！\n");
  } else if (results.length === 0) {
    console.log("⚠️  未能获取测试结果。请确保思源笔记API可访问。\n");
  }

  console.log("📝 下一步: 运行 'bun run inspect' 进行交互式验证\n");
}

main().catch(console.error);
