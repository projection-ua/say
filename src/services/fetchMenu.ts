import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const fetchMenu = async (lang: string = 'uk') => {
    try {
        const response = await axios.get(`${API_BASE_URL}/menu`, {
            params: { lang }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching menu:', error);
        return [];
    }
};
