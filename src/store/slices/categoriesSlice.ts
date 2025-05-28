import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { CategoryInfo } from '../../types/categoryTypes';

// 🔥 Отримати ВСІ категорії
export const fetchCategories = createAsyncThunk<
    CategoryInfo[],
    string, // мова: 'uk' | 'ru' і т.д.
    { rejectValue: unknown }
>(
    'categories/fetchCategories',
    async (lang, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products/categories`, {
                params: { per_page: 100, lang },
            });
            return Array.isArray(response.data) ? response.data : [];
        } catch (err) {
            console.error('Error fetching categories:', err);
            return rejectWithValue(err);
        }
    }
);

interface CategoriesState {
    items: Record<string, Record<string, CategoryInfo>>; // items[lang][slug]
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
        loadCategoriesFromCache: (state, action) => {
            const { lang, categories } = action.payload;
            state.items[lang] = categories;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                const lang = action.meta.arg;
                state.loading = false;

                if (!state.items[lang]) {
                    state.items[lang] = {};
                }

                const enriched: Record<string, CategoryInfo> = {};
                action.payload.forEach((cat) => {
                    const categoryWithLang = { ...cat, lang }; // ✅ додаємо lang
                    enriched[cat.slug] = categoryWithLang;
                });

                state.items[lang] = enriched;

                // 🔄 очищення старих мов
                Object.keys(localStorage).forEach((key) => {
                    if (key.startsWith('categories_') && key !== `categories_${lang}`) {
                        localStorage.removeItem(key);
                    }
                });

                // 💾 збереження у кеш
                localStorage.setItem(`categories_${lang}`, JSON.stringify(enriched));
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch error';
            });
    },
});

export const { loadCategoriesFromCache } = categoriesSlice.actions;
export default categoriesSlice.reducer;
