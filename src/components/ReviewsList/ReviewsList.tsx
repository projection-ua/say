import {FC, useRef} from "react";
import { ReviewItem } from "../ReviewItem/ReviewItem";
import s from "./ReviewsList.module.css";
import { ReviewerType } from "../../types/reviewTypes";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useId } from "react";
import {LoaderMini} from "../LoaderMini/LoaderMini.tsx";





interface ReviewsListPropType {
    reviews: ReviewerType[];
    openReview: () => void;
    loading: boolean;
}

export const ReviewsList: FC<ReviewsListPropType> = ({ reviews, openReview, loading }) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;


    const sliderRef = useRef<any>(null);
    const uniqueId = useId();
    const prevId = `review-prev-${uniqueId}`;
    const nextId = `review-next-${uniqueId}`;
    const paginationId = `review-pagination-${uniqueId}`;

    if (loading) return <LoaderMini />;

    return (
        <div className={s.wrapReview} id="reviews">
            <div className={s.titleContainer}>
                <h2>
                    Відгуки <div className={s.qty}>( {reviews.length} )</div>
                </h2>
                <button className={s.link} onClick={openReview}>
                    <span className={s.spanLink}>Залишити відгук</span>
                    <svg
                        className={s.iconLink}
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                    >
                        <path
                            d="M5.83325 14.6668L14.1666 6.3335M14.1666 6.3335H5.83325M14.1666 6.3335V14.6668"
                            stroke="#0C1618"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {reviews.length > 0 && (
                isMobile ? (
                    <div className={s.sliderWrapper}>
                        <Swiper
                            ref={sliderRef}
                            modules={[Navigation, Pagination]}
                            spaceBetween={12}
                            slidesPerView={1.5}
                            pagination={{
                                el: `#${paginationId}`,
                                clickable: true,
                                bulletClass: `swiper-pagination-bullet ${s.bullet}`,
                                bulletActiveClass: `${s.bullet} ${s.bulletActive}`,
                            }}
                            navigation={{
                                prevEl: `#${prevId}`,
                                nextEl: `#${nextId}`,
                            }}
                            className={s.reviewsSlider}
                        >
                        {reviews.map((item, index) => (
                                <SwiperSlide key={index}>
                                    <ReviewItem
                                        reviewerName={item.reviewer}
                                        reviewerRating={item.rating}
                                        review={item.review}
                                        images={item.review_media}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        <div className="wrapNavCustom">
                            <div className={s.wrapNav}>
                                <div className={s.wrapPagination}>
                                    <div id={paginationId} className={s.pagination}></div>
                                </div>

                                <div className={s.arrows}>
                                    <div className={s.arrow} id={prevId}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M16.668 10H3.33464M3.33464 10L8.33464 5M3.33464 10L8.33464 15" stroke="#0C1618" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                    <div className={s.arrow} id={nextId}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M3.33203 10H16.6654M16.6654 10L11.6654 5M16.6654 10L11.6654 15" stroke="#0C1618" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
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
                )
            )}
        </div>
    );
};
