import axios from 'axios';
import { apiUrl, consumerKey, consumerSecret } from '../App';
import { ProductInfo } from '../types/productTypes';

export const getProductsNews = async ({
                                      lang,
                                      isNew = false,
                                      page = 1,
                                      perPage = 28,
                                  }: {
    lang: string;
    onSale?: boolean;
    isNew?: boolean;
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
                orderby: isNew ? 'date' : undefined,
                order: isNew ? 'desc' : undefined,
            },
        });

        return response.data;
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        return [];
    }
};
