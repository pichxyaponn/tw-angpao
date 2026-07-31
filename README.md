# tw-angpao

ระบบรับเงินจาก Truewallet (ซองอั่งเปา) ด้วย [ElysiaJS](https://elysiajs.com/)

## ติดตั้ง:

```bash
bun add @pichxyaponn/tw-angpao
# หรือ
npm install @pichxyaponn/tw-angpao
```

## ตัวอย่างการใช้งาน:

#### example/index.ts

```typescript
import { Elysia, t } from "elysia";
import { TWAngpao } from "@pichxyaponn/tw-angpao";

// Reusable validation models — a single source of truth for both
// runtime validation and TypeScript types.
const models = new Elysia().model({
  "redeem.body": t.Object({
    phoneNumber: t.String({
      minLength: 1,
      description: "Thai mobile number (e.g. 0812345678 or +66812345678)"
    }),
    voucherCode: t.String({
      minLength: 1,
      description: "TrueMoney voucher hash or full gift link"
    })
  }),
  "redeem.error": t.Object({
    status: t.Object({
      code: t.String(),
      message: t.String(),
      error: t.Optional(t.Any())
    }),
    data: t.Optional(t.Any())
  })
});

const app = new Elysia()
  .use(models)
  .use(TWAngpao("TWA"))
  // Elysia v2: route schema comes before the handler — .post(path, schema, handler)
  .post(
    "/redeem",
    {
      body: "redeem.body",
      response: {
        400: "redeem.error",
        500: "redeem.error"
      }
    },
    async ({ body, TWA, status }) => {
      const response = await TWA.redeem(body.phoneNumber, body.voucherCode);

      if (response.status.code !== "SUCCESS") {
        const code = response.status.code;
        // Server-side failures -> 5xx, invalid input / voucher problems -> 4xx
        const httpStatus =
          code.startsWith("HTTP_ERROR_") ||
          code.startsWith("NETWORK_ERROR") ||
          code === "INVALID_JSON_RESPONSE"
            ? 500
            : 400;
        return status(httpStatus, response);
      }

      // Success (200) — already shaped as { status: { code, message, data } }
      return response;
    }
  )
  .listen(3000);
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

#### Status codes จาก TrueMoney (ส่งต่อจาก API ปลายทาง)

| code                   | message                            |
| ---------------------- | ---------------------------------- |
| VOUCHER_OUT_OF_STOCK   | Voucher ticket is out of stock.    |
| TARGET_USER_REDEEMED   | Redeemed                           |
| VOUCHER_NOT_FOUND      | Voucher doesn't exist.             |
| CANNOT_GET_OWN_VOUCHER | Cannot claim your own voucher.     |
| VOUCHER_EXPIRED        | The gift voucher link has expired. |
| SUCCESS                | Voucher redeemed successfully!     |

#### Status codes จากตัว library เอง

| code                  | สาเหตุ                                          |
| --------------------- | ----------------------------------------------- |
| INVALID_PHONE_NUMBER  | เบอร์โทรไม่ใช่รูปแบบเบอร์มือถือไทยที่ถูกต้อง     |
| INVALID_VOUCHER_CODE  | voucher code/link ว่างหรือแกะ code ไม่ได้        |
| HTTP_ERROR_UNKNOWN    | API ปลายทางตอบกลับไม่สำเร็จ (response ไม่ ok)    |
| INVALID_JSON_RESPONSE | API ตอบกลับมาไม่ใช่ JSON ที่ถูกต้อง              |
| NETWORK_ERROR         | error ที่ไม่คาดคิด/เชื่อมต่อปลายทางไม่ได้        |

## Config

### name

ตั้งชื่อให้ Decorate method ได้:

เช่น TWA จะ Decorate Context ด้วย Context.TWA

## Support

มีคำแนะนำหรืออยากช่วยพัฒนา ให้ส่ง Pull Request ได้เลย

### Issues

มีปัญหาหรือฟีเจอร์ที่อยากให้เพิ่ม แจ้งได้ที่ [หน้า Issues](https://github.com/pichxyaponn/tw-angpao/issues)
