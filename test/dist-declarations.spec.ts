import { test, assert } from "vitest";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");

/**
 * Guards the published surface: a consumer compiling under module nodenext
 * must resolve every export through the package.json exports map.
 *
 * Catches the regression where extensionless relative specifiers in src/ are
 * copied verbatim into dist declarations: nodenext requires extensions, and
 * consumer-side skipLibCheck masks the underlying TS2834 as opaque TS2305
 * "no exported member" errors. Builds a consumer project with duxs symlinked
 * into node_modules (exercises the exports map) and runs tsc with
 * skipLibCheck false so declaration errors surface.
 */
test("emitted declarations resolve under consumer module resolution", () => {
  if (!existsSync(join(repoRoot, "dist", "esm", "index.d.ts"))) {
    assert.fail("dist/esm/index.d.ts not found; run npm run build first");
  }
  const dir = join(repoRoot, "test", "dist-consumer-check");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, "node_modules"), { recursive: true });
  symlinkSync(repoRoot, join(dir, "node_modules", "duxs"), "dir");
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({
      name: "duxs-consumer-check",
      private: true,
      type: "module",
    }),
  );
  writeFileSync(
    join(dir, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        noEmit: true,
        strict: true,
        skipLibCheck: false,
        module: "nodenext",
        moduleResolution: "nodenext",
        target: "esnext",
      },
      files: ["index.ts"],
    }),
  );
  writeFileSync(
    join(dir, "index.ts"),
    `import { OngoingWMSClient, ArticlesApiV1, OrdersApiV1 } from "duxs";
import type { FetchLike } from "duxs";
const client = new OngoingWMSClient({ BASE_URL: "https://unit.invalid", TOKEN: "t" });
const articles: ArticlesApiV1 = client.articlesApiV1;
const orders: OrdersApiV1 = client.ordersApiV1;
const fetchLike: FetchLike | undefined = undefined;
void [articles, orders, fetchLike];
`,
  );
  try {
    execFileSync(
      process.execPath,
      [
        join(repoRoot, "node_modules", "typescript", "bin", "tsc"),
        "-p",
        "tsconfig.json",
        "--noEmit",
      ],
      { stdio: ["ignore", "pipe", "pipe"], cwd: dir },
    );
  } catch (error) {
    const { stdout, stderr } = error as { stdout?: Buffer; stderr?: Buffer };
    assert.fail(
      `built declarations failed consumer-side type-check (module nodenext, skipLibCheck false); fixture kept at test/dist-consumer-check:\n${String(stdout)}\n${String(stderr)}`,
    );
  }
  rmSync(dir, { recursive: true, force: true });
});
