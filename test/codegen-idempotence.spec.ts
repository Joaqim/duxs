import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const GEN_FILES = [
  "src/ongoing-wms-api/gen/shared.types.ts",
  "src/ongoing-wms-api/gen/articles.types.ts",
  "src/ongoing-wms-api/gen/orders.types.ts",
  "src/ongoing-wms-api/gen/articles.responses.ts",
  "src/ongoing-wms-api/gen/orders.responses.ts",
  "src/ongoing-wms-api/gen/articles.client.ts",
  "src/ongoing-wms-api/gen/orders.client.ts",
];

test("codegen is idempotent: regenerating yields byte-identical output", () => {
  const before = GEN_FILES.map((f) => readFileSync(f, "utf-8"));
  execFileSync("node", ["scripts/codegen.mts", "shared"], {
    encoding: "utf-8",
  });
  GEN_FILES.forEach((f, i) => {
    expect(readFileSync(f, "utf-8")).toBe(before[i]);
  });
});
