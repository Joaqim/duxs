import { OptionDefaults } from "typedoc";

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  ...OptionDefaults,
  entryPoints: [
    "src/index.ts",
    "src/ongoing-wms-api/gen/**/*.types.ts",
    "src/ongoing-wms-api/gen/**/*.d.ts",
  ],
  //entryPointStrategy: "expand",
  //sort: ["source-order"],
  cleanOutputDir: true,
  excludePrivate: true,
  excludeExternals: true,
  externalPattern: [
    "**/node_modules/**",
    //"./src/ongoing-wms-api/gen/**"
    //"./src/ongoing-wms-api/gen/**/*.d.ts",
    //"./src/ongoing-wms-api/gen/**/*.types.ts",
  ],
  /*
  validation: {
    notExported: false,
    invalidLink: true,
    notDocumented: false,
  },
  */
};

export default config;
