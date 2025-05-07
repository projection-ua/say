import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { getProducts } from '../../services/fetchProducts';
import { getCategories } from '../../services/fetchCategories.ts';
import { CategoryInfo } from '../../types/categoryTypes.ts';
import { ProductInfo } from '../../types/productTypes';
import ProductItem from '../../components/ProductItem/ProductItem';
import s from '../CategoryPage/CategoryPage.module.css';
import CatalogFilters from '../../components/CatalogFilters/CatalogFilters';
import Loader from '../../components/Loader/Loader';


import { Helmet, HelmetProvider } from 'react-helmet-async';
import {apiUrlWp} from "../../App.tsx";
import {useLocation} from "react-router-dom";


const NewPage = () => {
    const { slug } = useParams();
    const [products, setProducts] = useState<ProductInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [subcategories, setSubcategories] = useState<CategoryInfo[]>([]);


    const [searchParams, setSearchParams] = useSearchParams();

    const location = useLocation();
    const currentUrl = `${window.location.origin}${location.pathname}`;

    const [seoData, setSeoData] = useState<any>(null);

    useEffect(() => {
        const fetchSeo = async () => {
            const response = await fetch(`${apiUrlWp}wp-json/wp/v2/pages?slug=news`);
            const data = await response.json();
            setSeoData(data[0]?.yoast_head_json);
        };

        fetchSeo();
    }, []);



    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortOption, setSortOption] = useState(() => searchParams.get('sort') || 'default');




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







    const [visibleCount, setVisibleCount] = useState(18);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const allProducts = await getProducts();
                const categories = await getCategories();

                const current = slug ? categories.find(cat => cat.slug === slug) || null : null;

                const children = slug
                    ? categories.filter(cat => cat.parent === current?.id && cat.name.toLowerCase() !== 'без категорії')
                    : categories.filter(cat => cat.parent === 0 && cat.name.toLowerCase() !== 'без категорії');
                setSubcategories(children);

                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const newProductsThisMonth = allProducts.filter((product) => {
                    if (!product.date_created) return false;
                    const createdDate = new Date(product.date_created);
                    return (
                        createdDate.getMonth() === currentMonth &&
                        createdDate.getFullYear() === currentYear
                    );
                }).slice(0, 18);

                const filtered = newProductsThisMonth.length >= 1
                    ? newProductsThisMonth
                    : [...allProducts]
                        .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
                        .slice(0, 16);
                setProducts(filtered);
            } catch (error) {
                console.error('Помилка при завантаженні категорії або продуктів:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

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
            slug: name.toLowerCase().replace(/\s+/g, '-'), // ← генеруємо slug
            options: Array.from(options),
        }));
    }, [products]);



    const visibleProducts = useMemo(() => {
        return sortedProducts.slice(0, visibleCount);
    }, [sortedProducts, visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 18);
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
                <title>{seoData?.title || 'Say'}</title>
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
                style={{ backgroundImage: `url('/images/offer-img.jpg')` }}
            >
                <h1 className={s.categoryTitle}>Новинки</h1>
            </div>

            <div className={s.container}>

                <div className={s.contentWrapper}>
                    <div className={s.filtersTop}>
                        {isMobile && (
                            <button className={s.filterButton} onClick={() => setIsFilterOpen(true)}>
                                <svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.83333 15.625H13.1667V13.75H9.83333V15.625ZM4 4.375V6.25H19V4.375H4ZM6.5 10.9375H16.5V9.0625H6.5V10.9375Z" fill="black" />
                                </svg>
                                Фільтр
                            </button>
                        )}
                        {!isMobile && (
                            <div className={s.filtersHeader}>
                                <h3 className={s.titleFilter}>Фільтр</h3>
                            </div>
                        )}

                        <div className={`${s.sortWrapper} ${isSortOpen ? s.active : ''}`}>
                            <button className={s.sortButton} onClick={() => setIsSortOpen(prev => !prev)}>
                                Сортування
                                <span className={s.arrow}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="9" viewBox="0 0 16 9" fill="none">
                                      <path d="M2 2L8 8L14 2" stroke="#1A1A1A" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
                                    </svg>
                                </span>
                            </button>

                            {isSortOpen && (
                                <div className={s.sortDropdown}>
                                    <button onClick={() => handleSortChange('bestsellers')}>Бестселери</button>
                                    <button onClick={() => handleSortChange('new')}>Новинки</button>
                                    <button onClick={() => handleSortChange('sale')}>Акційні товари</button>
                                    <button onClick={() => handleSortChange('price_desc')}>Ціна за зменшенням</button>
                                    <button onClick={() => handleSortChange('price_asc')}>Ціна за зростанням</button>
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
                                    <button onClick={applyFilters} className={s.applyBtn}>Застосувати фільтри</button>
                                    <button onClick={resetFilters} className={s.resetBtn}>Скинути всі налаштування</button>
                                </div>
                            </div>
                        )}

                        <div className={s.productGrid}>
                            {loading ? (
                                <Loader />
                            ) : visibleProducts.length ? (
                                <>
                                    {visibleProducts.map((product, index) => (
                                        <ProductItem key={`${product.id}-${index}`} product={product} />
                                    ))}
                                    {visibleProducts.length < filteredProducts.length && (
                                        <div className={s.loadMoreWrapper}>
                                            <button className={s.loadMoreBtn} onClick={handleLoadMore}>
                                                Завантажити ще
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p>Товари не знайдено.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isMobile && isFilterOpen && (
                <div className={s.popupOverlay}>
                    <div className={s.popupContent}>
                        <div className={s.popupHeader}>
                            <h3>Фільтри</h3>
                            <button className={s.closeButton} onClick={() => setIsFilterOpen(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M1.26837 15.955L7.99948 9.22384L14.7306 15.955L15.9544 14.7311L9.22332 8L15.9544 1.26889L14.7306 0.0450475L7.99948 6.77616L1.26837 0.0450488L0.04453 1.26889L6.77564 8L0.04453 14.7311L1.26837 15.955Z" fill="#1A1A1A"/>
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
                            <button onClick={applyFilters} className={s.applyBtn}>Застосувати фільтри</button>
                            <button onClick={resetFilters} className={s.resetBtn}>Скинути всі налаштування</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default NewPage;