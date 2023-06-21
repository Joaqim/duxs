import Decimal from "decimal.js-light";
import getValue from "get-value";
import type {
  GetPurchaseOrderArticleItem,
  GetPurchaseOrderLine,
  GetPurchaseOrderModel,
} from "./lib/ongoing";

export type ArticleCountStatus = "advised" | "received" | "reported";
abstract class PurchaseOrders {
  public static tryGetFreeValues = (
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

  public static getFreeValues = (
    purchase: GetPurchaseOrderModel,
    fallbackValues: [
      freight: Decimal,
      customs: Decimal,
      estimatedFreight?: Decimal,
      estimatedCustoms?: Decimal
    ]
  ): [Decimal, Decimal, Decimal, Decimal] => {
    const getFreeValue = (
      freeVariableName: string,
      fallback = new Decimal(0)
    ): Decimal => {
      const freeValueString = getValue(
        purchase,
        `purchaseOrderInfo.freeValues.${freeVariableName}`
      );
      if (isNaN(parseFloat(freeValueString))) {
        return fallback;
      }
      return new Decimal(freeValueString);
    };
    // Estimated Freight
    const freeDecimal1 = getFreeValue("freeText1", fallbackValues[2]);
    // Estimated Customs
    const freeDecimal2 = getFreeValue("freeText2", fallbackValues[3]);
    // Freight
    const freeDecimal3 = getFreeValue("freeText3", fallbackValues[0]);
    // Customs
    const freeDecimal4 = getFreeValue("freeText4", fallbackValues[1]);
    return [freeDecimal1, freeDecimal2, freeDecimal3, freeDecimal4];
  };

  public static tryGetFreightAndCustomsCost = (
    purchaseOrder: GetPurchaseOrderModel,
    fallbackFreightCost?: Decimal,
    fallbackCustomsCost?: Decimal
  ): [Decimal, Decimal] => {
    const [
      estimatedFreightCost,
      estimatedCustomsCost,
      freightCost,
      customsCost,
    ] = this.tryGetFreeValues(purchaseOrder);

    const candidateFreightCost = freightCost ?? estimatedFreightCost;
    const candidateCustomsCost = customsCost ?? estimatedCustomsCost;

    const missingFreightCost = candidateFreightCost === undefined;
    const missingCustomsCost = candidateCustomsCost === undefined;

    if (missingFreightCost || missingCustomsCost) {
      if (fallbackFreightCost && fallbackCustomsCost) {
        return [fallbackFreightCost, fallbackCustomsCost];
      }
      throw new Error(
        `Purchase Order is missing free values for ${
          missingCustomsCost ? "customs fee" : ""
        }${
          missingFreightCost
            ? `${missingCustomsCost ? " and " : ""}${
                missingFreightCost ? "shipping fee" : ""
              }`
            : ""
        }`
      );
    }

    return [candidateFreightCost, candidateCustomsCost];
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
    purchaseOrderStatus: ArticleCountStatus
  ): Decimal => {
    let result: Decimal = new Decimal(0);
    const { purchaseOrderLines } = purchaseOrder;
    if (purchaseOrderLines) {
      if (Array.isArray(purchaseOrderLines)) {
        for (const purchaseOrderLine of purchaseOrderLines) {
          result = result.plus(
            new Decimal(
              getValue(
                purchaseOrderLine,
                `${purchaseOrderStatus}NumberOfItems`
              ) ?? 0
            )
          );
        }
      } else {
        result = new Decimal(
          getValue(purchaseOrderLines, `${purchaseOrderStatus}NumberOfItems`) ??
            0
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

  public static tryGetArticleCountStatus(
    purchaseOrder: GetPurchaseOrderModel
  ): ArticleCountStatus {
    const purchaseOrderStatus =
      purchaseOrder.purchaseOrderInfo?.purchaseOrderStatus?.text;

    let articleCountStatus: ArticleCountStatus | undefined;

    if (purchaseOrderStatus === "Inleverans") {
      articleCountStatus = "advised";
    } else if (
      purchaseOrderStatus === "Mottaget" ||
      purchaseOrderStatus === "Lagerlagd"
    ) {
      articleCountStatus = "received";
    } else {
      throw new Error(
        `Unexpected Purchase order status: ${purchaseOrderStatus}`
      );
    }

    return articleCountStatus;
  }
}

export default PurchaseOrders;
