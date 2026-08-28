import { test, assert } from "vitest";
import * as lib from "../src";
import { OngoingWMSClient, ArticlesApiV1, OrdersApiV1 } from "../src";

test("Modules exported from lib", () => {
  assert.isDefined(lib.OngoingWMSClient);
  assert.deepEqual(lib.OngoingWMSClient, OngoingWMSClient);
  assert.isDefined(ArticlesApiV1);
  assert.isDefined(OrdersApiV1);
});
