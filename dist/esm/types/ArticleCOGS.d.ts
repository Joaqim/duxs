import Decimal from "decimal.js-light";
export interface ArticleCOGS {
    articleSKU?: string | null;
    articleName?: string | null;
    quantity: number;
    weightPercentage: Decimal;
    unitCost: Decimal;
    unitShippingCost: Decimal;
    totalCost: Decimal;
    totalShippingCost: Decimal;
}
