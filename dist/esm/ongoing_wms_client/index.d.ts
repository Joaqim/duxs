import { AxiosInstance, AxiosResponse } from "axios";
import { paths } from "..";
/**
 * Gets the keys of a type that match a specified value
 *
 * @template T The type to get the keys from
 * @template V The value to check for in each key of T
 */
type KeyOfType<T, V> = keyof {
    [P in keyof T as T[P] extends V ? P : never]: any;
};
type GetEndpoint = KeyOfType<paths, {
    get: {
        parameters: {
            query: object;
        };
        responses: {
            200: {
                content: {
                    "application/json": object;
                };
            };
        };
    };
}>;
declare class OngoingWMSClient {
    api: AxiosInstance;
    constructor(api_url: Readonly<string>, username: Readonly<string>, password: Readonly<string>);
    getAll<TEndpoint extends GetEndpoint, TParameters = paths[TEndpoint]["get"]["parameters"]["query"], TContent = paths[TEndpoint]["get"]["responses"][200]["content"]["application/json"]>(endpoint: TEndpoint, parameters: TParameters): Promise<AxiosResponse<TContent>>;
}
export default OngoingWMSClient;
