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

import { ClientWrapper } from "./utils";
export class ArticlesApiV1 extends ClientWrapper<paths> {
  getArticleBySystemId(articleSystemId: number) {
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
  getArticles(query: GetArticlesParameterQuery) {
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
