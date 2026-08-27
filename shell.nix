{
  pkgs ? import ./nix/nixpkgs.nix { },
  package ? import ./default.nix { inherit pkgs; },
}:
pkgs.mkShell {
  inputsFrom = [ package ];
  buildInputs = with pkgs; [
    just
  ];

  shellHook = ''
    echo "Node JS development environment"
    echo "Run 'just prepare' to start development"
  '';
}
