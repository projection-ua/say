import { useRef, useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import ProductItem from "../ProductItem/ProductItem";
import { ProductInfo } from "../../types/productTypes";
import { API_BASE_URL } from "../../config/api";
import s from "./RecommendedProducts.module.css";
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css/pagination';

import { useTranslation } from "react-i18next";

interface RecommendedProductsProps {
    isVisible: boolean;
}

export const RecommendedProducts = ({ isVisible }: RecommendedProductsProps) => {
    const prevButtonRef = useRef<HTMLDivElement>(null);
    const nextButtonRef = useRef<HTMLDivElement>(null);
    const paginationRef = useRef<HTMLDivElement | null>(null);

    const [products, setProducts] = useState<ProductInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    const { i18n } = useTranslation();

    const loadRecommendedProducts = useCallback(async () => {
        setLoading(true);
        try {
            const lang = i18n.language === "ua" ? "uk" : i18n.language;

            const params = new URLSearchParams({
                per_page: "10",
                orderby: "popularity",
                lang, // 🟢 додали мову
            });

            let response = await fetch(`${API_BASE_URL}/products?${params}`);
            let data = await response.json();

            if (!data.length) {
                const fallbackParams = new URLSearchParams({
                    per_page: "10",
                    orderby: "meta_value_num",
                    meta_key: "total_sales",
                    lang, // 🟢 теж не забуваємо
                });

                response = await fetch(`${API_BASE_URL}/products?${fallbackParams}`);
                data = await response.json();
            }

            setProducts(data);
        } catch (err) {
            console.error("🔴 Recommended fetch error:", err);
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    }, [i18n.language]);

    useEffect(() => {
        if (isVisible && !loaded) {
            loadRecommendedProducts();
        }
    }, [isVisible, loaded, loadRecommendedProducts]);

    if (!isVisible || loading) return null;
    if (!products.length) return null;

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
                {products.map((product: ProductInfo, index) => (
                    <SwiperSlide key={`${product.id}-${index}`}>
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
