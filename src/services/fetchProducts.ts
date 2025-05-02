// src/services/getProducts.ts
import { store } from '../store/store';
import { fetchProducts } from '../store/slices/productsSlice';

export const getProducts = async () => {
    const products = store.getState().products.items;

    if (products.length) {
        return products;
    }

    await store.dispatch(fetchProducts());
    return store.getState().products.items;
};

