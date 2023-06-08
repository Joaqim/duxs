import Decimal from "decimal.js-light";
import getValue from "get-value";
import { Duxs, PurchaseOrders } from "../src";
import type { GetPurchaseOrderModel } from "../src/lib/ongoing";
import wraithPurchaseOrder from "./__mocks__/GetPurchaseOrderModel_WRAITH001.json";

describe("PurchaseOrders", function () {
  const wraithPurchase = wraithPurchaseOrder as any as GetPurchaseOrderModel;
  it("TODO: Serialize Model from json", function () {
    const wraithPurchase = wraithPurchaseOrder as any as GetPurchaseOrderModel;
  });

  it("", function () {
    const articleWeightDistribution: Record<
      string,
      { weightPercentage: Decimal; cost: Decimal; shipping: Decimal }
    > = {};

    const [freightCost, customsCost] =
      PurchaseOrders.tryGetFreightAndCustomsCost(wraithPurchase);

    const { purchaseOrderLines, purchaseOrderInfo } = wraithPurchase;

    if (!purchaseOrderLines) {
      throw new Error(`Unexpected empty field 'purchaseOrderLines'`);
    }

    const purchaseOrderStatus = purchaseOrderInfo?.purchaseOrderStatus?.text;
    let purchaseOrderArticleCountStatus: "advised" | "received" | undefined;
    if (purchaseOrderStatus === "Inleverans") {
      purchaseOrderArticleCountStatus = "advised";
    } else if (
      purchaseOrderStatus === "Mottaget" ||
      purchaseOrderStatus === "Lagerlagd"
    ) {
      purchaseOrderArticleCountStatus = "received";
    } else {
      throw new Error(
        `Unexpected Purchase order status: ${purchaseOrderStatus}`
      );
    }

    const totalArticleQuantity = PurchaseOrders.getTotalArticleQuantity(
      wraithPurchase,
      purchaseOrderArticleCountStatus
    );
    if (totalArticleQuantity.isZero()) {
      throw new Error(
        `Unexpected value of 'totalArticleQuantity': '${totalArticleQuantity}'`
      );
    }

    const totalWeightOfArticles =
      PurchaseOrders.getTotalWeightOfArticles(purchaseOrderLines);

    for (const purchaseOrderLine of purchaseOrderLines) {
      const { rowPrice } = purchaseOrderLine;
      const articleName = purchaseOrderLine.article?.articleName;
      if (!rowPrice) {
        throw new Error(`Unexpected value of 'rowPrice': '${rowPrice}'`);
      }
      if (!purchaseOrderLine.articleItems) {
        throw new Error(`Unexpected empty field 'articleItems'`);
      }

      // let calculateFreightCostDistributionByVolume = purchaseOrderLine.articleItems.find((article) => article.);
      const calculateFreightCostDistributionByWeight = true;

      for (const article of purchaseOrderLine.articleItems) {
        // Filter out articles with unexpected Zero weight:
        if (!article.weight) {
          console.log(
            `Skipping Zero weight article of SKU: ${articleName} with id: ${article.originalArticleItemId}`
          );
          continue;
        }
        // Filter out articles with Zero quantity:
        if ((article.numberOfItems ?? 0) == 0) {
          console.log(
            `Skipping Zero quantity article of SKU: ${articleName} with id: ${article.originalArticleItemId}`
          );
          continue;
        }
        const articleId = `${article.originalArticleItemId}`;
        if (articleWeightDistribution[articleId]) {
          throw new Error(`Unexpected duplicate articleId: ${articleId}`);
        }

        // TODO:
        const tariffPercentage = new Decimal(0);

        let [cost, shipping] = [new Decimal(0), new Decimal(0)];
        try {
          ({ cost, shipping } = Duxs.calculateArticleCosts(
            article,
            new Decimal(rowPrice),
            tariffPercentage,
            freightCost,
            customsCost,
            totalWeightOfArticles,
            totalArticleQuantity
          ));
          console.log("-------------------------------------");
          console.log(
            `Total Article cost: ${cost} incl. Shipping: ${shipping}`
          );
        } catch (error) {
          const { message } = error as Error;
          console.log(
            `Failed to calculate cost of articles of SKU: ${articleName} with id: ${articleId} - ${message}`
          );
        }

        const weightPercentage =
          PurchaseOrders.getArticleWeightPercentageOfOrder(
            article,
            totalWeightOfArticles
          );
        articleWeightDistribution[articleId] = {
          weightPercentage,
          cost,
          shipping,
        };
      }
      const tariffPercentage = new Decimal(0.0);

      const totalCostPerArticle = Duxs.getTotalCostPerArticle(
        rowPrice,
        getValue(
          purchaseOrderLine,
          `${purchaseOrderArticleCountStatus}NumberOfItems`
        ) ?? 0,
        totalArticleQuantity.toNumber(),
        freightCost,
        customsCost,
        tariffPercentage
      );
    }

    console.log("-------------------------------------");
    console.log(`Total Articles in Order: ${totalArticleQuantity}`);

    const SumOfArticleWeightDistribution = Object.values(
      articleWeightDistribution
    )
      .map(({ weightPercentage }) => weightPercentage)
      .reduce((a, b) => a.plus(b), new Decimal(0));
    if (SumOfArticleWeightDistribution.equals(100)) {
      throw new Error(
        `Unexpected sum percentage distribution: ${SumOfArticleWeightDistribution}, expected: 100`
      );
    }
  });
});
