// ✅ src/components/ProductSlider/ProductSlider.tsx

import React, { useState, useEffect } from 'react';
import s from './ProductSlider.module.css';
import { ProductInfo } from '../../types/productTypes';
import ImageGalleryModal from '../ImageGalleryModal/ImageGalleryModal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';


interface ProductSliderProps {
    images: string[];
    info: ProductInfo;
    showMarkers?: boolean;
    showThumbnails?: boolean;
    activeVariationImage?: string;
}

export const ProductSlider: React.FC<ProductSliderProps> = ({
                                                                images,
                                                                info,
                                                                showMarkers = true,
                                                                showThumbnails = true,
                                                                activeVariationImage,
                                                            }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const [isModalOpen, setModalOpen] = useState(false);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;



    useEffect(() => {
        setCurrentIndex(0);
    }, [images]);

    useEffect(() => {
        if (activeVariationImage) {
            const idx = images.findIndex(img => img === activeVariationImage);
            if (idx !== -1 && idx !== currentIndex) {
                setCurrentIndex(idx);
            }
        }
    }, [activeVariationImage, images]);



    const handleClose = () => {
        setModalOpen(false);
    };



    if (!images || images.length === 0) {
        return <div className={s.noImages}>No images available</div>;
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const selectSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const isNewProduct = (dateCreated: string) => {
        if (!dateCreated) return false;
        const createdDate = new Date(dateCreated);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 14;
    };

    return (
        <div className={s.slider}>
            {!isMobile && (
                <div>
                    {showThumbnails && (
                        <div className={s.sliderThumbnails}>
                            {images.length > 1 && (
                                <button className={s.customLeftNav} onClick={prevSlide}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M19 15.5L12 8.5L5 15.5" stroke="#212121" strokeWidth="1.6" strokeLinecap="square" />
                                    </svg>
                                </button>
                            )}

                            {images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    className={`${s.thumbnail} ${index === currentIndex ? s.active : ''}`}
                                    onClick={() => selectSlide(index)}
                                />
                            ))}

                            {images.length > 1 && (
                                <button className={s.customRightNav} onClick={nextSlide}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M19 8.5L12 15.5L5 8.5" stroke="#212121" strokeWidth="1.6" strokeLinecap="square" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className={s.sliderMain}>
                <div className={s.sliderMain}>
                    {isMobile ? (
                        <Swiper
                            modules={[Pagination]}
                            pagination={{ clickable: true }}
                            slidesPerView={1}
                            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
                        >
                            {images.map((img, index) => (
                                <SwiperSlide key={index}>
                                    <img src={img} alt={`Slide ${index + 1}`} className={s.sliderImage} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <>
                            {showMarkers && (
                                <div className={s.markersBlock}>
                                    {info.featured && <div className={s.bestMarker}><span>Bestseller</span></div>}
                                    {isNewProduct(info.date_created) && <div className={s.newMarker}>NEW</div>}
                                    {info.sale_price && info.regular_price && (
                                        <div className={s.saleMarker}>
                                            -{Math.round((1 - Number(info.sale_price) / Number(info.regular_price)) * 100)}%
                                        </div>
                                    )}
                                </div>
                            )}

                            <img
                                src={images[currentIndex]}
                                alt={`Slide ${currentIndex + 1}`}
                                className={s.sliderImage}
                                onClick={() => setModalOpen(true)}
                            />
                        </>
                    )}
                </div>
            </div>

            {!isMobile && (
                <ImageGalleryModal
                    images={images}
                    info={info}
                    currentIndex={currentIndex}
                    onClose={handleClose}
                    isVisible={isModalOpen}
                />
            )}

        </div>
    );
};

export default ProductSlider;
