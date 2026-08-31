{
  pkgs ? import ./nix/nixpkgs.nix { },
  lib ? pkgs.lib,
}:
let
  packageJSON = builtins.fromJSON (builtins.readFile ./package.json);
  inherit (packageJSON) name version description;

  # Only tested for "MIT", over-engineered and probably not what you want
  license = lib.findFirst (l: (l.spdxId or null) == packageJSON.license) null (
    lib.attrValues lib.licenses
  );

  # See: ./nix/packages/openapi-typescript
  openapi-typescript = pkgs.openapi-typescript; # or pkgs.callPackage (import ./nix/packages/openapi-typescript) { };
in
pkgs.buildNpmPackage {
  inherit version;
  pname = lib.strings.sanitizeDerivationName name;

  nativeBuildInputs = [
    openapi-typescript
  ];

  src = ./.;
  npmDepsHash = "sha256-3bYo0Ct8qa8qDnhw2imn1G81fp97nAnWWVGFtCR1f/A=";

  doCheck = true;
  checkPhase = ''
    runHook preCheck

    npm test

    runHook postCheck
  '';

  postPatch = ''
    # Using local openapi-typescript for compilation
    substituteInPlace ./scripts/codegen.mts --replace-fail '"npx", ["openapi-typescript",' '"openapi-typescript", ['
  '';
  buildPhase = ''
    runHook preBuild

    npm run generate:all
    npm run build

    runHook postBuild
  '';

  meta = with lib; {
    inherit description;
    license = optional (license != null) license;
  };
}
