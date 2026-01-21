import { motion } from 'framer-motion';

const ScrollReveal = ({ children, direction = 'up', delay = 0, width = 'fit-content', className = '' }) => {
    const variants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
            x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration: 0.5,
                delay: delay,
                ease: 'easeOut',
            },
        },
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={variants}
            style={{ width }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default ScrollReveal;
