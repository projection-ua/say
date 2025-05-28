import React, { useState, useEffect, useRef } from 'react';
import s from './SearchModal.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ProductInfo } from '../../types/productTypes';
import { CategoryInfo } from '../../types/categoryTypes';
import { API_BASE_URL } from '../../config/api';
import { useTranslation } from 'react-i18next';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const SearchModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState<ProductInfo[]>([]);
    const [categories, setCategories] = useState<CategoryInfo[]>([]);
    const modalRef = useRef<HTMLDivElement>(null);

    const { t, i18n } = useTranslation();
    const lang = i18n.language === 'ua' ? 'uk' : i18n.language;
    const langPrefix = i18n.language === 'ru' ? '/ru' : '';

    // Пошук продуктів і категорій
    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setProducts([]);
                setCategories([]);
                return;
            }

            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/products?search=${encodeURIComponent(query)}&per_page=4&lang=${lang}`)
                        .then(res => res.json()),
                    fetch(`${API_BASE_URL}/products/categories?search=${encodeURIComponent(query)}&per_page=3&lang=${lang}`)
                        .then(res => res.json()),
                ]);

                setProducts(productsRes);
                setCategories(categoriesRes);
            } catch (error) {
                console.error('Помилка пошуку:', error);
            }
        };

        const delay = setTimeout(fetchResults, 300); // debounce 300ms
        return () => clearTimeout(delay);
    }, [query, lang]);

    // Закриття при кліку поза модалкою або натисканні Escape
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={s.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={s.modal}
                        ref={modalRef}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className={s.header}>
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                                className={s.input}
                            />
                            <button onClick={onClose} className={s.closeBtn}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M1.26837 15.955L7.99948 9.22384L14.7306 15.955L15.9544 14.7311L9.22332 8L15.9544 1.26889L14.7306 0.0450475L7.99948 6.77616L1.26837 0.0450488L0.04453 1.26889L6.77564 8L0.04453 14.7311L1.26837 15.955Z" fill="#1A1A1A"/>
                                </svg>
                            </button>
                        </div>

                        <div className={s.results}>
                            {query && (
                                <>
                                    <div className={s.block}>
                                        <p className={s.label}>{t('products')}</p>
                                        <ul>
                                            {products.map((product) => (
                                                <li key={product.id}>
                                                    <Link to={`${langPrefix}/product/${product.slug}`} onClick={onClose}>
                                                        {product.images?.[0]?.src && (
                                                            <img src={product.images[0].src} alt={product.name} />
                                                        )}
                                                        <div className={s.contentProduct}>
                                                            <span>{product.name}</span>
                                                            <div
                                                                className={s.priceWrapHtml}
                                                                dangerouslySetInnerHTML={{ __html: product.price_html }}
                                                            />
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={s.block}>
                                        <p className={s.label}>{t('categories')}</p>
                                        <ul>
                                            {categories.map((cat) => (
                                                <li key={cat.id}>
                                                    <Link to={`${langPrefix}/product-category/${cat.slug}`} onClick={onClose}>
                                                        {cat.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;
