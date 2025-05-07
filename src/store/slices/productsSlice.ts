import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ProductInfo } from '../../types/productTypes';
import { apiUrl, consumerKey, consumerSecret } from '../../App.tsx';

export const fetchProducts = createAsyncThunk<ProductInfo[]>(
    'products/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(apiUrl, {
                auth: { username: consumerKey, password: consumerSecret },
                params: { per_page: 100 },
            });
            return Array.isArray(response.data) ? response.data : [];
        } catch (err) {
            console.error('Fetch error:', err);
            return rejectWithValue(err);
        }
    }
);

interface ProductsState {
    items: ProductInfo[];
    loading: boolean;
    error: string | null;
}

const initialState: ProductsState = {
    items: [],
    loading: false,
    error: null,
};

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                const flattenedProducts: ProductInfo[] = [];


                action.payload.forEach((product: ProductInfo) => {
                    const hasAttributeColor = Array.isArray(product.attribute_color) && product.attribute_color.length > 0;

                    if (hasAttributeColor) {
                        // 👉 додаємо варіації як окремі товари
                        product.attribute_color.forEach((colorObj: any) => {
                            const varData = colorObj.id_variations;

                            flattenedProducts.push({
                                ...product, // бере всі поля з product
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
                                variation_id: varData.id ?? 0,
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
                                // 👇 можна додати флаг для UI
                                hiddenInCatalog: false,
                            });
                        });

                        // ✅ додаємо головний товар, але ставимо hiddenInCatalog: true
                        flattenedProducts.push({
                            ...product,
                            hiddenInCatalog: true,
                        });
                    } else {
                        flattenedProducts.push({
                            ...product,
                            hiddenInCatalog: false,
                        });
                    }
                });


                state.items = flattenedProducts;
                state.loading = false;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch error';
            });
    },
});

export default productsSlice.reducer;
