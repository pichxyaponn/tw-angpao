# Elysia v2 migration (kept ready)

This branch ports the library to **Elysia `2.0.0-exp.25`** + **TypeBox 1.3**
(`typebox`). It builds, lints, tests (23/23) and passes the Node CJS/ESM smoke
tests. **Do not publish yet** — Elysia v2 is still `experimental` (the `latest`
dist-tag is v1), so this is held until v2 reaches RC/stable.

> Elysia v2 is churning fast (exp.1 → exp.25 already). Re-verify this branch
> against the newest exp — or ideally against the eventual RC — before shipping.

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
  was missing from elysia's typed `t`) is **fixed as of exp.25** — the example
  no longer needs `@ts-expect-error`.
- The v2 route signature (`.post(path, schema, handler)`) still holds on exp.25.
