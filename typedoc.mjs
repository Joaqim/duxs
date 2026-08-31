import { OptionDefaults } from "typedoc";

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  ...OptionDefaults,
  entryPoints: [
    "src/index.ts",
    "src/ongoing-wms-api/gen/**/*.types.ts",
    "src/ongoing-wms-api/gen/**/*.responses.ts",
    "src/ongoing-wms-api/gen/**/*.client.ts",
  ],
  cleanOutputDir: true,
  excludePrivate: true,
  excludeExternals: true,
  externalPattern: ["**/node_modules/**"],
  exclude: ["src/ongoing-wms-api/gen/**/*.d.ts"],
};

export default config;
