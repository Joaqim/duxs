import type { KeyOfType } from "../typings/KeyOfType";
import { paths } from "..";

// Endpoint URLs that accept param and returns json content
export type GetEndpoint = KeyOfType<
  paths,
  {
    get: {
      parameters: { query: object };
      responses: {
        200: {
          content: { "application/json": object };
        };
      };
    };
  }
>;

export const AllGetEndpoints: Array<GetEndpoint> = [
  "/api/v1/articleItems/statuses",
  "/api/v1/articles/classes",
  "/api/v1/articles/dangerousGoods",
  "/api/v1/articles/historicalInventory",
  "/api/v1/articles/inventoryPerWarehouse",
  "/api/v1/articles/structureDefinitions",
  "/api/v1/orders",
  "/api/v1/orders/classes",
  "/api/v1/orders/types",
  "/api/v1/orders/wayOfDeliveryTypes",
  "/api/v1/purchaseOrders/types",
  "/api/v1/returnOrders",
  "/api/v1/returnOrders/returnCauses",
] as const;

export type GetParameters<TEndpoint extends GetEndpoint> =
  paths[TEndpoint]["get"]["parameters"]["query"];
export type GetModel<TEndpoint extends GetEndpoint> =
  paths[TEndpoint]["get"]["responses"][200]["content"]["application/json"];
