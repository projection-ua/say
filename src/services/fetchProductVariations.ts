import axios, { AxiosError } from 'axios';
import { ProductInfo, Variation } from '../types/productTypes';
import { API_BASE_URL } from '../config/api';
import i18n from 'i18next';

export const fetchProductVariations = async (productId: number): Promise<Variation[]> => {
    try {
        const lang = i18n.language === 'ua' ? 'uk' : i18n.language;
        const params = lang && lang !== 'uk' ? { lang } : {};
        
        console.log('🔍 Fetching variations for product ID:', productId, 'with lang:', lang);
        const response = await axios.get<ProductInfo[]>(`${API_BASE_URL}/products/${productId}/variations`, { params });
        console.log('📦 API response:', {
            status: response.status,
            dataLength: Array.isArray(response.data) ? response.data.length : 'not an array',
            data: response.data
        });
        
        const variations = Array.isArray(response.data) ? response.data : [];
        const mappedVariations = variations.map(variation => ({
            ...variation,
            attributes: Array.isArray(variation.attributes)
                ? (variation.attributes as any[]).map(attr => ({
                    name: attr.name,
                    slug: attr.slug,
                    option: attr.option || ''
                }))
                : []
        }));
        
        console.log('🔄 Mapped variations:', mappedVariations);
        return mappedVariations;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error('❌ Error fetching product variations:', {
            message: axiosError.message,
            response: axiosError.response?.data,
            status: axiosError.response?.status
        });
        return [];
    }
};
