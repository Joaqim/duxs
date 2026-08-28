import dotenv from "dotenv";
// Works: 
// import { OngoingWMSClient } from "../dist/esm/index.node.js";
// Does not:  Module '"duxs"' has no exported member 'OngoingWMSClient'.
import { OngoingWMSClient } from "duxs";

dotenv.config({ quiet: true });

const { ONGOING_WMS_BASE_URL, ONGOING_WMS_TOKEN } = process.env;

if (!ONGOING_WMS_BASE_URL || !ONGOING_WMS_TOKEN) {
  process.exit(1);
}

const { articlesApiV1: articles, ordersApiV1: orders } = new OngoingWMSClient({
  BASE_URL: ONGOING_WMS_BASE_URL,
  TOKEN: ONGOING_WMS_TOKEN,
});
articles.getArticleBySystemId(123456).then(({ data, error }) => {
  if(error) {
    console.error(`Failed to fetch article`)
    console.error(error)
    return
  }
  console.log(`Fetched article with id: ${data.articleSystemId}`);
});

orders.getOrder(12345).then(({ data, error }) => {
  if(error) {
    console.error(`Failed to fetch order.`)
    console.error(error)
    return
  }
  if (!data?.orderInfo) {
    console.error(`Order has no order info.`);
    return
  }
  console.log(`Fetched order with id: ${data.orderInfo.orderId}`);
});
