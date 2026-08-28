{
  pkgs ? import ./nix/nixpkgs.nix { },
  lib ? pkgs.lib,
  ...
}:
let
  pythonScriptFile = pkgs.fetchurl {
    url = "https://github.com/Joaqim/devnet-split-swagger-file/raw/refs/heads/output-minimally-viable-spec/src/parse-swagger.py";
    hash = "sha256-yTcr54Rsni1IRuuPb1a0/mSGk2fQ5jlM+RKppdjP3X4=";
  };
in
pkgs.writeShellScriptBin "split-swagger-file" ''
  exec ${lib.getExe pkgs.python3} ${pythonScriptFile} "$@"
''
