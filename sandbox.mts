#!/usr/bin/env node
import dotenv from "dotenv";
import { OngoingWMSClient } from "./dist/esm/index.node.js";

dotenv.config({ quiet: true });

const { ONGOING_WMS_BASE_URL, ONGOING_WMS_TOKEN } = process.env;

if (!ONGOING_WMS_BASE_URL || !ONGOING_WMS_TOKEN) {
  process.exit(1);
}

const { 
  articlesApiV1: articles, 
  ordersApiV1: orders 
} = new OngoingWMSClient({
  BASE_URL: ONGOING_WMS_BASE_URL,
  TOKEN: ONGOING_WMS_TOKEN,
});
articles.getArticleBySystemId(16774).then(({ data, error }) => {
  console.log({ data, error });
});

orders.getOrder(35050).then(({ data, error }) => {
  console.log({ data, error });
});
