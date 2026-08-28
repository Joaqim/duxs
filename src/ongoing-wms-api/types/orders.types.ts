import type { components, operations } from "../gen/orders.d.ts";

export type PostParcelUsingIdTypeModel =
  components["schemas"]["PostParcelUsingIdTypeModel"];
export type PostParcelTypeModel = components["schemas"]["PostParcelTypeModel"];
export type PostOrderTrackingModel =
  components["schemas"]["PostOrderTrackingModel"];
export type PostParcelTrackingModel =
  components["schemas"]["PostParcelTrackingModel"];
export type PostOrderModel = components["schemas"]["PostOrderModel"];
export type PostWayBillRowModel = components["schemas"]["PostWayBillRowModel"];
export type PostFileMode = components["schemas"]["PostFileModel"];
export type PatchOrderNumberModel =
  components["schemas"]["PatchOrderNumberModel"];
export type PatchOrderTransporterModel =
  components["schemas"]["PatchOrderTransporterModel"];
export type PatchOrderReturnWaybill =
  components["schemas"]["PatchOrderReturnWaybill"];
export type PatchServicePointCode =
  components["schemas"]["PatchServicePointCode"];
export type PatchOrderWaybill = components["schemas"]["PatchOrderWaybill"];
export type PatchOrderDeliveryDate =
  components["schemas"]["PatchOrderDeliveryDate"] | null;
export type PatchFreightPrice = components["schemas"]["PatchFreightPrice"];
export type OrdersGetAllParamsQuery =
  operations["Orders_GetAll"]["parameters"]["query"];
