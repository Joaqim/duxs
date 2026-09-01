# Duxs

A simple CommonJS and ESM module using
[openapi-typescript](https://openapi-ts.dev/) and
[openapi-fetch](https://openapi-ts.dev/openapi-fetch/) with [Ongoing
WMS](https://ongoingsystems.se) [Rest API Swagger/OpenAPI
Specification](https://developer.ongoingwarehouse.com/REST/v1/index.html#/)
to create a REST API client.

> ⚠️ Work-in-Progess ⚠️
>
> Error handling is minimal, even a simple failed authentication returns ambiguous: `{ message: 'Unknown Error' }`

[Documentation](https://duxs.joaqim.com)

## Installation

```bash
npm i https://github.com/Joaqim/duxs.git
```

## Example usage

```typescript
import { OngoingWMSClient } from "duxs";

const client = new OngoingWMSClient({
  BASE_URL: "https://example.com",
  TOKEN: "<ONGOING WMS API TOKEN>",
});

const { articlesApiV1: articles } = client;

articles
  .getArticles({
    goodsOwnerId: 123,
    maxArticlesToGet: 1,
  })
  .then(({ data, error }) => {
    if (error) {
      console.error(error);
      return;
    }
    console.log(JSON.stringify(data, null, 2));
  });
```
