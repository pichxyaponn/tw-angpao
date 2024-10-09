// example/index.ts

import { Elysia, t } from 'elysia'
import { TWAngpao } from '../src'

const app = new Elysia()
.use(TWAngpao('TWA'))
.post('/redeem', async ({ body, TWA }) => {
    const response = await TWA.redeem(body.phoneNumber, body.voucherCode)
    if (response.status.code !== 'SUCCESS') { // If not success
        return {
            status: {
                code: response.status.code,
                message: response.status.message
            }
        }
    }

    return { // If successful
        status: {
            code: 'SUCCESS',
            message: 'Voucher redeemed successfully!'
        },
        data: response.data
    }
}, {
    body: t.Object({
        phoneNumber: t.String(),
        voucherCode: t.String()
    })
})
.listen(3000)