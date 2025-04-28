import axios from 'axios';
import {apiUrlWp} from "../App.tsx";

export const getMenu = async (slug = 'main-menu') => {
    try {
        const res = await axios.get(`${apiUrlWp}/wp-json/menus/v1/menus/${slug}`);
        return res.data.items; // масив пунктів меню
    } catch (err) {
        console.error('Помилка отримання меню:', err);
        return [];
    }
};
