import { store } from '../store/store';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { CategoryInfo } from '../types/categoryTypes';

export const getCategories = async (lang: string): Promise<CategoryInfo[]> => {
    const state = store.getState();
    const existing = state.categories.items[lang];

    if (existing && Object.keys(existing).length > 0) {
        return Object.values(existing);
    }

    const cached = localStorage.getItem(`categories_${lang}`);
    if (cached) {
        const parsed: Record<string, CategoryInfo> = JSON.parse(cached);

        const isSlugMatchLang = Object.values(parsed).some((cat) => {
            const slug = cat.slug.toLowerCase();
            const name = cat.name.toLowerCase();

            // 🔍 Прості евристики:
            if (lang === 'ru') {
                return slug.includes('-ru') || /[а-яё]/.test(name);
            } else {
                return !slug.includes('-ru') && /[а-щґєіїґ]/.test(name); // укр символи
            }
        });

        if (isSlugMatchLang) {
            store.dispatch({
                type: 'categories/loadCategoriesFromCache',
                payload: {
                    lang,
                    categories: parsed,
                },
            });
            return Object.values(parsed);
        } else {
            console.warn(`⚠️ Кеш не відповідає мові "${lang}", очищаємо.`);
            localStorage.removeItem(`categories_${lang}`);
        }
    }

    const result = await store.dispatch(fetchCategories(lang));

    if (fetchCategories.fulfilled.match(result)) {
        const newState = store.getState();
        const loaded = newState.categories.items[lang] || {};
        return Object.values(loaded);
    } else {
        console.error('❌ Не вдалося завантажити категорії:', result.error);
        return [];
    }
};
