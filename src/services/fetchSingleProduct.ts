import axios from 'axios';
import { ProductInfo } from '../types/productTypes';
import { API_BASE_URL } from '../config/api';
import i18n from 'i18next';

export const fetchSingleProduct = async (slug: string): Promise<ProductInfo | null> => {
    try {
        const lang = i18n.language === 'ua' ? 'uk' : i18n.language;
        const params = lang && lang !== 'uk' ? { lang } : {};
        
        console.log('🔍 Fetching product with slug:', slug, 'and lang:', lang);
        const response = await axios.get<ProductInfo>(
            `${API_BASE_URL}/products/slug/${slug}`,
            { params }
        );
        console.log('📦 API response:', {
            status: response.status,
            data: response.data
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('❌ Error fetching single product:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                url: `${API_BASE_URL}/products/slug/${slug}`
            });
        } else {
            console.error('❌ Error fetching single product:', error);
        }
        return null;
    }
};
