import type { components, operations, paths } from "./gen/orders.d.ts";
import type { PostFileNoFilenameModel } from "./types/shared.types.ts";
import { ClientWrapper } from "./utils";

export type PostParcelUsingIdTypeModel = components["schemas"]["PostParcelUsingIdTypeModel"];
export type PostParcelTypeModel = components["schemas"]["PostParcelTypeModel"];
export type PostOrderTrackingModel = components["schemas"]["PostOrderTrackingModel"];
export type PostParcelTrackingModel = components["schemas"]["PostParcelTrackingModel"];
export type PostOrderModel = components["schemas"]["PostOrderModel"];
export type PostWayBillRowModel = components["schemas"]["PostWayBillRowModel"];
export type PostFileMode = components["schemas"]["PostFileModel"];
export type PatchOrderNumberModel = components["schemas"]["PatchOrderNumberModel"];
export type PatchOrderTransporterModel = components["schemas"]["PatchOrderTransporterModel"];
export type PatchOrderReturnWaybill = components["schemas"]["PatchOrderReturnWaybill"];
export type PatchServicePointCode = components["schemas"]["PatchServicePointCode"];
export type PatchOrderWaybill = components["schemas"]["PatchOrderWaybill"];
export type PatchOrderDeliveryDate = components["schemas"]["PatchOrderDeliveryDate"] | null;
export type PatchFreightPrice = components["schemas"]["PatchFreightPrice"];
export type OrdersGetAllParamsQuery = operations["Orders_GetAll"]["parameters"]["query"];


