import { useEffect, useState, useMemo } from 'react';
import {Link, useSearchParams, useParams, useLocation, useNavigate} from 'react-router-dom';
import { getProducts } from '../../services/fetchProducts';
import { getCategories } from '../../services/fetchCategories.ts';
import { CategoryInfo } from '../../types/categoryTypes.ts';
import { ProductInfo } from '../../types/productTypes';
import ProductItem from '../../components/ProductItem/ProductItem';
import s from './CategoryPage.module.css';
import CatalogFilters from '../../components/CatalogFilters/CatalogFilters';
import Loader from '../../components/Loader/Loader';
import { Breadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs.tsx';

import { Helmet, HelmetProvider } from 'react-helmet-async';
import {apiUrlWp, consumerKey, consumerSecret} from "../../App.tsx";
import {useTranslation} from "react-i18next";

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

const CategoryPage = () => {
    const { slug } = useParams();

    const { t, i18n } = useTranslation();
    const langPrefix = i18n.language === '' ? '/' : i18n.language === 'ru' ? '/ru' : '';
    const navigate = useNavigate();

    const location = useLocation();
    const currentUrl = `${window.location.origin}${location.pathname}`;

    const [seoData, setSeoData] = useState<any>(null);

    useEffect(() => {
        const fetchSeo = async () => {
            const lang = i18n.language === 'ua' || i18n.language === 'uk' ? '' : `&lang=${i18n.language}`;
            const response = await fetch(`${apiUrlWp}wp-json/wp/v2/categories?slug=${slug}${lang}`);
            const data = await response.json();
            setSeoData(data[0]?.yoast_head_json);
        };

        fetchSeo();
    }, [slug, i18n.language]);



    const [products, setProducts] = useState<ProductInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState<CategoryInfo | null>(null);
    const [subcategories, setSubcategories] = useState<CategoryInfo[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const isMobile = useIsMobile();

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(18);

    const [selectedSubcategory, setSelectedSubcategory] = useState(() => searchParams.get('subcat') || null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>(() => {
        const result: Record<string, string[]> = {};
        searchParams.forEach((value, key) => {
            if (key.startsWith('attr_')) {
                result[key.replace('attr_', '')] = value.split(',');
            }
        });
        return result;
    });
    const [priceRange, setPriceRange] = useState({
        min: parseFloat(searchParams.get('min') || '0'),
        max: parseFloat(searchParams.get('max') || '10000'),
    });
    const [sortOption, setSortOption] = useState(() => searchParams.get('sort') || 'default');


    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        if (!category?.translations || hasRedirected) return;

        const newLang = i18n.language === 'ua' ? 'uk' : i18n.language;
        const translatedId = category.translations[newLang];

        if (!translatedId || category.id === translatedId) return;

        const fetchTranslatedCategory = async () => {
            try {
                const authHeader = 'Basic ' + btoa(`${consumerKey}:${consumerSecret}`);

                const response = await fetch(
                    `${apiUrlWp}wp-json/wc/v3/products/categories/${translatedId}?lang=${newLang}`,
                    {
                        headers: {
                            'Authorization': authHeader,
                        },
                    }
                );

                const data = await response.json();

                if (data?.slug) {
                    const langPrefix = newLang === 'ru' ? '/ru' : ''; // + '/ua' якщо треба
                    const newUrl = `${langPrefix}/product-category/${data.slug}`;
                    const currentPath = window.location.pathname.replace(/\/$/, '');
                    const targetPath = newUrl.replace(/\/$/, '');

                    if (currentPath !== targetPath) {
                        console.log('🔄 Перенаправлення категорії на:', targetPath);
                        setHasRedirected(true);
                        navigate(newUrl); // 🚀 SPA редірект
                    } else {
                        console.log('✅ Вже на правильній сторінці категорії');
                    }
                }

            } catch (error) {
                console.error('Помилка при завантаженні перекладу категорії:', error);
            }
        };

        fetchTranslatedCategory();
    }, [i18n.language, category, hasRedirected]);



    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const lang = i18n.language === 'ua' ? 'uk' : i18n.language;

                const [allProducts, categories] = await Promise.all([
                    getProducts(lang),
                    getCategories(lang),
                ]);

                console.log(`✅ Завантажено ${allProducts.length} продуктів`);
                console.log(`✅ Завантажено ${categories.length} категорій`);

                const current = slug ? categories.find(cat => cat.slug === slug) || null : null;
                setCategory(current);

                const children = slug
                    ? categories.filter(cat =>
                        cat.parent === current?.id &&
                        cat.name.toLowerCase() !== 'без категорії'
                    )
                    : categories.filter(cat =>
                        cat.parent === 0 &&
                        cat.name.toLowerCase() !== 'без категорії'
                    );

                setSubcategories(children);

                console.log('🔎 current:', current);
                console.log('🔎 current id:', current?.id);
                console.log('🔎 categories:', categories);

                const filtered = slug
                    ? allProducts.filter(product =>
                        product.categories?.some(cat => cat.slug === slug)
                    )
                    : allProducts;

                setProducts(filtered);
            } catch (error) {
                console.error('❌ Помилка при завантаженні категорії або продуктів:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, i18n.language]);



    const allAttributes = useMemo(() => {
        const attributesMap: Record<string, Set<string>> = {};
        products.forEach((product) => {
            product.attributes.forEach(({ name, options }) => {
                if (!attributesMap[name]) attributesMap[name] = new Set();
                options.forEach((opt) => attributesMap[name].add(opt.name));
            });
        });
        return Object.entries(attributesMap).map(([name, options]) => ({
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            options: Array.from(options),
        }));
    }, [products]);

    const filteredProducts = useMemo(() => {
        const catalogProducts = products.filter(p => !p.hiddenInCatalog); // 👈 фільтр прихованих

        return catalogProducts.filter((product) => {
            if (selectedSubcategory) {
                const hasSubcategory = product.categories?.some(cat => cat.slug === selectedSubcategory);
                if (!hasSubcategory) return false;
            }

            const hasActiveAttributes = Object.values(selectedAttributes).some(options => options.length > 0);
            if (hasActiveAttributes) {
                for (const [attrName, selectedOptions] of Object.entries(selectedAttributes)) {
                    if (!selectedOptions.length) continue;

                    if (attrName === 'Колір') {
                        if (!selectedOptions.includes(product.colorName)) {
                            return false;
                        }
                    } else {
                        const productAttr = product.attributes.find(attr => attr.name === attrName);
                        if (!productAttr) return false;

                        const hasOption = selectedOptions
                            .filter((opt: string): opt is string => typeof opt === 'string')
                            .some((opt: string) =>
                                productAttr.options.some(o => o.name === opt)
                            );

                        if (!hasOption) return false;
                    }

                }
            }

            const price = parseFloat(product.price);
            if (price < priceRange.min || price > priceRange.max) return false;

            return true;
        });
    }, [products, selectedSubcategory, selectedAttributes, priceRange]);


    const sortedProducts = useMemo(() => {
        let sorted = [...filteredProducts];
        if (sortOption === 'bestsellers') {
            sorted = sorted.filter(product => product.featured);
        }
        if (sortOption === 'new') {
            sorted = sorted.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());
        }
        if (sortOption === 'sale') {
            sorted = sorted.filter(product => parseFloat(product.sale_price) < parseFloat(product.regular_price));
        }
        if (sortOption === 'price_asc') {
            sorted = sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        }
        if (sortOption === 'price_desc') {
            sorted = sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        }
        return sorted;
    }, [filteredProducts, sortOption]);

    const visibleProducts = useMemo(() => {
        return sortedProducts.slice(0, visibleCount);
    }, [sortedProducts, visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 18);
    };

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (selectedSubcategory) params.subcat = selectedSubcategory;
        Object.entries(selectedAttributes).forEach(([attr, options]) => {
            if (options.length > 0) params[`attr_${attr}`] = options.join(',');
        });
        params.min = String(priceRange.min);
        params.max = String(priceRange.max);
        if (sortOption !== 'default') {
            params.sort = sortOption;
        }

        setSearchParams(params);
        if (isMobile) setIsFilterOpen(false);
    };

    const resetFilters = () => {
        setSelectedSubcategory(null);
        setSelectedAttributes({});
        setPriceRange({ min: 0, max: 10000 });
        setSearchParams({});
    };

    const handleSortChange = (option: string) => {
        setSortOption(option);
        setIsSortOpen(false);

        const params = new URLSearchParams(searchParams);
        if (option === 'default') {
            params.delete('sort');
        } else {
            params.set('sort', option);
        }
        setSearchParams(params);
    };



    const allAttributeColors = Array.from(new Set(
        products
            .filter(p => !!p.colorName)
            .map(p => ({
                id_variations: {
                    variation_id: p.variation_id,
                    variation_atribute_color: p.colorName,
                    variation_slug: p.slug,
                },
            }))
            .filter(c => c.id_variations.variation_atribute_color)
            .map(c => c.id_variations.variation_atribute_color)
    )).map(colorName => ({
        id_variations: {
            variation_id: 0, // це опціонально якщо не треба id
            variation_atribute_color: colorName,
            variation_slug: '', // теж якщо потрібно
        },
    }));






    return (
        <div className={s.categoryPage}>
            <HelmetProvider>
            <Helmet>
                <title>{category?.name}</title>
                <link rel="canonical" href={currentUrl} />

                {seoData?.og_title && <meta property="og:title" content={seoData.og_title} />}
                {seoData?.og_description && <meta property="og:description" content={seoData.og_description} />}
                <meta property="og:url" content={currentUrl} />

                {seoData?.og_locale && <meta property="og:locale" content={seoData.og_locale} />}
                {seoData?.og_type && <meta property="og:type" content={seoData.og_type} />}
                {seoData?.og_site_name && <meta property="og:site_name" content={seoData.og_site_name} />}
                {seoData?.twitter_card && <meta name="twitter:card" content={seoData.twitter_card} />}

                <meta
                    name="robots"
                    content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
                />
            </Helmet>
            </HelmetProvider>


            <div
                className={s.heroBanner}
                style={{ backgroundImage: `url(${category?.image?.src || '/images/category-placeholder.jpg'})` }}
            >
                {category && (
                    <Breadcrumbs
                        variant="catalog"
                        crumbs={[
                            { label: 'Головна', url: `${langPrefix}/` },
                            { label: category?.name || 'Каталог' },
                        ]}
                    />
                )}
                <h1 className={s.categoryTitle}>{category?.name || 'Каталог'}</h1>
            </div>

            <div className={s.container}>
                {subcategories.length > 0 && (
                    <div className={s.subcategories}>
                        {subcategories.map((subcategory) => (
                            <Link
                                to={`${langPrefix}/product-category/${subcategory.slug}`}
                                key={subcategory.id}
                                className={s.subcategoryCard}
                            >
                                <img
                                    src={subcategory.image?.src || '/images/category-placeholder.jpg'}
                                    alt={subcategory.name}
                                    className={s.subcategoryImage}
                                />
                                <p className={s.subcategoryName}>{subcategory.name}</p>
                            </Link>
                        ))}
                    </div>
                )}

                <div className={s.contentWrapper}>
                    <div className={s.filtersTop}>
                        {isMobile && (
                            <button className={s.filterButton} onClick={() => setIsFilterOpen(true)}>
                                <svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.83333 15.625H13.1667V13.75H9.83333V15.625ZM4 4.375V6.25H19V4.375H4ZM6.5 10.9375H16.5V9.0625H6.5V10.9375Z" fill="black" />
                                </svg>
                                {t('title_filter')}
                            </button>
                        )}
                        {!isMobile && (
                            <div className={s.filtersHeader}>
                                <h3 className={s.titleFilter}>{t('title_filter')}</h3>
                            </div>
                        )}

                        <div className={`${s.sortWrapper} ${isSortOpen ? s.active : ''}`}>
                            <button className={s.sortButton} onClick={() => setIsSortOpen(prev => !prev)}>
                                {t('sort_heading')}
                                <span className={s.arrow}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="9" viewBox="0 0 16 9" fill="none">
                                      <path d="M2 2L8 8L14 2" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                            </button>

                            {isSortOpen && (
                                <div className={s.sortDropdown}>
                                    <button onClick={() => handleSortChange('bestsellers')}>{t('sort.bestsellers')}</button>
                                    <button onClick={() => handleSortChange('new')}>{t('sort.new')}</button>
                                    <button onClick={() => handleSortChange('sale')}>{t('sort.sale')}</button>
                                    <button onClick={() => handleSortChange('price_desc')}>{t('sort.price_desc')}</button>
                                    <button onClick={() => handleSortChange('price_asc')}>{t('sort.price_asc')}</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={s.productListWrapper}>
                        {!isMobile && (
                            <div className={s.sortingBar}>
                                <CatalogFilters
                                    subcategories={subcategories}
                                    allAttributes={allAttributes}
                                    attributeColor={allAttributeColors}
                                    priceRange={priceRange}
                                    selectedSubcategory={selectedSubcategory}
                                    selectedAttributes={selectedAttributes}
                                    onChangeSubcategory={setSelectedSubcategory}
                                    onChangeAttributes={setSelectedAttributes}
                                    onChangePrice={setPriceRange}
                                />
                                <div className={s.buttons}>
                                    <button onClick={applyFilters} className={s.applyBtn}>{t('filters.apply')}</button>
                                    <button onClick={resetFilters} className={s.resetBtn}>{t('filters.reset')}</button>
                                </div>
                            </div>
                        )}

                        <div className={s.wrapProducts}>
                            <div className={s.productGrid}>
                                {loading ? (
                                    <Loader />
                                ) : visibleProducts.length ? (
                                    visibleProducts.map((product, index) => (
                                        <ProductItem key={`${product.id}-${index}`} product={product} />
                                    ))
                                ) : (
                                    <p>Товари не знайдено.</p>
                                )}
                            </div>
                            {!loading && visibleProducts.length < sortedProducts.length && (
                                <div className={s.loadMoreWrapper}>
                                    <button className={s.loadMoreBtn} onClick={handleLoadMore}>
                                        {t('loadMore')}
                                    </button>
                                </div>
                            )}
                        </div>


                    </div>
                </div>
            </div>

            {isMobile && isFilterOpen && (
                <div className={s.popupOverlay}>
                    <div className={s.popupContent}>
                        <div className={s.popupHeader}>
                            <h3>{t('title_filter')}</h3>
                            <button className={s.closeButton} onClick={() => setIsFilterOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M1.26935 15.955L8.00046 9.22384L14.7316 15.955L15.9554 14.7311L9.2243 8L15.9554 1.26889L14.7316 0.0450475L8.00046 6.77616L1.26935 0.0450488L0.0455065 1.26889L6.77662 8L0.0455065 14.7311L1.26935 15.955Z" fill="#1A1A1A"/>
                                </svg>
                            </button>
                        </div>

                        <CatalogFilters
                            subcategories={subcategories}
                            allAttributes={allAttributes}
                            attributeColor={allAttributeColors}
                            priceRange={priceRange}
                            selectedSubcategory={selectedSubcategory}
                            selectedAttributes={selectedAttributes}
                            onChangeSubcategory={setSelectedSubcategory}
                            onChangeAttributes={setSelectedAttributes}
                            onChangePrice={setPriceRange}
                        />
                        <div className={s.popupButtons}>
                            <button onClick={applyFilters} className={s.applyBtn}>{t('filters.apply')}</button>
                            <button onClick={resetFilters} className={s.resetBtn}>{t('filters.reset')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
