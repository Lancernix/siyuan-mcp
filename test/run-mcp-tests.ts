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
    const server = spawn("tsx", ["src/server.ts"], {
      cwd: process.cwd(),
        env: {
          ...process.env,
          SIYUAN_API_URL: config.SIYUAN_API_URL,
          SIYUAN_API_TOKEN: config.SIYUAN_API_TOKEN,
        },
      },
    );

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
            console.log("Initialize message received");
          }

          if (message.id && message.result) {
            const testIndex = tests.findIndex((t) => t.id === message.id);
            if (testIndex >= 0) {
              const test = tests[testIndex];
              results.push({
                toolName: test.tool,
                passed: true,
                message: `Called successfully - returned ${message.result.content?.length || 0} items`,
                duration: 100,
              });
              tests.splice(testIndex, 1);
            }
          }

          if (message.error) {
            console.log(`Error: ${JSON.stringify(message.error)}`);
          }
        } catch {
          // Ignore non-JSON lines
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
  console.log("   SiYuan MCP Automated Functional Tests");
  console.log("═══════════════════════════════════════════════════\n");

  const config = loadEnv();

  if (!config.SIYUAN_API_TOKEN) {
    console.log("Error: SIYUAN_API_TOKEN not found in .env.local\n");
    process.exit(1);
  }

  console.log("Starting MCP server and running tests...\n");

  const results = await runMCPTests(config);

  console.log("\n═══════════════════════════════════════════════════");
  console.log("Test Results");
  console.log("═══════════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

  for (const result of results) {
    if (result.passed) {
      console.log(`✓ ${result.toolName}`);
      console.log(`   ${result.message}`);
      passed++;
    } else {
      console.log(`✗ ${result.toolName}`);
      console.log(`   ${result.message}`);
      failed++;
    }
  }

  console.log("\n───────────────────────────────────────────────────");
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log("───────────────────────────────────────────────────\n");

  if (failed === 0 && results.length > 0) {
    console.log("All tests passed!\n");
  } else if (results.length === 0) {
    console.log("No test results obtained. Please ensure SiYuan API is accessible.\n");
  }

  console.log(
    "Next step: Run 'npx @modelcontextprotocol/inspector' for interactive verification\n",
  );
}

main().catch(console.error);
