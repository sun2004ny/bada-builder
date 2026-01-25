import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./DetailedSearchBar.css";

const propertyOptions = [
    "Flat/Apartment",
    "Independent/Builder Floor",
    "Independent House/Villa",
    "Residential Land",
    "1 RK/Studio Apartment",
    "Farm House",
    "Serviced Apartments",
    "Other",
];

const filterConfigs = {
    budget: ["Under 20 Lac", "20-40 Lac", "40-60 Lac", "60-80 Lac", "80 Lac - 1 Cr", "1-1.5 Cr", "1.5-2 Cr", "Above 2 Cr"],
    bedrooms: ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"],
    status: ["Ready to Move", "Under Construction"],
    postedBy: ["Owner", "Dealer", "Builder"]
};

const DetailedSearchBar = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [location, setLocation] = useState("");
    const [selectedProperties, setSelectedProperties] = useState([]);
    const [filters, setFilters] = useState({
        budget: "",
        bedrooms: "",
        status: "",
        postedBy: ""
    });
    const [isListening, setIsListening] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Initialize from URL params
    useEffect(() => {
        const loc = searchParams.get("location");
        const type = searchParams.get("type")?.split(",") || [];
        if (loc) setLocation(loc);
        if (type.length) setSelectedProperties(type);
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
            status: "",
            postedBy: ""
        });
    };

    const handleGeoLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Simple reverse geocoding using a free API or just setting a placeholder
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    if (data.address) {
                        const city = data.address.city || data.address.town || data.address.state;
                        setLocation(city);
                    }
                } catch (err) {
                    console.error("Geo search failed", err);
                }
            });
        }
    };

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice search is not supported in this browser.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setLocation(transcript);
        };
        recognition.start();
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (location) params.append("location", location);
        if (selectedProperties.length) params.append("type", selectedProperties.join(","));
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });
        navigate(`/search?${params.toString()}`);
    };

    return (
        <div className="search-bar-wrapper">
            {/* Title and Subtitle with Animations */}
            <motion.div
                className="search-bar-header"
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
                {/* Animated shimmer effect */}
                <div className="shimmer-overlay" />

                {/* Main Search Row */}
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
                            placeholder='Search "3 BHK for sale in Mumbai"'
                            whileFocus={{ scale: 1.01 }}
                        />
                        <div className="input-action-icons">
                            <motion.button
                                className="action-icon-btn geo-btn"
                                onClick={handleGeoLocation}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Use Current Location"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </motion.button>
                            <motion.button
                                className={`action-icon-btn mic-btn ${isListening ? 'listening' : ''}`}
                                onClick={handleVoiceSearch}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Voice Search"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                                    <path d="M19 10v2a7 7 0 01-14 0v-2M12 18v5M8 23h8" />
                                </svg>
                            </motion.button>
                        </div>
                    </div>

                    <motion.button
                        className="search-button"
                        onClick={handleSearch}
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

                {/* Dropdown Panel */}
                <AnimatePresence>
                    {dropdownOpen && (
                        <motion.div
                            className="dropdown-panel"
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
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
                                        <option value="">Select {key.charAt(0).toUpperCase() + key.slice(1)}</option>
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
        </div>
    );
};

export default DetailedSearchBar;


