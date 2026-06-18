# Spike: migrate to Elysia v2 (2.0.0-exp.1)

> Throwaway research branch — **do not merge/publish**. Documents feasibility only.
> Elysia `2.0.0-exp.1` was published 2026-06-18 under the `experimental`
> dist-tag; `latest` is still `1.4.29`.

## What works
- `elysia@2.0.0-exp.1` + `typebox@1.2.16` install and coexist.
- Our source ports to TypeBox 1.0 with three small changes:
  - `@sinclair/typebox` -> `typebox` (the `Type` namespace + `t.Object` still work)
  - `@sinclair/typebox/compiler` `TypeCompiler.Compile` -> `typebox/compile` `Compile`
  - `typeof shape.static` -> `Static<typeof shape>` (TypeBox 1.0 dropped `.static`)
- `tsc` declaration build and `tsup` build pass after those changes.
- **The `TWAngpao` plugin runs fine on Elysia v2.** A route using it returns
  the correct status codes (400 invalid phone, 400 API error, 200 success) —
  verified with the real plugin against mocked fetch.

## Resolved / non-issues
1. ~~**json-accelerator@0.1.7 (type-level).**~~ Removed entirely. Its only role
   was picking a serializer for the 2-field outgoing body, where the gain over
   `JSON.stringify` is negligible. Dropping it also removed the TypeBox compiler
   usage from `utils.ts`, so the v2 typecheck/build pass with no
   `@ts-expect-error`. Worthwhile on `main` regardless of v2.
2. ~~**Elysia v2 "breaks" the route handler.**~~ MISDIAGNOSED. v2 simply
   **swapped the route argument order**: v1 `.post(path, handler, schema)` ->
   v2 `.post(path, schema, handler)` (schema first, handler last; see the JSDoc
   in `node_modules/elysia/dist/base.d.ts`). With the new order the handler runs
   and everything works. This only affects consumer route registration (and the
   example/tests), not the library's redeem logic.

## Verdict
Elysia v2 **works** with this library — the migration is mechanical (typebox
import/`Static`/`Compile`, and the `.post` arg-order swap in tests/example).
The remaining reason NOT to ship is purely release-stage, not technical:
`2.0.0-exp.1` is experimental (published today, API will churn, no migration
guide) and `latest` is still v1, so a stable release depending on v2-exp would
break v1 users. Recommended: wait for v2 RC/stable, then apply the (now small,
well-understood) migration.
