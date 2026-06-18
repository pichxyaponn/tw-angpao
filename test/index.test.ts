// test/index.test.ts
import { Elysia, t } from "elysia";
import { TWAngpao } from "../src";
import { getValidVoucherCode, isValidThaiPhoneNumber } from "../src/utils";
import { describe, expect, it, beforeEach, mock, spyOn } from "bun:test";

// --- Mock fetch ---
const mockFetch = mock(globalThis.fetch);
globalThis.fetch = Object.assign(mockFetch, { preconnect: () => {} });

const successBody = {
  status: {
    code: "SUCCESS",
    message: "OK",
    data: { voucher: { amount_baht: "10.00" } }
  }
};

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
    app = new Elysia().use(TWAngpao()).post(
      "/redeem",
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
      },
      {
        body: t.Object({
          phoneNumber: t.String(),
          voucherCode: t.String()
        })
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

  it("should redeem successfully", async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify(successBody), { status: 200 }));

    const response = await app.handle(post("/redeem", { phoneNumber: "0812345678", voucherCode: "ABCDEF" }));
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.status.code).toBe("SUCCESS");
    expect(result.status.data.voucher.amount_baht).toBe("10.00");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should return HTTP_ERROR_UNKNOWN when the API responds non-OK without a JSON body", async () => {
    mockFetch.mockResolvedValue(new Response("Internal Server Error", { status: 500 }));

    const response = await app.handle(post("/redeem", { phoneNumber: "0812345678", voucherCode: "ABCDEF" }));
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.status.code).toBe("HTTP_ERROR_UNKNOWN");
  });

  it("should return INVALID_JSON_RESPONSE when the API responds OK with invalid JSON", async () => {
    mockFetch.mockResolvedValue(new Response("this is not json{", { status: 200 }));

    const response = await app.handle(post("/redeem", { phoneNumber: "0812345678", voucherCode: "ABCDEF" }));
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.status.code).toBe("INVALID_JSON_RESPONSE");
  });

  it("should surface a NETWORK_ERROR when fetch rejects", async () => {
    const errSpy = spyOn(console, "error").mockImplementation(() => {});
    mockFetch.mockRejectedValue(new Error("network down"));

    const response = await app.handle(post("/redeem", { phoneNumber: "0812345678", voucherCode: "ABCDEF" }));
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.status.code).toBe("NETWORK_ERROR");
    errSpy.mockRestore();
  });

  it("should accept a +66 / separated phone number and call the API", async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify(successBody), { status: 200 }));

    const response = await app.handle(post("/redeem", { phoneNumber: "+66 81-234-5678", voucherCode: "ABCDEF" }));

    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should extract the voucher code from a full gift link", async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify(successBody), { status: 200 }));

    const response = await app.handle(
      post("/redeem", {
        phoneNumber: "0812345678",
        voucherCode: "https://gift.truemoney.com/campaign/?v=ABC123XYZ"
      })
    );

    expect(response.status).toBe(200);
    const calledUrl = String(mockFetch.mock.calls[0][0]);
    expect(calledUrl).toContain("/vouchers/ABC123XYZ/redeem");
  });
});

describe("getValidVoucherCode", () => {
  it("returns a plain alphanumeric code unchanged", () => {
    expect(getValidVoucherCode("ABC123")).toBe("ABC123");
  });

  it("extracts the code from a ?v= gift link", () => {
    expect(getValidVoucherCode("https://gift.truemoney.com/campaign/?v=XYZ789")).toBe("XYZ789");
  });

  it("returns an empty string for symbol-only input", () => {
    expect(getValidVoucherCode("!!!")).toBe("");
  });

  it("returns an empty string for empty input", () => {
    expect(getValidVoucherCode("")).toBe("");
  });
});

describe("isValidThaiPhoneNumber", () => {
  it.each(["0612345678", "0812345678", "0912345678"])("accepts valid mobile %s", (n) => {
    expect(isValidThaiPhoneNumber(n)).toBe(true);
  });

  it("normalizes the 66 country code", () => {
    expect(isValidThaiPhoneNumber("66812345678")).toBe(true);
    expect(isValidThaiPhoneNumber("+66812345678")).toBe(true);
  });

  it("ignores separators", () => {
    expect(isValidThaiPhoneNumber("081-234-5678")).toBe(true);
  });

  it.each(["0712345678", "0512345678", "12345", "INVALID", ""])("rejects %s", (n) => {
    expect(isValidThaiPhoneNumber(n)).toBe(false);
  });
});
