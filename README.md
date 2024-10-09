# tw-angpao
ระบบรับเงินจาก Truewallet (ซองอั่งเปา) ด้วย [ElysiaJS](https://elysiajs.com/)

## ติดตั้ง:
```bash
bun add @pichxyaponn/tw-angpao
```

## ตัวอย่างการใช้งาน:

#### example/index.ts

```typescript

import { Elysia, t } from 'elysia'
import { TWAngpao } from '@pichxyaponn/tw-angpao'

const app = new Elysia()
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

```
#### POST
```
host:port/redeem
```

#### Body
```json
{
    "phoneNumber": "0881234567",
    "voucherCode": "c0d3v0ch3r1_c0d3v0ch3r2_c0d3v0ch3r3"
}
```

#### Response
```json
{
    "status": {
        "code": "SUCCESS",
        "message": "Voucher redeemed successfully!",
        "data": {
            "voucher": {
                "voucher_id": "...",
                "amount_baht": "10.00",
                "redeemed_amount_baht": "10.00",
                "member": 1,
                "status": "active",
                "link": "...",
                "detail": "Your pocket money",
                "expire_date": 1728661892014,
                "type": "R",
                "redeemed": 1,
                "available": 0
            },
            "owner_profile": {
                "full_name": "... ***"
            },
            "redeemer_profile": {
                "mobile_number": "..."
            },
            "my_ticket": {
                "mobile": "...",
                "update_date": 1728402860358,
                "amount_baht": "10.00",
                "full_name": "...",
                "profile_pic": null
            },
            "tickets": [
                {
                    "mobile": "...-xxx-...",
                    "update_date": 1728402860358,
                    "amount_baht": "10.00",
                    "full_name": "... ***",
                    "profile_pic": "..."
                }
            ]
        }
    }
}
```

| code                    | message                             |
| ----------------------- | ----------------------------------- |
| VOUCHER_OUT_OF_STOCK    | Voucher ticket is out of stock.     |
| VOUCHER_NOT_FOUND       | Voucher doesn't exist.              |
| CANNOT_GET_OWN_VOUCHER  | Cannot claim your own voucher.      |
| VOUCHER_EXPIRED         | The gift voucher link has expired.  |
| SUCCESS                 | Voucher redeemed successfully!      |

## Config
### name
ตั้งชื่อให้ Decorate method ได้:

เช่น TWA จะ Decorate Context ด้วย Context.TWA

## Support

มีคำแนะนำหรืออยากช่วยพัฒนา ให้ส่ง Pull Request ได้เลย

### Issues

มีปัญหาหรือฟีเจอร์ที่อยากให้เพิ่ม แจ้งได้ที่ [หน้า Issues](https://github.com/pichxyaponn/truewallet-angpao/issues)