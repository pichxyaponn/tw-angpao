# Elysia v2 migration (kept ready)

This branch ports the library to **Elysia `2.0.0-exp.1`** + **TypeBox 1.0**
(`typebox`). It builds, lints, tests (3/3) and passes the Node CJS/ESM smoke
tests. **Do not publish yet** — Elysia v2 is still `experimental` (the `latest`
dist-tag is v1), so this is held until v2 reaches RC/stable.

## What changed vs v1

| Area | v1 | v2 |
| --- | --- | --- |
| Validation lib | `@sinclair/typebox` 0.34 | `typebox` 1.x |
| Type builder import | `import { Type } from "@sinclair/typebox"` | `import { Type } from "typebox"` |
| Compiler | `@sinclair/typebox/compiler` `TypeCompiler.Compile` | `typebox/compile` `Compile` (not used here anymore) |
| Static type | `typeof shape.static` | `Static<typeof shape>` |
| Route signature | `.post(path, handler, schema)` | `.post(path, schema, handler)` |

The redeem logic itself is unchanged; the `TWAngpao` plugin runs as-is on v2.

## Known v2-exp rough edge

`t.Any()` exists at runtime but is missing from the typed surface of elysia's
`t` in `2.0.0-exp.1`. The example suppresses this with `@ts-expect-error`
(clearly marked); remove those once v2 ships complete typings — the
`@ts-expect-error` will start failing, which is the signal to drop it.
