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

const filterOptions = ["Budget", "Bedroom", "Construction Status", "Posted By"];

const DetailedSearchBar = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [location, setLocation] = useState("");
    const [selectedProperties, setSelectedProperties] = useState([]);
    const [possession, setPossession] = useState("");
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

    const clearProperties = () => setSelectedProperties([]);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (location) params.append("location", location);
        if (selectedProperties.length) params.append("type", selectedProperties.join(","));
        if (possession) params.append("possession", possession);
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
                        All Residential ▾
                    </motion.div>

                    <motion.input
                        type="text"
                        className="search-input"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder='Search "Flats for rent in sector 77 Noida"'
                        whileFocus={{ scale: 1.01 }}
                    />

                    <motion.button
                        className="search-button"
                        onClick={handleSearch}
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 8px 30px rgba(139, 92, 246, 0.5)"
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
                                <motion.div
                                    className="clear-btn"
                                    onClick={clearProperties}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Clear
                                </motion.div>
                            </div>

                            <div className="filters-row">
                                {filterOptions.map((filter) => (
                                    <motion.select
                                        key={filter}
                                        className="filter-select"
                                        whileHover={{ scale: 1.02 }}
                                        whileFocus={{ scale: 1.02 }}
                                    >
                                        <option value="">{filter}</option>
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


