export interface CartItem {
    id: number;
    name: string;
    price: number;          // actual price (з урахуванням знижки або без)
    regular_price: number;   // стара ціна без знижки
    sale_price?: number | null; // знижка (може бути null)
    quantity: number;
    image: string;
    sku: string;
    variationId?: number;
    attributes?: Record<string, string>;
}
