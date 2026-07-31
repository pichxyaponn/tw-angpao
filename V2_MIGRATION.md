# Elysia v2 migration (kept ready)

This branch ports the library to **Elysia `2.0.0-beta.1`** + **TypeBox 1.3.9**
(`typebox`). It builds, lints, tests (23/23) and passes the Node CJS/ESM smoke
tests. **Do not publish yet** — Elysia v2 is on the `next` dist-tag while
`latest` is still v1, so this is held until v2 goes stable.

> Elysia v2 has been promoted from `experimental` to **beta** (`next` tag).
> Note the prerelease ordering trap: `2.0.0-beta.1` sorts *below* `2.0.0-exp.61`
> in semver, so a `^2.0.0-exp.*` peer range silently excludes the betas — the
> peer range here is `^2.0.0-beta.1`, which matches beta, exp, and 2.x stable.

## What changed vs v1

| Area | v1 | v2 |
| --- | --- | --- |
| Validation lib | `@sinclair/typebox` 0.34 | `typebox` 1.x |
| Type builder import | `import { Type } from "@sinclair/typebox"` | `import { Type } from "typebox"` |
| Compiler | `@sinclair/typebox/compiler` `TypeCompiler.Compile` | `typebox/compile` `Compile` (not used here anymore) |
| Static type | `typeof shape.static` | `Static<typeof shape>` |
| Route signature | `.post(path, handler, schema)` | `.post(path, schema, handler)` |

The redeem logic itself is unchanged; the `TWAngpao` plugin runs as-is on v2.

## Notes

- The `t.Any()` typing gap seen in `2.0.0-exp.1` (where `t.Any()` ran fine but
  was missing from elysia's typed `t`) is **fixed as of exp.25** and stays fixed
  on beta.1 — the example no longer needs `@ts-expect-error`.
- The v2 route signature (`.post(path, schema, handler)`) still holds on beta.1.
  The README example and `example/index.ts` are kept byte-identical apart from
  the import path, so the two cannot drift out of sync.
