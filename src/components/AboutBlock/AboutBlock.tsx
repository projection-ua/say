import s from './AboutBlock.module.css';

const AboutBlock = () => {
    return (
        <section id="about" className={s.brandSection}>
            <div className={s.imageWrap}>
                <img
                    src="/images/about-image.jpg"
                    alt="Жінка в білизні"
                    className={s.image}
                />
            </div>

            <div className={s.content}>
                <div className={s.marker}>“</div>
                <p className={s.label}>Про наш бренд</p>
                <h2 className={s.title}>
                    SAY – ЦЕ БІЛЬШЕ, <br/>НІЖ БІЛИЗНА ЦЕ <br/> СМІЛИВІСТЬ СКАЗАТИ СВІТОВІ, ХТО ТИ Є
                </h2>
                <p className={s.description}>
                    Ми молодий бренд, створений для тих, хто говорить мовою чуттєвості та впевненості.
                    Кожен виріб – це поєднання ніжності та пристрасті, класики та сучасності.
                    <br/>
                    Ми не диктуємо правила, а даємо голос тим, хто хоче відчувати себе особливою.
                </p>
                <a href="/about" className={s.button}>ДЕТАЛЬНІШЕ</a>
            </div>
        </section>
    );
};

export default AboutBlock;