export class OrdersApiV1 extends ClientWrapper<paths> {
  updateParcelUsingId(orderId: number, parcelId: number, body: PostParcelUsingIdTypeModel) {
    return this.client.PUT("/api/v1/orders/{orderId}/parcels/{parcelId}", {
      params: {
        path: {
          orderId,
          parcelId
        },
      },
      body
    });
  }
  deleteParcel(orderId: number, parcelId: number) {
    return this.client.DELETE("/api/v1/orders/{orderId}/parcels/{parcelId}", {
      params: {
        path: {
          orderId,
          parcelId
        }
      }
    });
  }
  createOrUpdateParcel(orderId: number, body: PostParcelTypeModel) {
    return this.client.PUT("/api/v1/orders/{orderId}/parcels", {
      params: {
        path: {
          orderId,
        }
      },
      body
    });
  }
  createOrUpdateOrderTracking(orderId: number, body: PostOrderTrackingModel) {
    return this.client.PUT("/api/v1/orders/{orderId}/orderTracking", {
      params: {
        path: {
          orderId
        }
      },
      body
    });
  }
  createOrUpdateParcelTracking(orderId: number, parcelId: number, body: PostParcelTrackingModel) {
    return this.client.PUT("/api/v1/orders/{orderId}/parcels/{parcelId}/parcelTracking", {
      params: {
        path: {
          orderId,
          parcelId
        }
      },
      body
    });
  }
  getOrder(orderId: number) {
    return this.client.GET("/api/v1/orders/{orderId}", {
      params: {
        path: {
          orderId
        }
      }
    });
  }
  updateOrder(orderId: number, body: PostOrderModel) {
    return this.client.PUT("/api/v1/orders/{orderId}", {
      params: {
        path: {
          orderId
        }
      },
      body
    });
  }
  cancelOrder(orderId: number) {
    return this.client.DELETE("/api/v1/orders/{orderId}", {
      params: {
        path: {
          orderId
        }
      }
    });
  }
  getOrders(query: OrdersGetAllParamsQuery) {
    return this.client.GET("/api/v1/orders", {
      params: {
        query
      }
    });
  }
  createOrUpdateOrder(body: PostOrderModel) {
    return this.client.PUT("/api/v1/orders", {
      body
    });
  }
  deleteOrder(goodsOwnerId: number, orderNumber: string | null) {
    return this.client.DELETE("/api/v1/orders", {
      params: {
        query: {
          goodsOwnerId,
          orderNumber
        }
      }
    });
  }
  getWayBillRows(orderId: number) {
    return this.client.GET("/api/v1/orders/{orderId}/wayBillRows", {
      params: {
        path: {
          orderId
        }
      }
    });
  }
  createWayBillRow(orderId: number, body: PostWayBillRowModel) {
    return this.client.POST("/api/v1/orders/{orderId}/wayBillRows", {
      params: {
        path: {
          orderId
        }
      },
      body
    });
  }
  updateWayBillRow(orderId: number, wayBillRowId: number, body: PostWayBillRowModel) {
    return this.client.PATCH("/api/v1/orders/{orderId}/wayBillRows/{wayBillRowId}", {
      params: {
        path: {
          orderId,
          wayBillRowId
        }
      },
      body
    });
  }
  deleteWayBillRow(orderId: number, wayBillRowId: number) {
    return this.client.DELETE("/api/v1/orders/{orderId}/wayBillRows/{wayBillRowId}", {
      params: {
        path: {
          orderId,
          wayBillRowId
        }
      }
    });
  }
  getFiles(orderId: number) {
    return this.client.GET("/api/v1/orders/{orderId}/files", {
      params: {
        path: {
          orderId
        }
      }
    });
  }
  createOrUpdateFileByName(orderId: number, fileName: string | null, body: PostFileNoFilenameModel) {
    return this.client.PUT("/api/v1/orders/{orderId}/files", {
      params: {
        path: {
          orderId
        },
        query: {
          fileName
        }
      },
      body
    });
  }
  createOrUpdateFileById(orderId: number, fileId: number, body: PostFileMode) {
    return this.client.PUT("/api/v1/orders/{orderId}/files/{fileId}", {
      params: {
        path: {
          orderId,
          fileId
        }
      },
      body
    });
  }
  deleteFile(orderId: number, fileId: number) {
    return this.client.DELETE("/api/v1/orders/{orderId}/files/{fileId}", {
      params: {
        path: {
          orderId,
          fileId
        }
      }
    });
  }
  createFile(orderId: number, body: PostFileMode) {
    return this.client.POST("/api/v1/orders/{orderId}/files", {
      params: {
        path: {
          orderId
        },
      },
      body
    });
  }
  updateOrderNumber(orderId: number, body: PatchOrderNumberModel) {
    return this.client.PATCH("/api/v1/orders/{orderId}/orderNumber", {
      params: {
        path: {
          orderId
        }
      },
      body
    });
  }
  updateTransporter(orderId: number, body: PatchOrderTransporterModel) {
    return this.client.PATCH("/api/v1/orders/{orderId}/transporter", {
      params: {
        path: {
          orderId
        }
      },
      body
    });
  }
  updateReturnWaybill(orderId: number, body: PatchOrderReturnWaybill) {
    return this.client.PATCH("/api/v1/orders/{orderId}/returnWaybill", {
      params: {
        path: {
          orderId
        }
      },
      body
    });
  }
  updateServicePointCode(orderId: number, body: PatchServicePointCode) {
    return this.client.PATCH("/api/v1/orders/{orderId}/servicePointCode", {
      params: {
        path: {
          orderId
        }
      },
      body
    });
  }
  updateWaybill(orderId: number, body: PatchOrderWaybill) {
    return this.client.PATCH("/api/v1/orders/{orderId}/waybill", {
      params: {
        path: {
          orderId
        }
      },
      body
    });
  }
  updateDeliveryDate(orderId: number, body: PatchOrderDeliveryDate) {
    return this.client.PATCH("/api/v1/orders/{orderId}/deliveryDate", {
      params: {
        path: {
          orderId
        }
      },
      body
    });
  }
  updateFreightPrice(orderId: number, body: PatchFreightPrice) {
    return this.client.PATCH("/api/v1/orders/{orderId}/freightPrice", {
      params: {
        path: {
          orderId
        }
      },
      body
    });
  }
}
