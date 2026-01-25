import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './MobileSearchOverlay.css';

const MobileSearchOverlay = ({ isOpen, onClose, onSearch, initialValue = "" }) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const [recentSearches, setRecentSearches] = useState([]);

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
            const saved = localStorage.getItem('recent_searches');
            if (saved) {
                setRecentSearches(JSON.parse(saved));
            }
            setSearchTerm(initialValue);
        }
    }, [isOpen, initialValue]);

    const handleSearchSubmit = (term) => {
        const finalTerm = term || searchTerm;
        if (!finalTerm.trim()) return;

        const updated = [finalTerm, ...recentSearches.filter(s => s !== finalTerm)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recent_searches', JSON.stringify(updated));

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
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
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
                        <div className="tool-divider" />
                        <button className="tool-btn mic-tool">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                                <path d="M19 10v2a7 7 0 01-14 0v-2M12 18v5M8 23h8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mobile-search-body">
                {recentSearches.length > 0 && (
                    <div className="mobile-search-card">
                        <h4 className="card-title">Last searched..</h4>
                        <div className="recent-list">
                            {recentSearches.map((s, i) => (
                                <div key={i} className="recent-item" onClick={() => handleSearchSubmit(s)}>
                                    <div className="recent-left">
                                        <span className="icon-clock">🕒</span>
                                        <span className="text-val">{s}</span>
                                    </div>
                                    <span className="icon-arrow">↗</span>
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
