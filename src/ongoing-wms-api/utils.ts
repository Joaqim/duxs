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

/**
 * Error payload returned by the Ongoing WMS REST API when a request fails.
 *
 * The vendored OpenAPI specs declare only 2xx responses, so this shape is
 * observed behavior (see test/articles.spec.ts mocks), not spec-derived.
 * The HTTP status code is available on `response.status`.
 *
 * This is a friendly narrowing of what openapi-fetch actually yields in
 * `error`: `undefined` when a non-OK response has an empty body, and the raw
 * response text when the body is not JSON (a gateway HTML page, for example).
 * The widening is deliberate, traded for ergonomic narrowing on `message`;
 * inspect `response.status` and `response.text()` when the payload is missing.
 */
export type OngoingError = { message: string };

/**
 * Envelope returned by every wrapper method.
 *
 * - `data`: the operation's 2xx response body; `undefined` otherwise
 * - `error`: the error payload when the response was not OK; `undefined` on success
 * - `response`: the original fetch Response (status, headers)
 *
 * This mirrors openapi-fetch's FetchResponse shape with friendly names, so
 * typedoc renders the alias instead of a deep conditional type.
 */
export type ApiResponse<Data> =
  | { data: Data; error?: undefined; response: Response }
  | { data?: undefined; error: OngoingError; response: Response };
