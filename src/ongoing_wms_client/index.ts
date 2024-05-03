import axios, { AxiosInstance } from "axios";
import { paths } from "..";

class OngoingWMSClient {
  api: AxiosInstance;

  constructor(
    api_url: Readonly<string>,
    username: Readonly<string>,
    password: Readonly<string>
  ) {
    this.api = axios.create({
      baseURL: api_url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      auth: {
        username,
        password,
      },
    });
  }

  async getArticleItems(parameters: Readonly<paths["/api/v1/articleItems"]>) {
    return this.api.get<
      {},
      paths["/api/v1/articleItems"]["get"]["responses"]["200"]["content"]
    >("/api/v1/articleItems", {
      params: parameters.get.parameters.query,
    });
  }
}

export default OngoingWMSClient;
