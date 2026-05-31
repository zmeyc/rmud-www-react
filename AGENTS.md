# Project Agent Instructions

These instructions apply to the whole repository.

## Mandatory Style

Before making code changes, read and follow [docs/coding_style.md](docs/coding_style.md). That guide is the source of truth for source organization, hooks, Preact/React style, TypeScript style, character-grid layout, and verification expectations.

Keep this file thin. Do not duplicate the coding style guide into tool-specific rule files.

## Build And Test

- Build: `npm run build`
- Lint: `npm run lint`
- Dev server: `npm run dev`

## Agent Rule Files

Keep agent instructions thin and point them at this file and [docs/coding_style.md](docs/coding_style.md). Add tool-specific configuration only when a tool cannot discover `AGENTS.md` or this document.
