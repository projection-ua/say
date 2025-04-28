export interface ReviewerType {
    reviewer: string;
    rating: number;
    review: string;
    review_media: {url:string}[]; // або типізуй краще, якщо у тебе є конкретні поля
}
