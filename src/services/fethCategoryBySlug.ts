import axios from 'axios';
import { apiUrl, consumerKey, consumerSecret } from '../App.tsx';


export const getCategoryBySlug = async (slug: string) => {
    try {
        const res = await axios.get(`${apiUrl}/categories`, {
            auth: {
                username: consumerKey,
                password: consumerSecret,
            },
            params: {
                slug,
            },
        });
        return res.data;
    } catch (err) {
        console.error('Error fetching category by slug:', err);
        return null;
    }
};
