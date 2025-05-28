import { StarRating } from "../StarRating/StarRating";
import s from "./ReviewItem.module.css";
import { FC } from "react";

interface ReviewItemPropType {
  reviewerName: string;
  reviewerRating: number;
  review: string;
  images: {url:string}[]; // масив рядків
}

export const ReviewItem: FC<ReviewItemPropType> = ({
  reviewerName,
  reviewerRating,
  review,
  images = [], // Якщо review_images не передано, використовуємо порожній масив
}) => {
  // Фільтруємо масив, щоб виключити порожні рядки, перевіряючи на undefined


  return (
    <li className={s.item}>
      <p className={s.reviewerName}>{reviewerName || "Користувач"}</p>

      <div className={s.reviewerContent}>
        <div className="mb-[0.8vw]">
          <StarRating rating={Number(reviewerRating || 0).toString()} />
        </div>

          <ul className={s.iamgeList}>
            {images.map((image, index) => (
              <li key={index}>
                <img src={image.url} alt={`Review image ${index + 1}`} />
              </li>
            ))}
          </ul>
        <p dangerouslySetInnerHTML={{ __html: review }}></p>
      </div>
    </li>
  );
};
