import { ProductInfo } from "../types/productTypes";
import { apiUrlWp, consumerKey, consumerSecret } from "../App";

export const getProductBySlug = async (slug: string): Promise<ProductInfo | null> => {
    const response = await fetch(`${apiUrlWp}wp-json/wc/v3/products?slug=${slug}&consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`);

    if (!response.ok) {
        console.error("Помилка при запиті продукту по slug");
        return null;
    }

    const data = await response.json();
    return data.length > 0 ? data[0] : null;
};
