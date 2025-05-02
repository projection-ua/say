import { store } from '../store/store';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { CategoryInfo } from '../types/categoryTypes';

export const getCategories = async (): Promise<CategoryInfo[]> => {
    const state = store.getState();
    const existingCategories = state.categories.items;

    if (Object.keys(existingCategories).length > 0) {
        return Object.values(existingCategories);
    }

    const resultAction = await store.dispatch(fetchCategories());

    if (fetchCategories.fulfilled.match(resultAction)) {
        const newState = store.getState();
        return Object.values(newState.categories.items);
    } else {
        console.error('Не вдалося завантажити категорії:', resultAction.error);
        return [];
    }
};
