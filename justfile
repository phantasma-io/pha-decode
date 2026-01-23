set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

default:
    @just --list

build: 
    npm run build

alias b := build

r *args:
    node dist/cli/index.js {{args}}

d *args:
    npm run dev -- {{args}}

[group('publish')]
publish: build
    npm publish
