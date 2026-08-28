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

import { OrdersApiV1 } from "../dist/esm/index.node.js";
import type { paths } from "../src/ongoing-wms-api/gen/orders.d.ts";
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

suite("Orders API V1", async () => {
  const mockOrder = {
    orderId: 54321,
  };
  server.use(
    typedHttp.get<{ orderId: number }>(
      `${BASE_URL}/api/v1/orders/:orderId`,
      ({ orderId }) => {
        return HttpResponse.json(
          {
            ...mockOrder,
            orderId,
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

  const orders = new OrdersApiV1(client);

  it("Can fetch Orders", async () => {
    const { data, error } = await orders.getOrder(12345);

    expect(data).toEqual({
      ...mockOrder,
      orderId: 12345,
    });
    expect(error).toBeUndefined();
  });
});
