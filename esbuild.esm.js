const esbuild = require("esbuild");
const fs = require("node:fs");
const path = require("node:path");

// Rewrites ./transport.js imports to the node implementation for the node
// ESM invocation only; browser/CJS builds resolve the default transport.ts.
const transportAliasNode = {
  name: "transport-alias-node",
  setup(build) {
    build.onResolve({ filter: /transport\.js$/ }, () => ({
      path: path.resolve(__dirname, "src/ongoing-wms-api/transport.node.ts"),
    }));
  },
};

const common = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "esm",
  sourcemap: true,
  minify: false,
  splitting: true,
  outdir: "dist/esm",
  chunkNames: "chunks/[name]-[hash]",
};

esbuild.buildSync({
  ...common,
  platform: "browser",
  target: ["chrome150", "firefox152", "safari26.5"],
  entryNames: "index.browser",
});

esbuild
  .build({
    ...common,
    platform: "node",
    target: ["node24"],
    entryNames: "index.node",
    plugins: [transportAliasNode],
  })
  .then(() => {
    fs.writeFileSync(
      path.join("dist", "esm", "package.json"),
      '{"type":"module"}',
    );
  });
