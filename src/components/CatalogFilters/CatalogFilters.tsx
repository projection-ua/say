import { useState, useEffect } from 'react';
import Slider from 'rc-slider'; // ✅ Оновлений імпорт
import 'rc-slider/assets/index.css';
import s from './CatalogFilters.module.css';
import {useTranslation} from "react-i18next";

interface Attribute {
    name: string;
    slug: string;
    options: string[];
}

interface Subcategory {
    id: number;
    name: string;
    slug: string;
}

interface CatalogFiltersProps {
    priceRange: { min: number; max: number };
    selectedSubcategory: string | null;
    subcategories: Subcategory[];
    selectedAttributes: Record<string, string[]>;
    allAttributes: Attribute[];
    onChangeSubcategory: (slug: string | null) => void;
    onChangePrice: (range: { min: number; max: number }) => void;
    onChangeAttributes: (updated: Record<string, string[]>) => void;
}

const CatalogFilters = ({
                            priceRange,
                            selectedSubcategory,
                            subcategories,
                            selectedAttributes,
                            allAttributes,
                            onChangeSubcategory,
                            onChangePrice,
                            onChangeAttributes,
                        }: CatalogFiltersProps) => {
    const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({
        'filter-price': true,
        'filter-subcategories': true,
    });

    const { t } = useTranslation();

    useEffect(() => {
        const attrBlocks = Object.fromEntries(
            allAttributes.map((attr) => [`filter-attr-${attr.slug}`, true])
        );
        setOpenBlocks((prev) => ({ ...prev, ...attrBlocks }));
    }, [allAttributes]);

    const toggleBlock = (key: string) => {
        setOpenBlocks((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleAttributeToggle = (attrName: string, option: string) => {
        const selected = selectedAttributes[attrName] || [];
        const updated = selected.includes(option)
            ? selected.filter((opt) => opt !== option)
            : [...selected, option];

        onChangeAttributes({
            ...selectedAttributes,
            [attrName]: updated,
        });
    };

    return (
        <div className={s.filters}>

            {/* Ціна */}
            <div className={s.block} id="filter-price">
                <div onClick={() => toggleBlock('filter-price')} className={`${s.headerFilter} ${openBlocks['filter-price'] ? s.active : ''}`}>
                    <h4 className={s.headingFilter}>{t('filters.price')}</h4>
                    <svg className={s.iconClick} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M16 7.33333H8.66667V0H7.33333V7.33333H0V8.66667H7.33333V16H8.66667V8.66667H16V7.33333Z" fill="#1A1A1A"/>
                    </svg>
                </div>
                {openBlocks['filter-price'] && (
                    <div className={s.priceInputs}>
                        <div className={s.priceLabels}>
                            <span className={s.minPrice}>Від <strong>₴ {priceRange.min}</strong></span>
                            <span className={s.maxPrice}>До <strong>₴ {priceRange.max}</strong></span>
                        </div>
                        <div className={s.containerRange}>
                            <Slider
                                range
                                min={0}
                                max={10000}
                                step={10}
                                value={[priceRange.min, priceRange.max]}
                                allowCross={false}
                                onChange={(value) => {
                                    const [min, max] = value as [number, number];
                                    onChangePrice({ min, max });
                                }}
                                trackStyle={[{ backgroundColor: '#003C3A', height: 2 }]}
                                handleStyle={[
                                    {
                                        borderColor: '#003C3A',
                                        backgroundColor: '#fff',
                                        width: 28,
                                        height: 28,
                                        marginTop: -13,
                                        opacity: 1,
                                    },
                                    {
                                        borderColor: '#003C3A',
                                        backgroundColor: '#fff',
                                        width: 28,
                                        height: 28,
                                        marginTop: -13,
                                        opacity: 1,
                                    },
                                ]}
                                railStyle={{ backgroundColor: '#C4C4C4', height: 2 }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Підкатегорії */}
            {subcategories.length > 0 && (
                <div className={s.block} id="filter-subcategories">
                    <div onClick={() => toggleBlock('filter-subcategories')} className={`${s.headerFilter} ${openBlocks['filter-subcategories'] ? s.active : ''}`}>
                        <h4 className={s.headingFilter}>{t('filters.subcategories')}</h4>
                        <svg className={s.iconClick} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M16 7.33333H8.66667V0H7.33333V7.33333H0V8.66667H7.33333V16H8.66667V8.66667H16V7.33333Z" fill="#1A1A1A"/>
                        </svg>
                    </div>
                    {openBlocks['filter-subcategories'] && (
                        <ul className={s.optionsList}>
                            <li>
                                <label>
                                    <input
                                        type="radio"
                                        name="subcategory"
                                        checked={selectedSubcategory === null}
                                        onChange={() => onChangeSubcategory(null)}
                                    />
                                    Усі
                                </label>
                            </li>
                            {subcategories.map((subcat) => (
                                <li key={subcat.id}>
                                    <label>
                                        <input
                                            type="radio"
                                            name="subcategory"
                                            checked={selectedSubcategory === subcat.slug}
                                            onChange={() => onChangeSubcategory(subcat.slug)}
                                        />
                                        {subcat.name}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Атрибути */}
            {allAttributes.map((attr) => {
                const blockId = `filter-attr-${attr.slug}`;
                return (
                    <div className={s.block} key={attr.slug} id={blockId}>
                        <div onClick={() => toggleBlock(blockId)} className={`${s.headerFilter} ${openBlocks[blockId] ? s.active : ''}`}>
                            <h4  className={s.headingFilter}>{attr.name}</h4>
                            <svg className={s.iconClick} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M16 7.33333H8.66667V0H7.33333V7.33333H0V8.66667H7.33333V16H8.66667V8.66667H16V7.33333Z" fill="#1A1A1A"/>
                            </svg>
                        </div>
                        {openBlocks[blockId] && (
                            <ul className={s.optionsList}>
                                {attr.options.map((opt) => (
                                    <li key={opt}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedAttributes[attr.name]?.includes(opt) || false}
                                                onChange={() => handleAttributeToggle(attr.name, opt)}
                                            />
                                            {opt}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CatalogFilters;
