import axios from 'axios';
import { ProductInfo } from '../types/productTypes';
import { API_BASE_URL } from '../config/api';

export const getProductsNews = async ({
    lang,
    isNew = false,
    page = 1,
    perPage = 28,
}: {
    lang: string;
    onSale?: boolean;
    isNew?: boolean;
    page?: number;
    perPage?: number;
}): Promise<ProductInfo[]> => {
    try {
        const response = await axios.get<ProductInfo[]>(`${API_BASE_URL}/products`, {
            params: {
                lang,
                page,
                per_page: perPage,
                orderby: isNew ? 'date' : undefined,
                order: isNew ? 'desc' : undefined,
            },
        });

        if (response.data) {
            return response.data.map(product => {
                const colorAttr = product.attributes?.find(attr => attr.name === 'Колір' || attr.name === 'Цвет');
                const colorName = colorAttr?.options[0]?.name || '';
                return {
                    ...product,
                    productColor: colorName,
                    colorName: colorName
                };
            });
        }

        return [];
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        return [];
    }
};
