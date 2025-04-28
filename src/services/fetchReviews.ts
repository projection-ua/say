import { ReviewerType } from "../types/reviewTypes";


import { apiUrlWp, consumerKey, consumerSecret } from "../App"; // Шлях підлаштуй під свій проєкт


interface WooReviewApiResponse {
    reviewer: string;
    rating: number;
    review: string;
    review_media?: string[];
}
export const fetchReviewsByProductId = async (productId: number): Promise<ReviewerType[]> => {
    try {
        const response = await fetch(`${apiUrlWp}wp-json/wc/v3/products/reviews?product=${productId}`, {
            headers: {
                Authorization: "Basic " + btoa(`${consumerKey}:${consumerSecret}`),
            },
        });

        if (!response.ok) {
            throw new Error('Помилка при отриманні відгуків');
        }

        const data: WooReviewApiResponse[] = await response.json();

        return data.map((r) => ({
            reviewer: r.reviewer,
            rating: r.rating,
            review: r.review,
            review_media: (r.review_media || []).map((url) => ({ url })),
        }));

    } catch (error) {
        console.error("Помилка при завантаженні відгуків:", error);
        return [];
    }
};
