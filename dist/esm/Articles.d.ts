import Decimal from "decimal.js-light";
import type { GetArticleModel } from "./lib/ongoing";
type OptionalArray<T> = T | T[];
declare abstract class Articles {
    static tryGetCustoms(article: Readonly<GetArticleModel>): Decimal;
    static tryGetTotalQuantity(articles: OptionalArray<Readonly<GetArticleModel>>): Decimal;
    static getQuantity(article: Readonly<GetArticleModel>): Decimal | undefined;
    static tryGetQuantity(article: Readonly<GetArticleModel>): Decimal;
    static hasQuantity(articles: OptionalArray<Readonly<GetArticleModel>>): boolean;
    static tryGetTotalVolume(articles: OptionalArray<Readonly<GetArticleModel>>): Decimal;
    static getVolume(article: Readonly<GetArticleModel>): Decimal | undefined;
    static hasVolume(articles: OptionalArray<Readonly<GetArticleModel>>): boolean;
    static tryGetTotalWeight(articles: OptionalArray<Readonly<GetArticleModel>>): Decimal;
    static getWeight(article: GetArticleModel): Decimal | undefined;
    static hasWeight(articles: OptionalArray<Readonly<GetArticleModel>>): boolean;
}
export default Articles;
