import axios, { AxiosInstance, AxiosResponse } from "axios";
import { paths } from "..";

/**
 * Gets the keys of a type that match a specified value
 *
 * @template T The type to get the keys from
 * @template V The value to check for in each key of T
 */
type KeyOfType<T, V> = keyof {
  /**
   * The key of T that has a value of type V
   */
  [P in keyof T as T[P] extends V ? P : never]: any;
};

// Endpoint URLs that accept param and returns json content
type GetEndpoint = KeyOfType<
  paths,
  {
    get: {
      parameters: { query: object };
      responses: {
        200: {
          content: { "application/json": object };
        };
      };
    };
  }
>;

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
    TParameters = paths[TEndpoint]["get"]["parameters"]["query"],
    TContent = paths[TEndpoint]["get"]["responses"][200]["content"]["application/json"]
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
