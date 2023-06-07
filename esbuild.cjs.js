/* eslint-disable import/no-extraneous-dependencies */
const esbuild = require("esbuild");

esbuild.buildSync({
  entryPoints: ["src/index.ts"],
  outdir: "dist/cjs",
  bundle: true,
  sourcemap: true,
  minify: true,
  platform: "node",
  target: ["node14"],
});
