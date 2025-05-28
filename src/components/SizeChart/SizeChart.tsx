import React, { useState } from 'react';
import s from './SizeChart.module.css';
import {useTranslation} from "react-i18next";
import { AttributeOption } from '../../types/productTypes.ts';

interface SizeEntry {
    bust: string;
    waist: string;
    hips: string;
    size: string;
}

interface ProductAttribute {
    name: string;
    slug: string;
    options: AttributeOption[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    attributes?: ProductAttribute[];
}


// Розмірні сітки
const SIZE_GRIDS: Record<string, Record<string, SizeEntry[]>> = {
    // 🔹 Комплекти білизни повномірні
    'full_set': {
        S: [{ bust: '70B | 75B | 70C', waist: '-', hips: '88–94 см', size: 'S' }],
        M: [{ bust: '80B | 75C | 80C', waist: '-', hips: '94–100 см', size: 'M' }],
        L: [{ bust: '85B | 85C | 75D', waist: '-', hips: '98–105 см', size: 'L' }],
    },
    // 🔹 Комплекти білизни маломірні
    'small_set': {
        S: [{ bust: '70A | 70B | 75B', waist: '-', hips: '83–88 см', size: 'S' }],
        M: [{ bust: '70B | 75B | 70C', waist: '-', hips: '88–95 см', size: 'M' }],
        L: [{ bust: '80B | 75C | 80C', waist: '-', hips: '90–100 см', size: 'L' }],
    },
    // 🔹 Боді повномірні
    'body_full': {
        S: [{ bust: '80–90 см', waist: '57–68 см', hips: '85–95 см', size: 'S' }],
        M: [{ bust: '88–99 см', waist: '65–73 см', hips: '90–99 см', size: 'M' }],
        L: [{ bust: '95–103 см', waist: '73–83 см', hips: '98–108 см', size: 'L' }],
    },
    // 🔹 Боді маломірні
    'body_small': {
        S: [{ bust: '80–90 см', waist: '57–68 см', hips: '83–88 см', size: 'S' }],
        M: [{ bust: '88–99 см', waist: '65–73 см', hips: '87–94 см', size: 'M' }],
        L: [{ bust: '95–103 см', waist: '73–83 см', hips: '94–100 см', size: 'L' }],
    },
    // 🔹 Халати
    'robes': {
        S: [{ bust: 'до 94 см', waist: '-', hips: '-', size: 'S' }],
        M: [{ bust: 'до 98 см', waist: '-', hips: '-', size: 'M' }],
        L: [{ bust: 'до 102 см', waist: '-', hips: '-', size: 'L' }],
    },
    // 🔹 Пеньюари
    'peignoirs': {
        S: [{ bust: 'до 93 см', waist: 'до 70 см', hips: '-', size: 'S' }],
        M: [{ bust: 'до 97 см', waist: 'до 75 см', hips: '-', size: 'M' }],
        L: [{ bust: 'до 100 см', waist: 'до 80 см', hips: '-', size: 'L' }],
    },
    // 🔹 Бодістокінги (one size)
    'bodystockings': {
        'S-L': [{ bust: '80–99 см', waist: '60–88 см', hips: '84–104 см', size: 'S-L' }],
    },
    // 🔹 Панчохи, колготи (one size)
    'stockings': {
        'S-XL': [{ bust: '-', waist: '-', hips: '-', size: 'One Size S-XL' }],
    },
    // 🔹 Рольові костюми
    'role_costumes': {
        S: [{ bust: '80–90 см', waist: '57–68 см', hips: '85–95 см', size: 'S' }],
        M: [{ bust: '88–99 см', waist: '65–73 см', hips: '90–99 см', size: 'M' }],
        L: [{ bust: '95–103 см', waist: '73–83 см', hips: '98–108 см', size: 'L' }],
    },
    // 🔹 Купальники роздільні
    'swim_separate': {
        S: [{ bust: '80–86 см', waist: '60–68 см', hips: '85–91 см', size: 'S' }],
        M: [{ bust: '86–91 см', waist: '68–73 см', hips: '91–97 см', size: 'M' }],
        L: [{ bust: '91–96 см', waist: '72–80 см', hips: '96–101 см', size: 'L' }],
    },
    // 🔹 Купальники суцільні повномірні
    'swim_full': {
        S: [{ bust: '80–86 см', waist: '60–68 см', hips: '85–91 см', size: 'S' }],
        M: [{ bust: '86–91 см', waist: '68–73 см', hips: '91–97 см', size: 'M' }],
        L: [{ bust: '91–96 см', waist: '72–80 см', hips: '96–101 см', size: 'L' }],
    },
    // 🔹 Купальники суцільні маломірні
    'swim_small': {
        S: [{ bust: '77–83 см', waist: '57–64 см', hips: '83–88 см', size: 'S' }],
        M: [{ bust: '80–86 см', waist: '60–68 см', hips: '85–91 см', size: 'M' }],
        L: [{ bust: '86–91 см', waist: '68–73 см', hips: '91–97 см', size: 'L' }],
    },
    // 🔹 Пляжні сукні
    'beach_dress': {
        S: [{ bust: '83–93 см', waist: '68–73 см', hips: '85–90 см', size: 'S' }],
        M: [{ bust: '94–102 см', waist: '72–82 см', hips: '91–95 см', size: 'M' }],
        L: [{ bust: '100–110 см', waist: '83–95 см', hips: '96–100 см', size: 'L' }],
    },
};

const SizeChartModal: React.FC<Props> = ({ isOpen, onClose, attributes }) => {
    const [tab, setTab] = useState<'grid' | 'help'>('grid');
    const [type, setType] = useState<'panties' | 'bra'>('panties');
    const { t } = useTranslation();

    // ✅ Мапа ключів
    const SIZE_GRID_KEYS: Record<string, string> = {
        'повномірить верх/низ': 'full_set',
        'маломірить верх/низ': 'small_set',
        '990-993': 'full_set',
        'халати': 'robes',
        'пеньюари s/m/l': 'peignoirs',
        'пеньюари s/m': 'peignoirs',
        '228': 'body_full',
        'боді': 'body_full',
        'боді маломірить': 'body_small',
        'купальник роздільний': 'swim_separate',
        'купальник суцільний': 'swim_full',
        'купальник суцільний маломірить': 'swim_small',
        'пляжна сукня': 'beach_dress',
        'рольовий костюм': 'role_costumes',
        'панчохи, колготи': 'stockings',
        'бодістокінги': 'bodystockings',
    };

    const rawKey = attributes
        ?.find(attr => attr.slug === 'pa_rozmirna-sitka')
        ?.options?.[0]?.name || '';

    const sizeGridKey = SIZE_GRID_KEYS[rawKey] || 'full_set';
    const sizeGridSet = SIZE_GRIDS[sizeGridKey];

    if (!isOpen) return null;

    return (
        <div className={`${s.overlay} ${isOpen ? s.active : ''}`}>
            <div className={s.modal}>
                <button className={s.closeBtn} onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2.22001 19.1924L9.99819 11.4142L17.7764 19.1924L19.1906 17.7782L11.4124 10L19.1906 2.22182L17.7764 0.807611L9.99819 8.58579L2.22001 0.807613L0.805798 2.22183L8.58397 10L0.805798 17.7782L2.22001 19.1924Z" fill="#1A1A1A"/>
                    </svg>
                </button>

                <h2 className={s.title}>{t('sizeChart.title')}</h2>


                <div className={s.wrapFilters}>
                    <div className={s.tabs}>
                        <button className={`${s.tab} ${tab === 'grid' ? s.activeTab : ''}`} onClick={() => setTab('grid')}>
                            {t('sizeChart.gridTab')}
                        </button>
                        <button className={`${s.tab} ${tab === 'help' ? s.activeTab : ''}`} onClick={() => setTab('help')}>
                            {t('sizeChart.helpTab')}
                        </button>
                    </div>

                    {tab !== 'grid' && (
                        <div className={s.switcher}>
                            <label className={s.switchLabel}>
                                <input type="radio" name="sizeType" value="panties" checked={type === 'panties'} onChange={() => setType('panties')} />
                                <span className={`${s.switchBtn} ${type === 'panties' ? s.activeSwitch : ''}`}>{t('sizeChart.switchPanties')}</span>
                            </label>
                            <label className={s.switchLabel}>
                                <input type="radio" name="sizeType" value="bra" checked={type === 'bra'} onChange={() => setType('bra')} />
                                <span className={`${s.switchBtn} ${type === 'bra' ? s.activeSwitch : ''}`}>{t('sizeChart.switchBra')}</span>
                            </label>
                        </div>
                    )}

                </div>

                {tab === 'grid' ? (
                    <div className={s.tableWrapper}>
                        <table className={s.table}>
                            <tbody>
                            <tr>
                                <th>{t('sizeChart.bust')}</th>
                                {['S', 'M', 'L'].map((sizeKey) => (
                                    <td key={`bust-${sizeKey}`}>
                                        {sizeGridSet[sizeKey]?.[0]?.bust || '-'}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <th>{t('sizeChart.waist')}</th>
                                {['S', 'M', 'L'].map((sizeKey) => (
                                    <td key={`waist-${sizeKey}`}>
                                        {sizeGridSet[sizeKey]?.[0]?.waist || '-'}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <th>{t('sizeChart.hips')}</th>
                                {['S', 'M', 'L'].map((sizeKey) => (
                                    <td key={`hips-${sizeKey}`}>
                                        {sizeGridSet[sizeKey]?.[0]?.hips || '-'}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <th>{t('sizeChart.size')}</th>
                                {['S', 'M', 'L'].map((sizeKey) => (
                                    <td key={`size-${sizeKey}`}>
                                        {sizeGridSet[sizeKey]?.[0]?.size || '-'}
                                    </td>
                                ))}
                            </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={s.helpContent}>
                        {type === 'panties' ? (
                            <>
                                <img src="/images/sixeImg.jpg" alt="SizeHelpPanties" />
                                <div className={s.contentSize}>
                                    <h4>{t('sizeChart.panties.waistTitle')}</h4>
                                    <p>{t('sizeChart.panties.waistDesc')}</p>

                                    <h4>{t('sizeChart.panties.hipsTitle')}</h4>
                                    <p>{t('sizeChart.panties.hipsDesc')}</p>

                                    <h4>{t('sizeChart.panties.checkTitle')}</h4>
                                    <p>{t('sizeChart.panties.checkDesc')}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <img src="/images/sizeBra.jpg" alt="SizeHelpBra" />
                                <div className={s.contentSize}>
                                    <h4>{t('sizeChart.bra.underbustTitle')}</h4>
                                    <p>{t('sizeChart.bra.underbustDesc')}</p>

                                    <h4>{t('sizeChart.bra.bustTitle')}</h4>
                                    <p>{t('sizeChart.bra.bustDesc')}</p>

                                    <h4>{t('sizeChart.bra.cupTitle')}</h4>
                                    <p>{t('sizeChart.bra.cupDesc')}</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SizeChartModal;
