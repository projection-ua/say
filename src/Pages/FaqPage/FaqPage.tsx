import { useEffect, useState } from 'react';
import s from './FaqPage.module.css'; // стиль створимо нижче
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs';

interface FaqItem {
    id: number;
    input_question: string;
    input_answer: string;
}

export const FaqPage = () => {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [openItem, setOpenItem] = useState<number | null>(null);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await fetch('https://www.say.projection-learn.website/wp-json/wp/v2/faq');
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