import type { paths } from "./gen/orders.d.ts";
import {
  PostParcelUsingIdTypeModel,
  PostParcelTypeModel,
  PostOrderTrackingModel,
  PostParcelTrackingModel,
  PostOrderModel,
  PostWayBillRowModel,
  PatchOrderNumberModel,
  PatchOrderTransporterModel,
  PatchOrderReturnWaybill,
  PatchServicePointCode,
  PatchOrderWaybill,
  PatchOrderDeliveryDate,
  PatchFreightPrice,
} from "./gen/orders.types";
import type { 
  PostFileModel,
  PostFileNoFilenameModel
} from "./gen/shared.types";
import type {
  OrdersGetAllParamsQuery,
} from "./types/orders.types";
import { ClientWrapper } from "./utils";

export class OrdersApiV1 extends ClientWrapper<paths> {
  updateParcelUsingId(
    orderId: number,
    parcelId: number,
    body: PostParcelUsingIdTypeModel,
  ) {
    return this.client.PUT("/api/v1/orders/{orderId}/parcels/{parcelId}", {
      params: {
        path: {
          orderId,
          parcelId,
        },
      },
      body,
    });
  }
  deleteParcel(orderId: number, parcelId: number) {
    return this.client.DELETE("/api/v1/orders/{orderId}/parcels/{parcelId}", {
      params: {
        path: {
          orderId,
          parcelId,
        },
      },
    });
  }
  putParcel(orderId: number, body: PostParcelTypeModel) {
    return this.client.PUT("/api/v1/orders/{orderId}/parcels", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  putOrderTracking(orderId: number, body: PostOrderTrackingModel) {
    return this.client.PUT("/api/v1/orders/{orderId}/orderTracking", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  putParcelTracking(
    orderId: number,
    parcelId: number,
    body: PostParcelTrackingModel,
  ) {
    return this.client.PUT(
      "/api/v1/orders/{orderId}/parcels/{parcelId}/parcelTracking",
      {
        params: {
          path: {
            orderId,
            parcelId,
          },
        },
        body,
      },
    );
  }
  getOrder(orderId: number) {
    return this.client.GET("/api/v1/orders/{orderId}", {
      params: {
        path: {
          orderId,
        },
      },
    });
  }
  updateOrder(orderId: number, body: PostOrderModel) {
    return this.client.PUT("/api/v1/orders/{orderId}", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  cancelOrder(orderId: number) {
    return this.client.DELETE("/api/v1/orders/{orderId}", {
      params: {
        path: {
          orderId,
        },
      },
    });
  }
  getOrders(query: OrdersGetAllParamsQuery) {
    return this.client.GET("/api/v1/orders", {
      params: {
        query,
      },
    });
  }
  putOrder(body: PostOrderModel) {
    return this.client.PUT("/api/v1/orders", {
      body,
    });
  }
  deleteOrder(goodsOwnerId: number, orderNumber: string | null) {
    return this.client.DELETE("/api/v1/orders", {
      params: {
        query: {
          goodsOwnerId,
          orderNumber,
        },
      },
    });
  }
  getWayBillRows(orderId: number) {
    return this.client.GET("/api/v1/orders/{orderId}/wayBillRows", {
      params: {
        path: {
          orderId,
        },
      },
    });
  }
  createWayBillRow(orderId: number, body: PostWayBillRowModel) {
    return this.client.POST("/api/v1/orders/{orderId}/wayBillRows", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  updateWayBillRow(
    orderId: number,
    wayBillRowId: number,
    body: PostWayBillRowModel,
  ) {
    return this.client.PATCH(
      "/api/v1/orders/{orderId}/wayBillRows/{wayBillRowId}",
      {
        params: {
          path: {
            orderId,
            wayBillRowId,
          },
        },
        body,
      },
    );
  }
  deleteWayBillRow(orderId: number, wayBillRowId: number) {
    return this.client.DELETE(
      "/api/v1/orders/{orderId}/wayBillRows/{wayBillRowId}",
      {
        params: {
          path: {
            orderId,
            wayBillRowId,
          },
        },
      },
    );
  }
  getFiles(orderId: number) {
    return this.client.GET("/api/v1/orders/{orderId}/files", {
      params: {
        path: {
          orderId,
        },
      },
    });
  }
  putFileByName(
    orderId: number,
    fileName: string | null,
    body: PostFileNoFilenameModel,
  ) {
    return this.client.PUT("/api/v1/orders/{orderId}/files", {
      params: {
        path: {
          orderId,
        },
        query: {
          fileName,
        },
      },
      body,
    });
  }
  putFileById(orderId: number, fileId: number, body: PostFileModel) {
    return this.client.PUT("/api/v1/orders/{orderId}/files/{fileId}", {
      params: {
        path: {
          orderId,
          fileId,
        },
      },
      body,
    });
  }
  deleteFile(orderId: number, fileId: number) {
    return this.client.DELETE("/api/v1/orders/{orderId}/files/{fileId}", {
      params: {
        path: {
          orderId,
          fileId,
        },
      },
    });
  }
  createFile(orderId: number, body: PostFileModel) {
    return this.client.POST("/api/v1/orders/{orderId}/files", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  updateOrderNumber(orderId: number, body: PatchOrderNumberModel) {
    return this.client.PATCH("/api/v1/orders/{orderId}/orderNumber", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  updateTransporter(orderId: number, body: PatchOrderTransporterModel) {
    return this.client.PATCH("/api/v1/orders/{orderId}/transporter", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  updateReturnWaybill(orderId: number, body: PatchOrderReturnWaybill) {
    return this.client.PATCH("/api/v1/orders/{orderId}/returnWaybill", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  updateServicePointCode(orderId: number, body: PatchServicePointCode) {
    return this.client.PATCH("/api/v1/orders/{orderId}/servicePointCode", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  updateWaybill(orderId: number, body: PatchOrderWaybill) {
    return this.client.PATCH("/api/v1/orders/{orderId}/waybill", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  updateDeliveryDate(orderId: number, body: PatchOrderDeliveryDate) {
    return this.client.PATCH("/api/v1/orders/{orderId}/deliveryDate", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  updateFreightPrice(orderId: number, body: PatchFreightPrice) {
    return this.client.PATCH("/api/v1/orders/{orderId}/freightPrice", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
}
