import axios from 'axios';
import { Variation } from '../types/productTypes';
import { apiUrl, consumerKey, consumerSecret } from '../App';

export const getVariationsByProductId = async (
    productId: number,
    lang: string
): Promise<Variation[]> => {
    try {
        const response = await axios.get(`${apiUrl}/${productId}/variations`, {
            auth: {
                username: consumerKey,
                password: consumerSecret,
            },
            params: {
                per_page: 100,
                lang, // 🔥 додаємо мову сюди
            },
        });

        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error(`Помилка при отриманні варіацій для продукту ID ${productId}:`, error);
        return [];
    }
};
