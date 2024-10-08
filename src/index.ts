// src/index.ts

import { Elysia, t } from 'elysia'

export class RedeemError extends Error {
    constructor(public message: string, public code: string) {
        super(message)
    }
}

export interface RedeemVoucher {
    phoneNumber: string
    voucherCode: string
}

export interface RedemptionResult {
    status: object
    data: object
}

interface PluginConfig {
    name?: string
}

function isValidVoucherCode(voucherCode: string): boolean {
    return /^[a-z0-9]*$/i.test(voucherCode) && voucherCode.length >= 4
}

function getValidVoucherCode(voucherCode: string): string {
    const splitVoucherCode = (voucherCode + '').split('v=')
    const matchedVoucher = (splitVoucherCode[1] || splitVoucherCode[0]).match(/[0-9A-Za-z]+/)
    if (matchedVoucher && matchedVoucher.length > 0)
        return matchedVoucher[0]
        
    throw new RedeemError('Invalid Voucher Code.', 'INVALID_VOUCHER_CODE')
}

function isValidThaiPhoneNumber(phoneNumber: string): boolean {
    const thaiPhoneNumberRegex = /^(?:0)[689]\d{8}$/
    return thaiPhoneNumberRegex.test(phoneNumber) && phoneNumber.length == 10
}

async function redeemVoucher({ phoneNumber, voucherCode }: RedeemVoucher): Promise<RedemptionResult> {
    voucherCode = getValidVoucherCode(voucherCode)
    if (!isValidVoucherCode(voucherCode)) {
        throw new RedeemError('Invalid Voucher Code: It must consist of only English alphabets or numbers and be followed by more than 4 digits.', 'INVALID_VOUCHER_CODE')
    }

    phoneNumber = phoneNumber.trim()
    if (!isValidThaiPhoneNumber(phoneNumber)) {
        throw new RedeemError('Invalid Thai phone number. It must start with 0, followed by 9 digits.', 'INVALID_PHONE_NUMBER')
    }

    // Make API request to redeem voucher
    const url = `https://gift.truemoney.com/campaign/vouchers/${voucherCode}/redeem`
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            mobile: phoneNumber,
            voucher_hash: voucherCode
        })
    })

    const data: any = await response.json()
    if (data.status.code === 'SUCCESS') {
        return data
    }
    throw new RedeemError(data.status.message, data.status.code)
}

export const TWAngpao = () => {
    return new Elysia()
    .decorate('TWAngpao', {
        async redeem(phoneNumber: string, voucherCode: string) {
            return await redeemVoucher({phoneNumber, voucherCode})
        }
    })
    .post('/redeem', ({ body, TWAngpao }) => TWAngpao.redeem(body.phoneNumber, body.voucherCode), {
        body: t.Object({
            phoneNumber: t.String(),
            voucherCode: t.String()
        })
    })
    .error({ RedeemError }).onError(({code, error, set}) => {
        const errCode = code.toString()
        const errMsg = error.toString().replace("Error: ", "")

        set.status = 400
        if (errCode === 'INTERNAL_ERROR')
            set.status = 500

        return {
            status: 'ERROR',
            code: errCode,
            message: errMsg
        }
    })
}