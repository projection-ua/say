import { ReviewerType } from "../types/reviewTypes";
import { API_BASE_URL } from "../config/api";

interface WooReviewApiResponse {
    reviewer: string;
    rating: number;
    review: string;
    review_media?: string[];
}
export const fetchReviewsByProductId = async (productId: number): Promise<ReviewerType[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews?product=${productId}`);

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
