import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ProductInfo, Variation } from '../../types/productTypes';
import s from './QuickViewModal.module.css';
import { fetchProductVariations } from '../../services/fetchProductVariations';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {useDispatch, useSelector} from 'react-redux';
import {addToCart, setCartOpen} from '../../store/slices/cartSlice';
import {RootState} from "../../store/store.ts";
import {addToWishlist, removeFromWishlist} from "../../store/slices/wishlistSlice.ts";
import SizeChartModal from '../../components/SizeChart/SizeChart.tsx';
import {useTranslation} from "react-i18next";
import { fbq } from '../../utils/metaPixel';

interface Props {
    product: ProductInfo;
    onClose: () => void;
}

const QuickViewModal = ({ product, onClose }: Props) => {
    const [variations, setVariations] = useState<Variation[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
    const [mounted, setMounted] = useState(false);
    const dispatch = useDispatch();

    const [isSizeOpen, setSizeOpen] = useState(false);

    const { t, i18n } = useTranslation();
    const langPrefix = i18n.language === 'ua' ? '/ua' : i18n.language === 'ru' ? '/ru' : '';

    const wishList = useSelector((state: RootState) => state.wishlist.items);
    const isInWishlist    = wishList.some((item) => item.id === product?.id);
    const handleWishlistToggle = () => {
        if (!product) return;

        if (isInWishlist   ) {
            dispatch(removeFromWishlist(product.id));
        } else {
            dispatch(addToWishlist(product));
        }
    };

    useEffect(() => {
        setMounted(true);
        const fetch = async () => {
            const result = await fetchProductVariations(product.id);
            setVariations(result);

            // Ініціалізуємо початкові опції тільки для атрибутів, які є в варіаціях
            const initialOptions: Record<string, string> = {};
            const variationAttributes = new Set(result.flatMap(v => v.attributes.map(a => a.slug)));

            product.attributes.forEach(attr => {
                if (variationAttributes.has(attr.slug) && attr.options[0]) {
                    initialOptions[attr.slug] = attr.options[0].name;
                }
            });

            setSelectedOptions(initialOptions);
        };
        fetch();
    }, [product]);

    useEffect(() => {
        if (!product || variations.length === 0) return;

        const matched = variations.find((variation) => {
            return variation.attributes.every(attr => {
                const selected = selectedOptions[attr.slug];
                return selected === attr.option;
            });
        });

        setSelectedVariation(matched || null);
    }, [selectedOptions, variations, product]);

    const handleSelectOption = (slug: string, option: string) => {
        // Знаходимо варіацію з цим значенням атрибута
        const variationWithOption = variations.find(v => 
            v.attributes.some(attr => 
                attr.slug === slug && attr.option === option
            )
        );

        if (variationWithOption) {
            // Оновлюємо всі атрибути з варіації
            const newOptions = { ...selectedOptions };
            variationWithOption.attributes.forEach(attr => {
                newOptions[attr.slug] = attr.option;
            });
            setSelectedOptions(newOptions);
        } else {
            // Якщо варіацію не знайдено, просто оновлюємо один атрибут
            setSelectedOptions(prev => ({ ...prev, [slug]: option }));
        }
    };

    const isOutOfStock = selectedVariation
        ? selectedVariation.stock_status === 'outofstock' || selectedVariation.stock_quantity === 0
        : product.stock_status === 'outofstock' || product.stock_quantity === 0;


    const handleAddToCart = () => {
        if (!product) return;

        dispatch(addToCart({
            id: product.id,
            name: product.name,
            price: selectedVariation
                ? Number(selectedVariation.price)
                : Number(product.price),
            regular_price: selectedVariation
                ? Number(selectedVariation.regular_price)
                : Number(product.regular_price),
            sale_price: selectedVariation?.sale_price
                ? Number(selectedVariation.sale_price)
                : product.sale_price
                    ? Number(product.sale_price)
                    : null,
            quantity: 1,
            sku: product.sku,
            image: product.images?.[0]?.src || '',
            variationId: selectedVariation?.id,
            attributes: selectedVariation && Object.keys(selectedOptions).length
                ? selectedOptions
                : undefined,
            productAttributes: product.attributes,
        }));

        // Meta Pixel AddToCart event
        fbq('track', 'AddToCart', {
            content_ids: [product.id],
            content_name: product.name,
            content_type: 'product',
            value: Number(selectedVariation?.price || product.price),
            currency: 'UAH',
        });

        onClose();
        dispatch(setCartOpen(true));
    };

    const modalContent = (
        <div className={s.overlay}>
            <div className={s.modal}>
                <button className={s.close} onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2.22281 19.1621L10.001 11.3839L17.7792 19.1621L19.1934 17.7479L11.4152 9.96973L19.1934 2.19156L17.7792 0.777344L10.001 8.55552L2.22281 0.777345L0.808594 2.19156L8.58677 9.96973L0.808594 17.7479L2.22281 19.1621Z" fill="#1A1A1A"/>
                    </svg>
                </button>
                <div className={s.content}>
                    <div className={s.imageGallery}>
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={10}
                            slidesPerView={1}
                            navigation={{
                                nextEl: `.${s.arrowNext}`,
                                prevEl: `.${s.arrowPrev}`,
                            }}
                            pagination={{ clickable: true }}
                            className={s.swiperGallery}
                        >
                            {product.images?.map((img, i) => (
                                <SwiperSlide key={i}>
                                    <img src={img.src} alt={`${product.name} ${i + 1}`} className={s.galleryImage} />
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        <div className={`${s.arrow} ${s.arrowPrev}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M16.666 10H3.33268M3.33268 10L8.33268 5M3.33268 10L8.33268 15" stroke="#0C1618" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className={`${s.arrow} ${s.arrowNext}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M3.33398 10H16.6673M16.6673 10L11.6673 5M16.6673 10L11.6673 15" stroke="#0C1618" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>

                    <div className={s.info}>
                        <p className={s.sku}>{t('product.sku')}: {product.sku}</p>
                        <div className={s.headingWrap}>
                            <h2 className={s.title}>{product.name}</h2>
                            <div className={s.ratingBlock}>
                                <div className={s.starsRating}>
                                    {[...Array(5)].map((_, index) => (
                                        <svg key={index} width="14" height="14" viewBox="0 0 14 14" fill={index < Math.round(+product.average_rating) ? "#000" : "none"} xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8.4461 5.17873L8.56035 5.47691L8.87893 5.49866L12.7699 5.76441L9.76655 8.40986L9.53929 8.61003L9.61143 8.90415L10.5875 12.8841L7.27165 10.7068L6.99721 10.5266L6.72277 10.7068L3.40698 12.8841L4.38302 8.90415L4.4551 8.61026L4.22817 8.41009L1.22878 5.76441L5.11553 5.49866L5.43408 5.47688L5.54832 5.17873L6.99721 1.39742L8.4461 5.17873Z" stroke="black"/>
                                        </svg>
                                    ))}
                                </div>
                                <a href={`${langPrefix}/product/${product.slug}#reviews`} className={s.reviewText}>
                                    {t('product.reviews')} {product.rating_count}
                                </a>
                            </div>
                        </div>

                        {product.attributes
                            .filter(attr => attr.variation) // Фільтруємо тільки атрибути з variation: true
                            .map(attr => (
                                <div key={attr.name} className={`${s.attributeGroup} ${attr.slug === 'pa_kolir' ? s.hidden : ''}`}>
                                    <h4 className={s.nameAtribute}>{attr.name}</h4>
                                    <div className={s.options}>
                                        {attr.options.map(opt => {
                                            const key = `${attr.slug}-${opt.slug}`;
                                            return (
                                                <button
                                                    key={key}
                                                    className={`${s.optionBtn} ${selectedOptions[attr.slug] === opt.name ? s.active : ''}`}
                                                    onClick={() => handleSelectOption(attr.slug, opt.name)}
                                                    style={attr.slug === 'pa_kolir' ? { backgroundColor: opt.slug } : undefined}
                                                >
                                                    {opt.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}


                        <div className={s.stockStatusBlock}>
                            {selectedVariation ? (
                                // Якщо варіація обрана — показуємо статус варіації
                                selectedVariation.stock_status === 'outofstock' || selectedVariation.stock_quantity === 0 ? (
                                    <p className={s.outofstock}>{t('product.outOfStock')}</p>
                                ) : selectedVariation.stock_quantity !== null && selectedVariation.stock_quantity <= 9 ? (
                                    <p className={s.quentityStock}>
                                        {t('product.lowStock', { count: selectedVariation.stock_quantity })}
                                    </p>
                                ) : (
                                    <div className={s.onstock}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                                            <path d="M4.5325 12.1666C4.30103 12.1671 4.07174 12.123 3.85781 12.0367C3.64388 11.9505 3.44953 11.8239 3.28592 11.6642L0 8.4588L0.830667 7.64793L4.11658 10.8533C4.22684 10.9608 4.37634 11.0212 4.53221 11.0212C4.68808 11.0212 4.83757 10.9608 4.94783 10.8533L13.1693 2.83331L14 3.64419L5.7785 11.6642C5.615 11.8239 5.42074 11.9505 5.20691 12.0367C4.99308 12.123 4.76388 12.1671 4.5325 12.1666Z" fill="black"/>
                                        </svg>
                                        {t('product.inStock')}
                                    </div>
                                )
                            ) : (
                                // Якщо варіація ще не вибрана — показуємо статус основного продукту
                                product.stock_status === 'outofstock' || product.stock_quantity === 0 ? (
                                    <p className={s.outofstock}>{t('product.outOfStock')}</p>
                                ) : product.stock_quantity !== null && product.stock_quantity <= 9 ? (
                                    <p className={s.quentityStock}>
                                        {t('product.lowStock', { count: product.stock_quantity })}
                                    </p>
                                ) : (
                                    <div className={s.onstock}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                                            <path d="M4.5325 12.1666C4.30103 12.1671 4.07174 12.123 3.85781 12.0367C3.64388 11.9505 3.44953 11.8239 3.28592 11.6642L0 8.4588L0.830667 7.64793L4.11658 10.8533C4.22684 10.9608 4.37634 11.0212 4.53221 11.0212C4.68808 11.0212 4.83757 10.9608 4.94783 10.8533L13.1693 2.83331L14 3.64419L5.7785 11.6642C5.615 11.8239 5.42074 11.9505 5.20691 12.0367C4.99308 12.123 4.76388 12.1671 4.5325 12.1666Z" fill="black"/>
                                        </svg>
                                        {t('product.inStock')}
                                    </div>
                                )
                            )}
                        </div>

                        <button className={s.sizeButton} onClick={() => setSizeOpen(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" viewBox="0 0 25 20" fill="none">
                                <path d="M7.43597 6.4172C9.39038 6.6559 13.174 6.02613 13.0964 4.40814C13.0963 4.35072 13.0848 4.29389 13.0626 4.24093C13.0405 4.18796 13.0081 4.1399 12.9673 4.09951C12.9264 4.05912 12.878 4.0272 12.8249 4.00559C12.7717 3.98398 12.7147 3.97311 12.6573 3.97359C12.5404 3.97462 12.4287 4.0218 12.3465 4.10487C12.2643 4.18793 12.2182 4.30013 12.2184 4.41701C12.1337 5.25289 8.90975 5.74743 7.49531 5.54185C5.57101 5.38935 4.50674 4.77984 4.50674 4.41701C4.69364 3.37646 8.93689 2.92316 10.7842 3.55406C10.8956 3.58267 11.0137 3.56647 11.1132 3.50893C11.2127 3.45139 11.2857 3.35711 11.3165 3.24634C11.3472 3.13558 11.3333 3.01717 11.2777 2.91656C11.2221 2.81594 11.1292 2.74116 11.0191 2.70827C8.97964 2.02787 3.63975 2.35088 3.62891 4.41706C3.62888 5.67074 5.67429 6.27811 7.43597 6.4172Z" fill="black"/>
                                <path d="M24.4346 12.7236L23.2267 11.5337C23.1429 11.4524 23.0436 11.3888 22.9347 11.3467C22.8258 11.3045 22.7096 11.2846 22.5929 11.2883C22.4762 11.2919 22.3614 11.319 22.2553 11.3679C22.1493 11.4167 22.0542 11.4864 21.9756 11.5728C21.4746 11.1505 20.9339 10.7778 20.3609 10.46C20.2595 10.4056 20.1409 10.3931 20.0304 10.4253C19.92 10.4575 19.8266 10.5317 19.7703 10.632C19.7141 10.7323 19.6994 10.8507 19.7295 10.9617C19.7596 11.0727 19.8321 11.1675 19.9314 11.2256C20.5907 11.5868 21.2002 12.0324 21.7444 12.551L21.708 13.4007C21.7068 13.4654 21.7186 13.5297 21.7428 13.5897C21.7671 13.6498 21.8032 13.7043 21.8491 13.75C22.0903 14.0461 22.2115 14.4219 22.1888 14.8031C22.1661 15.1843 22.0011 15.5431 21.7265 15.8085C21.6506 15.8832 21.6047 15.9831 21.5974 16.0893C21.2722 15.8369 20.9337 15.6021 20.5833 15.3859V13.9234C20.5833 13.807 20.5371 13.6954 20.4548 13.613C20.3725 13.5307 20.2608 13.4845 20.1444 13.4845C20.028 13.4845 19.9164 13.5307 19.8341 13.613C19.7517 13.6954 19.7055 13.807 19.7055 13.9234V14.8882C19.2752 14.6631 18.8326 14.4552 18.3776 14.2643V13.0367C18.3755 12.9217 18.3283 12.8121 18.2462 12.7316C18.1641 12.651 18.0537 12.6058 17.9387 12.6058C17.8237 12.6058 17.7132 12.651 17.6311 12.7316C17.5491 12.8122 17.5019 12.9218 17.4998 13.0368V13.9214C17.0632 13.7614 16.6232 13.6137 16.1839 13.4805V11.8391C16.1839 11.7227 16.1377 11.6111 16.0554 11.5288C15.973 11.4465 15.8614 11.4002 15.745 11.4002C15.6286 11.4002 15.517 11.4465 15.4346 11.5288C15.3523 11.6111 15.3061 11.7227 15.3061 11.8391V13.2316C14.8577 13.1116 14.414 13.0028 13.9821 12.9071V11.8619C13.9794 11.7469 13.9317 11.6376 13.8492 11.5574C13.7668 11.4773 13.6562 11.4326 13.5412 11.4331C13.4262 11.4336 13.3161 11.4793 13.2343 11.5601C13.1526 11.641 13.1059 11.7508 13.1042 11.8657V12.7254C12.5857 12.6245 12.0916 12.54 11.6325 12.4698V10.6643C11.6325 10.5479 11.5863 10.4362 11.504 10.3539C11.4217 10.2716 11.31 10.2254 11.1936 10.2254C11.0772 10.2254 10.9656 10.2716 10.8833 10.3539C10.801 10.4362 10.7547 10.5479 10.7547 10.6643V12.3457C10.1809 12.2716 9.69265 12.2213 9.3246 12.1889V11.3276C9.32289 11.2123 9.27589 11.1023 9.19376 11.0214C9.11164 10.9405 9.00097 10.8951 8.88568 10.8951C8.77039 10.8951 8.65973 10.9405 8.5776 11.0214C8.49547 11.1023 8.44848 11.2123 8.44677 11.3276V12.128C7.90324 12.1174 7.38358 12.0932 6.88035 12.0508V10.1338C6.88035 10.0174 6.8341 9.9058 6.75179 9.82349C6.66948 9.74117 6.55784 9.69493 6.44143 9.69493C6.32502 9.69493 6.21338 9.74117 6.13107 9.82349C6.04876 9.9058 6.00252 10.0174 6.00252 10.1338V11.9581C5.48053 11.8857 4.98131 11.7911 4.50811 11.677V10.3537C4.50632 10.2385 4.45929 10.1286 4.37717 10.0477C4.29505 9.96689 4.18443 9.92157 4.06918 9.92158C3.95394 9.92158 3.84332 9.9669 3.7612 10.0478C3.67909 10.1286 3.63206 10.2385 3.63028 10.3538V11.4321C3.19236 11.2914 2.76726 11.1135 2.35962 10.9004V9.15615C2.35962 9.03974 2.31338 8.9281 2.23106 8.84579C2.14875 8.76347 2.03711 8.71723 1.9207 8.71723C1.8043 8.71723 1.69266 8.76347 1.61034 8.84579C1.52803 8.9281 1.48179 9.03974 1.48179 9.15615V10.3172C1.31229 10.1931 1.17088 10.0347 1.06681 9.85223C0.962736 9.66978 0.898344 9.46742 0.877843 9.25837V6.07898C2.02688 7.16539 4.6861 7.98136 7.33684 8.12012C8.86275 8.23417 14.1578 8.73524 18.2242 10.4017C18.3315 10.4436 18.4509 10.4417 18.5567 10.3963C18.6626 10.3509 18.7464 10.2658 18.79 10.1592C18.8336 10.0526 18.8336 9.93318 18.79 9.8266C18.7464 9.72003 18.6626 9.63486 18.5568 9.58948C18.0864 9.39669 17.5992 9.22119 17.105 9.05761V4.4074C16.8998 -0.545469 0.207058 -0.549081 0 4.4075L5.27413e-05 9.26041C0.275208 12.3226 5.85205 13.0004 8.53177 13.0104C8.62185 13.015 17.4594 13.5107 21.5461 17.1897C21.5274 17.3312 21.5449 17.4751 21.5968 17.608C21.6487 17.7409 21.7335 17.8585 21.8431 17.9499L23.2683 19.1123C23.3915 19.2131 23.5402 19.2778 23.698 19.2993C23.8557 19.3208 24.0163 19.2981 24.162 19.2339C24.3076 19.1697 24.4327 19.0663 24.5232 18.9354C24.6138 18.8045 24.6663 18.651 24.675 18.4921V13.2986C24.6742 13.0827 24.5877 12.8759 24.4346 12.7236ZM12.0737 7.83182C13.8948 7.47972 15.3578 6.85988 16.2272 6.079V8.78289C14.8616 8.38848 13.4749 8.07096 12.0737 7.83182ZM8.55265 1.53686C13.0755 1.53686 16.2272 3.0497 16.2272 4.40736C16.2272 5.76503 13.0755 7.27769 8.55265 7.27769C4.02979 7.27769 0.87783 5.76506 0.87783 4.4074C0.87783 3.04975 4.02975 1.53686 8.55265 1.53686ZM23.7972 18.4109L22.4205 17.2881L22.4637 16.3063C22.8315 15.8935 23.0451 15.3661 23.0685 14.8138C23.0918 14.2614 22.9235 13.7179 22.5919 13.2755L22.6305 12.3768L22.6386 12.1865L23.7972 13.3282L23.7972 18.4109Z" fill="black"/>
                            </svg>
                            {t('product.sizeChart')}
                        </button>

                        <div className={s.priceWrap}>
                            {!selectedVariation ? (
                                <div className={s.priceWrapHtml} dangerouslySetInnerHTML={{ __html: product.price_html }} />
                            ) : (
                                selectedVariation.sale_price && selectedVariation.sale_price !== selectedVariation.regular_price ? (
                                    <>
                                        <span className={s.sale}>{Math.floor(+selectedVariation.sale_price)} ₴</span>
                                        <span className={s.regular}>{Math.floor(+selectedVariation.regular_price)} ₴</span>
                                    </>
                                ) : (
                                    <span className={s.price}>{Math.floor(+selectedVariation.price)} ₴</span>
                                )
                            )}
                        </div>

                        <div className={s.actionButtons}>

                            <button
                                className={s.addToCartBtn}
                                disabled={
                                    (product.variations.length > 0 && !selectedVariation) || isOutOfStock
                                }
                                onClick={handleAddToCart}
                            >
                                {t('product.addToCart')}
                            </button>


                            <button
                                className={`${s.addToWishlistBtn} ${isInWishlist    ? s.active : ''}`}
                                aria-label="Додати в улюблене"
                                onClick={handleWishlistToggle}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 26 24" fill="none">
                                    <path d="M13 23C12.6583 23 12.3289 22.8725 12.0722 22.6408C11.1027 21.7673 10.1679 20.9464 9.3432 20.2224L9.33899 20.2186C6.92108 18.0956 4.83313 16.2622 3.38037 14.4562C1.75641 12.4371 1 10.5228 1 8.4315C1 6.39963 1.67621 4.52511 2.90393 3.15299C4.1463 1.76464 5.85101 1 7.70459 1C9.08997 1 10.3587 1.45127 11.4755 2.34118C12.0391 2.79038 12.5499 3.34014 13 3.98139C13.4503 3.34014 13.9609 2.79038 14.5247 2.34118C15.6415 1.45127 16.9102 1 18.2956 1C20.149 1 21.8539 1.76464 23.0963 3.15299C24.324 4.52511 25 6.39963 25 8.4315C25 10.5228 24.2438 12.4371 22.6198 14.456C21.1671 16.2622 19.0793 18.0954 16.6617 20.2182C15.8356 20.9434 14.8994 21.7656 13.9276 22.6412C13.6711 22.8725 13.3415 23 13 23Z" stroke="#003C3A" strokeWidth="1.5" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <SizeChartModal
                isOpen={isSizeOpen}
                onClose={() => setSizeOpen(false)}
                attributes={product?.attributes ?? []}
            />
        </div>
    );

    if (!mounted) return null;

    return createPortal(modalContent, document.body);
};

export default QuickViewModal;
