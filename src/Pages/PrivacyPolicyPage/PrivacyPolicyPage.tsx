import React, { useEffect, useState } from 'react';
import s from './PrivacyPolicyPage.module.css';
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { useTranslation } from "react-i18next";
import {apiUrlWp} from "../../App.tsx";

interface PolicyItem {
    id: number;
    title: { rendered: string };
    table_data: { description: string }[];
}

export const PrivacyPolicy: React.FC = () => {
    const [policies, setPolicies] = useState<PolicyItem[]>([]);
    const { t, i18n } = useTranslation();
    const langPrefix = i18n.language === 'ua' ? '/ua' : i18n.language === 'ru' ? '/ru' : '';

    useEffect(() => {
        const lang = i18n.language === 'ru' ? 'ru' : '';

        const url = lang
            ? `${apiUrlWp}wp-json/wp/v2/privat_policy?lang=${lang}`
            : `${apiUrlWp}wp-json/wp/v2/privat_policy`;

        fetch(url)
            .then((res) => res.json())
            .then((data: PolicyItem[]) => {
                const reversed = [...data].reverse();
                setPolicies(reversed);
            })
            .catch((error) => {
                console.error('❌ Помилка при завантаженні політики:', error);
            });
    }, [i18n.language]);

    return (
        <>
            <div
                className={s.heroBanner}
                style={{ backgroundImage: "url('/images/policyBg.jpg')" }}
            >
                <Breadcrumbs
                    variant="catalog"
                    crumbs={[
                        { label: t('breadcrumbs.home'), url: `${langPrefix}/` },
                        { label: t('privacy.title') },
                    ]}
                />
                <h1 className={s.categoryTitle}>{t('privacy.title')}</h1>
            </div>
            <div className={s.policyPage}>
                <p className={s.descMain}>{t('privacy.paragraph1')}</p>
                <p className={s.descMain}>{t('privacy.paragraph2')}</p>

                <div className={s.columns}>
                    {policies.map((block) => (
                        <div className={s.policyBlock} key={block.id}>
                            <details>
                                <summary className={s.policyTitle}>
                                    {block.title.rendered}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="9" viewBox="0 0 14 9" fill="none">
                                        <path opacity="0.75" d="M13 7.5L7 1.5L1 7.5" stroke="#0C1618" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </summary>
                                <ul className={s.list}>
                                    {block.table_data.map((item, i) => (
                                        <li key={i} className={s.item}>
                                            {item.description}
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default PrivacyPolicy;
