import s from './TipsBlock.module.css';
import { TipsPopup } from '../TipsBlock/TipsPopup';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useTranslation } from 'react-i18next';

const tips = [
    { id: 1, categoryKey: 'storage', titleKey: 'storage', popupKey: 'storage', image: '/images/tips/tips-1.jpg', icon: '/icons/tips-icon-1.svg' },
    { id: 2, categoryKey: 'update', titleKey: 'update', popupKey: 'update', image: '/images/tips/tips-2.jpg', icon: '/icons/tips-icon-2.svg' },
    { id: 3, categoryKey: 'washing', titleKey: 'washing', popupKey: 'washing', image: '/images/tips/tips-3.jpg', icon: '/icons/tips-icon-3.svg' },
    { id: 4, categoryKey: 'care', titleKey: 'care', popupKey: 'care', image: '/images/tips/tips-4.jpg', icon: '/icons/tips-icon-4.svg' }
];

export interface PopupBlock {
    title: string;
    text: string;
}

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

const TipsBlock = () => {
    const [activeTip, setActiveTip] = useState<null | typeof tips[0]>(null);
    const isMobile = useIsMobile();
    const { t } = useTranslation();

    return (
        <section className={s.tipsSection}>
            <h2 className={s.title}>{t('tips.sectionTitle')}</h2>

            {isMobile ? (
                <Swiper spaceBetween={16} slidesPerView={1.5}>
                    {tips.map((tip) => (
                        <SwiperSlide key={tip.id}>
                            <div className={s.card}>
                                <div className={s.imageWrap}>
                                    <img src={tip.image} alt={t(`tips.title.${tip.titleKey}`)} className={s.image} />
                                    <img src={tip.icon} alt="" className={s.icon} />
                                </div>
                                <div className={s.wrapContentTip}>
                                    <p className={s.category}>{t(`tips.category.${tip.categoryKey}`)}</p>
                                    <h3 className={s.tipTitle}>{t(`tips.title.${tip.titleKey}`)}</h3>
                                    <button className={s.link} onClick={() => setActiveTip(tip)}>
                                        <span className={s.spanLink}>{t('tips.buttonReadMore')}</span>
                                        <svg className={s.iconLink} xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                                            <path d="M5.83325 14.6668L14.1666 6.3335M14.1666 6.3335H5.83325M14.1666 6.3335V14.6668" stroke="#0C1618" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <div className={s.grid}>
                    {tips.map((tip) => (
                        <div key={tip.id} className={s.card}>
                            <div className={s.imageWrap}>
                                <img src={tip.image} alt={t(`tips.title.${tip.titleKey}`)} className={s.image} />
                                <img src={tip.icon} alt="" className={s.icon} />
                            </div>
                            <div className={s.wrapContentTip}>
                                <p className={s.category}>{t(`tips.category.${tip.categoryKey}`)}</p>
                                <h3 className={s.tipTitle}>{t(`tips.title.${tip.titleKey}`)}</h3>
                                <button className={s.link} onClick={() => setActiveTip(tip)}>
                                    <span className={s.spanLink}>{t('tips.buttonReadMore')}</span>
                                    <svg className={s.iconLink} xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                                        <path d="M5.83325 14.6668L14.1666 6.3335M14.1666 6.3335H5.83325M14.1666 6.3335V14.6668" stroke="#0C1618" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTip && (
                <TipsPopup
                    isOpen={!!activeTip}
                    onClose={() => setActiveTip(null)}
                    blocks={t(`tips.popup.${activeTip.popupKey}`, { returnObjects: true }) as PopupBlock[]}
                    title={t(`tips.title.${activeTip.titleKey}`)}
                />
            )}
        </section>
    );
};

export default TipsBlock;