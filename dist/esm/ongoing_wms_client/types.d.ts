import type { KeyOfType } from "../typings/KeyOfType";
import { paths } from "..";
export type GetEndpoint = KeyOfType<paths, {
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
export type GetParameters<TEndpoint extends GetEndpoint> = paths[TEndpoint]["get"]["parameters"]["query"];
export type GetModel<TEndpoint extends GetEndpoint> = paths[TEndpoint]["get"]["responses"][200]["content"]["application/json"];
