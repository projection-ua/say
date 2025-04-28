// src/components/Accordion/Accordion.tsx
import { useState, useRef, useEffect } from 'react';
import s from './Accordion.module.css';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
}

export const Accordion = ({ title, children }: AccordionProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState('0px');

    useEffect(() => {
        if (contentRef.current) {
            setHeight(isOpen ? `${contentRef.current.scrollHeight}px` : '0px');
        }
    }, [isOpen]);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={s.accordion}>
            <button className={`${s.accordionHeader} ${isOpen ? s.open : ''}`} onClick={toggleAccordion}>
                <h4 className={s.headingBackdrop}>{title}</h4>
                <div className={s.accordionIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M11 1.5L6 6.5L1 1.5" stroke="#0C1618" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </button>

            <div
                ref={contentRef}
                className={s.accordionContent}
                style={{
                    maxHeight: height,
                    overflow: 'hidden',
                    transition: 'max-height 0.4s ease',
                }}
            >
                <div className={s.accordionInner}>
                    {children}
                </div>
            </div>
        </div>
    );
};
