import React, { useState, useEffect } from 'react';
import { ProductInfo } from '../../types/productTypes';
import s from './ProductItem.module.css';
import { Link } from 'react-router-dom';
import QuickViewModal from '../../components/QuickViewModal/QuickViewModal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { addToWishlist } from '../../store/slices/wishlistSlice';
import {useTranslation} from "react-i18next";

interface ProductItemProps {
    product: ProductInfo;
    viewMode?: 'default' | 'cart' | 'wishlist';
}

const isNewProduct = (dateCreated: string) => {
    if (!dateCreated) return false;
    const createdDate = new Date(dateCreated);
    const today = new Date();
    const daysDiff = Math.floor(
        (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff <= 14;
};



const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
};



const ProductItem: React.FC<ProductItemProps> = ({ product, viewMode = 'default' }) => {
    const dispatch = useDispatch();
    const wishlist = useSelector((state: RootState) => state.wishlist.items);
    const isInWishlist = wishlist.some((item) => item.id === product.id);

    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const isMobile = useIsMobile(); // ось тут підключаємо

    const handleOpenQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsQuickViewOpen(true);
    };

    const handleCloseQuickView = () => {
        setIsQuickViewOpen(false);
    };



    const { t, i18n } = useTranslation();
    const langPrefix = i18n.language === 'ru' ? '/ru' : '';




    if (!product) return null;

    return (
        <div className={`${s.productItem} ${s[viewMode] || ''}`}>
            <Link
                to={`${langPrefix}/product/${product.slug || product.id}`}
                className={s.productLink}
                data-product-id={product.id}
            >
                <div className={s.imageWrap}>
                    <div className={s.markersProduct}>
                        {product.sale_price &&
                            product.sale_price !== "0" &&
                            product.regular_price &&
                            product.regular_price !== "0" && (
                                <div className={s.saleMarker}>
                                    -
                                    {Math.round(
                                        (1 - Number(product.sale_price) / Number(product.regular_price)) * 100
                                    )}
                                    %
                                </div>
                            )}
                        {isNewProduct(product.date_created) && (
                            <div className={s.newMarker}>NEW</div>
                        )}
                        {product.featured && <div className={s.markerPopular}>Bestseller</div>}
                    </div>

                    {product.images && product.images.length > 0 && product.images[0].src ? (
                        <>
                            <img
                                src={product.images[0].src}
                                alt={product.name}
                                className={s.productImage}
                                loading="lazy"
                            />

                            {product.images.length > 1 && product.images[1]?.src && (
                                <img
                                    src={product.images[1].src}
                                    alt={product.name}
                                    className={s.productImageBack}
                                    loading="lazy"
                                />
                            )}
                        </>
                    ) : (
                        <img
                            src="/images/image-product.jpg"
                            alt={product.name}
                            className={s.productImage}
                            loading="lazy"
                        />
                    )}






                    {viewMode === 'default' && (
                        <>
                            {!isMobile ? (
                                <div className={s.buttonsWrap}>
                                    {/* Десктоп */}
                                    <button className={s.manyInfo} onClick={handleOpenQuickView}>
                                        {t('product.view')}
                                    </button>
                                    <button
                                        className={`${s.wishlistButton} ${isInWishlist ? s.active : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            dispatch(addToWishlist(product));
                                        }}
                                        aria-label="Додати в улюблене"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 26 24" fill="none">
                                            <path
                                                d="M13 23C12.6583 23 12.3289 22.8725 12.0722 22.6408C11.1027 21.7673 10.1679 20.9464 9.3432 20.2224C6.92108 18.0956 4.83313 16.2622 3.38037 14.4562C1.75641 12.4371 1 10.5228 1 8.4315C1 6.39963 1.67621 4.52511 2.90393 3.15299C4.1463 1.76464 5.85101 1 7.70459 1C9.08997 1 10.3587 1.45127 11.4755 2.34118C12.0391 2.79038 12.5499 3.34014 13 3.98139C13.4503 3.34014 13.9609 2.79038 14.5247 2.34118C15.6415 1.45127 16.9102 1 18.2956 1C20.149 1 21.8539 1.76464 23.0963 3.15299C24.324 4.52511 25 6.39963 25 8.4315C25 10.5228 24.2438 12.4371 22.6198 14.456C21.1671 16.2622 19.0793 18.0954 16.6617 20.2182C15.8356 20.9434 14.8994 21.7656 13.9276 22.6412C13.6711 22.8725 13.3415 23 13 23Z"
                                                stroke="#003C3A"
                                                strokeWidth="1.5"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Мобайл — кнопки по одній */}
                                    <button className={s.manyInfo} onClick={handleOpenQuickView}>
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.36797 4.17213V5.38173H5.62397V9.44253H4.29917V5.38173H0.526367V4.17213H4.29917V0.111328H5.62397V4.17213H9.36797Z" fill="#003C3A"/>
                                        </svg>
                                    </button>
                                    <button
                                        className={`${s.wishlistButton} ${isInWishlist ? s.active : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            dispatch(addToWishlist(product));
                                        }}
                                        aria-label={`{t('product.wishlist')}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 26 24" fill="none">
                                            <path
                                                d="M13 23C12.6583 23 12.3289 22.8725 12.0722 22.6408C11.1027 21.7673 10.1679 20.9464 9.3432 20.2224C6.92108 18.0956 4.83313 16.2622 3.38037 14.4562C1.75641 12.4371 1 10.5228 1 8.4315C1 6.39963 1.67621 4.52511 2.90393 3.15299C4.1463 1.76464 5.85101 1 7.70459 1C9.08997 1 10.3587 1.45127 11.4755 2.34118C12.0391 2.79038 12.5499 3.34014 13 3.98139C13.4503 3.34014 13.9609 2.79038 14.5247 2.34118C15.6415 1.45127 16.9102 1 18.2956 1C20.149 1 21.8539 1.76464 23.0963 3.15299C24.324 4.52511 25 6.39963 25 8.4315C25 10.5228 24.2438 12.4371 22.6198 14.456C21.1671 16.2622 19.0793 18.0954 16.6617 20.2182C15.8356 20.9434 14.8994 21.7656 13.9276 22.6412C13.6711 22.8725 13.3415 23 13 23Z"
                                                stroke="#003C3A"
                                                strokeWidth="1.5"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </>
                    )}


                    {viewMode === 'wishlist' && (
                        <div className={s.buttonsWrap}>
                            <button className={s.manyInfo} onClick={handleOpenQuickView}>
                                {t('product.view')}
                            </button>
                            <button
                                className={`${s.wishlistButton} ${isInWishlist ? s.active : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    dispatch(addToWishlist(product));
                                }}
                                aria-label={`{t('product.wishlist')}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 26 24" fill="none">
                                    <path
                                        d="M13 23C12.6583 23 12.3289 22.8725 12.0722 22.6408C11.1027 21.7673 10.1679 20.9464 9.3432 20.2224C6.92108 18.0956 4.83313 16.2622 3.38037 14.4562C1.75641 12.4371 1 10.5228 1 8.4315C1 6.39963 1.67621 4.52511 2.90393 3.15299C4.1463 1.76464 5.85101 1 7.70459 1C9.08997 1 10.3587 1.45127 11.4755 2.34118C12.0391 2.79038 12.5499 3.34014 13 3.98139C13.4503 3.34014 13.9609 2.79038 14.5247 2.34118C15.6415 1.45127 16.9102 1 18.2956 1C20.149 1 21.8539 1.76464 23.0963 3.15299C24.324 4.52511 25 6.39963 25 8.4315C25 10.5228 24.2438 12.4371 22.6198 14.456C21.1671 16.2622 19.0793 18.0954 16.6617 20.2182C15.8356 20.9434 14.8994 21.7656 13.9276 22.6412C13.6711 22.8725 13.3415 23 13 23Z"
                                        stroke="#003C3A"
                                        strokeWidth="1.5"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}

                </div>

                <div className={s.contentProduct}>
                    <h2 className={s.nameProduct}>{product.name}</h2>

                    <div
                        className={s.priceWrapHtml}
                        dangerouslySetInnerHTML={{ __html: product.price_html }}
                    />

                </div>
            </Link>

            {isQuickViewOpen && viewMode === 'default' && (
                <QuickViewModal product={product} onClose={handleCloseQuickView} />
            )}
        </div>
    );
};

export default ProductItem;
