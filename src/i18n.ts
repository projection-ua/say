import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ua from './locales/ua/translation.json';
import ru from './locales/ru/translation.json';

i18n.use(initReactI18next).init({
    resources: {
        ua: { translation: ua },
        ru: { translation: ru }
    },
    lng: 'ua', // мова за замовчуванням
    fallbackLng: 'ua',
    interpolation: { escapeValue: false }
});

export default i18n;
