import s from './AboutBlock.module.css';
import {useTranslation} from "react-i18next";

const AboutBlock = () => {

    const { t } = useTranslation();

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
                <p className={s.label}>{t('about_label')}</p>
                <h2
                    className={s.title}
                    dangerouslySetInnerHTML={{ __html: t('about_title') }}
                />
                <p
                    className={s.description}
                    dangerouslySetInnerHTML={{ __html: t('about_description') }}
                />
                <a href="/about" className={s.button}>{t('button_details')}</a>
            </div>
        </section>
    );
};

export default AboutBlock;

