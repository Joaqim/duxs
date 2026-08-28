#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { fetchJson } from "fetch-json";

interface SpecConfig {
  url?: string;
  specFile: string;
}

const BASE = "src/ongoing-wms-api";

const SPECS: Record<string, SpecConfig> = {
  client: { specFile: "client.json" },
  articles: { specFile: "articles.json" },
  orders: { specFile: "orders.json" },
};

const createSpecPath = ({ specFile }: SpecConfig) => `${BASE}/${specFile}`;

async function downloadSpec(name: string, config: SpecConfig): Promise<string> {
  const specPath = createSpecPath(config);
  console.log(`Fetching ${name} spec from ${config.url}`);
  const data = await fetchJson.get(config.url);
  return await writeFile(specPath, JSON.stringify(data, null, 2));
}

function generateTypes(name: string, specPath: string): void {
  const outputPath = `${BASE}/gen/${name}.d.ts`;
  console.log(`Generating ${name} -> ${outputPath}`);
  // openapi-typescript peer dependancy 'typescript' will probably conflict
  // with ours, so we use npx instead of install  openapi-typescript implicitly
  // as a dev dependency
  execFileSync("npx", ["openapi-typescript", specPath, "-o", outputPath], {
    stdio: "inherit",
  });
}

async function run(name: string): Promise<void> {
  const config = SPECS[name];
  if (!config) {
    console.error(
      `Unknown spec "${name}". Available: ${Object.keys(SPECS).join(", ")}`,
    );
    process.exit(1);
  }
  const specPath = createSpecPath(config);
  if (config.url) {
    await downloadSpec(name, config);
  }
  generateTypes(name, specPath);
}

const arg = process.argv[2];
const targets = arg === "all" ? Object.keys(SPECS) : [arg];

for (const name of targets) {
  await run(name);
}
