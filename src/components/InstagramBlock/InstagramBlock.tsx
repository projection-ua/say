import s from '../InstagramBlock/InstagramBlock.module.css';

const images = [
    '/images/insta/1.jpg',
    '/images/insta/2.jpg',
    '/images/insta/3.jpg',
    '/images/insta/4.jpg',
    '/images/insta/5.jpg',
    '/images/insta/6.jpg',
];

const InstagramGrid = () => {
    return (
        <section className={s.instagramSection}>
            <div className={s.header}>
                <h2 className={s.title}>SAY ON INSTAGRAM</h2>
                <div className={s.profile}>
                    <img src="/images/insta/logo-inst.svg" alt="SAY" className={s.logo} />
                    <div>
                        <p className={s.username}>@say</p>
                        <a href="https://instagram.com" className={s.link}>
                            <span className={s.spanLink}>Підписатися</span>
                            <svg className={s.iconLink} xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                                <path d="M5.83325 14.6668L14.1666 6.3335M14.1666 6.3335H5.83325M14.1666 6.3335V14.6668" stroke="#0C1618" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <div className={s.grid}>
                {images.map((src, idx) => (
                    <div key={idx} className={`${s.item} ${s['item' + (idx + 1)]}`}>
                        <img src={src} alt={`Instagram ${idx + 1}`} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default InstagramGrid;
