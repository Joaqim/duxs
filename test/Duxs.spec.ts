import { expect } from "chai";
import { Duxs, GetPurchaseOrderModel } from "../src";
import wraithPurchaseOrder from "./__mocks__/GetPurchaseOrderModel_WRAITH001.json";

describe("Duxs", function () {
  it("", function () {
    const wraithPurchase =
      wraithPurchaseOrder as unknown as GetPurchaseOrderModel;

    const articleCOGS = Duxs.getArticleCostOverview(wraithPurchase);

    wraithPurchase.purchaseOrderInfo!.freeValues = {};

    expect(() => Duxs.getArticleCostOverview(wraithPurchase)).to.throw(
      "Purchase Order is missing free values for customs fee and shipping fee"
    );

    expect(() => Duxs.getArticleCostOverview(wraithPurchase)).to.throw(
      "Purchase Order is missing free values for customs fee and shipping fee"
    );

    console.log(JSON.stringify(articleCOGS, null, 4));
  });
});
