import { ReviewItem } from "../ReviewItem/ReviewItem";
import s from "./ReviewsList.module.css";
import { FC } from "react";
import { ReviewerType } from '../../types/reviewTypes';


interface ReviewsListPropType {
  reviews: ReviewerType[];
  openReview: () => void;
}

export const ReviewsList: FC<ReviewsListPropType> = ({
  reviews,
  openReview,
}) => {


  return (
    <div>
      <div className={s.titleContainer}>

          <h2>Відгуки
            <div className={s.qty}>( {reviews.length} )</div>
          </h2>
          <button className={s.link} onClick={openReview}>
              <span className={s.spanLink}>Залишити відгук</span>
              <svg className={s.iconLink} xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                  <path d="M5.83325 14.6668L14.1666 6.3335M14.1666 6.3335H5.83325M14.1666 6.3335V14.6668" stroke="#0C1618" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
          </button>

      </div>

      <ul className={s.list}>
        {reviews.map((item, index) => (
          <ReviewItem
            key={index}
            reviewerName={item.reviewer}
            reviewerRating={item.rating}
            review={item.review}
            images={item.review_media}
          />
        ))}
      </ul>
    </div>
  );
};
