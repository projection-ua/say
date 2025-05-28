import axios from 'axios';
import { ProductInfo } from '../types/productTypes';
import { API_BASE_URL } from '../config/api';

const getCategoryIdBySlug = (slug: string, lang: string): number | null => {
    const cached = localStorage.getItem(`categories_${lang}`);
    if (!cached) return null;
    
    try {
        const categories = JSON.parse(cached);
        // Перевіряємо обидва формати даних
        if (categories[slug]) {
            // Якщо це повна інформація про категорію
            if (typeof categories[slug] === 'object' && categories[slug].id) {
                return categories[slug].id;
            }
            // Якщо це просто ID
            if (typeof categories[slug] === 'number') {
                return categories[slug];
            }
        }
        return null;
    } catch (error) {
        console.error('Error parsing categories from localStorage:', error);
        return null;
    }
};

export const fetchProductsByCategorySlug = async (
    slug: string | null = null,
    page: number = 1,
    lang: string = 'uk'
): Promise<ProductInfo[]> => {
    const categoryId = slug ? getCategoryIdBySlug(slug, lang) : null;

    if (!categoryId) {
        console.error('❌ Category ID not found for slug:', slug);
        return [];
    }

    try {
        console.log('🔍 Fetching products for category ID:', categoryId, 'page:', page);
        const response = await axios.get<ProductInfo[]>(`${API_BASE_URL}/products`, {
            params: {
                category: categoryId,
                per_page: 18,
                page,
                lang,
            },
        });

        if (response.data) {
            const rawProducts = response.data;
            const flattened: ProductInfo[] = [];

            rawProducts.forEach((product: ProductInfo) => {
                const colorAttr = product.attributes?.find(attr => attr.name === 'Колір' || attr.name === 'Цвет');
                const colorName = colorAttr?.options[0]?.name || '';
                
                flattened.push({
                    ...product,
                    productColor: colorName,
                    colorName: colorName
                });
            });
            
            console.log('✅ Processed products:', flattened.length);
            return flattened;
        }
    } catch (error) {
        console.error('❌ Error fetching products by category:', error);
        return [];
    }
    return [];
};
