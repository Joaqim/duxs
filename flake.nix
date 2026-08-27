# IMPORTANT: This flake intentionally has ZERO inputs.
#
# nixpkgs is imported via fetchTarball in nix/nixpkgs.nix, bypassing the
# flake input system. This keeps `nix develop` fast after initial cold-start.
#
# DO NOT add flake inputs (nixpkgs, flake-parts, git-hooks, etc.).
# Instead, use npins:
#   npins add github <owner> <repo>    # add a dependency
#   npins update <name>                # update a pin
{
  outputs =
    _:
    let
      systems = [
        "x86_64-linux"
      ];
      eachSystem =
        f:
        builtins.listToAttrs (
          map (system: {
            name = system;
            value = f (import ./nix/nixpkgs.nix { inherit system; });
          }) systems
        );
    in
    {
      packages = eachSystem (pkgs: {
        default = import ./default.nix { inherit pkgs; };
      });

      devShells = eachSystem (pkgs: {
        default = import ./shell.nix { inherit pkgs; };
      });
    };
}
