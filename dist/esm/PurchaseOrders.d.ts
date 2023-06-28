import Decimal from "decimal.js-light";
import type { GetPurchaseOrderArticleItem, GetPurchaseOrderLine, GetPurchaseOrderModel } from "./lib/ongoing";
export type ArticleCountStatus = "advised" | "received" | "reported";
declare abstract class PurchaseOrders {
    static tryGetFreeValues: (purchase: GetPurchaseOrderModel) => [Decimal?, Decimal?, Decimal?, Decimal?];
    static getFreeValues: (purchase: GetPurchaseOrderModel, fallbackValues: [
        freight: Decimal,
        customs: Decimal,
        estimatedFreight?: Decimal,
        estimatedCustoms?: Decimal
    ]) => [Decimal, Decimal, Decimal, Decimal];
    static tryGetFreightAndCustomsCost: (purchaseOrder: GetPurchaseOrderModel, fallbackFreightCost?: Decimal, fallbackCustomsCost?: Decimal) => [Decimal, Decimal];
    static getArticleWeightPercentageOfOrder: (article: GetPurchaseOrderArticleItem, totalWeightOfArticles: Decimal) => Decimal;
    static getTotalArticleQuantity: (purchaseOrder: GetPurchaseOrderModel, purchaseOrderStatus: ArticleCountStatus) => Decimal;
    static getWeightOfArticles: (articles?: GetPurchaseOrderArticleItem | GetPurchaseOrderArticleItem[]) => Decimal;
    static getTotalWeightOfArticles: (purchaseOrderLines?: GetPurchaseOrderLine | GetPurchaseOrderLine[]) => Decimal;
    static tryGetArticleCountStatus(purchaseOrder: GetPurchaseOrderModel): ArticleCountStatus;
}
export default PurchaseOrders;
