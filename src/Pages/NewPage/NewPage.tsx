import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { getProducts } from '../../services/fetchProducts';
import { getCategories, CategoryInfo } from '../../services/fetchCategories.ts';
import { ProductInfo } from '../../types/productTypes';
import ProductItem from '../../components/ProductItem/ProductItem';
import s from '../CategoryPage/CategoryPage.module.css';
import CatalogFilters from '../../components/CatalogFilters/CatalogFilters';
import Loader from '../../components/Loader/Loader';

const NewPage = () => {
    const { slug } = useParams();
    const [products, setProducts] = useState<ProductInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [subcategories, setSubcategories] = useState<CategoryInfo[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();

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
            if (options.length > 0) {
                params[`attr_${attr}`] = options.join(',');
            }
        });

        params.min = String(priceRange.min);
        params.max = String(priceRange.max);

        setSearchParams(params);
    };

    const resetFilters = () => {
        setSelectedSubcategory(null);
        setSelectedAttributes({});
        setPriceRange({ min: 0, max: 10000 });
        setSearchParams({});
    };

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
                options.forEach((opt) => attributesMap[name].add(opt));
            });
        });
        return Object.entries(attributesMap).map(([name, options]) => ({
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'), // ← генеруємо slug
            options: Array.from(options),
        }));
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            if (selectedSubcategory) {
                const hasSubcategory = product.categories?.some(cat => cat.slug === selectedSubcategory);
                if (!hasSubcategory) return false;
            }
            const hasActiveAttributes = Object.values(selectedAttributes).some(options => options.length > 0);
            if (hasActiveAttributes) {
                for (const [attrName, selectedOptions] of Object.entries(selectedAttributes)) {
                    if (!selectedOptions.length) continue;
                    const productAttr = product.attributes.find(attr => attr.name === attrName);
                    if (!productAttr || !selectedOptions.some(opt => productAttr.options.includes(opt))) {
                        return false;
                    }
                }
            }
            const price = parseFloat(product.price);
            if (price < priceRange.min || price > priceRange.max) return false;
            return true;
        });
    }, [products, selectedSubcategory, selectedAttributes, priceRange]);

    const visibleProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 18);
    };

    return (
        <div className={s.categoryPage}>
            <div
                className={s.heroBanner}
                style={{ backgroundImage: `url('/images/offer-img.jpg')` }}
            >
                <h1 className={s.categoryTitle}>Новинки</h1>
            </div>

            <div className={s.container}>

                <div className={s.contentWrapper}>
                    <div className={s.filtersHeader}>
                        <h3 className={s.titleFilter}>Фільтр</h3>
                    </div>

                    <div className={s.productListWrapper}>
                        <div className={s.sortingBar}>
                            <CatalogFilters
                                subcategories={subcategories}
                                allAttributes={allAttributes}
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

                        <div className={s.productGrid}>
                            {loading ? (
                                <Loader />
                            ) : visibleProducts.length ? (
                                <>
                                    {visibleProducts.map((product) => (
                                        <ProductItem key={product.id} product={product} />
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
        </div>
    );
};

export default NewPage;