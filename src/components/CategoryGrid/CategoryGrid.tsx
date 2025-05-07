import { useEffect, useState } from 'react';
import { getCategories } from '../../services/fetchCategories.ts';
import { CategoryInfo } from '../../types/categoryTypes.ts';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // Не забудь імпорти стилів Swiper
import 'swiper/css/navigation';
import s from './CategoryGrid.module.css';
import {LoaderMini} from "../LoaderMini/LoaderMini.tsx";
import {useTranslation} from "react-i18next";

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
};

const CategoryGrid = () => {
    const [categories, setCategories] = useState<CategoryInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isMobile = useIsMobile(); // використання мобайл-перевірки


    const { t } = useTranslation();

    const { i18n } = useTranslation();
    const langPrefix = i18n.language === 'ru' ? '/ru' : '';

    useEffect(() => {
        const cachedCategories = localStorage.getItem('categories');

        if (cachedCategories) {
            setCategories(JSON.parse(cachedCategories));
            setLoading(false);
        } else {
            const fetch = async () => {
                try {
                    const data = await getCategories();
                    const filtered = data.filter(
                        (cat) =>
                            cat.count > 0 &&
                            cat.parent === 0 &&
                            cat.name.toLowerCase() !== 'Без категорії'
                    );
                    setCategories(filtered);
                    localStorage.setItem('categories', JSON.stringify(filtered));
                } catch {
                    setError('Не вдалося завантажити категорії');
                } finally {
                    setLoading(false);
                }
            };
            fetch();
        }
    }, []);

    if (loading) return <LoaderMini/>;
    if (error) return <p className={s.error}>{error}</p>;

    return (
        <section className={s.categoryGridSection}>
            <h2 className={s.title}>{t('category_title')}</h2>

            {isMobile ? (
                <Swiper
                    spaceBetween={16}
                    slidesPerView={1.5} // видно півтора слайди
                >
                    {categories.map((cat) => (
                        <SwiperSlide key={cat.id}>
                            <Link to={`${langPrefix}/product-category/${cat.slug}`} className={s.card}>
                                <div className={s.wrapImgCat}>
                                    <img
                                        src={cat.image?.src || '/images/category-img.jpg'}
                                        alt={cat.image?.alt || cat.name}
                                        className={s.image}
                                    />
                                    <svg className={s.arrowCat} width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="1" y="1" width="54" height="54" rx="11" fill="#FFFEFC"/>
                                        <rect x="1" y="1" width="54" height="54" rx="11" stroke="#003C3A" strokeWidth="2"/>
                                        <path d="M23 33L33 23M33 23H23M33 23V33" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div className={s.meta}>
                                    <span className={s.count}>{cat.count} {t('products_count')}</span>
                                    <h3 className={s.catTitle}>{cat.name}</h3>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <div className={s.grid}>
                    {categories.map((cat) => (
                        <Link to={`${langPrefix}/product-category/${cat.slug}`} key={cat.id} className={s.card}>
                            <div className={s.wrapImgCat}>
                                <img
                                    src={cat.image?.src || '../public/images/category-img.jpg'}
                                    alt={cat.image?.alt || cat.name}
                                    className={s.image}
                                />
                                <svg className={s.arrowCat} width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="1" y="1" width="54" height="54" rx="11" fill="#FFFEFC"/>
                                    <rect x="1" y="1" width="54" height="54" rx="11" stroke="#003C3A" strokeWidth="2"/>
                                    <path d="M23 33L33 23M33 23H23M33 23V33" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className={s.meta}>
                                <span className={s.count}>{cat.count} {t('products_count')}</span>
                                <h3 className={s.catTitle}>{cat.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
};

export default CategoryGrid;
