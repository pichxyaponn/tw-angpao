// example/index.ts

import { Elysia } from 'elysia'
import { TWAngpao } from '../src'

const app = new Elysia()
  .use(TWAngpao())
  .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)