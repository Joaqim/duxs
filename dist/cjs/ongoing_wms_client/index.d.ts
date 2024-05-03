import { AxiosInstance } from "axios";
import { paths } from "..";
declare class OngoingWMSClient {
    api: AxiosInstance;
    constructor(api_url: Readonly<string>, username: Readonly<string>, password: Readonly<string>);
    getArticleItems(parameters: Readonly<paths["/api/v1/articleItems"]>): Promise<{
        "application/json": {
            articleSystemId?: number | undefined;
            articleNumber?: string | null | undefined;
            items?: {
                batch?: string | null | undefined;
                container?: string | null | undefined;
                expiryDate?: string | null | undefined;
                isLocked?: boolean | undefined;
                isLockedForSale?: boolean | undefined;
                location?: string | null | undefined;
                numberOfItems?: number | undefined;
                serial?: string | null | undefined;
                status?: {
                    code?: string | null | undefined;
                    name?: string | null | undefined;
                } | undefined;
                comment?: string | null | undefined;
                warehouse?: {
                    id?: number | undefined;
                    code?: string | null | undefined;
                    name?: string | null | undefined;
                } | undefined;
                inDate?: string | undefined;
            }[] | null | undefined;
        }[] | null;
    }>;
}
export default OngoingWMSClient;
