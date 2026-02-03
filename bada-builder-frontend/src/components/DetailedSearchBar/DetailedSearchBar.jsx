import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MobileSearchOverlay from "./MobileSearchOverlay";
import "./DetailedSearchBar.css";

const propertyOptions = [
    "Flat/Apartment",
    "Independent/Builder Floor",
    "Independent House/Villa",
    "Residential Land",
    "1 RK/Studio Apartment",
    "Farm House",
    "Serviced Apartments",
    "Shops",
    "Offices",
    "Showrooms",
    "Godowns",
    "Warehouses",
    "Other",
];

const filterConfigs = {
    budget: ["Under 20 Lac", "20-40 Lac", "40-60 Lac", "60-80 Lac", "80 Lac - 1 Cr", "1-1.5 Cr", "1.5-2 Cr", "Above 2 Cr"],
    bedrooms: ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"],
    area: ["Under 1000 sq.ft", "1000-2000 sq.ft", "2000-3000 sq.ft", "3000-5000 sq.ft", "Above 5000 sq.ft"],
    status: ["Ready to Move", "Under Construction"],
    postedBy: ["Owner", "Dealer", "Builder"]
};

const DetailedSearchBar = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const routerLocation = useLocation();

    const [location, setLocation] = useState("");
    const [selectedProperties, setSelectedProperties] = useState([]);
    const [filters, setFilters] = useState({
        budget: "",
        bedrooms: "",
        area: "",
        status: "",
        postedBy: ""
    });

    // Close mobile search on route change
    useLayoutEffect(() => {
        setIsMobileSearchOpen(false);
    }, [routerLocation.pathname]);

    const [searchHistory, setSearchHistory] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Initialize from URL params and localStorage
    useEffect(() => {
        const loc = searchParams.get("location");
        const type = searchParams.get("type")?.split(",") || [];
        if (loc) setLocation(loc);
        if (type.length) setSelectedProperties(type);

        const savedHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
        const normalizedHistory = savedHistory.map(item => {
            if (typeof item === 'string') {
                return { display: item, location: item, types: [], filters: {}, id: Date.now() + Math.random() };
            }
            return item;
        });
        setSearchHistory(normalizedHistory);
    }, [searchParams]);

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Side effect to handle body scroll lock- [x] Phase 23: Remove Voice Search Functionality
    useEffect(() => {
        if (isMobileSearchOpen) {
            document.body.classList.add('mobile-search-open');
        } else {
            document.body.classList.remove('mobile-search-open');
        }
    }, [isMobileSearchOpen]);

    const toggleProperty = (option) => {
        setSelectedProperties((prev) =>
            prev.includes(option)
                ? prev.filter((item) => item !== option)
                : [...prev, option]
        );
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearAll = () => {
        setSelectedProperties([]);
        setLocation("");
        setFilters({
            budget: "",
            bedrooms: "",
            area: "",
            status: "",
            postedBy: ""
        });
    };

    const deleteHistoryItem = (id, e) => {
        e.stopPropagation();
        const newHistory = searchHistory.filter((item) => item.id !== id);
        setSearchHistory(newHistory);
        localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    };

    const handleInputClick = (e) => {
        // Overlay is triggered by the mobile-only UI container visible
        setIsMobileSearchOpen(true);
    };

    const handleSearch = (historyItem = null) => {
        // Close dropdown on search (Desktop)
        setDropdownOpen(false);

        let finalLocation, finalTypes, finalFilters;

        if (historyItem && typeof historyItem === 'object') { // Check if it's a history object
            // Restore from history
            finalLocation = historyItem.location;
            finalTypes = historyItem.types;
            finalFilters = historyItem.filters;

            // Optionally update current state to match history (good for UX)
            setLocation(finalLocation);
            setSelectedProperties(finalTypes);
            setFilters(finalFilters);
        } else { // This branch handles new searches (from desktop button or mobile overlay string)
            // Use current state
            finalLocation = historyItem || location; // If historyItem is a string (from mobile overlay), use it as location
            finalTypes = selectedProperties;
            finalFilters = filters;

            // Save to history if location is not empty
            if (finalLocation.trim()) {
                const typesLabel = finalTypes.length > 0 ? finalTypes.join(", ") : "All Residential";
                const filterLabels = Object.keys(finalFilters)
                    .filter(key => finalFilters[key])
                    .map(key => finalFilters[key]);

                let displayLabel = finalLocation;
                if (finalTypes.length > 0) {
                    displayLabel += ` | ${typesLabel}`;
                }
                if (filterLabels.length > 0) {
                    displayLabel += ` | ${filterLabels.join(", ")}`;
                }

                const newEntry = {
                    display: displayLabel,
                    location: finalLocation,
                    types: finalTypes,
                    filters: finalFilters,
                    id: Date.now()
                };

                // Remove duplicates based on display label and move to top
                const updatedHistory = [newEntry, ...searchHistory.filter(h => h.display !== displayLabel)].slice(0, 5);
                setSearchHistory(updatedHistory);
                localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
            }
        }

        const params = new URLSearchParams();
        if (finalLocation) params.append("location", finalLocation);
        if (finalTypes.length) params.append("type", finalTypes.join(","));
        Object.keys(finalFilters).forEach(key => {
            if (finalFilters[key]) params.append(key, finalFilters[key]);
        });
        navigate(`/search?${params.toString()}`);
    };

    return (
        <div className="search-bar-wrapper">
            <AnimatePresence>
                {isMobileSearchOpen && (
                    <MobileSearchOverlay
                        isOpen={isMobileSearchOpen}
                        onClose={() => setIsMobileSearchOpen(false)}
                        onSearch={handleSearch}
                        initialValue={location}
                        searchHistory={searchHistory}
                        onDeleteHistory={deleteHistoryItem}
                        propertyOptions={propertyOptions}
                        selectedProperties={selectedProperties}
                        onToggleProperty={toggleProperty}
                        filterConfigs={filterConfigs}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearAll={clearAll}
                    />
                )}
            </AnimatePresence>

            {/* Title and Subtitle with Animations - Hidden on mobile to match reference focus */}
            <motion.div
                className="search-bar-header lg:block hidden"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    Find Your Dream Property
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                >
                    Search from a wide range of properties across India
                </motion.p>
            </motion.div>

            <motion.div
                className="redesign-search-bar"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                }}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={{
                    y: -4,
                    transition: { duration: 0.3 }
                }}
                ref={dropdownRef}
            >
                <div className="search-bar-inner">
                    {/* Animated shimmer effect */}
                    <div className="shimmer-overlay" />

                    {/* MOBILE ONLY UI - Redesigned per reference */}
                    <div className="mobile-search-ui-container">
                        <div className="mobile-search-box-trigger" onClick={handleInputClick}>
                            <div className="m-search-left">
                                <svg className="m-search-icon" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                                </svg>
                                <span className="m-search-placeholder">Find Your Dream Property</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Search Row - Content hidden on mobile via CSS */}
                    <div className="search-main">
                        <motion.div
                            className="property-dropdown-toggle"
                            onClick={() => setDropdownOpen((prev) => !prev)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {selectedProperties.length > 0
                                ? `${selectedProperties.length} Selected`
                                : "All Residential"} ▾
                        </motion.div>

                        <div className="search-input-container">
                            <motion.input
                                type="text"
                                className="search-input"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder='Search from a wide range of properties across India"'
                                whileFocus={{ scale: 1.01 }}
                                readOnly={false} // Allow direct input on desktop; mobile uses overlay trigger
                            />
                            <div className="input-action-icons">
                            </div>
                        </div>

                        <motion.button
                            className="search-button"
                            onClick={() => handleSearch()}
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 8px 30px rgba(11, 240, 23, 0.4)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="search-icon" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>Search</span>
                        </motion.button>
                    </div>
                </div>

                {/* Dropdown Panel */}
                <AnimatePresence>
                    {dropdownOpen && (
                        <motion.div
                            className="dropdown-panel"
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        >
                            <div className="dropdown-header">
                                <h3 className="dropdown-title">Property Type</h3>
                                <motion.div
                                    className="clear-btn"
                                    onClick={clearAll}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Clear
                                </motion.div>
                            </div>

                            <div className="dropdown-top">
                                <motion.div
                                    className="checkbox-grid"
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.03
                                            }
                                        }
                                    }}
                                >
                                    {propertyOptions.map((option, index) => (
                                        <motion.label
                                            key={option}
                                            className="checkbox-item"
                                            variants={{
                                                hidden: { opacity: 0, x: -20 },
                                                visible: { opacity: 1, x: 0 }
                                            }}
                                            whileHover={{ scale: 1.03, x: 4 }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedProperties.includes(option)}
                                                onChange={() => toggleProperty(option)}
                                            />
                                            {option}
                                        </motion.label>
                                    ))}
                                </motion.div>
                            </div>

                            <div className="filters-row">
                                {Object.keys(filterConfigs).map((key) => (
                                    <motion.select
                                        key={key}
                                        className="filter-select"
                                        value={filters[key]}
                                        onChange={(e) => handleFilterChange(key, e.target.value)}
                                        whileHover={{ scale: 1.02 }}
                                        whileFocus={{ scale: 1.02 }}
                                    >
                                        <option value="">
                                            {key === 'postedBy' ? 'Listed By' : `Select ${key === 'bedrooms' ? 'BHK' : key.toUpperCase()}`}
                                        </option>
                                        {filterConfigs[key].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </motion.select>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Modern Search History - Desktop & Mobile */}
            <AnimatePresence>
                {searchHistory.length > 0 && (
                    <motion.div
                        className="search-history-container"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                    >
                        <div className="history-label">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Recent Searches</span>
                        </div>
                        <div className="history-chips">
                            {searchHistory.map((item, index) => (
                                <motion.div
                                    key={item.id || index}
                                    className="history-chip"
                                    onClick={() => handleSearch(item)}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ y: -2, backgroundColor: "rgba(139, 92, 246, 0.15)" }}
                                    layout
                                >
                                    <span>{item.display || item}</span>
                                    <button
                                        className="delete-history-btn"
                                        onClick={(e) => deleteHistoryItem(item.id, e)}
                                    >
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DetailedSearchBar;


