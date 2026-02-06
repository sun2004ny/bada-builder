import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoadingOverlay.css';

const LoadingOverlay = ({ isSubmitting, text = "Processing your booking..." }) => {
    useEffect(() => {
        if (isSubmitting) {
            document.body.style.overflow = 'hidden';
            // Prevent scrolling on mobile
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
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
                        <div className="professional-spinner"></div>
                        <p className="loading-overlay-text">{text}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingOverlay;
