import axios from 'axios';
import { ProductInfo } from '../types/productTypes';
import { API_BASE_URL } from '../config/api';

export const getRelatedProducts = async (
    categoryIds: number[],
    currentProductId: number,
    lang: string
): Promise<ProductInfo[]> => {
    try {
        const response = await axios.get<ProductInfo[]>(`${API_BASE_URL}/products`, {
            params: {
                category: categoryIds.join(','),
                per_page: 8,
                lang,
                exclude: currentProductId,
            },
        });

        return response.data;
    } catch (error) {
        console.error('❌ Error fetching related products:', error);
        return [];
    }
};
