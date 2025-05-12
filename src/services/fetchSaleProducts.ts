import axios from 'axios';
import { apiUrl, consumerKey, consumerSecret } from '../App';
import { ProductInfo } from '../types/productTypes';

export const getProductsSale = async ({
                                      lang,
                                      onSale = false,
                                      page = 1,
                                      perPage = 100,
                                  }: {
    lang: string;
    onSale?: boolean;
    page?: number;
    perPage?: number;
}): Promise<ProductInfo[]> => {
    try {
        const response = await axios.get<ProductInfo[]>(`${apiUrl}`, {
            auth: {
                username: consumerKey,
                password: consumerSecret,
            },
            params: {
                lang,
                page,
                per_page: perPage,
                on_sale: onSale ? true : undefined,
            },
        });

        return response.data;
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        return [];
    }
};
