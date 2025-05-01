import { Link } from 'react-router-dom';
import s from './NotFoundPage.module.css';
import {Breadcrumbs} from "../Breadcrumbs/Breadcrumbs.tsx"; // стилі винесемо в окремий CSS

export const NotFoundPage = () => {
    return (
        <div className={s.container}>

            <div className={s.sectionError}>
                <div className={s.imageSection}>
                    <Breadcrumbs
                        variant="catalog"
                        crumbs={[
                            { label: 'Головна', url: '/' },
                            { label: 'Сторінка 404' },
                        ]}
                    />
                    <img
                        src="/images/404_bg.jpg" // заміни на потрібний URL
                        alt="Not found"
                        className={s.image}
                    />
                </div>
                <div className={s.contentSection}>
                    <svg className={s.firstSvg} xmlns="http://www.w3.org/2000/svg" width="129" height="134" viewBox="0 0 129 134" fill="none">
                        <path opacity="0.05" d="M42.6109 0L30.9366 67.2926H48.448V134H0V67.2926L17.5113 0H42.6109ZM123.163 0L111.489 67.2926H129V134H80.552V67.2926L98.0633 0H123.163Z" fill="#FFFEFC"/>
                    </svg>
                    <h1 className={s.errorCode}>404</h1>
                    <p className={s.errorText}>Сторінку не знайдено</p>
                    <p className={s.subText}>
                        Онови сторінку або повернися назад — і давай почнемо все спочатку
                    </p>
                    <Link to="/" className={s.button}>
                        НА ГОЛОВНУ
                    </Link>
                    <svg className={s.lastSvg} xmlns="http://www.w3.org/2000/svg" width="129" height="134" viewBox="0 0 129 134" fill="none">
                        <path opacity="0.05" d="M86.3891 0L98.0634 67.2926H80.552V134H129V67.2926L111.489 0H86.3891ZM5.83712 0L17.5113 67.2926H0V134H48.448V67.2926L30.9367 0H5.83712Z" fill="#FFFEFC"/>
                    </svg>
                </div>
            </div>

        </div>
    );
};

export default NotFoundPage;
