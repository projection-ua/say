// src/services/getProducts.ts
import { store } from '../store/store';
import { fetchProducts } from '../store/slices/productsSlice';

export const getProducts = async () => {
    const state = store.getState();
    const existingProducts = state.products.items;

    if (existingProducts.length > 0) {
        return existingProducts; // вже завантажені
    }

    await store.dispatch(fetchProducts());
    return store.getState().products.items;
};
