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
  console.log("Environment config check");
  console.log(`API URL: ${config.SIYUAN_API_URL}`);
  console.log(`Token set: ${config.SIYUAN_API_TOKEN ? "yes" : "no"}\n`);

  try {
    console.log("Testing API connection...");
    const response = await fetch(
      `${config.SIYUAN_API_URL}/api/system/version`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${config.SIYUAN_API_TOKEN}`,
        },
      },
    );

    if (!response.ok) {
      console.log(`API connection failed: ${response.status} ${response.statusText}`);
      return false;
    }

    const data = (await response.json()) as Record<string, unknown>;
    console.log("API connection successful");
    console.log(`SiYuan version: ${data.data}\n`);
    return true;
  } catch (error) {
    console.log(`API connection error: ${error}\n`);
    return false;
  }
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("   SiYuan MCP Migration Verification");
  console.log("═══════════════════════════════════════\n");

  const config = loadEnv();

  if (!config.SIYUAN_API_TOKEN) {
    console.log("Error: SIYUAN_API_TOKEN not found in .env.local");
    console.log("Please configure .env.local according to .env.example\n");
    process.exit(1);
  }

  const apiOk = await testAPI(config);
  if (!apiOk) {
    console.log("SiYuan API unavailable. Please ensure:");
    console.log("1. SiYuan desktop app is running");
    console.log("2. API URL is correct (default: http://127.0.0.1:6806)");
    console.log("3. Token is correct\n");
    process.exit(1);
  }

  console.log("═══════════════════════════════════════");
  console.log("Basic connection verification complete");
  console.log("═══════════════════════════════════════");
  console.log("\nTest summary:");
  console.log("✓ Environment config");
  console.log("✓ API connection");
  console.log("\nNext step:");
  console.log(
    "Run 'npx @modelcontextprotocol/inspector' to interactively test all tools\n",
  );
}

main().catch(console.error);
