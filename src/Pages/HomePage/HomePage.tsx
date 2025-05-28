import s from '../../assets/styles/main.module.css';
import SliderProducts from '../../components/SliderProducts/SliderProducts';
import HeroSlider from "../../components/OfferBlock/OfferBlock.tsx";
import CategoryGrid from '../../components/CategoryGrid/CategoryGrid';
import AboutBlock from "../../components/AboutBlock/AboutBlock.tsx";
import TipsBlock from "../../components/TipsBlock/TipsBlock.tsx";
import InstagramBlock from "../../components/InstagramBlock/InstagramBlock.tsx";

import {SlideData} from "../../App.tsx";

import { useTranslation } from 'react-i18next';

import { Helmet, HelmetProvider } from 'react-helmet-async';
import {useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import { API_BASE_URL } from '../../config/api';

export interface HomePageProps {
    slides: SlideData[];
}

const HomePage : React.FC <HomePageProps> = ({slides}) => {

    const { t, i18n } = useTranslation();

    const location = useLocation();
    const currentUrl = `${window.location.origin}${location.pathname}`;

    const [seoData, setSeoData] = useState<any>(null);

    useEffect(() => {
        const fetchSeo = async () => {
            const lang = i18n.language === 'ru' ? 'ru' : '';
            const url = `${API_BASE_URL}/page-seo?slug=main${lang ? `&lang=${lang}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();
            setSeoData(data);
        };
        fetchSeo();
    }, [i18n.language]);

    return (
        <div className={s.pageWrap}>
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

            <HeroSlider slides={slides}/>

            <div className={s.container}>
                <SliderProducts filterTag="sale" title={t('sales_block')} />
                <SliderProducts filterTag="new" title={t('news_menu')} />
                <CategoryGrid />
                <AboutBlock />
                <TipsBlock />
                <InstagramBlock />
            </div>
        </div>
    );
};

export default HomePage;
