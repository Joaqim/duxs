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
in
pkgs.buildNpmPackage {
  inherit version;
  pname = lib.strings.sanitizeDerivationName name;

  src = ./.;
  npmDepsHash = "sha256-co2Z+wcDcHhr6RvPbYZR6nbcEdslHgqfvG7sjv8KTDM=";

  meta = with lib; {
    inherit description;
    license = optional (license != null) license;
  };
}
