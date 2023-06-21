import Decimal from "decimal.js-light";
import type { GetArticleModel } from "./lib/ongoing";

type OptionalArray<T> = T | T[];

const ARTICLE_CUSTOMS_PERCENTAGE: Record<string, number> = {
  Beverage: 0.12, // 12%
  Shaker: 0.065, // 6.5%
};

abstract class Articles {
  static tryGetCustoms(article: Readonly<GetArticleModel>): Decimal {
    if (
      typeof article.customsDescription === "string" &&
      article.customsDescription in Object.keys(ARTICLE_CUSTOMS_PERCENTAGE)
    ) {
      return new Decimal(
        ARTICLE_CUSTOMS_PERCENTAGE[article.customsDescription]
      );
    }
    throw new Error(`${article.articleName}: Article is missing customs`);
  }

  static tryGetTotalQuantity(
    articles: OptionalArray<Readonly<GetArticleModel>>
  ): Decimal {
    if (Array.isArray(articles)) {
      let result = new Decimal(0);
      for (const article of articles) {
        result = result.plus(this.tryGetQuantity(article));
      }
      return result;
    }
    return new Decimal(
      articles?.inventoryInfo?.numberOfItems ??
        articles.inventoryInfo?.toReceiveNumberOfItems ??
        0
    );
  }

  static getQuantity(article: Readonly<GetArticleModel>): Decimal | undefined {
    if (
      article.inventoryInfo?.numberOfItems ||
      article.inventoryInfo?.toReceiveNumberOfItems
    ) {
      return new Decimal(
        article.inventoryInfo?.numberOfItems ??
          (article.inventoryInfo?.toReceiveNumberOfItems as number)
      );
    }
    return undefined;
  }

  static tryGetQuantity(article: Readonly<GetArticleModel>): Decimal {
    const result = this.getQuantity(article);
    if (!result)
      throw new Error(
        `${article.articleName}: Article is missing 'inventoryInfo.numberOfItems'`
      );
    return result;
  }

  static hasQuantity(
    articles: OptionalArray<Readonly<GetArticleModel>>
  ): boolean {
    if (Array.isArray(articles)) {
      return (
        articles.findIndex(
          ({ inventoryInfo }) =>
            !!inventoryInfo?.numberOfItems ||
            !!inventoryInfo?.toReceiveNumberOfItems
        ) !== -1
      );
    }

    return (
      !!articles.inventoryInfo?.numberOfItems ||
      !!articles.inventoryInfo?.toReceiveNumberOfItems
    );
  }

  static tryGetTotalVolume(
    articles: OptionalArray<Readonly<GetArticleModel>>
  ): Decimal {
    if (Array.isArray(articles)) {
      let result = new Decimal(0);
      for (const article of articles) {
        result = result.plus(
          this.tryGetTotalVolume(article).times(this.tryGetQuantity(article))
        );
      }
      return result;
    }
    if (!articles.volume) {
      throw new Error(`${articles.articleName}: Article is missing volume`);
    }
    return new Decimal(articles.volume);
  }

  static getVolume(article: Readonly<GetArticleModel>): Decimal | undefined {
    if (article.volume) {
      return new Decimal(article.volume);
    }
    return undefined;
  }

  static hasVolume(
    articles: OptionalArray<Readonly<GetArticleModel>>
  ): boolean {
    if (Array.isArray(articles)) {
      return articles.findIndex(({ volume }) => !!volume) !== -1;
    }
    return !!articles.volume;
  }

  static tryGetTotalWeight(
    articles: OptionalArray<Readonly<GetArticleModel>>
  ): Decimal {
    if (Array.isArray(articles)) {
      let result = new Decimal(0);
      for (const article of articles) {
        result = result.plus(
          this.tryGetTotalWeight(article).times(this.tryGetQuantity(article))
        );
      }
      return result;
    }
    if (!articles.weight) {
      throw new Error(`${articles.articleName}: Article is missing weight`);
    }
    return new Decimal(articles.weight);
  }

  static getWeight(article: GetArticleModel): Decimal | undefined {
    if (article.weight) {
      return new Decimal(article.weight);
    }
    return undefined;
  }

  static hasWeight(
    articles: OptionalArray<Readonly<GetArticleModel>>
  ): boolean {
    if (Array.isArray(articles)) {
      return articles.findIndex(({ weight }) => !!weight) !== -1;
    }
    return !!articles.weight;
  }
}

export default Articles;
