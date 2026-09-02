- Consider formalizing ECMAScript/CommonJS module setup, see
  <https://nodejs.org/api/packages.html#dual-commonjses-module-packages>
  An early decision was to allow earliest compatible version: 22, while active
  development happens at version 24, let's make sure we stay compatible were
  applicable.

- Dynamic browserlist — the current "browserlist" as seen in ./esbuild.cjs.js
  was based on expected compatibility of openapi-fetch, but it should be derived
  in a way that is compatible and expected for a published npm package in the
  nodejs registry.
