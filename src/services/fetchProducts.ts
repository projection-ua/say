import axios from 'axios';
import { ProductInfo } from '../types/productTypes';
import {apiUrl, consumerKey, consumerSecret} from "../App.tsx";



// Функція для отримання продуктів
export const getProducts = async (): Promise<ProductInfo[]> => {
    try {
        const response = await axios.get(apiUrl, {
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
        console.error('Error fetching products:', error);
        return [];
    }
};
