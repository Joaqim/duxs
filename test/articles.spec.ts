import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import createClient from "openapi-fetch";
import { afterAll, afterEach, beforeAll, expect, it, suite } from "vitest";

import { ArticlesApiV1, OngoingWMSClient } from "../dist/esm/index.node.js";
import type { paths } from "../src/ongoing-wms-api/gen/articles.d.ts";
import type { GetArticleModel } from "../src/ongoing-wms-api/gen/articles.types";
import { typedHttp } from "./utils.ts";

const article123321 =
  import("./__mocks__/article.123321.json") as GetArticleModel;

const server = setupServer();

const BASE_URL = "https://example.com";
const MOCK_TOKEN = "test_token_base64=";

class MockDataWrapper {
  public constructor(readonly token: string) {}
}
class ArticlesMockData extends MockDataWrapper {
  mockArticle: GetArticleModel;
  public constructor(article123321: GetArticleModel) {
    super(MOCK_TOKEN);
    this.mockArticle = {
      ...article123321,
      articleSystemId: 54321,
    };
  }
}

function toObject<K extends PropertyKey, V>(
  entries: Iterable<readonly [K, V]>,
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

let mockData = new ArticlesMockData(article123321);

beforeAll(() => {
  server.listen({
    onUnhandledRequest: (request) => {
      throw new Error(
        `No request handler found for ${request.method} ${request.url}`,
      );
    },
  });
  server.use(
    typedHttp.get<{ articleSystemId: number }>(
      `${BASE_URL}/api/v1/articles/:articleSystemId`,
      ({ articleSystemId }) => {
        return HttpResponse.json(
          {
            ...mockData.mockArticle,
            articleSystemId,
          },
          { status: 200 },
        );
      },
    ),
  );
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

suite("Articles API V1", async () => {
  const mockArticle = mockData.mockArticle;
  // NOTE: use MSW's patched fetch, only required when creating client
  // outside of 'it' closure, see 'beforeAll'
  const fetch = (...args: [i?: any, e?: any]) => globalThis.fetch(...args);

  // Two different ways to create our articles api client:
  // Create and use 'openapi-fetch' client with our ArticleApiV1 class
  const client = createClient<paths>({
    baseUrl: BASE_URL,
    fetch,
  });
  const articles = new ArticlesApiV1(client);

  // Or:
  // Create the OngoingWMSClient and use sub-client articlesApiV1 which is
  // scoped to articles endpoint
  const { articlesApiV1: articlesClientWithToken } = new OngoingWMSClient(
    { BASE_URL, TOKEN: MOCK_TOKEN },
    fetch,
  );

  // Or: We could also do like so:
  const ongoingWMSClientWithInvalidToken = new OngoingWMSClient(
    { BASE_URL, TOKEN: "<Invalid token>" },
    fetch,
  );
  const articlesWithInvalidToken =
    ongoingWMSClientWithInvalidToken.articlesApiV1;

  it("Can fetch Article by system id", async () => {
    const { data, error } = await articles.getArticleBySystemId(12345);

    expect(error).toBeUndefined();
    expect(data).toEqual({
      ...mockArticle,
      articleSystemId: 12345,
    });
  });

  it("Can can handle missing Articles while fetching by system id", async () => {
    server.use(
      // Mock non-existant article:
      typedHttp.get<{ articleSystemId: number }>(
        `${BASE_URL}/api/v1/articles/:articleSystemId`,
        ({ articleSystemId }) => {
          return HttpResponse.json(
            {
              message: `ArticleSystemId ${articleSystemId} not found.`,
            },
            { status: 404 },
          );
        },
      ),
    );
    let { data, error } = await articles.getArticleBySystemId(0);

    expect(data).toBeUndefined;
    expect(error).toEqual({ message: "ArticleSystemId 0 not found." });

    ({ data, error } = await articles.getArticleBySystemId(12345));

    expect(data).toBeUndefined;
    expect(error).toEqual({ message: "ArticleSystemId 12345 not found." });
  });

  it("Requests have token in header", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/articles`, ({ request }) => {
        const token = request.headers.get("Authorization")?.split(" ")[1];
        if (!token) {
          return HttpResponse.json(
            {
              message: "Failed to authenticate.",
            },
            { status: 401, headers: { "WWW-Authenticate": "Bearer" } },
          );
        }
        if (token !== mockData.token) {
          return HttpResponse.json(
            {
              // NOTE: paraphrased
              message: "Wrong password/username.",
            },
            { status: 401 },
          );
        }
        return HttpResponse.json([mockArticle]);
      }),
    );

    let { data, error, response } = await articles.getArticles({
      goodsOwnerId: 0,
    });
    expect(data).toBeUndefined();
    expect(error).toEqual({ message: "Failed to authenticate." });
    expect(toObject(response.headers)).toHaveProperty(
      "www-authenticate",
      "Bearer",
    );

    ({ data, error } = await articlesClientWithToken.getArticles({
      goodsOwnerId: 0,
    }));

    expect(error).toBeUndefined();
    expect(data).toEqual([mockArticle]);

    ({ data, error } = await articlesWithInvalidToken.getArticles({
      goodsOwnerId: 0,
    }));

    expect(data).toBeUndefined();
    expect(error).toEqual({ message: "Wrong password/username." });
  });
});
