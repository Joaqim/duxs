import Decimal from "decimal.js-light";
import type { GetPurchaseOrderArticleItem } from "./lib/ongoing";
import { GetPurchaseOrderModel } from "./lib/ongoing/index";
import { ArticleCOGSOverview } from "./types/ArticleCOGSOverview";
declare abstract class Duxs {
    static calculateArticleCosts: (article: GetPurchaseOrderArticleItem, articleUnitPrice: Decimal, tariffPercentage: Decimal, orderFreightCost: Decimal, orderCustomsCost: Decimal, orderTotalWeight: Decimal, orderTotalArticleCount: Decimal) => {
        unitCost: Decimal;
        unitShippingCost: Decimal;
    };
    static getTotalCostPerArticle: (unitPrice: number, articleQuantity: number, totalArticleQuantity: number, freightCost: Decimal, tariffCost?: Decimal, tariffPercentage?: Decimal, articleWeightPercentage?: Decimal) => Decimal;
    static getArticleCostOverview: (purchaseOrder: GetPurchaseOrderModel, freightCost_?: number | string, customsCost_?: number | string) => ArticleCOGSOverview;
}
export default Duxs;
