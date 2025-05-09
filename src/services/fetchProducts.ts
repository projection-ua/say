import { store } from '../store/store';
import { fetchProducts } from '../store/slices/productsSlice';
import { ProductInfo } from '../types/productTypes';

export const getProducts = async (lang: string): Promise<ProductInfo[]> => {
    const state = store.getState();
    const existingProducts = state.products.items[lang];

    if (existingProducts && existingProducts.length > 0) {
        return existingProducts;
    }

    const cachedProducts = sessionStorage.getItem(`products_${lang}`);
    if (cachedProducts) {
        const parsed: ProductInfo[] = JSON.parse(cachedProducts);
        if (parsed.length > 0) {
            store.dispatch({
                type: 'products/loadProductsFromCache',
                payload: {
                    lang,
                    products: parsed,
                },
            });
            return parsed;
        }
    }

    const resultAction = await store.dispatch(fetchProducts(lang));

    if (fetchProducts.fulfilled.match(resultAction)) {
        const newState = store.getState();
        return newState.products.items[lang] || [];
    } else {
        console.error('Не вдалося завантажити товари:', resultAction.error);
        return [];
    }
};
