import { useEffect, useState } from 'react';
import s from './FaqPage.module.css'; // стиль створимо нижче
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs';

import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../config/api';

interface FaqItem {
    id: number;
    input_question: string;
    input_answer: string;
}

export const FaqPage = () => {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [openItem, setOpenItem] = useState<number | null>(null);

    const { i18n } = useTranslation();

    const location = useLocation();
    const currentUrl = `${window.location.origin}${location.pathname}`;

    const [seoData, setSeoData] = useState<any>(null);

    useEffect(() => {
        const fetchSeo = async () => {
            const langPage = i18n.language === 'ru' ? 'ru' : '';
            const url = `${API_BASE_URL}/page-seo?slug=faqs${langPage ? `&lang=${langPage}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();
            setSeoData(data);
        };
        fetchSeo();
    }, [i18n.language]);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const lang = i18n.language === 'ru' ? 'ru' : '';
                const url = `${API_BASE_URL}/faqs${lang ? `?lang=${lang}` : ''}`;
                const response = await fetch(url);
                const data = await response.json();
                setFaqs(data);
            } catch (error) {
                console.error('❌ Помилка при завантаженні FAQ:', error);
            }
        };
        fetchFaqs();
    }, [i18n.language]);

    const toggleItem = (id: number) => {
        setOpenItem(prev => (prev === id ? null : id));
    };

    const { t } = useTranslation();

    return (
        <div className={s.page}>
            <HelmetProvider>
                <Helmet>
                    <title>{seoData?.title || 'Say'}</title>
                    <link rel="canonical" href={currentUrl} />

                    {seoData?.og_title && <meta property="og:title" content={seoData.og_title} />}
                    {seoData?.og_description && <meta property="og:description" content={seoData.og_description} />}
                    <meta property="og:url" content={currentUrl} />

                    {seoData?.og_locale && <meta property="og:locale" content={seoData.og_locale} />}
                    {seoData?.og_type && <meta property="og:type" content={seoData.og_type} />}
                    {seoData?.og_site_name && <meta property="og:site_name" content={seoData.og_site_name} />}
                    {seoData?.twitter_card && <meta name="twitter:card" content={seoData.twitter_card} />}

                    <meta
                        name="robots"
                        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
                    />
                </Helmet>
            </HelmetProvider>
            <div
                className={s.heroBanner}
                style={{ backgroundImage: "url('/images/faq-baner.jpg')" }}
            >
                <Breadcrumbs
                    variant="catalog"
                    crumbs={[
                        { label: t('breadcrumbs.home'), url: '/' },
                        { label: t('faq.title') },
                    ]}
                />
                <h1 className={s.categoryTitle}>{t('faq.title')}</h1>
            </div>

            <div className={s.grid}>
                {faqs.map(({ id, input_question, input_answer }) => (
                    <div key={id} className={s.card}>
                        <button className={s.question} onClick={() => toggleItem(id)}>
                            {input_question}
                            <span className={`${s.arrow} ${openItem === id ? s.open : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="10" viewBox="0 0 16 10" fill="none">
                                  <path opacity="0.75" d="M15 8.5L8 1.5L1 8.5" stroke="#0C1618" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        </button>
                        {openItem === id && <p className={s.answer}>{input_answer}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FaqPage;