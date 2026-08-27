{
  pkgs ? import ./nix/nixpkgs.nix { },
  lib ? pkgs.lib,
  ...
}:
let
  pythonScriptFile = pkgs.fetchurl {
    url = "https://github.com/SuperOffice/devnet-split-swagger-file/raw/refs/heads/main/src/parse-swagger.py";
    hash = "sha256-2vkbzCCQyIrjvEWfAACnjC1lVn0iDASDpgPkrzStvwQ=";
  };
in
pkgs.writeShellScriptBin "split-swagger-file" ''
  exec ${lib.getExe pkgs.python3} ${pythonScriptFile} "$@"
''
