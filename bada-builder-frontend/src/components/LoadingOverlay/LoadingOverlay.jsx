import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoadingOverlay.css';

const LoadingOverlay = ({ isSubmitting, text = "Processing your booking..." }) => {
    useEffect(() => {
        if (isSubmitting) {
            document.body.style.overflow = 'hidden';
            // Disable interactions
            document.body.style.pointerEvents = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.pointerEvents = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.pointerEvents = '';
        };
    }, [isSubmitting]);

    return (
        <AnimatePresence>
            {isSubmitting && (
                <motion.div
                    className="loading-overlay-root"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="loading-overlay-content">
                        {/* 
                            Using both animate-spin (Tailwind) and custom-spin (index.css) 
                            to ensure the animation runs regardless of which one is properly loaded.
                        */}
                        <div className="w-16 h-16 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin custom-spin"></div>
                        <p className="loading-overlay-text">{text}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingOverlay;
