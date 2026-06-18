// bench.ts — compare per-request overhead of the /redeem route across Elysia versions.
// fetch is mocked to return instantly, so this measures framework + plugin +
// validation + serialization overhead only (no network).
import { Elysia, t } from "elysia";
import elysiaPkg from "elysia/package.json";
import { TWAngpao } from "./src";

const version: string = elysiaPkg.version;
const major = parseInt(version, 10);

// Mock fetch -> instant SUCCESS response
const okBody = JSON.stringify({
  status: { code: "SUCCESS", message: "ok", data: { voucher: { amount_baht: "10.00" } } }
});
globalThis.fetch = (async () => new Response(okBody, { status: 200 })) as typeof fetch;

const schema = { body: t.Object({ phoneNumber: t.String(), voucherCode: t.String() }) };
const handler = async ({ body, TWA, status }: any) => {
  const r = await TWA.redeem(body.phoneNumber, body.voucherCode);
  if (r.status.code !== "SUCCESS") return status(400, r);
  return r;
};

let app: any = new Elysia().use(TWAngpao("TWA"));
// v2: .post(path, schema, handler) | v1: .post(path, handler, schema)
app = major >= 2 ? app.post("/redeem", schema, handler) : app.post("/redeem", handler, schema);

const makeReq = (b: unknown) =>
  new Request("http://localhost/redeem", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(b)
  });

async function bench(name: string, reqFactory: () => Request, iters: number) {
  for (let i = 0; i < 5000; i++) await app.handle(reqFactory()); // warmup
  let best = Infinity;
  for (let r = 0; r < 5; r++) {
    const t0 = performance.now();
    for (let i = 0; i < iters; i++) await app.handle(reqFactory());
    best = Math.min(best, performance.now() - t0);
  }
  const ops = iters / (best / 1000);
  console.log(
    `  ${name.padEnd(24)} ${ops.toFixed(0).padStart(8)} ops/s   ${((best / iters) * 1000).toFixed(2)} µs/op`
  );
}

console.log(`\nElysia v${version} (runtime: Bun ${Bun.version})`);
await bench("redeem success (200)", () => makeReq({ phoneNumber: "0812345678", voucherCode: "ABCDEF" }), 50000);
await bench("validation reject (422)", () => makeReq({ phoneNumber: "0812345678" }), 50000);
await bench("invalid phone (400)", () => makeReq({ phoneNumber: "x", voucherCode: "ABCDEF" }), 50000);
