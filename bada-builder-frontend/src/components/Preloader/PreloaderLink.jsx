import React from 'react';
import { usePreloader } from '../../context/PreloaderContext';

const PreloaderLink = ({ to, icon, text, children, className, onClick }) => {
    const { triggerPreloader } = usePreloader();

    const handleClick = (e) => {
        e.preventDefault();

        // Call original onClick if provided (e.g., for closing mobile menu)
        if (onClick) {
            onClick(e);
        }

        // Use explicit text prop, or fallback to children if it's a string, or empty
        const displayText = text || (typeof children === 'string' ? children : '');
        triggerPreloader(to, icon, displayText);
    };

    return (
        <a href={to} onClick={handleClick} className={className}>
            {children}
        </a>
    );
};

export default PreloaderLink;
