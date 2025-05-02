import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ProductInfo } from '../../types/productTypes';
import { apiUrl, consumerKey, consumerSecret } from '../../App.tsx';

// asyncThunk для завантаження
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
                // 🔥 Фільтруємо товари, в яких categories НЕ містять slug 'gift-certificate'
                const filteredItems = action.payload.filter((product) =>
                    !product.categories?.some((category) => category.slug === 'gift-certificate')
                );

                state.items = filteredItems;
                state.loading = false;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch error';
            });
    },
});

export default productsSlice.reducer;
