import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import ProductItem from "../ProductItem/ProductItem";
import { ProductInfo } from "../../types/productTypes";
import { apiUrl, consumerKey, consumerSecret } from "../../App";
import s from "./RecommendedProducts.module.css";
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css/pagination';


export const RecommendedProducts = () => {
    const prevButtonRef = useRef<HTMLDivElement>(null);
    const nextButtonRef = useRef<HTMLDivElement>(null);

    const [products, setProducts] = useState<ProductInfo[]>([]);
    const [loading, setLoading] = useState(true);


    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const paginationRef = useRef<HTMLDivElement | null>(null);




    useEffect(() => {
        const fetchRecommendedProducts = async () => {
            try {
                // Перше: популярні товари
                const popularParams = new URLSearchParams({
                    per_page: "10",
                    orderby: "popularity",
                });

                const popularResponse = await fetch(`${apiUrl}?${popularParams.toString()}`, {
                    headers: {
                        Authorization: "Basic " + btoa(`${consumerKey}:${consumerSecret}`),
                    },
                });

                if (!popularResponse.ok) {
                    throw new Error("Помилка при завантаженні популярних товарів");
                }

                const popularData = await popularResponse.json();

                if (popularData.length > 0) {
                    setProducts(popularData);
                } else {
                    // Якщо популярних немає, тоді тягнемо товари з найбільшими total_sales
                    const bestSalesParams = new URLSearchParams({
                        per_page: "10",
                        orderby: "meta_value_num",
                        meta_key: "total_sales",
                    });

                    const bestSalesResponse = await fetch(`${apiUrl}?${bestSalesParams.toString()}`, {
                        headers: {
                            Authorization: "Basic " + btoa(`${consumerKey}:${consumerSecret}`),
                        },
                    });

                    if (!bestSalesResponse.ok) {
                        throw new Error("Помилка при завантаженні товарів по продажах");
                    }

                    const bestSalesData = await bestSalesResponse.json();
                    setProducts(bestSalesData);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedProducts();
    }, []);

    if (loading) {
        return <div>Завантаження...</div>;
    }

    if (!products.length) {
        return <div>Немає рекомендованих товарів</div>;
    }

    return (
        <section className={s.recommendedSection}>
            <Swiper
                modules={[Navigation, Pagination]}
                navigation={{
                    prevEl: prevButtonRef.current,
                    nextEl: nextButtonRef.current,
                }}
                pagination={isMobile ? {
                    el: paginationRef.current,
                    clickable: true,
                    bulletClass: `swiper-pagination-bullet ${s.bullet}`,
                    bulletActiveClass: s.bulletActive,
                } : false}
                onSwiper={(swiper) => {
                    if (
                        isMobile &&
                        typeof swiper.params.pagination === 'object' &&
                        swiper.pagination &&
                        swiper.pagination.el !== paginationRef.current
                    ) {
                        swiper.params.pagination.el = paginationRef.current!;
                        swiper.pagination.init();
                        swiper.pagination.update();
                    }
                }}
                spaceBetween={20}
                slidesPerView={isMobile ? 2 : 6.4}
                className={s.recommendedSwiper}
            >
                {products.map((product: ProductInfo) => (
                    <SwiperSlide key={product.id}>
                        <ProductItem viewMode="cart" product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>

            {isMobile && <div ref={paginationRef} className={s.paginationWrapper} />}

            {!isMobile &&
            <div className={s.navigationButtons}>
                <div ref={prevButtonRef} className={s.navBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M16.666 10H3.33268M3.33268 10L8.33268 5M3.33268 10L8.33268 15" stroke="#0C1618" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div ref={nextButtonRef} className={s.navBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M3.33398 10H16.6673M16.6673 10L11.6673 5M16.6673 10L11.6673 15" stroke="#0C1618" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
            }
        </section>
    );
};

export default RecommendedProducts;
