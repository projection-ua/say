// src/store/slices/categoriesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl, consumerKey, consumerSecret } from '../../App.tsx';
import { CategoryInfo } from '../../types/categoryTypes'; // тип для категорій

// 🔥 Отримати ОДНУ категорію за slug
export const fetchCategoryBySlug = createAsyncThunk<CategoryInfo | null, string>(
    'categories/fetchCategoryBySlug',
    async (slug, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${apiUrl}/categories`, {
                auth: { username: consumerKey, password: consumerSecret },
                params: { slug },
            });

            return response.data.length > 0 ? response.data[0] : null;
        } catch (err) {
            console.error('Error fetching category by slug:', err);
            return rejectWithValue(err);
        }
    }
);

// 🔥 Отримати ВСІ категорії
export const fetchCategories = createAsyncThunk<CategoryInfo[]>(
    'categories/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${apiUrl}/categories`, {
                auth: { username: consumerKey, password: consumerSecret },
                params: { per_page: 100 },
            });

            return response.data;
        } catch (err) {
            console.error('Error fetching categories:', err);
            return rejectWithValue(err);
        }
    }
);

interface CategoriesState {
    items: Record<string, CategoryInfo>; // 🔥 типізація item
    loading: boolean;
    error: string | null;
}

const initialState: CategoriesState = {
    items: {},
    loading: false,
    error: null,
};

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        loadCategoriesFromCache: (state, action: PayloadAction<Record<string, CategoryInfo>>) => {
            state.items = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<CategoryInfo[]>) => {
                state.loading = false;
                action.payload.forEach((cat) => {
                    state.items[cat.slug] = cat;
                });
                localStorage.setItem('categories', JSON.stringify(state.items));
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch error';
            });
    },
});


// 👇 default reducer
export default categoriesSlice.reducer;
