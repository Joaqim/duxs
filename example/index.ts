import dotenv from "dotenv";
import { OngoingWMSClient } from "@primepack/duxs";

dotenv.config({ quiet: true });

const { ONGOING_WMS_BASE_URL, ONGOING_WMS_TOKEN } = process.env;

if (!ONGOING_WMS_BASE_URL || !ONGOING_WMS_TOKEN) {
  console.error(
    "Missing ONGOING_WMS_TOKEN and/or ONGOING_WMS_TOKEN, see .env.example",
  );
  process.exit(1);
}

const {
  articlesApiV1: articles,
  ordersApiV1: orders,
  goodsOwnersApiV1: goodsOwners,
} = new OngoingWMSClient({
  BASE_URL: ONGOING_WMS_BASE_URL,
  TOKEN: ONGOING_WMS_TOKEN,
});
articles.getArticleBySystemId(123).then(async ({ data, error, response }) => {
  if (!data) {
    const { status, statusText } = response;
    console.error(`Failed to fetch article`);
    console.error(`${status}: ${error.message} - ${statusText}`);
    return;
  }
  console.log(`Fetched article with id: ${data.articleSystemId}`);
});

orders.getOrderById(123456).then(({ data, error }) => {
  if (error) {
    console.error(`Failed to fetch order.`);
    console.error(error);
    return;
  }
  if (!data?.orderInfo) {
    console.error(`Order has no order info.`);
    return;
  }
  console.log(`Fetched order with id: ${data.orderInfo.orderId}`);
});

goodsOwners.getGoodsOwners().then(({ data, error }) => {
  if (error) {
    console.error(`Failed to fetch goods owners`);
    return;
  }
  console.log("GoodsOwners: ");
  console.log(
    JSON.stringify(
      data?.goodsOwners?.map(
        ({ goodsOwnerId, goodsOwnerName }) =>
          `${goodsOwnerId} : ${goodsOwnerName}`,
      ),
      null,
      2,
    ),
  );
});
