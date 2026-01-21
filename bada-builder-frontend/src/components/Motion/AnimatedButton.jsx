import { motion } from 'framer-motion';

const AnimatedButton = ({ children, onClick, className = '', ...props }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={className}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default AnimatedButton;
