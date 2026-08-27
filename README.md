# Duxs
A Node library with some utilites for communicating with Ongoing WMS REST API

> ⚠️ Work-in-Progess ⚠️
>> Not for general usage.

[Documentation](https://duxs.joaqim.com)

## Installation

```bash
npm i https://github.com/Undefined-Stories-AB/duxs.git
```

## Example usage:
> NOTE: Top level async in node only works in certain environments.

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

