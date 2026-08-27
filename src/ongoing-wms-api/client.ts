import createClient from "openapi-fetch";
import type { paths } from "./gen/articles.d.ts"; // TODO
import { ClientWrapper } from "./utils";
import { ArticlesApiV1 } from "./articles";

export class OngoingWMSClient extends ClientWrapper<paths> {
  public articlesApiV1: ArticlesApiV1;
  constructor(options: {BASE_URL: string, TOKEN: string}) {
    super(createClient<paths>({ baseUrl: options.BASE_URL }), options.TOKEN);
    this.articlesApiV1 = new ArticlesApiV1(this.client);
  }
}

