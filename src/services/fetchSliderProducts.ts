// ✅ src/services/fetchSliderProducts.ts
import axios from 'axios';
import { ProductInfo } from '../types/productTypes';
import { API_BASE_URL } from '../config/api';
import i18n from 'i18next';

export const fetchSliderProducts = async (
    filterTag: 'new' | 'sale'
): Promise<ProductInfo[]> => {
    const lang = i18n.language === 'ua' ? 'uk' : i18n.language;
    const perPage = 12;

    try {
        const params: Record<string, string | number | boolean> = {
            per_page: perPage,
            lang,
        };

        if (filterTag === 'sale') {
            params.on_sale = true;
        }

        if (filterTag === 'new') {
            params.orderby = 'date';
            params.order = 'desc';
        }

        const response = await axios.get<ProductInfo[]>(`${API_BASE_URL}/products`, {
            params,
        });

        return response.data;
    } catch (error) {
        console.error('❌ fetchSliderProducts error:', error);
        return [];
    }
};
