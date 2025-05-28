import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ProductInfo } from '../../types/productTypes';
import { API_BASE_URL } from '../../config/api';
import i18n from 'i18next';

// ✅ Уніфікована мова
const getCurrentLang = (): string => {
    const lang = i18n.language;
    return lang === 'ua' ? 'uk' : lang;
};

export const fetchProducts = createAsyncThunk<
    ProductInfo[],
    void,
    { rejectValue: unknown }
>(
    'products/fetchProducts',
    async (_, { rejectWithValue }) => {
        const lang = getCurrentLang();
        try {
            const response = await axios.get(`${API_BASE_URL}/products`, {
                params: { per_page: 100, lang },
            });
            return Array.isArray(response.data) ? response.data : [];
        } catch (err) {
            console.error('Fetch error:', err);
            return rejectWithValue(err);
        }
    }
);

interface ProductsState {
    items: Record<string, ProductInfo[]>;
    loading: boolean;
    error: string | null;
}

const initialState: ProductsState = {
    items: {},
    loading: false,
    error: null,
};

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        loadProductsFromCache: (state, action) => {
            const { lang, products } = action.payload;
            state.items[lang] = products;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                const lang = getCurrentLang();
                const flattenedProducts: ProductInfo[] = [];

                action.payload.forEach((product: ProductInfo) => {
                    flattenedProducts.push({
                        ...product,
                        hiddenInCatalog: false,
                    });
                });

                state.items[lang] = flattenedProducts;

                try {
                    const lightProducts = flattenedProducts.map((product) => ({
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        regular_price: product.regular_price,
                        sale_price: product.sale_price,
                        on_sale: product.on_sale,
                        sku: product.sku,
                        variation_id: product.variation_id,
                        stock_status: product.stock_status,
                        stock_quantity: product.stock_quantity,
                        images: product.images,
                        categories: product.categories,
                        colorName: product.colorName,
                        hiddenInCatalog: product.hiddenInCatalog,
                    }));

                    // 🔄 Очистка попередніх мов
                    Object.keys(localStorage).forEach((key) => {
                        if (key.startsWith('products_') && key !== `products_${lang}`) {
                            localStorage.removeItem(key);
                        }
                    });

                    localStorage.setItem(`products_${lang}`, JSON.stringify(lightProducts));
                } catch (e) {
                    console.warn('⚠️ Failed to cache products:', e);
                }

                state.loading = false;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch error';
            });
    },
});

export const { loadProductsFromCache } = productsSlice.actions;
export default productsSlice.reducer;
