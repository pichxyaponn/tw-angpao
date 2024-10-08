// src/index.ts

import { Elysia, t } from 'elysia'

export interface RedeemVoucher {
    phoneNumber: string
    voucherCode: string
}

function isValidVoucherCode(voucherCode: string): boolean {
    return /^[a-z0-9]*$/i.test(voucherCode) && voucherCode.length >= 4
}

function getValidVoucherCode(voucherCode: string): string {
    const splitVoucherCode = (voucherCode + '').split('v=')
    const matchedVoucher = (splitVoucherCode[1] || splitVoucherCode[0]).match(/[0-9A-Za-z]+/)
    if (matchedVoucher && matchedVoucher.length > 0)
        return matchedVoucher[0]
        
    return ''
}

function isValidThaiPhoneNumber(phoneNumber: string): boolean {
    const thaiPhoneNumberRegex = /^(?:0)[689]\d{8}$/
    return thaiPhoneNumberRegex.test(phoneNumber) && phoneNumber.length == 10
}

async function redeemVoucher({ phoneNumber, voucherCode }: RedeemVoucher) {
    voucherCode = getValidVoucherCode(voucherCode)
    if (!isValidVoucherCode(voucherCode)) {
        return {
            status: {
                code: 'INVALID_VOUCHER_CODE',
                message: 'Invalid Voucher Code.'
            }
        }
    }

    phoneNumber = phoneNumber.trim()
    if (!isValidThaiPhoneNumber(phoneNumber)) {
        return {
            status: {
                code: 'INVALID_PHONE_NUMBER',
                message: 'Invalid Thai Phone Number.'
            }
        }
    }

    try {
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
        return data
    } catch (err) {
        return err
    }
}

export const TWAngpao = <const Name extends string = 'TWA'>(name = 'TWA' as Name) => {
    return new Elysia()
    .decorate(name as Name extends string ? Name : 'TWA', {
        async redeem(phoneNumber: string, voucherCode: string) {
            return await redeemVoucher({phoneNumber, voucherCode} as RedeemVoucher)
        }
    })
}
export default TWAngpao