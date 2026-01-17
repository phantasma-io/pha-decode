set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

default:
    @just --list

b:
    npm run build

r *args:
    node dist/cli/index.js {{args}}

d *args:
    npm run dev -- {{args}}
