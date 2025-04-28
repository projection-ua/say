// src/components/SizeChartModal/SizeChartModal.tsx

import React, { useState } from 'react';
import s from './SizeChart.module.css';

interface SizeEntry {
    bust: string;
    waist: string;
    hips: string;
    size: string;
}

interface MetaDataItem {
    key: string;
    value: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    metaData?: MetaDataItem[];
}

// Розмірні сітки
const SIZE_GRIDS: Record<'panties' | 'bra', Record<string, SizeEntry[]>> = {
    panties: {
        S: [
            { bust: '80–86 см', waist: '60–68 см', hips: '85–91 см', size: 'XS' },
            { bust: '87–92 см', waist: '69–75 см', hips: '92–98 см', size: 'S' },
            { bust: '93–97 см', waist: '76–82 см', hips: '99–104 см', size: 'M' },
            { bust: '98–102 см', waist: '83–88 см', hips: '105–110 см', size: 'L' },
        ],
        M: [
            { bust: '85–90 см', waist: '65–72 см', hips: '90–96 см', size: 'S' },
            { bust: '91–96 см', waist: '73–79 см', hips: '97–103 см', size: 'M' },
            { bust: '97–102 см', waist: '80–86 см', hips: '104–110 см', size: 'L' },
        ],
        L: [
            { bust: '88–92 см', waist: '66–70 см', hips: '90–95 см', size: 'S' },
            { bust: '93–97 см', waist: '71–75 см', hips: '96–100 см', size: 'M' },
            { bust: '98–102 см', waist: '76–80 см', hips: '101–105 см', size: 'L' },
        ],
    },
    bra: {
        S: [
            { bust: '70–75 см', waist: '60–65 см', hips: '-', size: '70A / 70B' },
            { bust: '75–80 см', waist: '66–70 см', hips: '-', size: '75A / 75B' },
            { bust: '80–85 см', waist: '71–75 см', hips: '-', size: '80A / 80B' },
        ],
        M: [
            { bust: '85–90 см', waist: '76–80 см', hips: '-', size: '85B / 85C' },
            { bust: '90–95 см', waist: '81–85 см', hips: '-', size: '90B / 90C' },
        ],
        L: [
            { bust: '95–100 см', waist: '86–90 см', hips: '-', size: '95B / 95C' },
            { bust: '100–105 см', waist: '91–95 см', hips: '-', size: '100B / 100C' },
        ],
    },
};

const SizeChartModal: React.FC<Props> = ({ isOpen, onClose, metaData }) => {
    const [tab, setTab] = useState<'grid' | 'help'>('grid');
    const [type, setType] = useState<'panties' | 'bra'>('panties');

    const sizeKey = metaData?.find((m) => m.key === '_rozmirna_sitka')?.value || 'S';
    const sizeGrid = SIZE_GRIDS[type][sizeKey] || SIZE_GRIDS[type]['S'];

    if (!isOpen) return null;

    return (
        <div className={`${s.overlay} ${isOpen ? s.active : ''}`}>
            <div className={s.modal}>
                <button className={s.closeBtn} onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2.22001 19.1924L9.99819 11.4142L17.7764 19.1924L19.1906 17.7782L11.4124 10L19.1906 2.22182L17.7764 0.807611L9.99819 8.58579L2.22001 0.807613L0.805798 2.22183L8.58397 10L0.805798 17.7782L2.22001 19.1924Z" fill="#1A1A1A"/>
                    </svg>
                </button>

                <h2 className={s.title}>Таблиця розмірів</h2>

                <div className={s.wrapFilters}>
                    <div className={s.tabs}>
                        <button
                            className={`${s.tab} ${tab === 'grid' ? s.activeTab : ''}`}
                            onClick={() => setTab('grid')}
                        >
                            Розмірна сітка
                        </button>
                        <button
                            className={`${s.tab} ${tab === 'help' ? s.activeTab : ''}`}
                            onClick={() => setTab('help')}
                        >
                            Як визначити розмір?
                        </button>
                    </div>

                    <div className={s.switcher}>
                        <label className={s.switchLabel}>
                            <input
                                type="radio"
                                name="sizeType"
                                value="panties"
                                checked={type === 'panties'}
                                onChange={() => setType('panties')}
                                className={s.switchInput}
                            />
                            <span className={`${s.switchBtn} ${type === 'panties' ? s.activeSwitch : ''}`}>Трусики</span>
                        </label>

                        <label className={s.switchLabel}>
                            <input
                                type="radio"
                                name="sizeType"
                                value="bra"
                                checked={type === 'bra'}
                                onChange={() => setType('bra')}
                                className={s.switchInput}
                            />
                            <span className={`${s.switchBtn} ${type === 'bra' ? s.activeSwitch : ''}`}>Бюст</span>
                        </label>
                    </div>
                </div>

                {tab === 'grid' ? (
                    <div className={s.tableWrapper}>
                        <table className={s.table}>
                            <tbody>
                            <tr>
                                <th>Обхват грудей, см</th>
                                {sizeGrid.map((row, idx) => (
                                    <td key={`bust-${idx}`}>{row.bust}</td>
                                ))}
                            </tr>
                            <tr>
                                <th>Обхват талії, см</th>
                                {sizeGrid.map((row, idx) => (
                                    <td key={`waist-${idx}`}>{row.waist}</td>
                                ))}
                            </tr>
                            <tr>
                                <th>Обхват стегон, см</th>
                                {sizeGrid.map((row, idx) => (
                                    <td key={`hips-${idx}`}>{row.hips}</td>
                                ))}
                            </tr>
                            <tr>
                                <th>Розмір</th>
                                {sizeGrid.map((row, idx) => (
                                    <td key={`size-${idx}`}>{row.size}</td>
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
                                    <h4>1. Обхват талії</h4>
                                    <p>Знайди найвужчу частину тіла — це і є талія. Обгорни сантиметрову стрічку навколо цієї зони, не натягуючи її занадто сильно. Такий замір допоможе обрати розмір, який не буде врізатись і залишить комфортне відчуття.</p>

                                    <h4>2. Обхват стегон</h4>
                                    <p>Виміряй найширшу частину стегон — зазвичай вона трохи нижче сідниць. Стрічка має щільно прилягати до тіла, але не стискати. Цей крок важливий для того, щоб білизна ідеально сиділа й не зсовувалась під час руху.</p>

                                    <h4>3. Перевір у таблиці</h4>
                                    <p>Тепер просто звір свої заміри з таблицею розмірів. Це допоможе обрати трусики, які не лише красиво виглядають, а й справді зручні для щоденного носіння.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <img src="/images/sizeBra.jpg" alt="SizeHelpBra" />
                                <div className={s.contentSize}>
                                    <h4>1. Обхват під грудьми</h4>
                                    <p>Розмістіть сантиметрову стрічку прямо під грудьми — там, де зазвичай проходить резинка бюстгальтера. Стрічка має лягати щільно, але не тиснути. Це і буде ваш розмір пояса — наприклад, 70, 75 або 80.</p>

                                    <h4>2. Виміряйте обхват грудей</h4>
                                    <p>Виміряйте груди по найбільш виступаючій частині. Стрічка має проходити рівно, паралельно підлозі й не стискати тіло.</p>

                                    <h4>3. Визначте розмір чашки</h4>
                                    <p>Від обхвату грудей відніміть обхват під грудьми. Різниця між цими значеннями визначає розмір чашки. Наприклад, 12–14 см — це B, 14–16 — C і так далі. Залишаємо таблицю нижче для зручності.</p>
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
