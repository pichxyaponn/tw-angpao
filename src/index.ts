// src/index.ts

import { Elysia } from "elysia";
import type { Static } from "typebox";
import type { shape, ApiResponse, RedeemVoucher } from "./type";
import { ApiError, JsonParseError, NetworkError, ValidationError } from "./error.class";
import {
  getValidVoucherCode,
  isValidThaiPhoneNumber,
  makeApiRequest,
  parseApiResponse
} from "./utils";

// --- Main redeemVoucher Function ---
async function redeemVoucher({
  phoneNumber,
  voucherCode
}: Readonly<RedeemVoucher>): Promise<ApiResponse> {
  const cleanedPhoneNumber = phoneNumber?.trim() || "";
  const validVoucherCode = voucherCode ? getValidVoucherCode(voucherCode) : "";

  if (!isValidThaiPhoneNumber(cleanedPhoneNumber))
    return {
      status: {
        code: "INVALID_PHONE_NUMBER",
        message: "Invalid Thai Phone Number."
      },
      data: null
    };

  if (!validVoucherCode)
    return {
      status: {
        code: "INVALID_VOUCHER_CODE",
        message: "Invalid Voucher Code."
      },
      data: null
    };

  const url = `https://gift.truemoney.com/campaign/vouchers/${validVoucherCode}/redeem`;
  const body = {
    mobile: cleanedPhoneNumber,
    voucher_hash: validVoucherCode
  } satisfies Static<typeof shape>;

  try {
    const response = await makeApiRequest(url, body);
    return await parseApiResponse(response);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ApiError)
      return {
        status: { code: error.code, message: error.message },
        data: null
      };

    if (error instanceof NetworkError || error instanceof JsonParseError)
      return {
        status: {
          code: error.code,
          message: error.message,
          error: error.cause
        },
        data: null
      };

    // Handle unexpected errors
    // should not happen, but for safety
    console.error("Unexpected error in redeemVoucher:", error);
    throw new NetworkError(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Unexpected error"
    );
  }
}

export const TWAngpao = (name: string = "TWA") => {
  return new Elysia({ name: "tw-angpao", seed: name }).decorate(name, {
    async redeem(phoneNumber: string, voucherCode: string) {
      return redeemVoucher({
        phoneNumber,
        voucherCode
      });
    }
  });
};

export default TWAngpao;
