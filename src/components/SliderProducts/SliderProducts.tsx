import { useEffect, useState, useId } from 'react';
import { ProductInfo } from '../../types/productTypes';
import { getProducts } from '../../services/fetchProducts';
import ProductItem from '../ProductItem/ProductItem';
import s from './SliderProducts.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import {LoaderMini} from "../LoaderMini/LoaderMini.tsx";

// Створимо простий хук для перевірки ширини
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
};

interface SliderProductsProps {
    filterTag: 'new' | 'sale';
    title?: string;
}

const SliderProducts = ({ filterTag, title }: SliderProductsProps) => {
    const [filteredProducts, setFilteredProducts] = useState<ProductInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const uniqueId = useId();
    const isMobile = useIsMobile();

    useEffect(() => {
        const fetchFiltered = async () => {
            try {
                setLoading(true);
                const products = await getProducts();

                const filtered = products.filter((product) => {
                    if (filterTag === 'sale') {
                        const salePrice = parseFloat(product.sale_price);
                        const regularPrice = parseFloat(product.regular_price);

                        const isMainProductOnSale = (
                            product.on_sale ||
                            (!isNaN(salePrice) && !isNaN(regularPrice) && salePrice < regularPrice)
                        );

                        const isVariationOnSale = Array.isArray(product.variations) &&
                            product.variations.some((variation) => {
                                const varSale = parseFloat(variation.sale_price);
                                const varRegular = parseFloat(variation.regular_price);
                                return (
                                    variation.on_sale ||
                                    (!isNaN(varSale) && !isNaN(varRegular) && varSale < varRegular)
                                );
                            });

                        return isMainProductOnSale || isVariationOnSale;
                    }

                    if (filterTag === 'new') {
                        if (!product.date_created) return false;
                        const createdDate = new Date(product.date_created);
                        const daysDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
                        return daysDiff <= 30;
                    }

                    return false;
                });

                setFilteredProducts(filtered.slice(0, 12));
            } catch (err) {
                console.error('❌ Failed to load products:', err);
                setFilteredProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFiltered();
    }, [filterTag]);

    const prevId = `prev-${uniqueId}`;
    const nextId = `next-${uniqueId}`;

    if (!loading && filteredProducts.length === 0) {
        return null;
    }

    return (
        <section className={s.sliderSection}>
            <div className={s.topSectionWrap}>
                <div className={s.titleWrap}>
                    {title && <h2 className={s.titleSectionSlider}>{title}</h2>}
                    <span className={s.countProduct}>
                        {loading ? '' : `( ${filteredProducts.length} )`}
                    </span>
                </div>
                {isMobile ? '' : (
                    <div className={s.buttonWrapper}>
                        <Link
                            to={filterTag === 'new' ? '/new' : '/sales'}
                            className={s.linkAllProducts}
                        >
                            Показати все
                        </Link>
                    </div>
                )}
            </div>

            {loading ? (
                <LoaderMini/>
            ) : (
                <>
                    {isMobile ? (
                        <>
                            <div className={s.productGrid}>
                                {filteredProducts.slice(0, 4).map((product) => (
                                    <ProductItem key={product.id} product={product} />
                                ))}
                            </div>

                            <div className={s.buttonWrapper}>
                                <Link
                                    to={filterTag === 'new' ? '/new' : '/sales'}
                                    className={s.linkAllProducts}
                                >
                                    Показати все
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className={s.sliderWrap}>
                            <div className={`${s.arrow} ${s.arrowPrev}`} id={prevId}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="13" viewBox="0 0 17 13" fill="none">
                                    <path d="M6.58228 0L7.65132 1.05572L2.89413 5.75351L16.5 5.75351V7.24654L2.89413 7.24654L7.65132 11.9443L6.58228 13L0 6.49997L6.58228 0Z" fill="#0C1618" />
                                </svg>
                            </div>

                            <Swiper
                                modules={[Navigation]}
                                spaceBetween={16}
                                slidesPerView={2}
                                breakpoints={{
                                    1024: { slidesPerView: 4 },
                                }}
                                loop={filteredProducts.length > 4}
                                navigation={{
                                    nextEl: `#${nextId}`,
                                    prevEl: `#${prevId}`,
                                }}
                            >
                                {filteredProducts.map((product) => (
                                    <SwiperSlide key={product.id}>
                                        <ProductItem product={product} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            <div className={`${s.arrow} ${s.arrowNext}`} id={nextId}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="13" viewBox="0 0 17 13" fill="none">
                                    <path d="M10.4177 0L9.34868 1.05572L14.1059 5.75351L0.5 5.75351L0.5 7.24654L14.1059 7.24654L9.34868 11.9443L10.4177 13L17 6.49997L10.4177 0Z" fill="#0C1618" />
                                </svg>
                            </div>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default SliderProducts;
