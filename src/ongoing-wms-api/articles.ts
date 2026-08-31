import { ArticlesApiV1Base } from "./gen/articles.client";

export class ArticlesApiV1 extends ArticlesApiV1Base {
  /**
   * @deprecated Renamed to fix a typo and align with generated naming. Use
   * {@link putArticlesFileById} instead.
   */
  putArticleFilyById(
    ...args: Parameters<ArticlesApiV1Base["putArticlesFileById"]>
  ): ReturnType<ArticlesApiV1Base["putArticlesFileById"]> {
    return this.putArticlesFileById(...args);
  }
}
