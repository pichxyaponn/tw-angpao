// src/utils.ts

import { type ApiResponse, type ApiResponseError, type ApiResponseSuccess } from "./type";
import { ApiError, JsonParseError } from "./error.class";

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
    body: JSON.stringify(body)
  });
  return response;
}

// --- Response Shape Guards ---
// `response.json()` yields `unknown`. These narrow it without an unchecked cast,
// so a provider that changes its payload fails here rather than at the caller's
// first property access.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiResponseSuccess(value: unknown): value is ApiResponseSuccess {
  if (!isRecord(value) || !isRecord(value.status)) return false;
  return value.status.code === "SUCCESS" && isRecord(value.status.data);
}

function isApiResponseError(value: unknown): value is ApiResponseError {
  if (!isRecord(value) || !isRecord(value.status)) return false;
  return typeof value.status.code === "string";
}

// --- Response Parse Function ---
export async function parseApiResponse(response: Readonly<Response>): Promise<ApiResponse> {
  if (!response?.ok) {
    try {
      const errorData: unknown = await response?.json();
      if (isApiResponseError(errorData)) {
        return errorData;
      }
    } catch {
      // ignore parse error; fall through to throwing an ApiError below
    }
    throw new ApiError(
      `HTTP_ERROR_${response?.ok ? "OK" : "UNKNOWN"}`,
      `API request failed: ${response?.statusText || "Unknown"}`
    );
  }

  let data: unknown;
  try {
    data = await response?.json();
  } catch (jsonError) {
    throw new JsonParseError("API returned invalid JSON", jsonError);
  }

  if (isApiResponseSuccess(data)) return data;
  if (isApiResponseError(data)) return data;

  // Parsed as JSON but carries no `status.code`. Returning it as an
  // ApiResponseError would hand the caller a value that throws the moment they
  // read `.status.message`, so fail here instead.
  throw new ApiError("MALFORMED_RESPONSE", "API returned JSON in an unrecognised shape");
}
