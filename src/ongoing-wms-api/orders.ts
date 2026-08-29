import type { paths } from "./gen/orders.js";
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
} from "./gen/orders.types.js";
import type {
  PostFileModel,
  PostFileNoFilenameModel,
} from "./gen/shared.types.js";
import type { OrdersGetAllParamsQuery } from "./types/orders.types.js";
import { ClientWrapper } from "./utils.js";

export class OrdersApiV1 extends ClientWrapper<paths> {
  postParcelUsingId(
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
  get(orderId: number) {
    return this.client.GET("/api/v1/orders/{orderId}", {
      params: {
        path: {
          orderId,
        },
      },
    });
  }
  putOrderUsingOrderId(orderId: number, body: PostOrderModel) {
    return this.client.PUT("/api/v1/orders/{orderId}", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  delete(orderId: number) {
    return this.client.DELETE("/api/v1/orders/{orderId}", {
      params: {
        path: {
          orderId,
        },
      },
    });
  }
  getAll(query: OrdersGetAllParamsQuery) {
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
  postWayBillRow(orderId: number, body: PostWayBillRowModel) {
    return this.client.POST("/api/v1/orders/{orderId}/wayBillRows", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  patchWayBillRow(
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
  putFileUsingFilename(
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
  putFile(orderId: number, fileId: number, body: PostFileModel) {
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
  postFile(orderId: number, body: PostFileModel) {
    return this.client.POST("/api/v1/orders/{orderId}/files", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  patchOrderNumber(orderId: number, body: PatchOrderNumberModel) {
    return this.client.PATCH("/api/v1/orders/{orderId}/orderNumber", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  patchTransporter(orderId: number, body: PatchOrderTransporterModel) {
    return this.client.PATCH("/api/v1/orders/{orderId}/transporter", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  patchReturnWaybill(orderId: number, body: PatchOrderReturnWaybill) {
    return this.client.PATCH("/api/v1/orders/{orderId}/returnWaybill", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  patchServicePointCode(orderId: number, body: PatchServicePointCode) {
    return this.client.PATCH("/api/v1/orders/{orderId}/servicePointCode", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  patchWaybill(orderId: number, body: PatchOrderWaybill) {
    return this.client.PATCH("/api/v1/orders/{orderId}/waybill", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  patchDeliveryDate(orderId: number, body: PatchOrderDeliveryDate) {
    return this.client.PATCH("/api/v1/orders/{orderId}/deliveryDate", {
      params: {
        path: {
          orderId,
        },
      },
      body,
    });
  }
  patchFreightPrice(orderId: number, body: PatchFreightPrice) {
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
