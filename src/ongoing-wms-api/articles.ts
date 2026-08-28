import type { paths } from "./gen/articles.d.ts";
import type {
  GetArticlesByQueryModel,
  GetArticlesParameterQuery,
  PostArticleModel,
} from "./types/articles.types.ts";
import type { PostFileNoFilenameModel, PostFileModel } from "./types/shared.types.ts";
import { ClientWrapper } from "./utils";

export class ArticlesApiV1 extends ClientWrapper<paths> {
  getArticleBySystemId(articleSystemId: number) {
    return this.client.GET("/api/v1/articles/{articleSystemId}", {
      params: {
        path: { articleSystemId },
      },
    });
  }
  updateArticleBySystemId(articleSystemId: number, body: PostArticleModel) {
    return this.client.PUT("/api/v1/articles/{articleSystemId}", {
      params: {
        path: { articleSystemId },
      },
      body,
    });
  }
  createOrUpdateArticle(body: PostArticleModel) {
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
  createArticlesFile(articleSystemId: number, body: PostFileModel) {
    return this.client.POST("/api/v1/articles/{articleSystemId}/files", {
      params: {
        path: { articleSystemId },
      },
      body,
    });
  }
  createOrUpdateArticlesFile(
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
  updateArticleFilyById(
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
