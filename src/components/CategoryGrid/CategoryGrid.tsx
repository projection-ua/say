import { useEffect, useState } from 'react';
import { getCategories, CategoryInfo } from '../../services/fetchCategories.ts';
import { Link } from 'react-router-dom';
import s from './CategoryGrid.module.css';

const CategoryGrid = () => {
    const [categories, setCategories] = useState<CategoryInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getCategories();
                const filtered = data.filter(
                    (cat) =>
                        cat.count > 0 &&
                        cat.parent === 0 && // ✅ Лише головні категорії
                        cat.name.toLowerCase() !== 'без категорії'
                );
                setCategories(filtered);
            } catch {
                setError('Не вдалося завантажити категорії');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);



    if (loading) return <p>Завантаження категорій...</p>;
    if (error) return <p className={s.error}>{error}</p>;

    return (
        <section className={s.categoryGridSection}>
            <h2 className={s.title}>Категорії</h2>
            <div className={s.grid}>
                {categories.map((cat) => (
                    <Link to={`/product-category/${cat.slug}`} key={cat.id} className={s.card}>
                        <div className={s.wrapImgCat}>
                            <img
                                src={cat.image?.src || '../public/images/category-img.jpg'}
                                alt={cat.image?.alt || cat.name}
                                className={s.image}
                            />
                            <svg className={s.arrowCat} width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="1" y="1" width="54" height="54" rx="11" fill="#FFFEFC"/>
                                <rect x="1" y="1" width="54" height="54" rx="11" stroke="#003C3A" stroke-width="2"/>
                                <path d="M23 33L33 23M33 23H23M33 23V33" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div className={s.meta}>
                            <span className={s.count}>{cat.count} товарів</span>
                            <h3 className={s.catTitle}>{cat.name}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default CategoryGrid;
