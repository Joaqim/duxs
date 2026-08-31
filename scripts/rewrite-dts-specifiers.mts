#!/usr/bin/env node
// Rewrites extensionless relative specifiers in emitted .d.ts files to the
// extensioned form required by node16/nodenext consumers. Source files stay
// extensionless per repository convention; only declarations shipped in
// dist/ carry extensions.
//
// A regex pass over `from "..."` alone is insufficient: inline
// `import("./x")` type references and directory barrels (`./types` ->
// `./types/index.js`) need resolution against the actual dist layout, and
// specifiers that resolve to nothing must fail the build rather than
// silently dropping the re-exported types.
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

const distRoot = resolve(process.argv[2] ?? "dist");

// Matches the specifier literal in `from "..."` clauses and inline
// `import("...")` type references, single or double quoted.
const specifierPattern = /(\bfrom\s*|\bimport\s*\(\s*)(["'])(\.[^"']+?)\2/g;

const alreadyExtensioned = /\.(?:js|cjs|mjs|d\.ts)$/;

interface Replacement {
  start: number;
  end: number;
  text: string;
}

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/**
 * Maps an extensionless relative specifier to the extensioned form that
 * resolves under node16/nodenext, or null when no emitted file matches.
 *
 * Consumers resolve `./x.js` to the sibling `x.d.ts`, so the emitted
 * specifier names the runtime path even in declaration-only trees.
 */
async function extensionedForm(
  spec: string,
  fromFile: string,
): Promise<string | null> {
  const base = resolve(dirname(fromFile), spec);
  for (const candidate of [`${base}.d.ts`, `${base}.js`]) {
    if (await isFile(candidate)) return `${spec}.js`;
  }
  for (const candidate of [join(base, "index.d.ts"), join(base, "index.js")]) {
    if (await isFile(candidate)) return `${spec}/index.js`;
  }
  return null;
}

async function walkDeclarations(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory()
        ? walkDeclarations(path)
        : Promise.resolve(entry.name.endsWith(".d.ts") ? [path] : []);
    }),
  );
  return nested.flat();
}

async function rewriteFile(
  file: string,
): Promise<{ rewritten: number; unresolved: string[] }> {
  const source = await readFile(file, "utf8");
  const replacements: Replacement[] = [];
  const unresolved: string[] = [];
  for (const match of source.matchAll(specifierPattern)) {
    const spec = match[3]!;
    if (alreadyExtensioned.test(spec)) continue;
    const replacement = await extensionedForm(spec, file);
    if (replacement === null) {
      unresolved.push(spec);
      continue;
    }
    const start = match.index! + match[0].length - spec.length - 1;
    replacements.push({ start, end: start + spec.length, text: replacement });
  }
  if (replacements.length > 0) {
    let out = source;
    for (const { start, end, text } of replacements.sort(
      (a, b) => b.start - a.start,
    )) {
      out = out.slice(0, start) + text + out.slice(end);
    }
    await writeFile(file, out);
  }
  return { rewritten: replacements.length, unresolved };
}

async function main(): Promise<void> {
  const files = await walkDeclarations(distRoot);
  const failures: string[] = [];
  let total = 0;
  for (const file of files) {
    const { rewritten, unresolved } = await rewriteFile(file);
    total += rewritten;
    const label = relative(process.cwd(), file);
    if (unresolved.length > 0) {
      failures.push(`${label}: ${unresolved.join(", ")}`);
    }
  }
  console.log(`extensioned ${total} relative specifier(s) in ${files.length} declaration file(s)`);
  if (failures.length > 0) {
    throw new Error(
      `unresolvable relative specifiers in emitted declarations:\n  ${failures.join("\n  ")}`,
    );
  }
}

await main();
