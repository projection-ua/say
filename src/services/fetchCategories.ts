import axios from 'axios';
import { CategoryInfo } from '../types/categoryTypes';
import { API_BASE_URL } from '../config/api';

export const getCategories = async (lang: string = 'uk'): Promise<CategoryInfo[]> => {
    try {
        const response = await axios.get<CategoryInfo[]>(`${API_BASE_URL}/products/categories`, {
            params: {
                per_page: 100,
                lang,
                hide_empty: false,
            },
        });

        const categories = response.data;
        const categoriesMap: Record<string, number> = {};

        categories.forEach((category) => {
            categoriesMap[category.slug] = category.id;
        });

        localStorage.setItem(`categories_${lang}`, JSON.stringify(categoriesMap));

        return categories;
    } catch (error) {
        console.error('❌ Error fetching categories:', error);
        return [];
    }
};

export const fetchCategories = async (lang: string = 'uk'): Promise<CategoryInfo[]> => {
    try {
        const response = await axios.get<CategoryInfo[]>(`${API_BASE_URL}/products/categories`, {
            params: {
                per_page: 100,
                lang,
                hide_empty: true,
            },
        });

        const categories = response.data;
        const categoriesMap: Record<string, number> = {};

        categories.forEach((category) => {
            categoriesMap[category.slug] = category.id;
        });

        localStorage.setItem(`categories_${lang}`, JSON.stringify(categoriesMap));

        return categories;
    } catch (error) {
        console.error('❌ Error fetching categories:', error);
        return [];
    }
};
