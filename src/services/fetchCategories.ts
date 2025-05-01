import axios from 'axios';
import { apiUrl, consumerKey, consumerSecret } from '../App.tsx';

export interface CategoryInfo {
    id: number;
    name: string;
    slug: string;
    image?: {
        id: number;
        src: string;
        name: string;
        alt: string;
    };
    count: number;
    parent: number;
}




export const getCategories = async (): Promise<CategoryInfo[]> => {
    try {
        const response = await axios.get(`${apiUrl}/categories`, {
            auth: {
                username: consumerKey,
                password: consumerSecret,
            },
            params: {
                per_page: 100, // 🔥 отримуємо до 100 товарів за раз
            },
        });

        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};
