import type { paths as articlesPath } from "./gen/articles";
import type { paths as ordersPath } from "./gen/orders";

import createClient from "openapi-fetch";
import { transport } from "./transport";
import { ClientWrapper } from "./utils";
import { ArticleItemsApiV1 } from "./articleItems";
import { ArticlesApiV1 } from "./articles";
import { GoodsOwnersApiV1 } from "./goodsOwners";
import { InventoryAdjustmentsApiV1 } from "./inventoryAdjustments";
import { InvoicesApiV1 } from "./invoices";
import { MovementsApiV1 } from "./movements";
import { OrdersApiV1 } from "./orders";
import { ParcelTypesApiV1 } from "./parcelTypes";
import { ProductionOrdersApiV1 } from "./productionOrders";
import { PurchaseOrdersApiV1 } from "./purchaseOrders";
import { ReturnOrdersApiV1 } from "./returnOrders";
import { TransporterContractsApiV1 } from "./transporterContracts";
import { WarehousesApiV1 } from "./warehouses";

export class OngoingWMSClient extends ClientWrapper<articlesPath & ordersPath> {
  public articleItemsApiV1: ArticleItemsApiV1;
  public articlesApiV1: ArticlesApiV1;
  public goodsOwnersApiV1: GoodsOwnersApiV1;
  public inventoryAdjustmentsApiV1: InventoryAdjustmentsApiV1;
  public invoicesApiV1: InvoicesApiV1;
  public movementsApiV1: MovementsApiV1;
  public ordersApiV1: OrdersApiV1;
  public parcelTypesApiV1: ParcelTypesApiV1;
  public productionOrdersApiV1: ProductionOrdersApiV1;
  public purchaseOrdersApiV1: PurchaseOrdersApiV1;
  public returnOrdersApiV1: ReturnOrdersApiV1;
  public transporterContractsApiV1: TransporterContractsApiV1;
  public warehousesApiV1: WarehousesApiV1;

  constructor(options: { BASE_URL: string; TOKEN: string }, fetch = transport) {
    super(createClient({ baseUrl: options.BASE_URL, fetch }), options.TOKEN);
    this.articleItemsApiV1 = new ArticleItemsApiV1(this.client);
    this.articlesApiV1 = new ArticlesApiV1(this.client);
    this.goodsOwnersApiV1 = new GoodsOwnersApiV1(this.client);
    this.inventoryAdjustmentsApiV1 = new InventoryAdjustmentsApiV1(this.client);
    this.invoicesApiV1 = new InvoicesApiV1(this.client);
    this.movementsApiV1 = new MovementsApiV1(this.client);
    this.ordersApiV1 = new OrdersApiV1(this.client);
    this.parcelTypesApiV1 = new ParcelTypesApiV1(this.client);
    this.productionOrdersApiV1 = new ProductionOrdersApiV1(this.client);
    this.purchaseOrdersApiV1 = new PurchaseOrdersApiV1(this.client);
    this.returnOrdersApiV1 = new ReturnOrdersApiV1(this.client);
    this.transporterContractsApiV1 = new TransporterContractsApiV1(this.client);
    this.warehousesApiV1 = new WarehousesApiV1(this.client);
  }
}
