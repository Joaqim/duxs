/* eslint-disable import/no-extraneous-dependencies */
const esbuild = require("esbuild");

esbuild.buildSync({
  entryPoints: ["src/index.ts"],
  outdir: "dist/esm",
  bundle: true,
  sourcemap: true,
  minify: true,
  splitting: true,
  format: "esm",
  target: ["ES6"],
});
