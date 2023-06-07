import Decimal from "decimal.js-light";
import getValue from "get-value";
import type {
  GetPurchaseOrderArticleItem,
  GetPurchaseOrderLine,
  GetPurchaseOrderModel,
} from "./lib/ongoing";

abstract class PurchaseOrders {
  public static getFreeValues = (
    purchase: GetPurchaseOrderModel
  ): [Decimal?, Decimal?, Decimal?, Decimal?] => {
    const getFreeValue = (freeVariableName: string): Decimal | undefined => {
      const freeValueString = getValue(
        purchase,
        `purchaseOrderInfo.freeValues.${freeVariableName}`
      );
      if (isNaN(parseFloat(freeValueString))) {
        return undefined;
      }
      return new Decimal(freeValueString);
    };
    const freeDecimal1 = getFreeValue("freeText1");
    const freeDecimal2 = getFreeValue("freeText2");
    const freeDecimal3 = getFreeValue("freeText3");
    const freeDecimal4 = getFreeValue("freeText4");
    return [freeDecimal1, freeDecimal2, freeDecimal3, freeDecimal4];
  };

  public static tryGetFreightAndCustomsCost = (
    purchaseOrder: GetPurchaseOrderModel
  ): [Decimal, Decimal] => {
    const [
      estimatedFreightCost,
      estimatedCustomsCost,
      freightCost,
      customsCost,
    ] = this.getFreeValues(purchaseOrder);

    const candidateFreightCost = freightCost ?? estimatedFreightCost;
    const candidateCustomsCost = customsCost ?? estimatedCustomsCost;

    if (!candidateFreightCost || !candidateCustomsCost) {
      throw new Error(
        `Purchase Order is missing free values for ${
          customsCost === undefined && estimatedCustomsCost !== undefined
            ? "customs fee"
            : ""
        }${
          freightCost === undefined && estimatedFreightCost !== undefined
            ? `${customsCost === undefined ? " and " : ""}shipping${
                customsCost === undefined && estimatedCustomsCost === undefined
                  ? " fee"
                  : ""
              }`
            : ""
        }`
      );
    }

    return [
      (freightCost ?? estimatedFreightCost) as Decimal,
      (customsCost ?? estimatedCustomsCost) as Decimal,
    ];
  };

  public static getArticleWeightPercentageOfOrder = (
    article: GetPurchaseOrderArticleItem,
    totalWeightOfArticles: Decimal
  ) => {
    const articleWeight = this.getWeightOfArticles(article);
    const articleQuantity = new Decimal(article.numberOfItems ?? 0);

    if (articleQuantity.isZero() !== articleWeight.isZero()) {
      throw new Error(
        `Article with unexpected Weight of '${articleWeight}' with Quantity: '${articleQuantity}'`
      );
    }
    return articleWeight.dividedBy(totalWeightOfArticles);
  };

  public static getTotalArticleQuantity = (
    purchaseOrder: GetPurchaseOrderModel,
    purchaseOrderStatus: "advised" | "received" | "reported"
  ): Decimal => {
    let result: Decimal = new Decimal(0);
    const { purchaseOrderLines } = purchaseOrder;
    if (purchaseOrderLines) {
      if (Array.isArray(purchaseOrderLines)) {
        for (const purchaseOrderLine of purchaseOrderLines) {
          result = result.plus(
            new Decimal(
              getValue(purchaseOrderLine, `${purchaseOrderStatus}NumberOfs`) ??
                0
            )
          );
        }
      } else {
        result = new Decimal(
          getValue(purchaseOrderLines, `${purchaseOrderStatus}NumberOfs`) ?? 0
        );
      }
    }

    return result;
  };

  public static getWeightOfArticles = (
    articles?: GetPurchaseOrderArticleItem | GetPurchaseOrderArticleItem[]
  ): Decimal => {
    if (Array.isArray(articles)) {
      let result = new Decimal(0);
      for (const article of articles) {
        result = result.plus(new Decimal(article.weight ?? 0));
      }
      return result;
    }
    return new Decimal(articles?.weight ?? 0);
  };

  public static getTotalWeightOfArticles = (
    purchaseOrderLines?: GetPurchaseOrderLine | GetPurchaseOrderLine[]
  ): Decimal => {
    if (Array.isArray(purchaseOrderLines)) {
      let result = new Decimal(0);
      for (const purchaseOrderLine of purchaseOrderLines) {
        const { articleItems } = purchaseOrderLine;
        if (!articleItems) {
          continue;
        }
        result = result.plus(this.getWeightOfArticles(articleItems));
      }
      return result;
    }
    if (purchaseOrderLines?.articleItems)
      return this.getWeightOfArticles(purchaseOrderLines.articleItems);
    return new Decimal(0);
  };
}

export default PurchaseOrders;
