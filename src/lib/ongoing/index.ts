import { components } from "./ongoing-wms";

// Articles
export type GetArticleModel = components["schemas"]["GetArticleModel"];

// Purchase Orders

export type GetArticleItemsModel =
  components["schemas"]["GetArticleItemsModel"];

export type GetPurchaseOrderArticle =
  components["schemas"]["GetPurchaseOrderArticle"];

export type GetPurchaseOrderArticleItem =
  components["schemas"]["GetPurchaseOrderArticleItem"];

export type GetPurchaseOrderLine =
  components["schemas"]["GetPurchaseOrderLine"];

export type GetPurchaseOrderModel =
  components["schemas"]["GetPurchaseOrderModel"];

export type PurchaseOrderLineArticleItem =
  components["schemas"]["GetPurchaseOrderArticleItem"];

export * from "./ongoing-wms";
