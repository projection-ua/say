import { store } from '../store/store';
import { fetchProducts, loadProductsFromCache } from '../store/slices/productsSlice';
import { ProductInfo } from '../types/productTypes';
import i18n from 'i18next';

export const getCurrentLang = (): string => {
    const lang = i18n.language;
    return lang === 'ua' ? 'uk' : lang;
};

export const getProducts = async (): Promise<ProductInfo[]> => {
    const lang = getCurrentLang();
    const state = store.getState();
    const existingProducts = state.products.items[lang];

    if (existingProducts?.length) return existingProducts;

    const cachedProducts = localStorage.getItem(`products_${lang}`);
    if (cachedProducts) {
        const parsed: ProductInfo[] = JSON.parse(cachedProducts);
        if (parsed.length) {
            store.dispatch(loadProductsFromCache({ lang, products: parsed }));
            return parsed;
        }
    }

    const resultAction = await store.dispatch(fetchProducts());

    if (fetchProducts.fulfilled.match(resultAction)) {
        return store.getState().products.items[lang] || [];
    }

    console.error('❌ Не вдалося завантажити товари');
    return [];
};
