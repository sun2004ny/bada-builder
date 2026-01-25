import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './MobileSearchOverlay.css';

const MobileSearchOverlay = ({
    isOpen,
    onClose,
    onSearch,
    initialValue = "",
    searchHistory = [],
    onDeleteHistory,
    propertyOptions = [],
    selectedProperties = [],
    onToggleProperty,
    filterConfigs = {},
    filters = {},
    onFilterChange,
    onClearAll
}) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm(initialValue);
        }
    }, [isOpen, initialValue]);

    const handleSearchSubmit = (item) => {
        // Check if item is a history object (has a location or display property)
        // rather than just any object (like a React Event)
        const isHistoryObject = item && typeof item === 'object' && ('location' in item || 'display' in item);
        const finalTerm = isHistoryObject ? item : searchTerm;

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
                        <path d="M20 4L4 20M4 4l16 16" strokeLinecap="round" strokeLinejoin="round" />
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
                        <button className="mobile-search-btn-active" onClick={() => handleSearchSubmit()}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="3.5">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mobile-filter-toggle-container">
                <button
                    className={`mobile-filter-trigger-btn ${isFiltersOpen ? 'active' : ''}`}
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                    <div className="trigger-left">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                        </svg>
                        <span>Filters</span>
                    </div>
                    <svg
                        className={`chevron-icon ${isFiltersOpen ? 'rotate' : ''}`}
                        viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
            </div>

            <div className="mobile-search-body">
                <AnimatePresence>
                    {isFiltersOpen && (
                        <motion.div
                            className="mobile-all-options-container"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="mobile-body-header">
                                <button className="mobile-clear-all" onClick={onClearAll}>
                                    CLEAR ALL
                                </button>
                            </div>

                            <div className="mobile-search-card">
                                <div className="card-header-with-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4f46e5" strokeWidth="2.5">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                        <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                    <h4 className="card-title">PROPERTY TYPE</h4>
                                </div>
                                <div className="chip-container property-grid">
                                    {propertyOptions.map((option) => (
                                        <button
                                            key={option}
                                            className={`search-chip property-chip ${selectedProperties.includes(option) ? 'selected' : ''}`}
                                            onClick={() => onToggleProperty(option)}
                                        >
                                            {selectedProperties.includes(option) && <span className="check-mark">✓</span>}
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mobile-search-card">
                                <div className="card-header-with-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4f46e5" strokeWidth="2.5">
                                        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                                    </svg>
                                    <h4 className="card-title">ADVANCED FILTERS</h4>
                                </div>
                                <div className="mobile-filters-grid">
                                    {Object.keys(filterConfigs).map((key) => (
                                        <div key={key} className="mobile-filter-item">
                                            <label className="mobile-filter-label">
                                                {key === 'bedrooms' ? 'BHK' : key === 'postedBy' ? 'LISTED BY' : key.toUpperCase()}
                                            </label>
                                            <div className="custom-select-wrapper">
                                                <select
                                                    className="mobile-filter-select"
                                                    value={filters[key]}
                                                    onChange={(e) => onFilterChange(key, e.target.value)}
                                                >
                                                    <option value="">
                                                        {key === 'postedBy' ? 'Listed By' : `Select ${key === 'bedrooms' ? 'BHK' : key.toUpperCase()}`}
                                                    </option>
                                                    {filterConfigs[key].map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {searchHistory.length > 0 && (
                    <div className="mobile-search-card history-card">
                        <div className="history-header">
                            <div className="card-header-with-icon">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4f46e5" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <h4 className="card-title">RECENT SEARCHES</h4>
                            </div>
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
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="5">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );

    return ReactDOM.createPortal(overlayContent, document.body);
};

export default MobileSearchOverlay;
