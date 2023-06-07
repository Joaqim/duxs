
import Decimal from 'decimal.js-light';
import getValue from 'get-value';
import { Duxs, PurchaseOrders } from '../src';
import type { GetPurchaseOrderModel } from '../src/lib/ongoing';
import wraithPurchaseOrder from "./__mocks__/GetPurchaseOrderModel_WRAITH001.json";


describe("PurchaseOrders", function () {
    const wraithPurchase = wraithPurchaseOrder as any as GetPurchaseOrderModel;
    it("TODO: Serialize Model from json", function () {
        const wraithPurchase = wraithPurchaseOrder as any as GetPurchaseOrderModel;
    });

    it("", function () {
        const articleWeightDistribution: Record<string, Decimal> = {}

        const [freightCost, customsCost] = PurchaseOrders.tryGetFreightAndCustomsCost(wraithPurchase);

        const { purchaseOrderLines, purchaseOrderInfo } = wraithPurchase;

        if(!purchaseOrderLines) {
            throw new Error(`Unexpected empty field 'purchaseOrderLines'`)
        }

          const purchaseOrderStatus = purchaseOrderInfo?.purchaseOrderStatus?.text
          let purchaseOrderArticleCountStatus: 'advised' | 'received' | undefined
          if (purchaseOrderStatus === 'Inleverans') {
            purchaseOrderArticleCountStatus = 'advised'
          } else if (purchaseOrderStatus === 'Mottaget' || purchaseOrderStatus === 'Lagerlagd') {
            purchaseOrderArticleCountStatus = 'received'
          } else {
            throw new Error(`Unexpected Purchase order status: ${purchaseOrderStatus}`)
          }


          const totalArticleQuantity = PurchaseOrders.getTotalArticleQuantity(wraithPurchase, purchaseOrderArticleCountStatus)

          const totalWeightOfArticles = PurchaseOrders.getTotalWeightOfArticles(purchaseOrderLines)

          for (const purchaseOrderLine of purchaseOrderLines) {
            const { rowPrice } = purchaseOrderLine;
            const articleName = purchaseOrderLine.article?.articleName
            if (!rowPrice) {
              throw new Error(`Unexpected value of 'rowPrice': '${rowPrice}'`)
            }
            if (!purchaseOrderLine.articleItems) {
              throw new Error(`Unexpected empty field 'articleItems'`)
            }


            for (let article of purchaseOrderLine.articleItems) {
              console.log(article.weight)
              console.log(PurchaseOrders.getWeightOfArticles(article).toString())
              // Filter out articles with unexpected Zero weight:
              if(article.weight == 0) {
                console.log(`Skipping Zero weight article of SKU: ${articleName} with id: ${article.originalArticleItemId}`)
                continue;
              }
              const articleId = `${article.originalArticleItemId}`
              if (articleWeightDistribution[articleId]) {
                throw new Error(`Unexpected duplicate articleId: ${articleId}`)
              }
              articleWeightDistribution[articleId] = PurchaseOrders.getArticleWeightPercentageOfOrder(article, totalWeightOfArticles)

              let [cost, shipping] = [new Decimal(0), new Decimal(0)];
              try {
               ({ cost, shipping } = Duxs.calculateArticleCosts(article, new Decimal(rowPrice), new Decimal(0), freightCost, customsCost, totalWeightOfArticles, totalArticleQuantity));
                console.log(`Total cost: ${cost} incl. Shipping: ${shipping}`)
              } catch (error) {
                const {message} = error as Error;
                console.log(`Failed to calculate cost of articles of SKU: ${articleName} with id: ${articleId} - ${message}`)
              }
            }
            const tariffPercentage = new Decimal(0.0);
            const totalCostPerArticle =
              Duxs.getTotalCostPerArticle(
                rowPrice,
                getValue(purchaseOrderLine, `${purchaseOrderArticleCountStatus}NumberOfItems`) ?? 0,
                totalArticleQuantity.toNumber(),
                freightCost,
                customsCost,
                tariffPercentage,
              )
          }

          const SumOfArticleWeightDistribution = Object.values(articleWeightDistribution).reduce((a, b) => a.plus(b), new Decimal(0))
          if (SumOfArticleWeightDistribution.equals(100)) {
            throw new Error(`Unexpected sum percentage distribution: ${SumOfArticleWeightDistribution}, expected: 100`)
          }
    })
})