import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './MobileSearchOverlay.css';

const MobileSearchOverlay = ({ isOpen, onClose, onSearch, initialValue = "", searchHistory = [], onDeleteHistory }) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);

    // Popular localities as per reference
    const popularLocalities = [
        "Vasna Bhayli Road, Vadodara",
        "Gotri Road, Vadodara",
        "New Alkapuri, Vadodara",
        "Bhayli, Vadodara"
    ];

    const recentLocalities = [
        "Vasna Bhayli Road, Vadodara",
        "Bhayli"
    ];

    useEffect(() => {
        if (isOpen) {
            setSearchTerm(initialValue);
        }
    }, [isOpen, initialValue]);

    const handleSearchSubmit = (item) => {
        const finalTerm = typeof item === 'object' ? item : (item || searchTerm);
        if (typeof finalTerm === 'string' && !finalTerm.trim()) return;

        onSearch(finalTerm);
        onClose();
    };

    const handleOpenMenu = () => {
        onClose();
        // Dispatch custom event to tell Header to open menu
        const event = new CustomEvent('open-mobile-menu');
        window.dispatchEvent(event);
    };

    if (!isOpen) return null;

    const overlayContent = (
        <motion.div
            className="mobile-search-overlay"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
        >
            {/* Added App Header Section */}
            <div className="mobile-search-site-header">
                <div className="mobile-search-logo">
                    <Link to="/" onClick={onClose}>
                        <img src={logo} alt="Bada Builder" className="h-8 w-auto" />
                    </Link>
                </div>
                <div className="mobile-search-menu-toggle">
                    <button className="p-2 bg-gray-100 rounded-lg" onClick={handleOpenMenu}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#58335E" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="mobile-search-top-bar">
                <button className="mobile-search-close-btn" onClick={onClose} aria-label="Close search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <div className="mobile-search-input-box">
                    <input
                        type="text"
                        className="mobile-search-field"
                        placeholder="Try - ATS Pristine Sector 150 Noida"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    />
                    <div className="mobile-search-tools">
                        <button className="tool-btn location-tool">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mobile-search-body">
                {searchHistory.length > 0 && (
                    <div className="mobile-search-card history-card">
                        <div className="history-header">
                            <h4 className="card-title">Recent Searches</h4>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2.5">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="mobile-history-chips">
                            {searchHistory.map((item, index) => (
                                <div key={item.id || index} className="m-history-chip-wrapper">
                                    <button
                                        className="m-history-chip"
                                        onClick={() => handleSearchSubmit(item)}
                                    >
                                        {item.display || item}
                                    </button>
                                    <button
                                        className="m-delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteHistory(item.id, e);
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="4">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mobile-search-card">
                    <h4 className="card-title">Recently Searched Localities in Vadodara</h4>
                    <div className="chip-container">
                        {recentLocalities.map((l, i) => (
                            <button key={i} className="search-chip" onClick={() => handleSearchSubmit(l)}>
                                <span className="plus-sign">+</span> {l}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mobile-search-card">
                    <h4 className="card-title">Popular Localities in Vadodara</h4>
                    <div className="chip-container">
                        {popularLocalities.map((l, i) => (
                            <button key={i} className="search-chip" onClick={() => handleSearchSubmit(l)}>
                                <span className="plus-sign">+</span> {l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return ReactDOM.createPortal(overlayContent, document.body);
};

export default MobileSearchOverlay;
