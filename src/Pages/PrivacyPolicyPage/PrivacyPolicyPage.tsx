import React, { useEffect, useState } from 'react';
import s from './PrivacyPolicyPage.module.css';
import {Breadcrumbs} from "../../components/Breadcrumbs/Breadcrumbs.tsx";

interface PolicyItem {
    id: number;
    title: { rendered: string };
    table_data: { description: string }[];
}

export const PrivacyPolicy: React.FC = () => {
    const [policies, setPolicies] = useState<PolicyItem[]>([]);

    useEffect(() => {
        fetch('https://www.say.projection-learn.website/wp-json/wp/v2/privat_policy')
            .then((res) => res.json())
            .then((data: PolicyItem[]) => {
                // Повертаємо у зворотному порядку
                const reversed = [...data].reverse();
                setPolicies(reversed);
            });
    }, []);

    return (
        <>
            <div
                className={s.heroBanner}
                style={{ backgroundImage: "url('/images/policyBg.jpg')" }}
            >
                <Breadcrumbs
                    variant="catalog"
                    crumbs={[
                        { label: 'Головна', url: '/' },
                        { label: 'Політика конфіденційності' },
                    ]}
                />
                <h1 className={s.categoryTitle}>Політика конфіденційності</h1>
            </div>
            <div className={s.policyPage}>



                <p className={s.descMain}>Дана угода про конфіденційність розроблено відповідно до вимог Закону України «Про захист персональних даних» та інших нормативних актів українського законодавства, що регламентують правові відносини, пов'язані зі збором, обробкою, зберіганням персональних даних, а також правом громадян на невтручання в особисте життя та правом на самовираження.</p>
                <p className={s.descMain}>Інтернет-магазин «_______», піклуючись про розвиток взаємовідносин з клієнтами, розуміючи важливість забезпечення охорони Ваших персональних даних, з метою вирішення можливих протиріч і непорозумінь підготувало цю Угоду про конфіденційність (політику конфіденційності), далі за текстом - «Політика конфіденційності», і умови користування веб-сайтом Інтернет-магазину https://________, далі по тексту - «сайт». Будь ласка, уважно прочитайте дану сторінку, тому що інформація, викладена на ній є важливою для Вас як для Користувача сайту.</p>

                <div className={s.columns}>
                    {policies.map((block) => (
                        <div className={s.policyBlock} key={block.id}>
                            <details>
                                <summary className={s.policyTitle}>
                                    {block.title.rendered}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="9" viewBox="0 0 14 9" fill="none">
                                        <path opacity="0.75" d="M13 7.5L7 1.5L1 7.5" stroke="#0C1618" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
