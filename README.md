# Duxs

A CommonJS and ESM module using
[openapi-typescript](https://openapi-ts.dev/) and
[openapi-fetch](https://openapi-ts.dev/openapi-fetch/) with [Ongoing
WMS](https://ongoingsystems.se) [Rest API Swagger/OpenAPI
Specification](https://developer.ongoingwarehouse.com/REST/v1/index.html#/)
to create a REST API client.

> ⚠️ Work-in-Progess ⚠️

[Documentation](https://joaqim.github.io/duxs/)

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

### Error handling

Error handling is currently minimal; even a simple failed authentication
returns ambiguous: `{ message: 'Unknown Error' }`

For better insights into a failed response, inspect `response.status`` and
 `response.statusText`:

```typescript
orders.get(12345).then(({ data, error, response }) => {
  if (!data) {
    const { status, statusText } = response;
    console.error(`Failed to fetch article`);
    console.error(`${status}: ${error.message} - ${statusText}`);
    return;
  }
  return data;
});
```

```

```
