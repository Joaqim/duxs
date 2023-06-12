const esbuild = require("esbuild");

esbuild.buildSync({
  entryPoints: ["src/index.ts"],
  format: "esm",
  outdir: "dist/esm",
  bundle: true,
  sourcemap: false,
  minify: true,
  splitting: true,
  target: ["node14"],
});
