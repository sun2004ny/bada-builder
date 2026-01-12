import React from 'react';
import { usePreloader } from '../../context/PreloaderContext';
import './Preloader.css';

const Preloader = () => {
    const { loading, activeIcon, activeText } = usePreloader();

    return (
        <div className={`preloader-overlay ${loading ? 'active' : ''}`}>
            <div className="preloader-content">
                <div className="preloader-icon">
                    {activeIcon}
                </div>
                {activeText && <h2 className="preloader-text">{activeText}</h2>}
            </div>
        </div>
    );
};

export default Preloader;
