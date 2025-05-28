import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { ProductInfo } from '../types/productTypes';

export const getProductsSale = async ({
                                      lang,
                                      onSale = false,
                                      page = 1,
                                      perPage = 100,
                                  }: {
    lang: string;
    onSale?: boolean;
    page?: number;
    perPage?: number;
}): Promise<ProductInfo[]> => {
    try {
        const response = await axios.get<ProductInfo[]>(`${API_BASE_URL}/products`, {
            params: {
                lang,
                page,
                per_page: perPage,
                on_sale: onSale ? true : undefined,
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
