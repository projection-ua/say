import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import s from './OfferBlock.module.css';

const slides = [
    {
        id: 1,
        image: '/images/offer-img.jpg', // заміни на свій шлях
        title: 'Час для змін!',
        subtitle: 'Відкрийте для себе нову колекцію білизни та купальників.',
        buttonText: 'ПРИДБАТИ ЗАРАЗ',
        buttonLink: '/category/underwear',
    },
    {
        id: 2,
        image: '/images/offer-img.jpg',
        title: 'Літня колекція',
        subtitle: 'Сміливі кольори. Нові форми. Абсолютний комфорт.',
        buttonText: 'ПЕРЕГЛЯНУТИ',
        buttonLink: '/category/swimwear',
    },
];

const HeroSlider = () => {
    return (
        <div className={s.heroSlider}>
            <Swiper
                modules={[Navigation, Pagination]}
                pagination={{
                    el: '.swiper-custom-pagination',
                    clickable: true,
                }}
                loop
                navigation={{
                    nextEl: '.swiper-hero-next',
                    prevEl: '.swiper-hero-prev',
                }}
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div
                            className={s.slide}
                            style={{ backgroundImage: `url(${slide.image})` }}
                        >
                            <div className={s.content}>
                                <h2>{slide.title}</h2>
                                <p>{slide.subtitle}</p>
                                <a href={slide.buttonLink} className={s.btn}>
                                    {slide.buttonText}
                                </a>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
                <div className={`${s.swiperPagination} swiper-custom-pagination`}></div>
                <div className={s.arrowsWrap}>
                    <div className={`${s.arrow} swiper-hero-prev`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="13" viewBox="0 0 17 13" fill="none">
                            <path d="M6.58228 0L7.65132 1.05572L2.89413 5.75351L16.5 5.75351V7.24654L2.89413 7.24654L7.65132 11.9443L6.58228 13L0 6.49997L6.58228 0Z" fill="white"/>
                        </svg>
                    </div>
                    <div className={`${s.arrow} swiper-hero-next`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="13" viewBox="0 0 17 13" fill="none">
                            <path d="M10.4177 0L9.34868 1.05572L14.1059 5.75351L0.5 5.75351L0.5 7.24654L14.1059 7.24654L9.34868 11.9443L10.4177 13L17 6.49997L10.4177 0Z" fill="white"/>
                        </svg>
                    </div>
                </div>
            </Swiper>
        </div>
    );
};

export default HeroSlider;
