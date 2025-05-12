import { useEffect, useState, useId } from 'react';
import { ProductInfo } from '../../types/productTypes';
import { getRelatedProducts } from '../../services/getRelatedProducts.ts';
import ProductItem from '../ProductItem/ProductItem';
import s from './RelatedProducts.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import {LoaderMini} from "../LoaderMini/LoaderMini.tsx";
import {useTranslation} from "react-i18next";

interface SliderProductsProps {
    relatedToProduct: ProductInfo;
    title?: string;
}

const RelatedProducts = ({ relatedToProduct, title }: SliderProductsProps) => {
    const [relatedProducts, setRelatedProducts] = useState<ProductInfo[]>([]);
    const uniqueId = useId();

    const [loading, setLoading] = useState(true);


    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;


    const { i18n } = useTranslation();



    useEffect(() => {
        const fetchRelated = async () => {
            setLoading(true);
            try {
                const lang = i18n.language === 'ua' ? 'uk' : i18n.language;
                const categoryIds = relatedToProduct.categories.map((cat) => cat.id);

                const related = await getRelatedProducts(categoryIds, relatedToProduct.id, lang);
                setRelatedProducts(related);
            } catch (err) {
                console.error('Помилка при завантаженні релевантних товарів:', err);
                setRelatedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [relatedToProduct, i18n.language]);



    const prevId = `prev-${uniqueId}`;
    const nextId = `next-${uniqueId}`;

    if (loading) return <LoaderMini />;

    return (
        <section className={s.sliderSection}>
            <div className={s.topSectionWrap}>
                <div className={s.titleWrap}>
                    {title && <h2 className={s.titleSectionSlider}>{title}</h2>}
                    <span className={s.countProduct}>
                        {loading ? '' : `( ${relatedProducts.length} )`}
                    </span>
                </div>
            </div>

            {loading ? (
                <p><LoaderMini/></p>
            ) : relatedProducts.length === 0 ? (
                <p>Немає релевантних товарів.</p>
            ) : (
                <div className={s.sliderWrap}>
                    {!isMobile && (
                        <div className={`${s.arrow} ${s.arrowPrev}`} id={prevId}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="13" viewBox="0 0 17 13" fill="none">
                                <path d="M6.58228 0L7.65132 1.05572L2.89413 5.75351L16.5 5.75351V7.24654L2.89413 7.24654L7.65132 11.9443L6.58228 13L0 6.49997L6.58228 0Z" fill="#0C1618"/>
                            </svg>
                        </div>
                    )}

                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={16}
                        slidesPerView={isMobile ? 2 : 1}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 4 },
                        }}
                        loop={!isMobile && relatedProducts.length > 4}
                        navigation={!isMobile ? {
                            nextEl: `#${nextId}`,
                            prevEl: `#${prevId}`,
                        } : false}
                    >
                        {relatedProducts.map((product, index) => (
                            <SwiperSlide key={`${product.id}-${index}`}>
                                <ProductItem product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    {!isMobile && (
                        <div className={`${s.arrow} ${s.arrowNext}`} id={nextId}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="13" viewBox="0 0 17 13" fill="none">
                                <path d="M10.4177 0L9.34868 1.05572L14.1059 5.75351L0.5 5.75351L0.5 7.24654L14.1059 7.24654L9.34868 11.9443L10.4177 13L17 6.49997L10.4177 0Z" fill="#0C1618"/>
                            </svg>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default RelatedProducts;
