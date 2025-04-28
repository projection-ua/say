import { AnimatePresence, motion } from 'framer-motion';
import s from './Loader.module.css';

const Loader = () => {

    return (
        <AnimatePresence>
                <motion.div
                    className={s.loaderOverlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className={s.progressBar}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                    />
                </motion.div>
        </AnimatePresence>
    );
};

export default Loader;
