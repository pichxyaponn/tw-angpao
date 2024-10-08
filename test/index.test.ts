import { Elysia, t } from 'elysia'
import { TWAngpao } from '../src'

import { describe, expect, it } from 'bun:test'

const post = (path: string, body = {}) =>
    new Request(`http://localhost${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })

describe('TW Angpao Plugin', () => {
    it('should redeem voucher', async () => {
        const app = new Elysia().use(TWAngpao())

        const phoneNumber = '0123456789'
        const voucherCode = 'your-test-voucher-code-here'

        const response = await app.handle(post('/redeem', { phoneNumber, voucherCode }))
        const result = await response.json()

        expect(result).toHaveProperty('status')
    })
})