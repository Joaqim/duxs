import type { paths } from "./gen/client.d.ts";
import createClient from "openapi-fetch";
import { transport } from "./transport.js";
import { ClientWrapper } from "./utils";
import { ArticlesApiV1 } from "./articles";
import { OrdersApiV1 } from "./orders";

export class OngoingWMSClient extends ClientWrapper<paths> {
  public articlesApiV1: ArticlesApiV1;
  public ordersApiV1: OrdersApiV1;
  constructor(options: { BASE_URL: string; TOKEN: string }, fetch = transport) {
    super(
      createClient<paths>({ baseUrl: options.BASE_URL, fetch }),
      options.TOKEN,
    );
    this.articlesApiV1 = new ArticlesApiV1(this.client);
    this.ordersApiV1 = new OrdersApiV1(this.client);
  }
}
