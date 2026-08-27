# Prefix for commands that need a Nix devshell; empty if already inside one.
nix_shell := if env('IN_NIX_SHELL', '') != '' { '' } else { 'nix develop ' + justfile_directory() + ' --accept-flake-config -c' }

# List available recipes
default:
    @just --list

# Prepare repo for development
prepare: install build

# NPM build
build:
    {{ nix_shell }} npm run build

# NPM install
install:
    {{ nix_shell }} npm install

# Run just tests
test:
    {{ nix_shell }} npm test

# Run eslint check
check:
    {{ nix_shell }} npm run lint

# Run eslint --fix
fmt:
    {{ nix_shell }} npm run lint:fix

# Remove all gitignored files
clean:
    git clean -fdX
