# Duxs

A [CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules) and [ECMAScript](https://nodejs.org/api/esm.html#modules-ecmascript-modules) module using vendored [Ongoing WMS](https://ongoingsystems.se) [Rest API Swagger/OpenAPI Specification](https://developer.ongoingwarehouse.com/REST/v1/index.html#/) with [openapi-typescript](https://openapi-ts.dev/) and custom codegen with [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) to generate REST API client(s).

[Documentation](https://joaqim.github.io/duxs/)

## Installation

### From GitHub

```bash
npm i https://github.com/Joaqim/duxs.git
```

### From NPM

```bash
npm i @primepack/duxs
```

## Example usage

For more info about authentication, go to [Ongoing WMS Goods Owner REST API
Documentation](https://developer.ongoingwarehouse.com/REST/v1/index.html).

```typescript
import { OngoingWMSClient } from "@primepack/duxs";

const client = new OngoingWMSClient({
  BASE_URL: "https://api.ongoingsystems.se/apidemo",
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

For more in-depth and functional example, see:
[./example/index.ts](https://github.com/Joaqim/duxs/blob/main/example/index.ts).

### Error handling

Error handling is currently minimal; even a simple failed
authentication returns ambiguous: `{ message: 'Unknown
Error' }`

For better insights into a failed response, inspect
`response.status`` and`response.statusText`:

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

Output:

```
404: ArticleSystemId 123 not found -
```

In this case, the `responseText` of the `response` object
is empty; the `404` indication and accompanying message
_from_ Ongoing WMS API endpoint is the pertinent info.
