import React, { useEffect, useState } from 'react';
import s from './PrivacyPolicyPage.module.css';
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from '../../config/api';

interface PolicyItem {
    id: number;
    title: { rendered: string };
    content: { rendered: string };
}

export const PrivacyPolicy: React.FC = () => {
    const [policies, setPolicies] = useState<PolicyItem[]>([]);
    const { t, i18n } = useTranslation();
    const langPrefix = i18n.language === 'ua' ? '/ua' : i18n.language === 'ru' ? '/ru' : '';

    useEffect(() => {
        const lang = i18n.language === 'ru' ? 'ru' : '';
        const url = `${API_BASE_URL}/privacy-policy${lang ? `?lang=${lang}` : ''}`;
        fetch(url)
            .then((res) => res.json())
            .then((data: PolicyItem[] | any) => {
                if (Array.isArray(data)) {
                    const reversed = [...data].reverse();
                    setPolicies(reversed);
                } else {
                    setPolicies([]);
                    console.error('❌ Очікувався масив, але отримано:', data);
                }
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
                                <div
                                    className={s.item}
                                    dangerouslySetInnerHTML={{ __html: block.content.rendered }}
                                />
                            </details>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default PrivacyPolicy;
