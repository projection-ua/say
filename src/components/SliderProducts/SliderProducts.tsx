import { useEffect, useState, useId } from 'react';
import { ProductInfo } from '../../types/productTypes';
import { getProducts } from '../../services/fetchProducts'; // 🔄 без аргументу
import ProductItem from '../ProductItem/ProductItem';
import s from './SliderProducts.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { LoaderMini } from '../LoaderMini/LoaderMini';
import { useTranslation } from 'react-i18next';

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
    const { t, i18n } = useTranslation();
    const langPrefix = i18n.language === 'ru' ? '/ru' : '';

    useEffect(() => {
        const fetchFiltered = async () => {
            try {
                setLoading(true);
                const products = await getProducts(); // ✅ без аргументу

                const catalogProducts = products.filter((product) => !product.hiddenInCatalog);

                const filtered = catalogProducts.filter((product) => {
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
    }, [filterTag, i18n.language]); // 🔁 перезавантаження при зміні мови

    const prevId = `prev-${uniqueId}`;
    const nextId = `next-${uniqueId}`;

    if (!loading && filteredProducts.length === 0) return null;

    return (
        <section className={s.sliderSection}>
            <div className={s.topSectionWrap}>
                <div className={s.titleWrap}>
                    {title && <h2 className={s.titleSectionSlider}>{title}</h2>}
                    <span className={s.countProduct}>
                        {loading ? '' : `( ${filteredProducts.length} )`}
                    </span>
                </div>
                {!isMobile && (
                    <div className={s.buttonWrapper}>
                        <Link
                            to={`${langPrefix}${filterTag === 'new' ? '/new' : '/sales'}`}
                            className={s.linkAllProducts}
                        >
                            {t('view_all')}
                        </Link>
                    </div>
                )}
            </div>

            {loading ? (
                <LoaderMini />
            ) : (
                <>
                    {isMobile ? (
                        <>
                            <div className={s.productGrid}>
                                {filteredProducts.slice(0, 4).map((product, index) => (
                                    <ProductItem key={`${product.id}-${index}`} product={product} />
                                ))}
                            </div>
                            <div className={s.buttonWrapper}>
                                <Link
                                    to={`${langPrefix}${filterTag === 'new' ? '/new' : '/sales'}`}
                                    className={s.linkAllProducts}
                                >
                                    {t('view_all')}
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className={s.sliderWrap}>
                            <div className={`${s.arrow} ${s.arrowPrev}`} id={prevId}>
                                <svg width="17" height="13" viewBox="0 0 17 13" fill="none">
                                    <path d="M6.58228 0L7.65132 1.05572L2.89413 5.75351H16.5V7.24654H2.89413L7.65132 11.9443L6.58228 13L0 6.49997L6.58228 0Z" fill="#0C1618" />
                                </svg>
                            </div>

                            <Swiper
                                modules={[Navigation]}
                                spaceBetween={16}
                                slidesPerView={2}
                                breakpoints={{ 1024: { slidesPerView: 4 } }}
                                loop={filteredProducts.length > 4}
                                navigation={{ nextEl: `#${nextId}`, prevEl: `#${prevId}` }}
                            >
                                {filteredProducts.map((product, index) => (
                                    <SwiperSlide key={`${product.id}-${index}`}>
                                        <ProductItem product={product} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            <div className={`${s.arrow} ${s.arrowNext}`} id={nextId}>
                                <svg width="17" height="13" viewBox="0 0 17 13" fill="none">
                                    <path d="M10.4177 0L9.34868 1.05572L14.1059 5.75351H0.5V7.24654H14.1059L9.34868 11.9443L10.4177 13L17 6.49997L10.4177 0Z" fill="#0C1618" />
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
