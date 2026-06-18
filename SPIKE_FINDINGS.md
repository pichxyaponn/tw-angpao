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
1. ~~**json-accelerator@0.1.7 (type-level).**~~ RESOLVED — removed
   json-accelerator entirely. Its only role was picking a serializer for the
   2-field outgoing body, where the gain over `JSON.stringify` is negligible.
   Dropping it also removed the TypeBox compiler usage from `utils.ts`, so the
   v2 typecheck/build now pass with no `@ts-expect-error`. This removal is
   independently worthwhile and should land on `main` regardless of v2.
2. **Elysia v2 core route API changed (undocumented).** The existing
   `.post(path, handler, { body })` pattern no longer runs the handler — the
   request returns the options object (the body JSON schema) instead. `status()`
   and `set.status` both work in isolation, but the plugin/route usage breaks.
   No migration guide exists yet (exp.1). This is now the only blocker.

## Verdict
Still not feasible to migrate the published library now — but the only
remaining blocker is the churning, undocumented v2 route API (json-accelerator
is no longer in the way). Our source is otherwise ready. Revisit when Elysia v2
reaches RC/stable and ships a migration guide; the source-side migration is
then a few lines (the typebox import/`Static`/`Compile` changes above).
