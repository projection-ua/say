import s from './TipsBlock.module.css';

interface PopupBlock {
    title: string;
    text: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    blocks: PopupBlock[];
    title: string;
}

export const TipsPopup: React.FC<Props> = ({ isOpen, onClose, blocks, title }) => {
    return (
        <div className={`${s.overlay} ${isOpen ? s.active : ''}`}>
            <div className={`${s.popup} ${isOpen ? s.active : ''}`}>
                <button className={s.closeBtn} onClick={onClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
                        <path d="M2.22001 18.6924L9.99819 10.9142L17.7764 18.6924L19.1906 17.2782L11.4124 9.5L19.1906 1.72182L17.7764 0.307611L9.99819 8.08579L2.22001 0.307613L0.805798 1.72183L8.58397 9.5L0.805798 17.2782L2.22001 18.6924Z" fill="#1A1A1A"/>
                    </svg>
                </button>
                <h2 className={s.titlePopup}>{title}</h2>
                <div className={s.gridPopup}>
                    {blocks.map((block, idx) => (
                        <div key={idx} className={s.cardPopup}>
                            <h4>{block.title}</h4>
                            <p>{block.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
