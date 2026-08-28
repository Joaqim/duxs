import type { components, operations } from "../gen/articles";

export type GetArticlesByQueryModel =
  components["schemas"]["GetArticlesByQueryModel"];
export type PostArticleModel = components["schemas"]["PostArticleModel"];
export type GetArticlesParameterQuery =
  operations["Articles_GetAll"]["parameters"]["query"];
