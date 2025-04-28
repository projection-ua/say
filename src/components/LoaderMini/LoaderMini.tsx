import { motion } from "framer-motion";

const loadingContainer = {
    width: "3rem",
    height: "2rem",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
};

const loadingCircle = {
    display: "block",
    width: "0.6rem",
    height: "0.6rem",
    backgroundColor: "#003C3A",
    borderRadius: "50%",
};

export const LoaderMini = () => {
    return (
        <div style={loadingContainer}>
            <motion.span
                style={loadingCircle}
                animate={{ y: ["0%", "-100%", "0%"] }}
                transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                }}
            />
            <motion.span
                style={loadingCircle}
                animate={{ y: ["0%", "-100%", "0%"] }}
                transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                    delay: 0.2,
                }}
            />
            <motion.span
                style={loadingCircle}
                animate={{ y: ["0%", "-100%", "0%"] }}
                transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                    delay: 0.4,
                }}
            />
        </div>
    );
};
