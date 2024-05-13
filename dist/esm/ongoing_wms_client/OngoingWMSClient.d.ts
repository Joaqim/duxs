import { AxiosInstance, AxiosResponse } from "axios";
import type { GetEndpoint, GetParameters, GetModel } from "./types";
declare class OngoingWMSClient {
    api: AxiosInstance;
    constructor(api_url: Readonly<string>, username: Readonly<string>, password: Readonly<string>);
    getAll<TEndpoint extends GetEndpoint, TParameters = GetParameters<TEndpoint>, TContent = GetModel<TEndpoint>>(endpoint: TEndpoint, parameters: TParameters): Promise<AxiosResponse<TContent>>;
}
export default OngoingWMSClient;
