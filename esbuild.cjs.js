const esbuild = require("esbuild");

esbuild.buildSync({
  entryPoints: ["src/index.ts"],
  format: "cjs",
  platform: "browser",
  outdir: "dist/cjs",
  bundle: true,
  sourcemap: false,
  minify: true,
  target: ["chrome150", "firefox152", "safari26.5"],
});
