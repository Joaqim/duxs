import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  operationIdFallbackName,
  operationKey,
  resolveCollisions,
  toMethodName,
  toResponseAliasName,
} from "../scripts/codegen-names.mts";

describe("toMethodName", () => {
  it.each([
    ["get", "/api/v1/articles", "getArticles"],
    ["get", "/api/v1/articles/{articleSystemId}", "getArticleBySystemId"],
    ["get", "/api/v1/articles/{articleSystemId}/files", "getArticlesFiles"],
    [
      "put",
      "/api/v1/articles/{articleSystemId}/files/{fileId}",
      "putArticlesFileById",
    ],
    ["post", "/api/v1/articles/byQuery", "postArticlesByQuery"],
    ["put", "/api/v1/articles", "putArticles"],
    ["get", "/api/v1/orders/{orderId}", "getOrderById"],
    ["put", "/api/v1/orders", "putOrders"],
    [
      "delete",
      "/api/v1/orders/{orderId}/wayBillRows/{wayBillRowId}",
      "deleteOrdersWayBillRowById",
    ],
    [
      "patch",
      "/api/v1/orders/{orderId}/lines/{orderLineId}/comment",
      "patchOrdersLinesComment",
    ],
  ])("%s %s -> %s", (method, path, expected) => {
    expect(toMethodName(method, path)).toBe(expected);
  });
});

describe("collision resolution", () => {
  it("falls back to operationId-derived names for both colliding ops", () => {
    const resolved = resolveCollisions([
      {
        method: "get",
        path: "/api/v1/articles/{articleSystemId}/dangerousGoods",
        operationId: "Articles_GetDangerousGoods",
      },
      {
        method: "get",
        path: "/api/v1/articles/dangerousGoods",
        operationId: "Articles_GetDangerousGoodsByArticleNumber",
      },
      {
        method: "get",
        path: "/api/v1/articles",
        operationId: "Articles_GetAll",
      },
    ]);
    expect(
      resolved.get(
        operationKey(
          "get",
          "/api/v1/articles/{articleSystemId}/dangerousGoods",
        ),
      ),
    ).toBe("getDangerousGoods");
    expect(
      resolved.get(operationKey("get", "/api/v1/articles/dangerousGoods")),
    ).toBe("getDangerousGoodsByArticleNumber");
    expect(resolved.get(operationKey("get", "/api/v1/articles"))).toBe(
      "getArticles",
    );
  });

  it("both vendored specs resolve to unique method names", () => {
    for (const spec of ["articles", "orders"]) {
      const specJson = JSON.parse(
        readFileSync(`vendor/${spec}.json`, "utf-8"),
      ) as {
        paths: Record<string, Record<string, { operationId?: string }>>;
      };
      const ops = Object.entries(specJson.paths).flatMap(([path, methods]) =>
        Object.entries(methods)
          .filter(([, op]) => op.operationId)
          .map(([method, op]) => ({
            method,
            path,
            operationId: op.operationId!,
          })),
      );
      const resolved = resolveCollisions(ops);
      const names = [...resolved.values()];
      expect(new Set(names).size).toBe(names.length);
      expect(names.length).toBe(ops.length);
    }
  });

  it("operationIdFallbackName strips the tag prefix and lowercases", () => {
    expect(operationIdFallbackName("Articles_GetDangerousGoods")).toBe(
      "getDangerousGoods",
    );
  });
});

describe("toResponseAliasName", () => {
  it("derives PascalCase alias from method name", () => {
    expect(toResponseAliasName("getArticleBySystemId")).toBe(
      "GetArticleBySystemIdResponse",
    );
  });
});
