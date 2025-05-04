import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import s from './LanguageSwitcher.module.css'; // свій CSS

const LanguageSwitcher = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const isRu = location.pathname.startsWith('/ru');
    const currentLang = isRu ? 'RU' : 'UA';

    const switchTo = (lang: string) => {
        if (lang === 'ru' && !isRu) {
            navigate('/ru' + location.pathname + location.search);
        } else if (lang === 'ua' && isRu) {
            const newPath = location.pathname.replace('/ru', '') || '/';
            navigate(newPath + location.search);
        }
        setOpen(false);
    };

    return (
        <div className={s.dropdown}>
            <button onClick={() => setOpen(prev => !prev)}>
                {currentLang}
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="black" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            {open && (
                <ul className={s.menu}>
                    <li onClick={() => switchTo('ua')}>UA</li>
                    <li onClick={() => switchTo('ru')}>RU</li>
                </ul>
            )}
        </div>
    );
};

export default LanguageSwitcher;
