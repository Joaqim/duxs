#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { fetchJson } from "fetch-json";

interface SpecConfig {
  url?: string;
  specFile: string;
}

const VENDOR_PATH = "vendor";
const GENERATED_OUTPUT_PATH = "src/ongoing-wms-api/gen";
const SHARED_TYPES_PATH = `${GENERATED_OUTPUT_PATH}/shared.types.ts`;

const SPECS: Record<string, SpecConfig> = {
  articles: { specFile: "articles.json" },
  orders: { specFile: "orders.json" },
};

const createVendorSpecPath = ({ specFile }: SpecConfig) => `${VENDOR_PATH}/${specFile}`;
const createDefinitionsPath = (name: string) => `${GENERATED_OUTPUT_PATH}/${name}.d.ts`;
const createGeneratedTypesPath = (name: string) => `${GENERATED_OUTPUT_PATH}/${name}.types.ts`;

async function downloadSpec(name: string, config: Required<SpecConfig>): Promise<void> {
  const specPath = createVendorSpecPath(config);
  console.log(`Fetching ${name} spec from ${config.url}`);
  const data = await fetchJson.get(config.url);
  return await writeFile(specPath, JSON.stringify(data, null, 2));
}

function generateTypes(name: string, specPath: string): void {
  const outputPath = createDefinitionsPath(name);
  console.log(`Generating ${name} -> ${outputPath}`);
  /* openapi-typescript's peer dependency 'typescript' will most likely
   * conflict with our version of typescript, so instead, we use npx for
   * transient dependency */
  execFileSync("npx", ["openapi-typescript", specPath, "-o", outputPath], {
    stdio: "inherit",
  });
}

// ---- alias generation (shared + per-spec) ----

interface SchemaOccurrence {
  specName: string;
  schema: unknown;
}

async function loadSchemas(specName: string): Promise<Record<string, unknown>> {
  const specPath = createVendorSpecPath(SPECS[specName]);
  const raw = await readFile(specPath, "utf-8");
  const spec = JSON.parse(raw);
  return spec?.components?.schemas ?? {};
}

function toAlias(specName: string): string {
  return `${specName[0].toUpperCase()}${specName.slice(1)}Components`;
}

async function generateAllAliasFiles(): Promise<void> {
  const specNames = Object.keys(SPECS);
  const schemasBySpec = new Map<string, Record<string, unknown>>();
  const occurrences = new Map<string, SchemaOccurrence[]>();

  for (const specName of specNames) {
    const schemas = await loadSchemas(specName);
    schemasBySpec.set(specName, schemas);
    for (const [schemaName, schema] of Object.entries(schemas)) {
      const list = occurrences.get(schemaName) ?? [];
      list.push({ specName, schema });
      occurrences.set(schemaName, list);
    }
  }

  // 1. Detect conflicts (same name, different shape) — fatal.
  const conflicts: string[] = [];
  const sharedNames = new Set<string>();
  const canonicalSourceOf = new Map<string, string>();

  for (const [schemaName, list] of occurrences) {
    if (list.length < 2) continue; // only in one spec — handled per-spec below

    const [first, ...rest] = list;
    const allIdentical = rest.every((entry) =>
      isDeepStrictEqual(entry.schema, first.schema),
    );

    if (!allIdentical) {
      const specsInvolved = list.map((entry) => entry.specName).join(", ");
      conflicts.push(
        `  - "${schemaName}" differs across specs: ${specsInvolved}`,
      );
      continue;
    }

    sharedNames.add(schemaName);
    const canonical = [...list].sort((a, b) =>
      a.specName.localeCompare(b.specName),
    )[0];
    canonicalSourceOf.set(schemaName, canonical.specName);
  }

  if (conflicts.length > 0) {
    console.error(
      "\n🛑 Fatal: identically-named schemas with different shapes across specs.\n" +
      "Rename one of them upstream before types can be generated:\n\n" +
      conflicts.join("\n") +
      "\n",
    );
    process.exit(1);
  }

  // 2. Write shared.types.ts — one alias per name shared across specs.
  if (sharedNames.size > 0) {
    const usedSpecs = [...new Set(canonicalSourceOf.values())].sort();
    const importLines = usedSpecs.map(
      (specName) =>
        `import type { components as ${toAlias(specName)} } from "./${specName}.js";`,
    );
    const typeLines = [...sharedNames].sort().map((name) => {
      const specName = canonicalSourceOf.get(name)!;
      const allSpecs = occurrences
        .get(name)!
        .map((e) => e.specName)
        .sort();
      return [
        `// present identically in: ${allSpecs.join(", ")}`,
        `export type ${name} = ${toAlias(specName)}["schemas"]["${name}"];`,
      ].join("\n");
    });

    const content = [
      "// AUTO-GENERATED. Do not edit by hand — run the codegen script instead.",
      "//",
      "// Types below are structurally identical across every spec they appear",
      "// in, and are exported once here instead of being duplicated per-spec.",
      "",
      ...importLines,
      "",
      ...typeLines,
      "",
    ].join("\n");

    console.log(
      `Writing ${sharedNames.size} shared type(s) -> ${SHARED_TYPES_PATH}`,
    );
    await writeFile(SHARED_TYPES_PATH, content);
  } else {
    console.log(
      "No identical cross-spec schemas found; skipping shared.types.ts",
    );
  }

  // 3. Write one alias file per spec, for every schema NOT already in shared.types.ts.
  for (const specName of specNames) {
    const schemas = schemasBySpec.get(specName)!;
    const localNames = Object.keys(schemas)
      .filter((name) => !sharedNames.has(name))
      .sort();

    const outputPath = createGeneratedTypesPath(specName);

    if (localNames.length === 0) {
      console.log(
        `No spec-specific schemas for ${specName}; skipping ${outputPath}`,
      );
      continue;
    }

    const alias = toAlias(specName);
    const content = [
      "// AUTO-GENERATED. Do not edit by hand — run the codegen script instead.",
      "//",
      `// Types below are unique to the ${specName} spec (not shared with any other spec).`,
      "",
      `import type { components as ${alias} } from "./${specName}.js";`,
      "",
      ...localNames.map(
        (name) => `export type ${name} = ${alias}["schemas"]["${name}"];`,
      ),
      "",
    ].join("\n");

    console.log(
      `Writing ${localNames.length} spec-specific type(s) -> ${outputPath}`,
    );
    await writeFile(outputPath, content);
  }
}


async function run(name: string): Promise<void> {
  const config = SPECS[name];
  if (!config) {
    console.error(
      `Unknown spec "${name}". Available: ${Object.keys(SPECS).join(", ")}`,
    );
    process.exit(1);
  }
  if (config.url) {
    await downloadSpec(name, config as Required<SpecConfig>);
  }
  const specPath = createVendorSpecPath(config);
  generateTypes(name, specPath);
}

// ---- entrypoint ----

const arg = process.argv[2];

if (arg === "shared") {
  await generateAllAliasFiles();
} else {
  const targets = arg === "all" ? Object.keys(SPECS) : [arg];
  for (const name of targets) {
    await run(name);
  }
  // Alias files depend on ALL specs' JSON being present and current, so
  // regenerate them after any run — not just "all" — to keep them in sync.
  await generateAllAliasFiles();
}
