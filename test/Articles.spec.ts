import { expect } from "chai";
import Decimal from "decimal.js-light";
import Articles from "../src/Articles";
import type { GetArticleModel } from "../src/lib/ongoing";
import wraithArticlesJson from "./__mocks__/GetArticleModel_WRAITH.json";

describe("Articles", function () {
  const wraithArticles = wraithArticlesJson as any as GetArticleModel[];
  it("", function () {
    let totalVolume = new Decimal(0);
    if (Articles.hasVolume(wraithArticles)) {
      totalVolume = Articles.tryGetTotalVolume(wraithArticles);

      expect(() => Articles.tryGetTotalVolume(wraithArticles)).to.not.throw;
    }
    let totalWeight = new Decimal(0);

    const articlesWithWeight = wraithArticles.filter((article) =>
      Articles.hasWeight(article)
    );

    expect(articlesWithWeight).to.not.be.empty;
    expect(Articles.hasWeight(articlesWithWeight)).to.be.true;

    const articlesWithoutWeight = wraithArticles.filter(
      (article) => !Articles.hasWeight(article)
    );

    expect(Articles.hasWeight(articlesWithoutWeight)).to.be.false;

    expect(
      articlesWithWeight.length + articlesWithoutWeight.length
    ).to.be.equal(wraithArticles.length);

    totalWeight = Articles.tryGetTotalWeight(wraithArticles);

    console.log(totalVolume.toString(), totalWeight.toString());
  });
});
