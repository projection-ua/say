// ✅ src/services/fetchSliderProducts.ts
import axios from 'axios';
import { ProductInfo } from '../types/productTypes';
import { apiUrl, consumerKey, consumerSecret } from '../App';
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

        const response = await axios.get<ProductInfo[]>(`${apiUrl}`, {
            auth: { username: consumerKey, password: consumerSecret },
            params,
        });

        return response.data;
    } catch (error) {
        console.error('❌ fetchSliderProducts error:', error);
        return [];
    }
};
