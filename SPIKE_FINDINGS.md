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

## Blockers
1. **json-accelerator@0.1.7 (type-level).** Its types target
   `@sinclair/typebox` 0.34 and reject a `typebox` 1.0 schema (`TObject` is not
   assignable to its `TAnySchema`). Runtime IS compatible (verified: `encode()`
   produces correct JSON), so today it only builds with a `@ts-expect-error`.
   Real fix: wait for json-accelerator to support typebox 1.0, or drop it.
2. **Elysia v2 core route API changed (undocumented).** The existing
   `.post(path, handler, { body })` pattern no longer runs the handler — the
   request returns the options object (the body JSON schema) instead. `status()`
   and `set.status` both work in isolation, but the plugin/route usage breaks.
   No migration guide exists yet (exp.1).

## Verdict
Not feasible to migrate the published library now: the blockers are external
(json-accelerator + churning, undocumented v2 API), not our code (~90% ready).
Revisit when Elysia v2 reaches RC/stable and json-accelerator supports
typebox 1.0 — the source-side migration is then a few lines.
