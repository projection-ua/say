import { store } from '../store/store';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { CategoryInfo } from '../types/categoryTypes';

export const getCategories = async (): Promise<CategoryInfo[]> => {
    const state = store.getState();
    const existingCategories = state.categories.items;

    if (Object.keys(existingCategories).length > 0) {
        return Object.values(existingCategories);
    }

    const cachedCategories = localStorage.getItem('categories');
    if (cachedCategories) {
        const parsed = JSON.parse(cachedCategories);
        store.dispatch({
            type: 'categories/loadFromCache', // ❗️потрібно додати такий редюсер
            payload: parsed,
        });
        return parsed;
    }

    const resultAction = await store.dispatch(fetchCategories());

    if (fetchCategories.fulfilled.match(resultAction)) {
        const newState = store.getState();
        const categories = Object.values(newState.categories.items);
        localStorage.setItem('categories', JSON.stringify(categories));
        return categories;
    } else {
        console.error('Не вдалося завантажити категорії:', resultAction.error);
        return [];
    }
};
