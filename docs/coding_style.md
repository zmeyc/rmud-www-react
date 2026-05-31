# Coding Style Guide

This guide is mandatory for all code changes in this repository.

## Source Organization

- Prefer existing project directories and naming conventions before creating new top-level areas.
- Keep reusable app-wide hooks under `src/hooks/`, with one hook per file named after the hook, for example `useVisualViewportHeight.tsx`.
- Keep feature-only hooks under that feature's nearest `hooks/` directory when they are not reused elsewhere.
- Keep feature-scoped utilities under that feature's nearest `utils/` directory.
- Promote utility helpers to top-level `src/utils/` only when they are reused across unrelated features.
- Keep one primary component per component file. Small helper types and render helpers may stay in the same file when they are private to that component.
- Name component files, hook files, and type files after their main exported symbol.

## Preact And React Style

- Use Preact through `preact/compat` or `preact/hooks`, matching the surrounding file.
- Extract reusable hook logic into a named hook instead of embedding ResizeObserver, viewport, document-title, or event-listener effects directly in components.
- Hooks must live in their own file under `src/hooks/` or the nearest feature `hooks/` directory. Do not collect multiple unrelated hooks in one file.
- Name hooks with the `use...` prefix and return the smallest useful value or object.
- Keep hook dependency arrays complete. Prefer stable `useCallback`, `useMemo`, or local helpers when that makes dependencies explicit.
- Keep components focused on rendering and wiring callbacks. Move layout measurement, subscriptions, persistence, and document/window side effects into hooks when they are reusable or non-trivial.
- Use `memo` for existing component patterns and follow the local component style before introducing a different pattern.
- Prefer controlled, narrowly scoped state. Do not store derived state when it can be calculated cheaply from props/state during render.

## TypeScript Style

- Use clear names in new code. Avoid ad-hoc abbreviations unless they match established local APIs or domain terms.
- Prefer discriminated string-union types for small finite UI/domain sets.
- Keep exported types close to the feature that owns them, unless multiple unrelated areas share them.
- Avoid `any`. Use `unknown` at boundaries and narrow it before use.
- Follow the surrounding file's formatting and import style.

## Text UI And Character Grid Layout

- For DOS/text-mode styled UI, size fixed-format elements in character units such as `ch` so controls align to the same character grid as the font.
- Avoid layout-affecting borders, padding, or pixel offsets when they would change a character-grid dimension between states such as expanded/collapsed, active/inactive, or hovered.
- Prefer non-layout-affecting decoration such as inset `box-shadow` when a visual border must not alter the grid.

## Tests And Verification

- Run `npm run build` and `npm run lint` after code changes when practical.
- Add focused tests when the project has a nearby test pattern and the behavior is regression-prone.
- For UI-only changes without automated coverage, verify the affected responsive states manually when possible.

## Agent Rule Files

- Keep agent instructions thin and point them at this guide.
- Do not duplicate this guide across tool-specific rule files. Add tool-specific configuration only when a tool cannot discover `AGENTS.md` or this document.
