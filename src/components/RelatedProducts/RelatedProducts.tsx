import { useEffect, useState, useId } from 'react';
import { ProductInfo } from '../../types/productTypes';
import { getProducts } from '../../services/fetchProducts';
import ProductItem from '../ProductItem/ProductItem';
import s from './RelatedProducts.module.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

interface SliderProductsProps {
    relatedToProduct: ProductInfo;
    title?: string;
}

const RelatedProducts = ({ relatedToProduct, title }: SliderProductsProps) => {
    const [relatedProducts, setRelatedProducts] = useState<ProductInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const uniqueId = useId();

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                setLoading(true);
                const products = await getProducts();

                // ID категорій товару
                const categoryIds = relatedToProduct.categories.map((cat) => cat.id);

                const filtered = products
                    .filter((product) => {
                        // Виняток для самого товару
                        if (product.id === relatedToProduct.id) return false;

                        // Порівнюємо категорії
                        const productCatIds = product.categories.map((cat) => cat.id);
                        return productCatIds.some((id) => categoryIds.includes(id));
                    })
                    .slice(0, 12); // обмеження до 12

                setRelatedProducts(filtered);
            } catch (err) {
                console.error('Помилка при завантаженні релевантних товарів:', err);
                setRelatedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [relatedToProduct]);

    const prevId = `prev-${uniqueId}`;
    const nextId = `next-${uniqueId}`;

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
                <p>Завантаження...</p>
            ) : relatedProducts.length === 0 ? (
                <p>Немає релевантних товарів.</p>
            ) : (
                <div className={s.sliderWrap}>
                    <div className={`${s.arrow} ${s.arrowPrev}`} id={prevId}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="13" viewBox="0 0 17 13" fill="none">
                            <path d="M6.58228 0L7.65132 1.05572L2.89413 5.75351L16.5 5.75351V7.24654L2.89413 7.24654L7.65132 11.9443L6.58228 13L0 6.49997L6.58228 0Z" fill="#0C1618"/>
                        </svg>
                    </div>

                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={16}
                        slidesPerView={1}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 4 },
                        }}
                        loop={relatedProducts.length > 4}
                        navigation={{
                            nextEl: `#${nextId}`,
                            prevEl: `#${prevId}`,
                        }}
                    >
                        {relatedProducts.map((product) => (
                            <SwiperSlide key={product.id}>
                                <ProductItem product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className={`${s.arrow} ${s.arrowNext}`} id={nextId}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="13" viewBox="0 0 17 13" fill="none">
                            <path d="M10.4177 0L9.34868 1.05572L14.1059 5.75351L0.5 5.75351L0.5 7.24654L14.1059 7.24654L9.34868 11.9443L10.4177 13L17 6.49997L10.4177 0Z" fill="#0C1618"/>
                        </svg>
                    </div>
                </div>
            )}
        </section>
    );
};

export default RelatedProducts;
