import { describe, expect, it } from "vitest";
import { expectTypeOf } from "vitest";
import type { ArticlesApiV1Base } from "../src/ongoing-wms-api/gen/articles.client";
import type { OrdersApiV1Base } from "../src/ongoing-wms-api/gen/orders.client";
import { ArticlesApiV1, OrdersApiV1 } from "../src";

describe("hand subclasses extend generated bases", () => {
  it("ArticlesApiV1 extends ArticlesApiV1Base", () => {
    expectTypeOf<ArticlesApiV1>().toExtend<ArticlesApiV1Base>();
  });

  it("OrdersApiV1 extends OrdersApiV1Base", () => {
    expectTypeOf<OrdersApiV1>().toExtend<OrdersApiV1Base>();
  });

  it("deprecated typo alias delegates with identical signature", () => {
    expectTypeOf<ArticlesApiV1["putArticleFilyById"]>().toEqualTypeOf<
      ArticlesApiV1Base["putArticlesFileById"]
    >();
  });
});
