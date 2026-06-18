// example/index.ts

import { Elysia, t } from "elysia";
import { TWAngpao } from "../src";

// Reusable validation models — a single source of truth for both
// runtime validation and TypeScript types.
const models = new Elysia().model({
  "redeem.body": t.Object({
    phoneNumber: t.String({
      minLength: 1,
      description: "Thai mobile number (e.g. 0812345678 or +66812345678)"
    }),
    voucherCode: t.String({
      minLength: 1,
      description: "TrueMoney voucher hash or full gift link"
    })
  }),
  "redeem.error": t.Object({
    status: t.Object({
      code: t.String(),
      message: t.String(),
      error: t.Optional(t.Any())
    }),
    data: t.Optional(t.Any())
  })
});

const app = new Elysia()
  .use(models)
  .use(TWAngpao("TWA"))
  .post(
    "/redeem",
    async ({ body, TWA, status }) => {
      const response = await TWA.redeem(body.phoneNumber, body.voucherCode);

      if (response.status.code !== "SUCCESS") {
        const code = response.status.code;
        // Server-side failures -> 5xx, invalid input / voucher problems -> 4xx
        const httpStatus =
          code.startsWith("HTTP_ERROR_") ||
          code.startsWith("NETWORK_ERROR") ||
          code === "INVALID_JSON_RESPONSE"
            ? 500
            : 400;
        return status(httpStatus, response);
      }

      // Success (200) — already shaped as { status: { code, message, data } }
      return response;
    },
    {
      body: "redeem.body",
      response: {
        400: "redeem.error",
        500: "redeem.error"
      }
    }
  )
  .listen(3000);
