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
          return request;
        },
      });
    }
  }
}
