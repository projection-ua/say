import s from './DeliveryAndPaymentPage.module.css';
import {Breadcrumbs} from "../../components/Breadcrumbs/Breadcrumbs.tsx";

import { Helmet, HelmetProvider } from 'react-helmet-async';
import {apiUrlWp} from "../../App.tsx";
import {useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

export const DeliveryPage = () => {

    const location = useLocation();
    const currentUrl = `${window.location.origin}${location.pathname}`;

    const [seoData, setSeoData] = useState<any>(null);

    useEffect(() => {
        const fetchSeo = async () => {
            const response = await fetch(`${apiUrlWp}wp-json/wp/v2/pages?slug=how-to-buy`);
            const data = await response.json();
            setSeoData(data[0]?.yoast_head_json);
        };

        fetchSeo();
    }, []);

    const { t } = useTranslation();

    const cards = t('deliveryPayment.cards', { returnObjects: true }) as { title: string; text: string }[];
    const breadcrumbs = t('deliveryPayment.breadcrumbs', { returnObjects: true }) as { label: string; url?: string }[];


    return (
        <div className={s.heroWrap}>
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
                style={{ backgroundImage: "url('/images/delivery-baner.jpg')" }}
            >
                <Breadcrumbs variant="catalog" crumbs={breadcrumbs} />
                <h1 className={s.categoryTitle}>{t('deliveryPayment.title')}</h1>
            </div>
            <section className={s.section}>
                <div className={s.grid}>
                    {cards.map((card, index) => (
                        <div key={index} className={s.card}>
                            <div className={s.iconTitle}>
                                <img src={`/icons/${index === 0 ? 'np-icon.png' : index === 1 ? 'ukr-icon.png' : index === 2 ? 'apple-pay.svg' : 'bank-card.svg'}`} alt={card.title} />
                                <h3>{card.title}</h3>
                            </div>
                            <p>{card.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default DeliveryPage;