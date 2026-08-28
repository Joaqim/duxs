# Prefix for commands that need a Nix devshell; empty if already inside one.
nix_shell := if env('IN_NIX_SHELL', '') != '' { '' } else { 'nix develop ' + justfile_directory() + ' --accept-flake-config -c' }

# List available recipes
default:
    @just --list

# Prepare repo for development
prepare: install generate build

# NPM build
build:
    {{ nix_shell }} npm run build

# NPM install
install:
    {{ nix_shell }} npm install

# Codegen
generate:
    {{ nix_shell }} node ./scripts/codegen.mts all


# Run just tests
test:
    {{ nix_shell }} npm test

# Run eslint & prettier check
fmt-check:
    {{ nix_shell }} npm run lint:check
    {{ nix_shell }} npm run format:check

# Run eslint --fix and prettier --write
fmt:
    {{ nix_shell }} npm run lint
    {{ nix_shell }} npm run format

# Remove all gitignored files
clean:
    git clean -fdX
