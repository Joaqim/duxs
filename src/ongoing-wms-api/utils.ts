import type { Client } from "openapi-fetch";

export class ClientWrapper<T extends object> {
  protected client: Client<T>;
  constructor(client: Client<T>, token?: string) {
    this.client = client;
    if (token) {
      this.client.use({
        onRequest({ request }) {
          request.headers.set("Authorization", `Basic ${token}`);
          request.headers.set("Accept", "application/json");
          request.headers.set("User-Agent", "@primepack/duxs");
          return request;
        },
        onResponse({ response, request }) {
          if (!response.ok) {
            console.log(request, null, 2);
            console.log(response, null, 2);
            throw new Error(
              `${response.url}: ${response.status} ${response.statusText}`,
            );
          }
        },
      });
    }
  }
}
