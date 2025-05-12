import axios from 'axios';
import { apiUrl, consumerKey, consumerSecret } from '../App';
import { ProductInfo } from '../types/productTypes';

export const getRelatedProducts = async (
    categoryIds: number[],
    excludeProductId: number,
    lang: string
): Promise<ProductInfo[]> => {
    try {
        const response = await axios.get<ProductInfo[]>(`${apiUrl}`, {
            auth: {
                username: consumerKey,
                password: consumerSecret,
            },
            params: {
                per_page: 12,
                lang,
                category: categoryIds.join(','), // 🎯 потрібні категорії
                exclude: excludeProductId,       // ❌ виключаємо сам товар
                status: 'publish',
            },
        });

        return response.data;
    } catch (error) {
        console.error('❌ Error fetching related products:', error);
        return [];
    }
};
