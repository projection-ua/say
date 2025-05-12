// services/getProductBySlug.ts
import axios from 'axios';
import { ProductInfo } from '../types/productTypes';
import { apiUrl, consumerKey, consumerSecret } from '../App';

export const getProductBySlug = async (slug: string, lang: string): Promise<ProductInfo | null> => {
    try {
        const response = await axios.get<ProductInfo[]>(`${apiUrl}`, {
            auth: {
                username: consumerKey,
                password: consumerSecret,
            },
            params: {
                slug,
                lang,
                per_page: 1,
                status: 'publish',
            },
        });

        return response.data.length ? response.data[0] : null;
    } catch (err) {
        console.error('❌ getProductBySlug error:', err);
        return null;
    }
};
