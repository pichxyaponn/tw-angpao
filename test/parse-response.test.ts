// test/parse-response.test.ts
//
// parseApiResponse turns an unknown JSON body into a typed ApiResponse. It used
// to cast whatever it parsed, so a payload with no `status` was handed back as an
// ApiResponseError and blew up at the caller's first property read. These cover
// the shapes that cast used to wave through.
import { describe, expect, it } from "bun:test";
import { parseApiResponse } from "../src/utils";
import { ApiError, JsonParseError } from "../src/error.class";

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init
  });

const successBody = {
  status: {
    code: "SUCCESS",
    message: "OK",
    data: { voucher: { amount_baht: "10.00" } }
  }
};

describe("parseApiResponse", () => {
  it("returns a success payload unchanged", async () => {
    const result = await parseApiResponse(json(successBody));
    expect(result.status.code).toBe("SUCCESS");
  });

  it("returns an error payload when the code is not SUCCESS", async () => {
    const body = { status: { code: "VOUCHER_OUT_OF_STOCK", message: "gone" } };
    const result = await parseApiResponse(json(body));
    expect(result.status.code).toBe("VOUCHER_OUT_OF_STOCK");
  });

  it("treats SUCCESS without a data object as an error payload, not a success", async () => {
    const body = { status: { code: "SUCCESS", message: "OK" } };
    const result = await parseApiResponse(json(body));
    expect("data" in result.status).toBe(false);
  });

  it("throws ApiError when the JSON has no status at all", async () => {
    await expect(parseApiResponse(json({ unexpected: true }))).rejects.toBeInstanceOf(ApiError);
  });

  it("throws ApiError when status.code is not a string", async () => {
    await expect(parseApiResponse(json({ status: { code: 500 } }))).rejects.toBeInstanceOf(
      ApiError
    );
  });

  it("throws ApiError on a JSON null body", async () => {
    await expect(parseApiResponse(json(null))).rejects.toBeInstanceOf(ApiError);
  });

  it("throws JsonParseError when the body is not JSON", async () => {
    const notJson = new Response("<html>502 Bad Gateway</html>", {
      status: 200,
      headers: { "content-type": "text/html" }
    });
    await expect(parseApiResponse(notJson)).rejects.toBeInstanceOf(JsonParseError);
  });

  describe("non-ok responses", () => {
    it("returns the error payload when the body carries one", async () => {
      const body = { status: { code: "UNAUTHORIZED", message: "bad token" } };
      const result = await parseApiResponse(json(body, { status: 401 }));
      expect(result.status.code).toBe("UNAUTHORIZED");
    });

    it("throws ApiError when a non-ok body is unusable", async () => {
      const body = { message: "nope" };
      await expect(parseApiResponse(json(body, { status: 500 }))).rejects.toBeInstanceOf(ApiError);
    });

    it("throws ApiError when a non-ok body is not JSON", async () => {
      const html = new Response("<html>504</html>", {
        status: 504,
        headers: { "content-type": "text/html" }
      });
      await expect(parseApiResponse(html)).rejects.toBeInstanceOf(ApiError);
    });
  });
});
