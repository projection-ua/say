import { useEffect, useState } from 'react';
import s from './FaqPage.module.css'; // стиль створимо нижче
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs';

import { Helmet, HelmetProvider } from 'react-helmet-async';
import {apiUrlWp} from "../../App.tsx";
import {useLocation} from "react-router-dom";




interface FaqItem {
    id: number;
    input_question: string;
    input_answer: string;
}

export const FaqPage = () => {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [openItem, setOpenItem] = useState<number | null>(null);


    const location = useLocation();
    const currentUrl = `${window.location.origin}${location.pathname}`;

    const [seoData, setSeoData] = useState<any>(null);

    useEffect(() => {
        const fetchSeo = async () => {
            const response = await fetch(`${apiUrlWp}wp-json/wp/v2/pages?slug=faqs`);
            const data = await response.json();
            setSeoData(data[0]?.yoast_head_json);
        };

        fetchSeo();
    }, []);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await fetch('https://api.say.in.ua/wp-json/wp/v2/faq');
                const data = await response.json();
                setFaqs(data);
            } catch (error) {
                console.error('❌ Помилка при завантаженні FAQ:', error);
            }
        };

        fetchFaqs();
    }, []);

    const toggleItem = (id: number) => {
        setOpenItem(prev => (prev === id ? null : id));
    };

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
                        { label: 'Головна', url: '/' },
                        { label: 'Часті запитання' },
                    ]}
                />
                <h1 className={s.categoryTitle}>Часті запитання</h1>
            </div>

            <div className={s.grid}>
                {faqs.map(({ id, input_question, input_answer }) => (
                    <div key={id} className={s.card}>
                        <button className={s.question} onClick={() => toggleItem(id)}>
                            {input_question}
                            <span className={`${s.arrow} ${openItem === id ? s.open : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="10" viewBox="0 0 16 10" fill="none">
                                  <path opacity="0.75" d="M15 8.5L8 1.5L1 8.5" stroke="#0C1618" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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