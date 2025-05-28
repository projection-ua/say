// services/getProductBySlug.ts
import axios from 'axios';
import { ProductInfo } from '../types/productTypes';
import { API_BASE_URL } from '../config/api';

export const getProductBySlug = async (slug: string): Promise<ProductInfo | null> => {
    try {
        const response = await axios.get<ProductInfo>(`${API_BASE_URL}/products/${slug}`);
        return response.data;
    } catch (err) {
        console.error('❌ getProductBySlug error:', err);
        return null;
    }
};
