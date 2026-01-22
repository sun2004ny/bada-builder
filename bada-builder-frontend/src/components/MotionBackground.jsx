import { motion } from "framer-motion";

const MotionBackground = () => {
    return (
        <div className="motion-background-container">
            {/* Orb 1 - Purple/Pink */}
            <motion.div
                className="floating-orb orb-1"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Orb 2 - Blue/Teal */}
            <motion.div
                className="floating-orb orb-2"
                animate={{
                    x: [0, -70, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
            />

            {/* Orb 3 - Small Accent */}
            <motion.div
                className="floating-orb orb-3"
                animate={{
                    x: [0, 50, -50, 0],
                    y: [0, 50, 50, 0],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
};

export default MotionBackground;
