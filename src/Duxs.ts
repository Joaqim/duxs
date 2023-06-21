import Decimal from "decimal.js-light";
import getValue from "get-value";
import PurchaseOrders, { ArticleCountStatus } from "./PurchaseOrders";
import type { GetPurchaseOrderArticleItem } from "./lib/ongoing";
import { GetPurchaseOrderModel } from "./lib/ongoing/index";
import { ArticleCOGSOverview } from "./types/ArticleCOGSOverview";
abstract class Duxs {
  public static calculateArticleCosts = (
    article: GetPurchaseOrderArticleItem,
    articleUnitPrice: Decimal,
    tariffPercentage: Decimal,
    orderFreightCost: Decimal,
    orderCustomsCost: Decimal,
    orderTotalWeight: Decimal,
    orderTotalArticleCount: Decimal
  ): { unitCost: Decimal; unitShippingCost: Decimal } => {
    const articlesWeightDistribution =
      PurchaseOrders.getArticleWeightPercentageOfOrder(
        article,
        orderTotalWeight
      );

    if ((article.numberOfItems ?? 0) == (article.weight ?? 0)) {
      throw new Error(
        `Article with unexpected Weight of '${article.weight}' while Quantity is '${article.numberOfItems}'`
      );
    }
    if (article.numberOfItems == 0) {
      return { unitCost: new Decimal(0), unitShippingCost: new Decimal(0) };
    }
    // TODO: numberOfItems should be explicitly explicitly defined here already
    const perArticleShippingCost = orderFreightCost
      .times(articlesWeightDistribution)
      .dividedBy(article.numberOfItems as number);
    const tariffPerArticle = articleUnitPrice
      .times(tariffPercentage.plus(1.0))
      .minus(articleUnitPrice);

    const totalFreightAndFees = perArticleShippingCost.plus(
      orderCustomsCost.minus(tariffPerArticle.times(article.numberOfItems ?? 0))
    );
    const freightAndFeesPerArticle = totalFreightAndFees.dividedBy(
      orderTotalArticleCount
    );

    /*     console.log(`unitPrice: ${articleUnitPrice}`);
    console.log(`freightAndFeesPerArticle: ${freightAndFeesPerArticle}`);
    console.log(`totalFreightAndFees: ${totalFreightAndFees}`);
    console.log(`tariffPerArticle: ${tariffPerArticle}`);
 */
    return {
      unitCost: freightAndFeesPerArticle
        .plus(articleUnitPrice)
        .plus(tariffPerArticle),
      unitShippingCost: perArticleShippingCost,
    };
  };

  public static getTotalCostPerArticle = (
    unitPrice: number,
    articleQuantity: number,
    totalArticleQuantity: number,
    freightCost: Decimal,
    tariffCost: Decimal = new Decimal(0),
    tariffPercentage: Decimal = new Decimal(0),
    articleWeightPercentage: Decimal = new Decimal(1.0)
  ): Decimal => {
    if (totalArticleQuantity === 0 || articleQuantity === 0) {
      return new Decimal(0);
    }
    const perArticleShippingCost = freightCost.times(articleWeightPercentage);
    const tariffPerArticle = new Decimal(unitPrice).times(tariffPercentage);
    const totalFreightAndFees = perArticleShippingCost.plus(
      tariffCost.minus(tariffPerArticle.times(articleQuantity))
    );
    const freightAndFeesPerArticle =
      totalFreightAndFees.dividedBy(totalArticleQuantity);

    // console.log(`unitPrice: ${unitPrice}`);
    // console.log(`freightAndFeesPerArticle: ${freightAndFeesPerArticle}`);
    // console.log(`totalFreightAndFees: ${totalFreightAndFees}`);
    // console.log(`tariffPerArticle: ${tariffPerArticle}`);

    return freightAndFeesPerArticle.plus(unitPrice).plus(tariffPerArticle);
  };

  public static getArticleCostOverview = (
    purchaseOrder: GetPurchaseOrderModel,
    freightCost_?: number | string,
    customsCost_?: number | string
  ): ArticleCOGSOverview => {
    const articleCogs: ArticleCOGSOverview = {};

    let freightCost: Decimal | undefined;
    let customsCost: Decimal | undefined;

    try {
      [freightCost, customsCost] =
        PurchaseOrders.tryGetFreightAndCustomsCost(purchaseOrder);
    } catch (error) {
      if (freightCost_ === undefined || customsCost_ === undefined) {
        throw error;
      }
      [freightCost, customsCost] = [
        new Decimal(freightCost_),
        new Decimal(customsCost_),
      ];
    }

    const { purchaseOrderLines } = purchaseOrder;

    if (!purchaseOrderLines) {
      throw new Error(`Unexpected empty field 'purchaseOrderLines'`);
    }

    const purchaseOrderArticleCountStatus: ArticleCountStatus =
      PurchaseOrders.tryGetArticleCountStatus(purchaseOrder);

    const totalArticleQuantity = PurchaseOrders.getTotalArticleQuantity(
      purchaseOrder,
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
      const articleSKU = purchaseOrderLine.article?.articleNumber;
      if (!rowPrice) {
        throw new Error(`Unexpected value of 'rowPrice': '${rowPrice}'`);
      }
      if (!purchaseOrderLine.articleItems) {
        throw new Error(`Unexpected empty field 'articleItems'`);
      }

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

        // TODO:
        const tariffPercentage = new Decimal(0);

        let [unitCost, unitShippingCost] = [new Decimal(0), new Decimal(0)];
        try {
          ({ unitCost, unitShippingCost } = Duxs.calculateArticleCosts(
            article,
            new Decimal(rowPrice),
            tariffPercentage,
            freightCost,
            customsCost,
            totalWeightOfArticles,
            totalArticleQuantity
          ));
        } catch (error) {
          const { message } = error as Error;
        }

        const weightPercentage =
          PurchaseOrders.getArticleWeightPercentageOfOrder(
            article,
            totalWeightOfArticles
          );
        const articleId = `${article.originalArticleItemId}`;

        const totalCost = unitCost.times(article.numberOfItems ?? 0);
        const totalShippingCost = unitShippingCost.times(
          article.numberOfItems ?? 0
        );
        const quantity = article.numberOfItems ?? 0;

        const newEntry = {
          articleSKU,
          articleName,
          weightPercentage,
          unitCost,
          unitShippingCost,
          totalCost,
          totalShippingCost,
          quantity,
        };

        if (!articleCogs[articleId]) {
          articleCogs[articleId] = newEntry;
        } else {
          const previousEntry = articleCogs[articleId];
          articleCogs[articleId] = {
            ...newEntry,
            weightPercentage:
              previousEntry.weightPercentage.plus(weightPercentage),

            unitCost: previousEntry.unitCost.plus(newEntry.unitCost),
            unitShippingCost:
              previousEntry.unitShippingCost.plus(unitShippingCost),

            totalCost: previousEntry.totalCost.plus(newEntry.totalCost),
            totalShippingCost: previousEntry.totalShippingCost.plus(
              newEntry.totalShippingCost
            ),
          };
        }
      }
      const tariffPercentage = new Decimal(0);

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

    const SumOfArticleWeightDistribution = Object.values(articleCogs)
      .map(({ weightPercentage }) => weightPercentage)
      .reduce((a, b) => a.plus(b), new Decimal(0));
    if (SumOfArticleWeightDistribution.equals(100)) {
      throw new Error(
        `Unexpected sum of combined distribution: ${SumOfArticleWeightDistribution}, expected: 100`
      );
    }
    return articleCogs;
  };
}

export default Duxs;
