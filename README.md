# Duxs

A simple CommonJS and ESM module using
[openapi-typescript](https://openapi-ts.dev/) and
[openapi-fetch](https://openapi-ts.dev/openapi-fetch/) with [Ongoing
WMS](https://ongoingsystems.se) [Rest API Swagger/OpenAPI
Specification](https://developer.ongoingwarehouse.com/REST/v1/index.html#/) to
create a REST API client.

> ⚠️ Work-in-Progess ⚠️
>
> > Not for general usage.

[Documentation](https://duxs.joaqim.com)

## Installation

```bash
npm i https://github.com/Joaqim/duxs.git
```

## Example usage

> NOTE: Top level async in node only works in certain environments.

```javascript
import { OngoingWMSClient } from "duxs";

const client = new OngoingWMSClient({
  BASE_URL: "https://example.com",
  TOKEN: "<ONGOING WMS API TOKEN>",
});

const { articlesApiV1: articles } = client;

(async () => {
  const { data, error } = await articles.getArticles({
    goodsOwnerId: 123,
  });
  if (error) {
    throw new Error(error);
  }
  console.log(JSON.stringify(data, null, 2));
})();
```
