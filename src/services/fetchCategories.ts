import { store } from '../store/store';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { CategoryInfo } from '../types/categoryTypes';

export const getCategories = async (lang: string): Promise<CategoryInfo[]> => {
    const state = store.getState();
    const existingCategories = state.categories.items[lang];

    if (existingCategories && Object.keys(existingCategories).length > 0) {
        return Object.values(existingCategories);
    }

    const cachedCategories = localStorage.getItem(`categories_${lang}`);
    if (cachedCategories) {
        const parsed: Record<string, CategoryInfo> = JSON.parse(cachedCategories);
        store.dispatch({
            type: 'categories/loadCategoriesFromCache',
            payload: {
                lang,
                categories: parsed,
            },
        });
        return Object.values(parsed);
    }

    const resultAction = await store.dispatch(fetchCategories(lang));

    if (fetchCategories.fulfilled.match(resultAction)) {
        const newState = store.getState();
        return Object.values(newState.categories.items[lang] || {});
    } else {
        console.error('Не вдалося завантажити категорії:', resultAction.error);
        return [];
    }
};


