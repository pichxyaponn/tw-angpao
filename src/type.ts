// src/type.ts

import { Type as t } from "@sinclair/typebox";

export interface RedeemVoucher {
  phoneNumber: string;
  voucherCode: string;
}

export interface VoucherDetails {
  voucher_id: string;
  amount_baht: string;
  redeemed_amount_baht: string;
  member: number;
  status: string;
  link: string;
  detail: string;
  expire_date: number;
  type: string;
  redeemed: number;
  available: number;
}

export interface Profile {
  full_name?: string;
  mobile_number?: string;
}

export interface Ticket {
  mobile: string;
  update_date: number;
  amount_baht: string;
  full_name: string;
  profile_pic: string | null;
}

export interface ApiResponseSuccess {
  status: {
    code: "SUCCESS";
    message: string;
    data: {
      voucher: VoucherDetails;
      owner_profile: Profile;
      redeemer_profile: Profile;
      my_ticket: Ticket;
      tickets: Ticket[];
    };
  };
}

export interface ApiResponseError {
  status: {
    code: string;
    message: string;
    error?: any;
  };
  data?: null;
}

export type ApiResponse = Readonly<ApiResponseSuccess> | Readonly<ApiResponseError>;

// --- Types ---
export const shape = t.Object({
  mobile: t.String(),
  voucher_hash: t.String()
});
