import axios from 'axios';
import { ProductInfo } from '../types/productTypes';
import { apiUrl, consumerKey, consumerSecret } from '../App';

const getCategoryIdBySlug = (slug: string, lang: string): number | null => {
    const cached = localStorage.getItem(`categories_${lang}`);
    if (!cached) return null;
    const categories = JSON.parse(cached);
    return categories[slug]?.id || null;
};

export const fetchProductsByCategorySlug = async (
    slug: string | null = null,
    page: number = 1,
    lang: string = 'uk'
): Promise<ProductInfo[]> => {
    const categoryId = slug ? getCategoryIdBySlug(slug, lang) : null;

    try {
        const response = await axios.get<ProductInfo[]>(`${apiUrl}`, {
            auth: {
                username: consumerKey,
                password: consumerSecret,
            },
            params: {
                ...(categoryId ? { category: categoryId } : {}),
                per_page: 18,
                page,
                lang,
            },
        });

        const rawProducts = response.data;
        const flattened: ProductInfo[] = [];

        rawProducts.forEach((product: ProductInfo) => {
            const hasColors = Array.isArray(product.attribute_color) && product.attribute_color.length > 0;

            if (hasColors) {
                product.attribute_color.forEach((colorObj: any) => {
                    const varData = colorObj.id_variations;

                    flattened.push({
                        ...product,
                        id: product.id,
                        name: varData.variation_name ?? product.name,
                        description: product.description ?? '',
                        price: varData.price ?? product.price ?? '',
                        regular_price: varData.regular_price ?? product.regular_price ?? '',
                        sale_price: varData.sale_price ?? product.sale_price ?? '',
                        on_sale: varData.on_sale ?? product.on_sale ?? false,
                        sku: varData.sku ?? product.sku ?? '',
                        slug: varData.variation_slug ?? product.slug,
                        images: [{ src: varData.variation_image ?? '', name: '', alt: '' }],
                        gallery_images: product.gallery_images ?? [],
                        variation_id: varData.variation_id ?? 0,
                        date_created: product.date_created ?? '',
                        categories: product.categories ?? [],
                        price_html: varData.variation_price_html ?? product.price_html ?? '',
                        attribute_color: product.attribute_color ?? [],
                        stock_status: varData.stock_status ?? product.stock_status ?? '',
                        meta_data: product.meta_data ?? [],
                        variations: product.variations ?? [],
                        attributes: product.attributes ?? [],
                        featured: product.featured ?? false,
                        quantity: product.quantity ?? 0,
                        stock_quantity: varData.stock_quantity ?? product.stock_quantity ?? 0,
                        average_rating: product.average_rating ?? '',
                        rating_count: product.rating_count ?? '',
                        type: product.type ?? '',
                        colorName: varData.variation_atribute_color ?? '',
                        hiddenInCatalog: false,
                    });
                });

                flattened.push({
                    ...product,
                    hiddenInCatalog: true,
                });
            } else {
                flattened.push({
                    ...product,
                    hiddenInCatalog: false,
                });
            }
        });

        return flattened;
    } catch (err) {
        console.error('❌ Помилка при завантаженні продуктів:', err);
        return [];
    }
};
