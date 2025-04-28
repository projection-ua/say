import s from './DeliveryAndPaymentPage.module.css';
import {Breadcrumbs} from "../../components/Breadcrumbs/Breadcrumbs.tsx";

export const DeliveryPage = () => {
    return (
        <div className={s.heroWrap}>
            <div
                className={s.heroBanner}
                style={{ backgroundImage: "url('/images/delivery-baner.jpg')" }}
            >
                    <Breadcrumbs
                        variant="catalog"
                        crumbs={[
                            { label: 'Головна', url: '/' },
                            { label: 'Доставка та Оплата' },
                        ]}
                    />
                <h1 className={s.categoryTitle}>Доставка та Оплата</h1>
            </div>
            <section className={s.section}>
                <div className={s.grid}>
                    {/* Нова Пошта */}
                    <div className={s.card}>
                        <div className={s.iconTitle}>
                            <img src="/icons/np-icon.png" alt="Нова Пошта" />
                            <h3>Доставка Новою Поштою по Україні</h3>
                        </div>
                        <p>
                            Ми молодий бренд, створений для тих, хто говорить мовою чуттєвості та впевненості.
                            Кожен виріб — це поєднання ніжності та пристрасті, класики та сучасності.
                            Ми не диктуємо правила, а даємо голос тим, хто хоче відчувати себе особливою.
                        </p>
                    </div>

                    {/* УкрПошта */}
                    <div className={s.card}>
                        <div className={s.iconTitle}>
                            <img src="/icons/ukr-icon.png" alt="УкрПошта" />
                            <h3>Доставка Укр Поштою по Україні</h3>
                        </div>
                        <p>
                            Бюджетний варіант доставки, який охоплює навіть найвіддаленіші населені пункти.
                            Відправлення здійснюється у відділення або кур’єром. Орієнтовний термін доставки – 3–7 днів
                        </p>
                    </div>

                    {/* Оплата онлайн */}
                    <div className={s.card}>
                        <div className={s.iconTitle}>
                            <img src="/icons/apple-pay.svg" alt="Apple Pay" />
                            <h3>Оплата онлайн</h3>
                        </div>
                        <p>
                            Можна сплатити замовлення картками Visa, MasterCard будь-якого банку,
                            а також через Приват24, Google Pay, Apple Pay. Платіж обробляється через
                            безпечний сервіс WayForPay, що гарантує сучасний рівень захисту та швидку авторизацію.
                        </p>
                    </div>

                    {/* Оплата за реквізитами */}
                    <div className={s.card}>
                        <div className={s.iconTitle}>
                            <img src="/icons/bank-card.svg" alt="Реквізити" />
                            <h3>Оплата за реквізитами</h3>
                        </div>
                        <p>
                            Можлива оплата за реквізитами із передоплатою 150 грн.
                            Після підтвердження замовлення менеджером ви сплачуєте аванс, а залишок — при отриманні посилки у відділенні пошти.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DeliveryPage;