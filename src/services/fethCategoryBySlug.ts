import axios from 'axios';


export const getCategoryBySlug = async (slug: string) => {
    try {
        const res = await axios.get(`/api/categories`, {
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
