export type FetchLike = (
  input: Request | URL | string,
  init?: RequestInit,
) => Promise<Response>;

/**
 * Default transport. `undefined` defers to the ambient `fetch` of the
 * runtime, which is correct in browsers and in test environments where
 * `fetch` is intercepted (msw). The Node ESM build substitutes
 * `transport.node.ts` for this module at build time.
 */
export const transport: FetchLike | undefined = undefined;
