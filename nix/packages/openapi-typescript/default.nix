{
  pkgs ? import ../../nixpkgs.nix { },
  ...
}:
let
  # See: https://github.com/aabccd021/openapi-typescript-nix
  npm_deps = import "${(import ../../../npins).openapi-typescript-nix}/npm_deps.nix" {
    inherit pkgs;
  };
in
pkgs.writeShellApplication {
  name = "openapi-typescript";
  text = ''
    exec node ${npm_deps}/lib/node_modules/openapi-typescript/bin/cli.js "$@"
  '';
}
