import axios, { AxiosInstance, AxiosResponse } from "axios";
import type { GetEndpoint, GetParameters, GetModel } from "./types";

class OngoingWMSClient {
  api: AxiosInstance;

  public constructor(
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

  public async getAll<
    TEndpoint extends GetEndpoint,
    TParameters = GetParameters<TEndpoint>,
    TContent = GetModel<TEndpoint>
  >(
    endpoint: TEndpoint,
    parameters: TParameters
  ): Promise<AxiosResponse<TContent>> {
    return this.api.get<TContent>(`${endpoint}`, {
      params: parameters,
    });
  }
}

export default OngoingWMSClient;
