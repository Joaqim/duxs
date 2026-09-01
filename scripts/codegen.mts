#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { fetchJson } from "fetch-json";
import {
  operationKey,
  resolveCollisions,
  toResponseAliasName,
  type NameableOperation,
} from "./codegen-names.mts";

interface SpecConfig {
  url?: string;
  specFile: string;
  docsBaseUrl: string;
}

const VENDOR_PATH = "vendor";
const GENERATED_OUTPUT_PATH = "src/ongoing-wms-api/gen";
const SHARED_TYPES_PATH = `${GENERATED_OUTPUT_PATH}/shared.types.ts`;

const SPECS: Record<string, SpecConfig> = {
  articleItems: {
    specFile: "articleItems.json",
    docsBaseUrl: "https://developer.ongoingwarehouse.com/REST/v1/index.html",
  },
  articles: {
    specFile: "articles.json",
    docsBaseUrl: "https://developer.ongoingwarehouse.com/REST/v1/index.html",
  },
  goodsOwners: {
    specFile: "goodsOwners.json",
    docsBaseUrl: "https://developer.ongoingwarehouse.com/REST/v1/index.html",
  },
  inventoryAdjustments: {
    specFile: "inventoryAdjustments.json",
    docsBaseUrl: "https://developer.ongoingwarehouse.com/REST/v1/index.html",
  },
  invoices: {
    specFile: "invoices.json",
    docsBaseUrl: "https://developer.ongoingwarehouse.com/REST/v1/index.html",
  },
  movements: {
    specFile: "movements.json",
    docsBaseUrl: "https://developer.ongoingwarehouse.com/REST/v1/index.html",
  },
  orders: {
    specFile: "orders.json",
    docsBaseUrl: "https://developer.ongoingwarehouse.com/REST/v1/index.html",
  },
  parcelTypes: {
    specFile: "parcelTypes.json",
    docsBaseUrl: "https://developer.ongoingwarehouse.com/REST/v1/index.html",
  },
  productionOrders: {
    specFile: "productionOrders.json",
    docsBaseUrl: "https://developer.ongoingwarehouse.com/REST/v1/index.html",
  },
  purchaseOrders: {
    specFile: "purchaseOrders.json",
    docsBaseUrl: "https://developer.ongoingwarehouse.com/REST/v1/index.html",
  },
  returnOrders: {
    specFile: "returnOrders.json",
    docsBaseUrl: "https://developer.ongoingwarehouse.com/REST/v1/index.html",
  },
  transporterContracts: {
    specFile: "transporterContracts.json",
    docsBaseUrl: "https://developer.ongoingwarehouse.com/REST/v1/index.html",
  },
  warehouses: {
    specFile: "warehouses.json",
    docsBaseUrl: "https://developer.ongoingwarehouse.com/REST/v1/index.html",
  }
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

interface ResponseSchema {
  $ref?: string;
  type?: string;
  items?: { $ref?: string };
}

interface OperationResponses {
  [status: string]: {
    content?: { "application/json"?: { schema?: ResponseSchema } };
  };
}

interface OperationParameter {
  name?: string;
  in?: string;
}

interface RequestBodySchema {
  $ref?: string;
  oneOf?: { $ref?: string }[];
}

interface OperationRequestBody {
  content?: { "application/json"?: { schema?: RequestBodySchema } };
}

interface ParsedOperation {
  tags?: string[];
  operationId?: string;
  summary?: string;
  requestBody?: OperationRequestBody;
  responses?: OperationResponses;
  parameters?: OperationParameter[];
}

interface ParsedSpec {
  components?: { schemas?: Record<string, unknown> };
  paths?: Record<string, Record<string, ParsedOperation>>;
}

async function loadSpec(specName: string): Promise<ParsedSpec> {
  const specPath = createVendorSpecPath(SPECS[specName]);
  const raw = await readFile(specPath, "utf-8");
  return JSON.parse(raw);
}

function toAlias(specName: string): string {
  return `${specName[0].toUpperCase()}${specName.slice(1)}Components`;
}
type SpecDoc = {
  paths: Record<
    string,
    Record<
      string,
      {
        tags?: string[];
        operationId?: string;
        requestBody?: unknown;
        responses?: unknown;
        parameters?: unknown;
      }
    >
  >;
};

// Set this once you've confirmed whether the ReDoc build exposes component-level anchors.
const HAS_COMPONENT_SCHEMA_ANCHORS = false;

function buildSchemaLinkIndex(
  specName: string,
  spec: SpecDoc,
): Map<string, string> {
  const base = `https://developer.ongoingwarehouse.com/REST/v1/index.html#`;
  const index = new Map<string, string>();

  if (HAS_COMPONENT_SCHEMA_ANCHORS) {
    // If confirmed, this is strictly better: stable, one-to-one, no operation guessing.
    // Adjust the anchor format to match whatever ReDoc actually emits.
    return index; // fill in once verified — leaving unset so the fallback below is used until then
  }

  for (const [, methods] of Object.entries(spec.paths)) {
    for (const [, op] of Object.entries(methods)) {
      if (!op.operationId || !op.tags?.[0]) continue;
      const refs = extractSchemaRefs(op); // walk requestBody/responses/parameters for $ref strings
      const anchor = `${op.tags[0]}/${op.tags[0]}_${op.operationId}`;
      for (const schemaName of refs) {
        // first-in-first-served, mirroring your existing sharedNames dedup philosophy
        if (!index.has(schemaName)) {
          index.set(schemaName, `${base}/${anchor}`);
        }
      }
    }
  }
  return index;
}

/**
 * Ongoing wraps some request bodies in a nullable single-member oneOf instead
 * of a direct $ref; return the wrapped schema name when that is the shape.
 */
function singleRefOfOneOf(oneOf: { $ref?: string }[] | undefined): string | undefined {
  if (!oneOf || oneOf.length !== 1) return undefined;
  return oneOf[0]?.["$ref"]?.match(/#\/components\/schemas\/(.+)$/)?.[1];
}

function extractSchemaRefs(op: unknown): string[] {
  const names = new Set<string>();
  const walk = (node: unknown) => {
    if (node && typeof node === "object") {
      for (const [key, value] of Object.entries(node)) {
        if (key === "$ref" && typeof value === "string") {
          const match = value.match(/#\/components\/schemas\/(.+)$/);
          if (match) names.add(match[1]);
        } else {
          walk(value);
        }
      }
    }
  };
  walk(op);
  return [...names];
}

function buildSchemaDocComment(
  name: string,
  canonicalUrl: string | undefined,
  extraLine?: string,
): string {
  const lines = ["/**"];
  if (extraLine) lines.push(` * ${extraLine}`);
  if (canonicalUrl) {
    lines.push(` * @see {@link ${canonicalUrl} | REST API: ${name}}`);
  } else {
    // No resolvable operation reference — still emit the type, just without a dead link.
    lines.push(` * @see No matching operation found in spec for ${name}.`);
  }
  lines.push(" */");
  return lines.join("\n");
}

async function generateAllAliasFiles(): Promise<void> {
  const specNames = Object.keys(SPECS);
  const rawSpecs = new Map<string, ParsedSpec>();
  const schemasBySpec = new Map<string, Record<string, unknown>>();
  const occurrences = new Map<string, SchemaOccurrence[]>();

  for (const specName of specNames) {
    const spec = await loadSpec(specName);
    rawSpecs.set(specName, spec);

    const schemas = spec.components?.schemas ?? {};
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

    // Build one link index per spec that's actually used here.
    const linkIndexBySpec = new Map(
      usedSpecs.map((specName) => [
        specName,
        buildSchemaLinkIndex(specName, rawSpecs.get(specName)!),
      ]),
    );

    const typeLines = [...sharedNames].sort().map((name) => {
      const specName = canonicalSourceOf.get(name)!;
      const allSpecs = occurrences
        .get(name)!
        .map((e) => e.specName)
        .sort();
      const url = linkIndexBySpec.get(specName)?.get(name);
      const comment = buildSchemaDocComment(
        name,
        url,
        `Present identically in: ${allSpecs.join(", ")}`,
      );
      return [
        comment,
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
    const linkIndex = buildSchemaLinkIndex(specName, rawSpecs.get(specName)!);

    const typeBlocks = localNames.map((name) => {
      const url = linkIndex.get(name);
      const comment = buildSchemaDocComment(name, url);
      return [
        comment,
        `export type ${name} = ${alias}["schemas"]["${name}"];`,
      ].join("\n");
    });

    const content = [
      "// AUTO-GENERATED. Do not edit by hand — run the codegen script instead.",
      "//",
      `// Types below are unique to the ${specName} spec (not shared with any other spec).`,
      "",
      `import type { components as ${alias} } from "./${specName}.js";`,
      "",
      ...typeBlocks,
      "",
    ].join("\n");

    console.log(
      `Writing ${localNames.length} spec-specific type(s) -> ${outputPath}`,
    );
    await writeFile(outputPath, content);
  }

  // 4. Per-operation response aliases: <Method>Response = ApiResponse<Data>
  for (const specName of specNames) {
    const spec = rawSpecs.get(specName)!;
    const localSchemas = new Set(
      Object.keys(schemasBySpec.get(specName) ?? {}),
    );
    const sharedHere = new Set(
      [...sharedNames].filter((name) =>
        occurrences.get(name)!.some((o) => o.specName === specName),
      ),
    );

    const ops: NameableOperation[] = [];
    for (const [path, methods] of Object.entries(spec.paths ?? {})) {
      for (const [method, op] of Object.entries(methods)) {
        if (op.operationId)
          ops.push({ method, path, operationId: op.operationId });
      }
    }
    const names = resolveCollisions(ops);

    // First pass collects data types; imports must precede the aliases that use them.
    const referencedLocal = new Set<string>();
    const referencedShared = new Set<string>();
    const aliases: {
      aliasName: string;
      dataExpr: string;
      summary: string;
      operationId: string;
      docsUrl: string;
    }[] = [];

    for (const [path, methods] of Object.entries(spec.paths ?? {})) {
      for (const [method, op] of Object.entries(methods)) {
        if (!op.operationId) continue;
        const methodName = names.get(operationKey(method, path))!;
        const aliasName = toResponseAliasName(methodName);
        const ok = op.responses?.["200"] ?? op.responses?.["201"];
        const jsonSchema = ok?.content?.["application/json"]?.schema;
        const refName =
          typeof jsonSchema?.["$ref"] === "string"
            ? jsonSchema["$ref"].match(/#\/components\/schemas\/(.+)$/)?.[1]
            : undefined;
        const itemRefName =
          jsonSchema?.["type"] === "array" &&
            typeof jsonSchema["items"]?.["$ref"] === "string"
            ? jsonSchema["items"]["$ref"].match(
              /#\/components\/schemas\/(.+)$/,
            )?.[1]
            : undefined;
        const known = (n: string | undefined) =>
          n && (localSchemas.has(n) || sharedHere.has(n)) ? n : undefined;
        const dataName = known(refName) ?? known(itemRefName);
        const dataExpr = dataName
          ? refName && known(refName)
            ? dataName
            : `${dataName}[]`
          : "unknown";
        if (dataName && sharedHere.has(dataName)) {
          referencedShared.add(dataName);
        } else if (dataName) {
          referencedLocal.add(dataName);
        }
        const summary = op.summary ?? `Operation ${op.operationId}`;
        const docsUrl = `https://developer.ongoingwarehouse.com/REST/v1/index.html#/${op.tags?.[0] ?? ""}/${op.operationId}`;
        aliases.push({
          aliasName,
          dataExpr,
          summary,
          operationId: op.operationId,
          docsUrl,
        });
      }
    }

    const typeLines = aliases.map(
      ({ aliasName, dataExpr, summary, operationId, docsUrl }) =>
        [
          "/**",
          ` * ${summary}`,
          ` * @see {@link ${docsUrl} | REST API: ${operationId}}`,
          dataExpr === "unknown"
            ? ` * Success payload: unknown (inline schema, not a named model). Errors: {@link OngoingError}.`
            : ` * Success payload: {@link ${dataExpr}}. Errors: {@link OngoingError}.`,
          " */",
          `export type ${aliasName} = ApiResponse<${dataExpr}>;`,
          "",
        ].join("\n"),
    );

    const importLines: string[] = [
      'import type { ApiResponse, OngoingError } from "../utils.js";',
    ];
    if (referencedShared.size > 0) {
      importLines.push(
        `import type { ${[...referencedShared].sort().join(", ")} } from "./shared.types.js";`,
      );
    }
    if (referencedLocal.size > 0) {
      importLines.push(
        `import type { ${[...referencedLocal].sort().join(", ")} } from "./${specName}.types.js";`,
      );
    }

    const content = [
      "// AUTO-GENERATED. Do not edit by hand — run the codegen script instead.",
      "//",
      `// Per-operation response aliases for the ${specName} spec.`,
      "",
      ...importLines,
      "",
      ...typeLines,
    ].join("\n");

    const outputPath = `${GENERATED_OUTPUT_PATH}/${specName}.responses.ts`;
    console.log(
      `Writing ${typeLines.length} response aliases -> ${outputPath}`,
    );
    await writeFile(outputPath, content);
  }

  // 5. Base wrapper classes: one method per operation
  for (const specName of specNames) {
    const spec = rawSpecs.get(specName)!;
    const localSchemas = new Set(Object.keys(schemasBySpec.get(specName) ?? {}));
    const sharedHere = new Set(
      [...sharedNames].filter((name) =>
        occurrences.get(name)!.some((o) => o.specName === specName),
      ),
    );
    const schemaSource = (name: string): string | null =>
      sharedHere.has(name)
        ? "./shared.types.js"
        : localSchemas.has(name)
          ? `./${specName}.types.js`
          : null;

    const ops: NameableOperation[] = [];
    for (const [path, methods] of Object.entries(spec.paths ?? {})) {
      for (const [method, op] of Object.entries(methods)) {
        if (op.operationId)
          ops.push({ method, path, operationId: op.operationId });
      }
    }
    const names = resolveCollisions(ops);

    const localImports = new Set<string>();
    const sharedImports = new Set<string>();
    const methodBlocks: string[] = [];

    for (const [path, methods] of Object.entries(spec.paths ?? {})) {
      for (const [method, op] of Object.entries(methods)) {
        if (!op.operationId) continue;
        const methodName = names.get(operationKey(method, path))!;
        const aliasName = toResponseAliasName(methodName);

        const pathParams = [...path.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
        const hasQuery = (op.parameters ?? []).some(
          (p) => p?.in === "query",
        );
        const bodyRef =
          op.requestBody?.content?.["application/json"]?.schema?.["$ref"]
            ?.match(/#\/components\/schemas\/(.+)$/)?.[1] ??
          singleRefOfOneOf(
            op.requestBody?.content?.["application/json"]?.schema?.["oneOf"],
          );
        const bodySource = bodyRef !== undefined ? schemaSource(bodyRef) : null;
        if (bodyRef !== undefined && bodySource === null) {
          throw new Error(
            `Body schema "${bodyRef}" of ${op.operationId} not found in alias files`,
          );
        }
        if (bodyRef !== undefined) {
          if (bodySource === "./shared.types.js") sharedImports.add(bodyRef);
          else localImports.add(bodyRef);
        }

        const args = [
          ...pathParams.map(
            (p) => `${p}: ${p.endsWith("Id") || p === "id" ? "number" : "string"}`,
          ),
          ...(hasQuery
            ? [`query: operations["${op.operationId}"]["parameters"]["query"]`]
            : []),
          ...(bodyRef !== undefined ? [`body: ${bodyRef}`] : []),
        ].join(", ");

        const paramsObject = [
          ...(pathParams.length > 0
            ? [`path: { ${pathParams.join(", ")} }`]
            : []),
          ...(hasQuery ? ["query"] : []),
        ].join(", ");
        const fetchOptions = [
          ...(paramsObject.length > 0 ? [`params: { ${paramsObject} }`]
            : []),
          ...(bodyRef !== undefined ? ["body"] : []),
        ].join(", ");

        const summary = op.summary ?? `Operation ${op.operationId}`;
        const docsUrl = `https://developer.ongoingwarehouse.com/REST/v1/index.html#/${op.tags?.[0] ?? ""}/${op.operationId}`;
        const paramDocs = [
          ...pathParams.map((p) => ` * @param ${p} - path parameter`),
          ...(hasQuery ? [` * @param query - query parameters`] : []),
          ...(bodyRef !== undefined
            ? [` * @param body - request body ({@link ${bodyRef}})`]
            : []),
        ].join("\n");

        methodBlocks.push(
          [
            "  /**",
            `   * ${summary}`,
            `   * @see {@link ${docsUrl} | REST API: ${op.operationId}}`,
            ...(paramDocs.length > 0 ? [paramDocs] : []),
            `   * @returns {@link ${aliasName}}`,
            "   */",
            `  ${methodName}(${args}): Promise<responses.${aliasName}> {`,
            `    return this.client.${method.toUpperCase()}("${path}", { ${fetchOptions} }) as Promise<responses.${aliasName}>;`,
            "  }",
            "",
          ].join("\n"),
        );
      }
    }

    const className = `${specName[0].toUpperCase()}${specName.slice(1)}ApiV1Base`;
    const importLines = [
      `import type { operations, paths } from "./${specName}.js";`,
      'import { ClientWrapper } from "../utils.js";',
      `import type * as responses from "./${specName}.responses.js";`,
      `export type * from "./${specName}.responses.js";`,
      ...(localImports.size > 0
        ? [
          `import type { ${[...localImports].sort().join(", ")} } from "./${specName}.types.js";`,
        ]
        : []),
      ...(sharedImports.size > 0
        ? [
          `import type { ${[...sharedImports].sort().join(", ")} } from "./shared.types.js";`,
        ]
        : []),
    ];

    const content = [
      "// AUTO-GENERATED. Do not edit by hand — run the codegen script instead.",
      "//",
      `// Base wrapper class for the ${specName} spec. Hand-written subclasses live in`,
      `// src/ongoing-wms-api/${specName}.ts.`,
      "//",
      "// The 'as Promise<...>' downcast is deliberate: openapi-fetch's FetchResponse",
      "// and ApiResponse are structurally parallel unions, but the vendored specs",
      "// declare no error responses, so the error branch is typed as OngoingError",
      "// from observed behavior rather than derived from the spec.",
      "",
      ...importLines,
      "",
      `export class ${className} extends ClientWrapper<paths> {`,
      ...methodBlocks,
      "}",
      "",
    ].join("\n");

    const outputPath = `${GENERATED_OUTPUT_PATH}/${specName}.client.ts`;
    console.log(
      `Writing ${className} (${methodBlocks.length} methods) -> ${outputPath}`,
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
