import Decimal from "decimal.js-light";
import PurchaseOrders from "./PurchaseOrders";
import { GetPurchaseOrderArticleItem } from "./lib/ongoing";

abstract class Duxs {
  public static calculateArticleCosts = (
    article: GetPurchaseOrderArticleItem,
    articleUnitPrice: Decimal,
    tariffPercentage: Decimal,
    orderFreightCost: Decimal,
    orderCustomsCost: Decimal,
    orderTotalWeight: Decimal,
    orderTotalArticleCount: Decimal
  ): { cost: Decimal; shipping: Decimal } => {
    const articlesWeightDistribution =
      PurchaseOrders.getArticleWeightPercentageOfOrder(
        article,
        orderTotalWeight
      );
    // TODO: numberOfItems should be explicitly explicitly defined here already
    const perArticleShippingCost = orderFreightCost
      .times(articlesWeightDistribution)
      .dividedBy(article.numberOfItems as number);
    const tariffPerArticle = articleUnitPrice
      .times(tariffPercentage.plus(1.0))
      .minus(articleUnitPrice);

    if ((article.numberOfItems ?? 0) == (article.weight ?? 0)) {
      throw new Error(
        `Article with unexpected Weight of '${article.weight}' while Quantity is '${article.numberOfItems}'`
      );
    }

    const totalFreightAndFees = perArticleShippingCost.plus(
      orderCustomsCost.minus(tariffPerArticle.times(article.numberOfItems ?? 0))
    );
    const freightAndFeesPerArticle = totalFreightAndFees.dividedBy(
      orderTotalArticleCount
    );

    /*
    console.log(`unitPrice: ${articleUnitPrice}`);
    console.log(`freightAndFeesPerArticle: ${freightAndFeesPerArticle}`);
    console.log(`totalFreightAndFees: ${totalFreightAndFees}`);
    console.log(`tariffPerArticle: ${tariffPerArticle}`);
    */

    return {
      cost: freightAndFeesPerArticle
        .plus(articleUnitPrice)
        .plus(tariffPerArticle),
      shipping: perArticleShippingCost,
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
    const tariffPerArticle = new Decimal(unitPrice)
      .times(tariffPercentage.plus(1.0))
      .minus(unitPrice);
    const totalFreightAndFees = perArticleShippingCost.plus(
      tariffCost.minus(tariffPerArticle.times(articleQuantity))
    );
    const freightAndFeesPerArticle =
      totalFreightAndFees.dividedBy(totalArticleQuantity);

    console.log(`unitPrice: ${unitPrice}`);
    console.log(`freightAndFeesPerArticle: ${freightAndFeesPerArticle}`);
    console.log(`totalFreightAndFees: ${totalFreightAndFees}`);
    console.log(`tariffPerArticle: ${tariffPerArticle}`);

    return freightAndFeesPerArticle.plus(unitPrice).plus(tariffPerArticle);
  };
}

export default Duxs;
