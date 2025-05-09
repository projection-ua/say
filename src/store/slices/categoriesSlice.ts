import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl, consumerKey, consumerSecret } from '../../App.tsx';
import { CategoryInfo } from '../../types/categoryTypes'; // тип для категорій

// 🔥 Отримати ВСІ категорії
export const fetchCategories = createAsyncThunk<
    CategoryInfo[],
    string, // 🟢 тип аргумента (мова: 'ua' | 'ru' і т.д.)
    { rejectValue: unknown }
>(
    'categories/fetchCategories',
    async (lang, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${apiUrl}/categories`, {
                auth: { username: consumerKey, password: consumerSecret },
                params: { per_page: 100, lang }, // 🟢 динамічно підставляємо lang
            });

            return response.data;
        } catch (err) {
            console.error('Error fetching categories:', err);
            return rejectWithValue(err);
        }
    }
);

interface CategoriesState {
    items: Record<string, Record<string, CategoryInfo>>;
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
                state.loading = false;
                const lang = action.meta.arg;
                if (!state.items[lang]) {
                    state.items[lang] = {};
                }
                action.payload.forEach((cat) => {
                    state.items[lang][cat.slug] = cat;
                });

                Object.keys(localStorage).forEach((key) => {
                    if (key.startsWith('categories_') && key !== `categories_${lang}`) {
                        localStorage.removeItem(key);
                    }
                });

                localStorage.setItem(`categories_${lang}`, JSON.stringify(state.items[lang]));
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch error';
            });
    },
});

export default categoriesSlice.reducer;
