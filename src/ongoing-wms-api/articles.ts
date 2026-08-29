import type { paths } from "./gen/articles";
import type {
  GetArticlesByQueryModel,
  PostArticleModel,
} from "./gen/articles.types";
import type {
  PostFileNoFilenameModel,
  PostFileModel,
} from "./gen/shared.types";
import type { GetArticlesParameterQuery } from "./types/articles.types";

import { ClientWrapper, ExtractFetchResponse } from "./utils";
export class ArticlesApiV1 extends ClientWrapper<paths> {
  /**
   * @see {@link https://developer.ongoingwarehouse.com/REST/v1/index.html#/Articles/Articles_Get}
   * @returns {@link GetArticleBySystemIdResponse}
   *
   * data: 2xx response if OK; otherwise undefined
   *
   * error: 5xx, 4xx, or default response if not OK; otherwise undefined
   *
   * response: The original Response which contains status, headers, etc.
   *
   * TODO: Typedef returns for envelope of { data?, error?: response: Response
   * }, preferably via openapi-fetch's existing types:
   * Readable<ErrorResponse<ResponseObjectMap<T>, Media>>; from `paths` codegen
   *
   * We want the clean "GetArticleModel" for documentation purposes, we should
   * be able to do the same for error messages which are dictated by the
   * codegen openapi spec in `paths`
   *
   * The explicit GetArticleBySystemIdResponse prevent typedocs verbose
   * external in-line codegen type definition.
   * But our return type becomes simply: "Promise"
   */
  getArticleBySystemId(articleSystemId: number): GetArticleBySystemIdResponse {
    return this.client.GET("/api/v1/articles/{articleSystemId}", {
      params: {
        path: { articleSystemId },
      },
    });
  }
  putArticleBySystemId(articleSystemId: number, body: PostArticleModel) {
    return this.client.PUT("/api/v1/articles/{articleSystemId}", {
      params: {
        path: { articleSystemId },
      },
      body,
    });
  }
  putArticle(body: PostArticleModel) {
    return this.client.PUT("/api/v1/articles", {
      body,
    });
  }
  /**
   * @returns {@link GetArticlesResponse} Array of articles
   */
  getArticles(query: GetArticlesParameterQuery): GetArticlesResponse {
    return this.client.GET("/api/v1/articles", {
      params: {
        query,
      },
    });
  }
  getArticlesFiles(articleSystemId: number) {
    return this.client.GET("/api/v1/articles/{articleSystemId}/files", {
      params: {
        path: { articleSystemId },
      },
    });
  }
  postArticlesFile(articleSystemId: number, body: PostFileModel) {
    return this.client.POST("/api/v1/articles/{articleSystemId}/files", {
      params: {
        path: { articleSystemId },
      },
      body,
    });
  }
  putArticlesFile(
    articleSystemId: number,
    body: PostFileNoFilenameModel,
    fileName: string | null,
  ) {
    return this.client.PUT("/api/v1/articles/{articleSystemId}/files", {
      params: {
        path: { articleSystemId },
        query: { fileName },
      },
      body,
    });
  }
  putArticleFilyById(
    articleSystemId: number,
    fileId: number,
    body: PostFileModel,
  ) {
    return this.client.PUT(
      "/api/v1/articles/{articleSystemId}/files/{fileId}",
      {
        params: {
          path: { articleSystemId, fileId },
        },
        body,
      },
    );
  }
  getArticlesByQuery(body: GetArticlesByQueryModel) {
    return this.client.POST("/api/v1/articles/byQuery", {
      body,
    });
  }
}
