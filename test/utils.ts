import {
  http,
  type AsyncResponseResolverReturnType,
  type DefaultBodyType,
  type HttpResponseResolver,
  type PathParams,
} from "msw";
/* References used:
 * [1]: https://github.com/mswjs/msw/blob/4de91fd3/src/core/handlers/HttpHandler.ts#L31
 * [2]: https://github.com/mswjs/msw/blob/4de91fd3/src/core/http.ts#L38
 */
/* Narrow param types from string to numbers where applicable; since we are
 * using codegen as source-of-truth */
function typedParams<Params extends Record<string, string | number>>(
  method: keyof typeof http, //  'all' | 'head' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options'
  path: string,
  resolver: (
    params: Params,
    ...rest: any[]
  ) => ReturnType<HttpResponseResolver>,
) {
  return http[method]<PathParams>(path, ({ params, ...rest }) => {
    const converted = Object.fromEntries(
      Object.entries(params).map(([k, v]) => [
        k,
        isNaN(Number(v)) ? v : Number(v),
      ]),
    ) as Params;
    return resolver(converted, { params, ...rest });
  });
}

function createTypedHttpHandler(method: keyof typeof http) {
  return function <Params extends Record<string, string | number>>(
    path: string,
    resolver: (
      params: Params,
      ...rest: any[]
    ) => AsyncResponseResolverReturnType<DefaultBodyType>,
  ) {
    return http[method]<PathParams>(path, ({ params, ...rest }) => {
      const converted = Object.fromEntries(
        Object.entries(params).map(([k, v]) => [
          k,
          isNaN(Number(v)) ? v : Number(v),
        ]),
      ) as Params;
      return resolver(converted, { params, ...rest });
    });
  };
}

export const typedHttp = {
  all: createTypedHttpHandler("all"),
  head: createTypedHttpHandler("head"),
  get: createTypedHttpHandler("get"),
  post: createTypedHttpHandler("post"),
  put: createTypedHttpHandler("put"),
  delete: createTypedHttpHandler("delete"),
  patch: createTypedHttpHandler("patch"),
  options: createTypedHttpHandler("options"),
};
