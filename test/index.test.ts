// test/index.test.ts
import { Elysia, t } from "elysia";
import { TWAngpao } from "../src";
import { describe, expect, it, beforeEach, mock } from "bun:test";

// --- Mock fetch ---
const mockFetch = mock(globalThis.fetch);
globalThis.fetch = Object.assign(mockFetch, { preconnect: () => {} });

const post = (path: string, body = {}) =>
  new Request(`http://localhost${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

describe("TW Angpao Plugin", () => {
  let app: Elysia;

  beforeEach(() => {
    mockFetch.mockReset();
    // Elysia v2: route schema comes before the handler — .post(path, schema, handler)
    app = new Elysia().use(TWAngpao()).post(
      "/redeem",
      {
        body: t.Object({
          phoneNumber: t.String(),
          voucherCode: t.String()
        })
      },
      async ({ body, TWA, set }) => {
        try {
          const response = await TWA.redeem(body.phoneNumber, body.voucherCode);

          if (response.status.code === "SUCCESS") {
            set.status = 200;
          } else if (
            (response.status.code as string).startsWith("HTTP_ERROR_") ||
            (response.status.code as string).startsWith("NETWORK_ERROR") ||
            (response.status.code as string).length === 0 ||
            response.status.code === "INVALID_JSON_RESPONSE"
          ) {
            set.status = 500;
          } else {
            set.status = 400; // Bad Request
          }

          return response;
        } catch (error: any) {
          set.status = 500; // Handle custom errors
          return {
            status: {
              code: error.code ?? "INTERNAL_SERVER_ERROR",
              message: error.message ?? "An unexpected error occurred.",
              ...(error.cause && { error: error.cause })
            }
          };
        }
      }
    );
  });

  it("should return an error for an invalid phone number", async () => {
    const phoneNumber = "INVALID_PHONENUMBER"; // Invalid
    const voucherCode = "VALID_CODE";

    const response = await app.handle(post("/redeem", { phoneNumber, voucherCode }));
    const result = await response.json(); //parse as JSON

    expect(response.status).toBe(400);
    expect(result.status.code).toBe("INVALID_PHONE_NUMBER");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should return an error for an invalid voucher code", async () => {
    const phoneNumber = "0643456789";
    const voucherCode = ""; // Invalid

    const response = await app.handle(post("/redeem", { phoneNumber, voucherCode }));
    const result = await response.json(); //parse as JSON

    expect(response.status).toBe(400);
    expect(result.status.code).toBe("INVALID_VOUCHER_CODE");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should handle API errors", async () => {
    const mockApiError = {
      status: { code: "VOUCHER_EXPIRED", message: "Voucher has expired" }
    };
    mockFetch.mockResolvedValue(new Response(JSON.stringify(mockApiError), { status: 400 }));

    const phoneNumber = "0643456789";
    const voucherCode = "VALID_CODE";

    const response = await app.handle(post("/redeem", { phoneNumber, voucherCode }));
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result).toEqual(mockApiError);
    expect(mockFetch).toHaveBeenCalledTimes(1); // Expect fetch to be called
  });
});
