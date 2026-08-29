import { type Client, FetchResponse } from "openapi-fetch";

export type _ExtractFetchResponse<
  Paths,
  Path extends keyof Paths,
  Method extends keyof Paths[Path],
> = Paths[Path][Method] extends infer Op
  ? Op extends Record<string | number, unknown>
    ? Promise<FetchResponse<Op, unknown, `${string}/${string}`>>
    : never
  : never;
export type ExtractFetchResponse<
  Paths,
  Path extends keyof Paths,
  Method extends keyof Paths[Path],
> =
  Paths[Path][Method] extends Record<string | number, unknown>
    ? Promise<
        FetchResponse<Paths[Path][Method], unknown, `${string}/${string}`>
      >
    : never;
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
