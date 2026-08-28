import { HttpResponse } from "msw";
import { setupServer } from "msw/node";
import createClient from "openapi-fetch";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  suite,
  test,
} from "vitest";

import { ArticlesApiV1 } from "../dist/esm/index.node.js";
import type { paths } from "../src/ongoing-wms-api/gen/articles.d.ts";
import { typedHttp } from "./utils.ts";

const server = setupServer();

const BASE_URL = "https://example.com";

beforeAll(() => {
  server.listen({
    onUnhandledRequest: (request) => {
      throw new Error(
        `No request handler found for ${request.method} ${request.url}`,
      );
    },
  });
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

suite("Articles API V1", async () => {
  const mockArticle = {
    articleSystemId: 54321,
  };
  server.use(
    typedHttp.get<{ articleSystemId: number }>(
      `${BASE_URL}/api/v1/articles/:articleSystemId`,
      ({ articleSystemId }) => {
        return HttpResponse.json(
          {
            ...mockArticle,
            articleSystemId,
          },
          { status: 200 },
        );
      },
    ),
  );

  const client = createClient<paths>({
    baseUrl: BASE_URL,
    // NOTE: use MSW's patched fetch, only required when creating client
    // outside of 'it' closure, see 'beforeAll'
    fetch: (...args) => globalThis.fetch(...args),
  });

  const articles = new ArticlesApiV1(client);

  it("Can fetch Articles", async () => {
    const { data, error } = await articles.getArticleBySystemId(12345);

    expect(data).toEqual({
      ...mockArticle,
      articleSystemId: 12345,
    });
    expect(error).toBeUndefined();
  });
});
