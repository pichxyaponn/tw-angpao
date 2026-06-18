// src/utils.ts

import {
  shape,
  type ApiResponse,
  type ApiResponseError,
  type ApiResponseSuccess
} from "./type.d";
import createAccelerator from "json-accelerator";
import { ApiError, JsonParseError } from "./error.class";
import { TypeCompiler } from "@sinclair/typebox/compiler";

// --- Pre-compiled schema (compiled once at module load, reused per request) ---
const guard = TypeCompiler.Compile(shape);
const encode = createAccelerator(shape);

// --- Validation Functions ---
export function getValidVoucherCode(voucherCode: Readonly<string>): string {
  const parts = voucherCode.split("?v=");
  const codeToTest = parts[1] || parts[0];

  const match = codeToTest.match(/[0-9A-Za-z]+/);
  return match ? match[0] : "";
}

const thaiPhoneNumberRegex = /^0[689]\d{8}$/;
export function isValidThaiPhoneNumber(phoneNumber: Readonly<string>): boolean {
  const cleanedNumber = phoneNumber.replace(/[^\d]/g, "");

  // Check if the number starts with "66" (thai code)
  if (cleanedNumber.startsWith("66") && cleanedNumber.length === 11) {
    return thaiPhoneNumberRegex.test("0" + cleanedNumber.substring(2));
  }

  return thaiPhoneNumberRegex.test(cleanedNumber);
}

// --- API Request Function ---
export async function makeApiRequest(
  url: Readonly<string>,
  body: Readonly<{
    mobile: string;
    voucher_hash: string;
  }>
): Promise<Response> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: guard.Check(body) ? encode(body) : JSON.stringify(body)
  });
  return response;
}

// --- Response Parse Function ---
export async function parseApiResponse(response: Readonly<Response>): Promise<ApiResponse> {
  if (!response?.ok) {
    try {
      const errorData = await response?.json();
      if (errorData) {
        return errorData as ApiResponseError;
      }
    } catch {
      // ignore parse error; fall through to throwing an ApiError below
    }
    throw new ApiError(
      `HTTP_ERROR_${response?.ok ? "OK" : "UNKNOWN"}`,
      `API request failed: ${response?.statusText || "Unknown"}`
    );
  }

  try {
    const data: any = await response?.json();
    if (data?.status?.code === "SUCCESS" && data?.status?.data) return data as ApiResponseSuccess;
    else return data as ApiResponseError;
  } catch (jsonError) {
    throw new JsonParseError("API returned invalid JSON", jsonError);
  }
}
