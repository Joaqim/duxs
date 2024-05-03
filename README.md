# Duxs - Node utilites for communicating with Ongoing WMS REST API


[Documentation](https://duxs.joaqim.com)

## Installation

```bash
npm i github.com/Undefined-Stories-AB/duxs.git
```

## Example usage:

```javascript
import { OngoingWMSClient } from "duxs";

const client = new OngoingWMSClient(
  "https://example.com",
  "username",
  "password"
);

(async () => {
  const orders = await client.getAll("/api/v1/orders", {
    goodsOwnerId: 72,
  });
  orders.data.forEach((order) => console.log(order));
})();

```