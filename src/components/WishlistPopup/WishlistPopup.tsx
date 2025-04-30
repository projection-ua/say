import s from './WishListPopup.module.css';
import { ProductInfo } from '../../types/productTypes';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { removeFromWishlist } from '../../store/slices/wishlistSlice';
import React from "react";
import { useEffect, useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const useIsMobile = (breakpoint: number = 768) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < breakpoint);

        checkIsMobile(); // перевірка при завантаженні
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, [breakpoint]);

    return isMobile;
};


export const WishlistPopup: React.FC<Props> = ({ isOpen, onClose }) => {
    const wishlist = useSelector((state: RootState) => state.wishlist.items);
    const dispatch = useDispatch();

    const isMobile = useIsMobile(); // 👈 додай цей рядок

    const handleRemove = (id: number) => {
        dispatch(removeFromWishlist(id));
    };


    return (
        <div className={s.wrapWishlist}>
            {isOpen && <div className={`${s.overlay} ${isOpen ? s.active : ''}`} onClick={onClose} />}
            <div className={`${s.popup} ${isOpen ? s.active : ''}`}>

                <div className={s.wrapHeader}>
                    <h2 className={s.title}>ОБРАНЕ <span className={s.countWishlist}>( {wishlist.length} )</span></h2>
                    <button className={s.closeBtn} onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M2.22197 19.1924L10.0001 11.4142L17.7783 19.1924L19.1925 17.7782L11.4144 10L19.1925 2.22182L17.7783 0.807611L10.0001 8.58579L2.22197 0.807613L0.807751 2.22183L8.58592 10L0.807751 17.7782L2.22197 19.1924Z" fill="#1A1A1A"/>
                        </svg>
                    </button>
                </div>

                {wishlist.length === 0 ? (
                    <p className={s.empty}>Ваш список обраного порожній</p>
                ) : isMobile ? (
                        <div className={s.mobileGrid}>
                            {wishlist.map((product: ProductInfo) => (
                                <div key={product.id} className={s.productCard}>
                                    <button
                                        className={s.removeBtn}
                                        onClick={() => handleRemove(product.id)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M1.51863 15.6603L8.00044 9.17851L14.4823 15.6603L15.6608 14.4818L9.17895 8L15.6608 1.51819L14.4823 0.339676L8.00044 6.82149L1.51863 0.339677L0.340119 1.51819L6.82193 8L0.340119 14.4818L1.51863 15.6603Z" fill="#003C3A"/>
                                        </svg>
                                    </button>
                                    <Link to={`/product/${product.slug}`}>
                                        <img src={product.images[0]?.src} alt={product.name} />
                                        <p>{product.name}</p>
                                        <div
                                            className={s.priceWrapHtml}
                                            dangerouslySetInnerHTML={{ __html: product.price_html }}
                                        />
                                    </Link>
                                </div>
                            ))}
                        </div>
                ) : (
                    <div className={s.sliderWrap}>
                        <Swiper
                            spaceBetween={24}
                            slidesPerView={5}
                            navigation={{
                                nextEl: `.${s.nextBtn}`,
                                prevEl: `.${s.prevBtn}`,
                            }}
                            modules={[Navigation]}
                            className={s.swiper}
                        >
                            {wishlist.map((product: ProductInfo) => (
                                <SwiperSlide key={product.id}>
                                    <div className={s.productCard}>
                                        <button
                                            className={s.removeBtn}
                                            onClick={() => handleRemove(product.id)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M1.51863 15.6603L8.00044 9.17851L14.4823 15.6603L15.6608 14.4818L9.17895 8L15.6608 1.51819L14.4823 0.339676L8.00044 6.82149L1.51863 0.339677L0.340119 1.51819L6.82193 8L0.340119 14.4818L1.51863 15.6603Z" fill="#003C3A"/>
                                            </svg>
                                        </button>
                                        <Link to={`/product/${product.slug}`}>
                                            <img src={product.images[0]?.src} alt={product.name} />
                                            <p>{product.name}</p>
                                            <div
                                                className={s.priceWrapHtml}
                                                dangerouslySetInnerHTML={{ __html: product.price_html }}
                                            />
                                        </Link>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <button className={`${s.navBtn} ${s.prevBtn}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="13" viewBox="0 0 17 13" fill="none">
                                <path d="M6.58228 0L7.65132 1.05572L2.89413 5.75351L16.5 5.75351V7.24654L2.89413 7.24654L7.65132 11.9443L6.58228 13L0 6.49997L6.58228 0Z" fill="#0C1618" />
                            </svg>
                        </button>
                        <button className={`${s.navBtn} ${s.nextBtn}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="13" viewBox="0 0 17 13" fill="none">
                                <path d="M10.4177 0L9.34868 1.05572L14.1059 5.75351L0.5 5.75351L0.5 7.24654L14.1059 7.24654L9.34868 11.9443L10.4177 13L17 6.49997L10.4177 0Z" fill="#0C1618" />
                            </svg>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
