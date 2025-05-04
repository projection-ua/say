import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import s from './Header.module.css';
import Loader from '../Loader/Loader'; // шлях змінюй залежно від структури
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setCartOpen } from '../../store/slices/cartSlice'; // якщо ти маєш екшен для відкриття Drawer
import { getCategoryBySlug } from '../../services/fethCategoryBySlug.ts'
import { WishlistPopup } from '../WishlistPopup/WishlistPopup';
import SearchModal from '../SearchModal/SearchModal.tsx'; // правильний імпорт
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher.tsx";

import { useTranslation } from 'react-i18next';



interface MenuItem {
    id: number;
    title: string;
    url: string;
    parent_id: string;
}

interface Menu {
    id: number;
    name: string;
    slug: string;
    items: MenuItem[];
}

const Header = () => {

    const { t } = useTranslation();

    const { i18n } = useTranslation();
    const langPrefix = i18n.language === 'ru' ? '/ru' : '';

    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

    const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const [mainMenuItems, setMainMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true); // 👈

    const [activeSubmenuId, setActiveSubmenuId] = useState<number | null>(null);

    const wishlist = useSelector((state: RootState) => state.wishlist.items);
    const [wishlistOpen, setWishlistOpen] = useState(false);


    const [isMobileNavOpen, setMobileNavOpen] = useState(false);

    const [openedSubmenuIds, setOpenedSubmenuIds] = useState<number[]>([]);

    const toggleSubmenu = (id: number) => {
        setOpenedSubmenuIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };



    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 150) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);




    const [wishlistAnimating, setWishlistAnimating] = useState(false);
    const [cartAnimating, setCartAnimating] = useState(false);

    useEffect(() => {
        if (wishlist.length === 0) return; // не анімувати при пустому
        setWishlistAnimating(true);
        const timeout = setTimeout(() => setWishlistAnimating(false), 500);
        return () => clearTimeout(timeout);
    }, [wishlist.length]);

    useEffect(() => {
        if (totalCartQuantity === 0) return; // не анімувати при пустому
        setCartAnimating(true);
        const timeout = setTimeout(() => setCartAnimating(false), 500);
        return () => clearTimeout(timeout);
    }, [totalCartQuantity]);






    const loadCategoryImage = async (slug: string) => {
        if (categoryImages[slug]) return; // якщо вже є, не грузимо повторно

        const data = await getCategoryBySlug(slug);
        if (Array.isArray(data) && data[0]?.image?.src) {
            setCategoryImages((prev) => ({ ...prev, [slug]: data[0].image.src }));
        }

        console.log(data);
    };

    useEffect(() => {
        mainMenuItems.forEach((item) => {
            const hasChildren = mainMenuItems.some((child) => child.parent_id === item.id.toString());
            if (hasChildren) {
                const slug = getLastSlug(item.url);
                loadCategoryImage(slug);
            }
        });
    }, [mainMenuItems]);


    const handleOpenCart = () => {
        dispatch(setCartOpen(true)); // якщо у тебе є action setCartOpen або щось подібне
    };

    const handleLinkClick = () => {
        setMobileNavOpen(false);
    };



    useEffect(() => {
        const fetchMenus = async () => {
            try {
                setLoading(true); // 👉 показуємо лоадер
                const response = await fetch('https://say.projection-learn.website/wp-json/responses/v1/menus');
                const data: Menu[] = await response.json();
                const mainMenu = data.find((menu) => menu.slug === 'main');
                if (mainMenu) {
                    setMainMenuItems(mainMenu.items);
                }
            } catch (error) {
                console.error('Failed to fetch menu:', error);
            } finally {
                setLoading(false); // 👉 ховаємо лоадер
            }
        };

        fetchMenus();
    }, []);


    const convertUrl = (url: string) => {
        try {
            const path = new URL(url, window.location.origin).pathname;
            const segments = path.split('/').filter(Boolean);
            const lastSlug = segments[segments.length - 1];

            // Перевірка, чи це справді категорія товару
            if (segments.includes('product-category')) {
                return `/product-category/${lastSlug}`;
            }

            // Інакше повертаємо звичайний шлях
            return `/${lastSlug}`;
        } catch (e) {
            console.warn('❗️convertUrl error:', e);
            return url;
        }
    };



    const getLastSlug = (url: string) => {
        const parts = new URL(url, window.location.origin).pathname.split('/').filter(Boolean);
        return parts[parts.length - 1];
    };


    const [isSearchOpen, setSearchOpen] = useState(false);



    return (
        <div className={s.wrapHeader}>
            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setSearchOpen(false)}
            />
            <div className={isSticky ? s.headerPlaceholder : ''}></div>
            <header className={`${s.header} ${isSticky ? s.sticky : ''}`}>
                <div className={s.container}>
                    <div className={s.topBar}>

                        <div className={s.left}>
                            <div className={s.menuMobileClick} onClick={() => setMobileNavOpen(true)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <rect x="12.0293" y="12.0293" width="7.10144" height="7.10144" stroke="white" strokeWidth="1.4" />
                                    <rect x="0.869141" y="12.0293" width="7.10144" height="7.10144" stroke="white" strokeWidth="1.4" />
                                    <rect x="0.869141" y="0.869141" width="7.10144" height="7.10144" stroke="white" strokeWidth="1.4" />
                                    <rect x="12.0293" y="0.869141" width="7.10144" height="7.10144" stroke="white" strokeWidth="1.4" />
                                </svg>
                            </div>
                            <div className={s.searchClick} onClick={() => setSearchOpen(true)}>
                                <svg className={s.icon} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </div>
                            <a href="tel:+380961212525" className={s.phone}>+38 (096) 121 25 25</a>
                        </div>


                        <Link to={`${langPrefix}`} className={s.logo}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="96" height="32" viewBox="0 0 96 32" fill="none">
                                <path d="M30.5619 0V9.71931H29.799C29.5517 7.85468 29.1084 6.36976 28.4681 5.26341C27.8288 4.15822 26.9178 3.28157 25.735 2.63112C24.5522 1.98184 23.3285 1.65719 22.0641 1.65719C20.634 1.65719 19.4512 2.09552 18.5168 2.97334C17.5813 3.85116 17.1147 4.84852 17.1147 5.96777C17.1147 6.8245 17.4098 7.60504 18.0012 8.30941C18.8539 9.34545 20.8813 10.7272 24.0856 12.4536C26.6985 13.8623 28.482 14.944 29.4386 15.6965C30.3939 16.45 31.13 17.3372 31.6455 18.3592C32.1611 19.3824 32.4189 20.4524 32.4189 21.5716C32.4189 23.6988 31.5965 25.533 29.9541 27.0741C28.3106 28.6153 26.1969 29.3853 23.612 29.3853C22.8001 29.3853 22.0373 29.3232 21.3222 29.1989C20.8953 29.1298 20.0123 28.8778 18.672 28.443C17.3317 28.0082 16.4825 27.7902 16.1244 27.7902C15.7663 27.7902 15.5085 27.8934 15.3102 28.1008C15.1107 28.3082 14.9626 28.736 14.8669 29.3853H14.104V19.7492H14.8669C15.2239 21.7662 15.7056 23.2757 16.311 24.2766C16.9164 25.2786 17.8403 26.1108 19.0849 26.7741C20.3295 27.4374 21.6943 27.7691 23.1792 27.7691C24.8975 27.7691 26.2552 27.3132 27.2526 26.4014C28.2499 25.4896 28.748 24.4125 28.748 23.1691C28.748 22.4788 28.559 21.7803 28.1811 21.0759C27.8032 20.3715 27.2153 19.7152 26.4174 19.1069C25.8808 18.6921 24.4169 17.8119 22.0244 16.4641C19.632 15.1175 17.9301 14.0428 16.9199 13.2423C15.9097 12.4407 15.1422 11.557 14.6208 10.5901C14.0982 9.62321 13.8369 8.55904 13.8369 7.39877C13.8369 5.38178 14.6068 3.64489 16.1465 2.18693C17.6863 0.73015 19.646 0.00117313 22.0244 0.00117313C23.5094 0.00117313 25.0841 0.368005 26.7475 1.09933C27.5174 1.44506 28.061 1.61735 28.3771 1.61735C28.734 1.61735 29.0268 1.51069 29.2543 1.29622C29.4806 1.08175 29.6637 0.650455 29.8013 0.00117313H30.5642L30.5619 0Z" fill="#003C3A"/>
                                <path d="M77.257 0.642286H87.2362V1.42635H86.688C86.3217 1.42635 85.7874 1.58925 85.084 1.9139C84.3807 2.23854 83.7403 2.70499 83.164 3.31325C82.5878 3.92151 81.8774 4.91067 81.0329 6.28073L74.1343 17.1966V24.4032C74.1343 26.1694 74.3315 27.2722 74.7246 27.7094C75.2588 28.3024 76.1033 28.6001 77.2558 28.6001H78.1843V29.3842H66.032V28.6001H67.0445C68.2541 28.6001 69.1115 28.2333 69.6189 27.4984C69.928 27.046 70.0831 26.0147 70.0831 24.4032V17.5986L62.2351 5.55878C61.3066 4.14536 60.6767 3.26285 60.3465 2.90891C60.0164 2.55614 59.3305 2.13188 58.29 1.6373C58.0089 1.49667 57.6007 1.42517 57.0664 1.42517V0.641113H69.3028V1.42517H68.6694C68.008 1.42517 67.4002 1.58105 66.845 1.89163C66.2898 2.2022 66.0121 2.66866 66.0121 3.29098C66.0121 3.79963 66.4414 4.71847 67.2988 6.04633L73.2688 15.3097L78.8807 6.44949C79.7241 5.12163 80.1464 4.13247 80.1464 3.48202C80.1464 3.08706 80.0437 2.73312 79.8407 2.42254C79.6366 2.11196 79.345 1.86819 78.9647 1.69122C78.5844 1.51425 78.0152 1.42635 77.2558 1.42635V0.642286H77.257Z" fill="#003C3A"/>
                                <path d="M63.159 31.1621C62.9035 31.1621 62.6469 31.1504 62.3938 31.1152C61.4687 30.9863 60.7315 30.6593 60.1798 30.1331C59.5406 29.5225 58.829 28.1935 58.0451 26.1437L48.3097 0.642334H47.5877L37.7496 25.8717C36.8969 28.088 36.12 29.5565 35.4189 30.2808C35.2253 30.4847 34.9022 30.6664 34.4473 30.8269C33.7929 31.0578 33.1 31.1621 32.4059 31.1645L0 31.2324L8.2645 31.9989H41.9571V31.1621C40.6098 31.0566 39.7326 30.8269 39.3267 30.473C38.9207 30.119 38.7178 29.7077 38.7178 29.2412C38.7178 28.6529 38.951 27.7645 39.4188 26.5738L41.3167 21.7358H52.1451L53.8365 26.1448C54.3859 27.577 54.6612 28.6236 54.6612 29.2869C54.6612 29.7839 54.4652 30.2069 54.0733 30.5527C53.6813 30.8996 52.929 31.1035 51.815 31.1633V32.0001H87.7355L96 31.2336L63.1578 31.1645L63.159 31.1621ZM41.9582 20.0622L46.8259 7.6731L51.57 20.0622H41.9582Z" fill="#003C3A"/>
                            </svg>
                        </Link>

                        <div className={s.right}>

                            <LanguageSwitcher />

                            <div className={s.iconBlock} onClick={() => setWishlistOpen(true)}>
                                <svg className={`${s.icon} ${wishlistAnimating ? s.pulse : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 22" fill="none">
                                    <path d="M12 22C11.6583 22 11.3289 21.8725 11.0722 21.6408C10.1027 20.7673 9.16791 19.9464 8.3432 19.2224L8.33899 19.2186C5.92108 17.0956 3.83313 15.2622 2.38037 13.4562C0.756409 11.4371 0 9.52279 0 7.4315C0 5.39963 0.676208 3.52511 1.90393 2.15299C3.1463 0.764638 4.85101 0 6.70459 0C8.08997 0 9.3587 0.451274 10.4755 1.34118C11.0391 1.79038 11.5499 2.34014 12 2.98139C12.4503 2.34014 12.9609 1.79038 13.5247 1.34118C14.6415 0.451274 15.9102 0 17.2956 0C19.149 0 20.8539 0.764638 22.0963 2.15299C23.324 3.52511 24 5.39963 24 7.4315C24 9.52279 23.2438 11.4371 21.6198 13.456C20.1671 15.2622 18.0793 17.0954 15.6617 19.2182C14.8356 19.9434 13.8994 20.7656 12.9276 21.6412C12.6711 21.8725 12.3415 22 12 22ZM6.70459 1.44853C5.24835 1.44853 3.91058 2.04734 2.93738 3.13477C1.94971 4.23862 1.4057 5.7645 1.4057 7.4315C1.4057 9.19038 2.04016 10.7634 3.46271 12.5319C4.83765 14.2414 6.88275 16.037 9.25067 18.1162L9.25507 18.12C10.0829 18.8469 11.0213 19.671 11.998 20.5509C12.9805 19.6693 13.9204 18.8439 14.7499 18.1159C17.1176 16.0367 19.1625 14.2414 20.5375 12.5319C21.9598 10.7634 22.5943 9.19038 22.5943 7.4315C22.5943 5.7645 22.0503 4.23862 21.0626 3.13477C20.0896 2.04734 18.7516 1.44853 17.2956 1.44853C16.2288 1.44853 15.2494 1.79793 14.3846 2.48691C13.6139 3.10119 13.077 3.87771 12.7623 4.42105C12.6004 4.70046 12.3155 4.86724 12 4.86724C11.6845 4.86724 11.3996 4.70046 11.2377 4.42105C10.9232 3.87771 10.3863 3.10119 9.61542 2.48691C8.75061 1.79793 7.77118 1.44853 6.70459 1.44853Z" fill="#0C1618"/>
                                </svg>
                                <div className={s.wrapTextIcon}>
                                    <span>{t('wishlist')}</span>
                                    <span className={s.countWhishlist}>({wishlist.length})</span>
                                </div>
                            </div>
                            <div className={s.iconBlock} onClick={handleOpenCart}>
                                <svg className={`${s.icon} ${cartAnimating ? s.pulse : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 24" fill="none">
                                    <path d="M20.3031 19.5623L18.2878 7.60509C18.1914 7.03493 17.8959 6.51745 17.4538 6.1447C17.0118 5.77196 16.4518 5.56812 15.8735 5.56947H14.9331V4.75522C14.9331 3.49405 14.4321 2.28455 13.5403 1.39277C12.6485 0.500995 11.439 0 10.1779 0C8.9167 0 7.70719 0.500995 6.81542 1.39277C5.92364 2.28455 5.42264 3.49405 5.42264 4.75522V5.56947H4.47812C3.89987 5.56812 3.3399 5.77196 2.89782 6.1447C2.45575 6.51745 2.16024 7.03493 2.06387 7.60509L0.0526703 19.5623C-0.0390483 20.108 -0.0107279 20.667 0.135659 21.2006C0.282047 21.7341 0.542982 22.2293 0.900293 22.6518C1.2576 23.0742 1.7027 23.4136 2.20459 23.6465C2.70648 23.8793 3.25309 24 3.80636 24H16.5494C17.1026 24 17.6492 23.8793 18.1511 23.6465C18.653 23.4136 19.0981 23.0742 19.4554 22.6518C19.8127 22.2293 20.0737 21.7341 20.2201 21.2006C20.3664 20.667 20.3948 20.108 20.3031 19.5623ZM6.64402 4.73486C6.64402 3.79763 7.01633 2.89878 7.67906 2.23606C8.34178 1.57333 9.24063 1.20102 10.1779 1.20102C11.1151 1.20102 12.0139 1.57333 12.6767 2.23606C13.3394 2.89878 13.7117 3.79763 13.7117 4.73486V5.54911H6.64402V4.73486ZM18.5239 21.8626C18.2812 22.1497 17.9788 22.3803 17.6377 22.5386C17.2967 22.6968 16.9253 22.7787 16.5494 22.7786H3.80636C3.43056 22.7792 3.05917 22.6977 2.71814 22.5398C2.37711 22.3819 2.07468 22.1514 1.83197 21.8645C1.58925 21.5776 1.41212 21.2411 1.31294 20.8787C1.21376 20.5162 1.19493 20.1364 1.25776 19.7659L3.25674 7.80458C3.30444 7.51632 3.45389 7.2547 3.67799 7.06721C3.90208 6.87972 4.18596 6.77878 4.47812 6.7827H5.41857V8.55776C5.41857 8.71972 5.48291 8.87506 5.59744 8.98958C5.71197 9.10411 5.8673 9.16845 6.02926 9.16845C6.19122 9.16845 6.34656 9.10411 6.46108 8.98958C6.57561 8.87506 6.63995 8.71972 6.63995 8.55776V6.7827H13.7117V8.55776C13.7117 8.71972 13.776 8.87506 13.8906 8.98958C14.0051 9.10411 14.1604 9.16845 14.3224 9.16845C14.4844 9.16845 14.6397 9.10411 14.7542 8.98958C14.8687 8.87506 14.9331 8.71972 14.9331 8.55776V6.7827H15.8776C16.1698 6.77878 16.4536 6.87972 16.6777 7.06721C16.9018 7.2547 17.0513 7.51632 17.099 7.80458L19.098 19.7659C19.16 20.1361 19.1407 20.5154 19.0416 20.8774C18.9425 21.2394 18.7659 21.5756 18.5239 21.8626Z" fill="black"/>
                                </svg>
                                <div className={s.wrapTextIcon}>
                                    <span>{t('cart.title')}</span>
                                    <span className={s.countCart}>({totalCartQuantity})</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <nav className={s.navBar}>
                        {loading ? (
                            <Loader />
                        ) : (
                            <ul className={s.menu}>
                                <li><Link to={`${langPrefix}/sales`}>{t('sales_menu')}</Link></li>
                                <li>
                                    <Link to={`${langPrefix}/new`}>
                                        {t('news_menu')} <sup className={s.new}>NEW</sup>
                                    </Link>
                                </li>

                                {mainMenuItems
                                    .filter((item) => item.parent_id === "0")
                                    .map((parent) => {
                                        const children = mainMenuItems.filter((child) => child.parent_id === parent.id.toString());
                                        const slug = getLastSlug(parent.url);

                                        return (
                                            <li
                                                key={parent.id}
                                                className={`${children.length > 0 ? s.hasSubmenu : ''} ${activeSubmenuId === parent.id ? s.active : ''}`}
                                                onMouseEnter={() => setActiveSubmenuId(parent.id)}
                                                onMouseLeave={() => setActiveSubmenuId(null)}
                                            >
                                                <Link to={`${langPrefix}${convertUrl(parent.url)}`}>
                                                    {parent.title}
                                                    <svg className={s.iconDown} xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none">
                                                        <path d="M0.799805 1L4.7998 5L8.7998 1" stroke="black" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </Link>

                                                {children.length > 0 && (
                                                    <ul className={`${s.submenu} ${activeSubmenuId === parent.id ? s.active : ''}`}>
                                                        <div className={s.contentSubMenu}>
                                                            <div className={s.itemsSubMeny}>
                                                                {children.map((child) => (
                                                                    <li key={child.id}>
                                                                        <Link to={`${langPrefix}${convertUrl(child.url)}`}>{child.title}</Link>
                                                                    </li>
                                                                ))}
                                                            </div>

                                                            <Link
                                                                to={`${langPrefix}/new?subcat=${slug}`}
                                                                className={s.newsBaner}
                                                            >
                                                                <span>{t('new_from_say')}</span>
                                                                {categoryImages[slug] && (
                                                                    <img
                                                                        src={categoryImages[slug]}
                                                                        alt={t('news_menu')}
                                                                        className={s.imgCategory}
                                                                        loading="lazy"
                                                                    />
                                                                )}
                                                            </Link>
                                                        </div>
                                                    </ul>
                                                )}
                                            </li>
                                        );
                                    })}
                            </ul>
                        )}
                    </nav>

                </div>
            </header>

            <div
                className={`${s.overlay} ${activeSubmenuId ? s.active : ''}`}
                onClick={() => setActiveSubmenuId(null)}
            />
            <WishlistPopup isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />


            <AnimatePresence>
                {isMobileNavOpen && (
                    <div className={s.mobileNavOverlay}>
                        <motion.div
                            className={s.mobileNavContent}
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <div className={s.topBarMenu}>
                                <h3>Меню</h3>
                                <button className={s.closeButton} onClick={() => setMobileNavOpen(false)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M1.26886 15.955L7.99997 9.22384L14.7311 15.955L15.9549 14.7311L9.22381 8L15.9549 1.26889L14.7311 0.0450475L7.99997 6.77616L1.26886 0.0450488L0.0450183 1.26889L6.77613 8L0.0450183 14.7311L1.26886 15.955Z" fill="#1A1A1A"/>
                                    </svg>
                                </button>
                            </div>

                            <nav className={s.mobileMenu}>
                                {loading ? (
                                    <Loader />
                                ) : (
                                    <ul className={s.menu}>
                                        <li>
                                            <Link to={`${langPrefix}/sales`} onClick={handleLinkClick}>
                                                {t('sales_menu')}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={`${langPrefix}/new`} onClick={handleLinkClick}>
                                                {t('news_menu')} <sup className={s.new}>NEW</sup>
                                            </Link>
                                        </li>

                                        {mainMenuItems
                                            .filter((item) => item.parent_id === "0")
                                            .map((parent) => {
                                                const children = mainMenuItems.filter(
                                                    (child) => child.parent_id === parent.id.toString()
                                                );
                                                const isOpen = openedSubmenuIds.includes(parent.id);

                                                return (
                                                    <li key={parent.id} className={s.mobileParentItem}>
                                                        <div className={s.parentRow}>
                                                            <Link
                                                                to={`${langPrefix}${convertUrl(parent.url)}`}
                                                                onClick={handleLinkClick}
                                                            >
                                                                {parent.title}
                                                            </Link>

                                                            {children.length > 0 && (
                                                                <button
                                                                    onClick={() => toggleSubmenu(parent.id)}
                                                                    className={s.submenuToggle}
                                                                >
                                                                    <svg
                                                                        className={isOpen ? s.arrowOpen : ''}
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        width="16"
                                                                        height="17"
                                                                        viewBox="0 0 16 17"
                                                                        fill="none"
                                                                    >
                                                                        <path
                                                                            d="M4 6.5L8 10.5L12 6.5"
                                                                            stroke="black"
                                                                            strokeWidth="1.33333"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>

                                                        {isOpen && children.length > 0 && (
                                                            <ul className={s.mobileSubmenu}>
                                                                {children.map((child) => (
                                                                    <li key={child.id}>
                                                                        <Link
                                                                            to={`${langPrefix}${convertUrl(child.url)}`}
                                                                            onClick={handleLinkClick}
                                                                        >
                                                                            {child.title}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                )}
                            </nav>

                            <div className={s.col}>
                                <a href="mailto:saylingerie11@gmail.com" className={s.contactEmail}>
                                    saylingerie11@gmail.com
                                </a>
                                <a href="tel:+380961212525" className={s.contactPhone}>
                                    +38 (096) 121 25 25
                                </a>
                                <p
                                    className={s.schedule}
                                    dangerouslySetInnerHTML={{ __html: t('time_work') }}
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            className={s.mobileNavBackdrop}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setMobileNavOpen(false)}
                        />
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Header;
