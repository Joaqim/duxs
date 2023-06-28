export interface IncomingArticle {
    id: string;
    article_system_id?: number;
    article_number: string;
    quantity: number;
    price: number;
    weight?: number;
    freight?: number;
    customs?: number;
    tariff?: number;
    tariff_code?: string;
    type?: string;
}
export interface IncomingOrder {
    id: string;
    supplier_number: string;
    articles: IncomingArticle[];
    customs_cost?: number;
    freight_cost?: number;
    estimated_freight_cost?: number;
    estimated_customs_cost?: number;
}
export interface IncomingOrderDocument<TArticleIdType extends object | string | number | symbol = string> extends Omit<IncomingOrder, "articles"> {
    articles: TArticleIdType[];
}
