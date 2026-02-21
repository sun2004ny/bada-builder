import React, { useState, useRef, useEffect, useMemo } from 'react';

const ReferLocationFilter = ({ properties, selectedLocation, onLocationSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Helper function to format strings to Proper Case
    const toProperCase = (str) => {
        return str.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        );
    };

    // Extract unique locations dynamically - Memoized for performance
    const uniqueLocations = useMemo(() => {
        if (!properties || !Array.isArray(properties)) return [];

        const invalidLocations = ["location not specified", "null", "undefined", "none", "n/a"];
        const locationMap = new Map(); // Use Map to ensure precise deduplication while preserving proper case

        properties.forEach(p => {
            if (!p.location || typeof p.location !== 'string') return;

            // Extract base location (before comma), trim whitespace
            const rawLocation = p.location.split(',')[0].trim();
            if (!rawLocation) return;

            const lowerLocation = rawLocation.toLowerCase();

            // Exclude invalid or placeholder values
            if (invalidLocations.includes(lowerLocation)) return;

            // Add properly cased version to map if it doesn't already exist
            if (!locationMap.has(lowerLocation)) {
                locationMap.set(lowerLocation, toProperCase(rawLocation));
            }
        });

        // Convert Map values to array and sort alphabetically
        return Array.from(locationMap.values()).sort((a, b) => a.localeCompare(b));
    }, [properties]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredLocations = uniqueLocations.filter(loc =>
        loc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (loc) => {
        onLocationSelect(loc);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onLocationSelect('');
        setSearchTerm('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (filteredLocations.length > 0) {
                handleSelect(filteredLocations[0]);
            }
        }
    };

    return (
        <div className="relative w-full sm:w-64 flex-shrink-0" ref={dropdownRef}>
            <div
                className="w-full h-11 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between px-3 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedLocation ? (
                    <span className="text-sm font-medium text-gray-800 truncate" title={selectedLocation}>
                        {selectedLocation}
                    </span>
                ) : (
                    <span className="text-sm text-gray-500">Search location...</span>
                )}

                <div className="flex items-center gap-2">
                    {selectedLocation && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                        <input
                            type="text"
                            className="w-full h-9 bg-gray-50 border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    </div>
                    <ul className="max-h-48 overflow-y-auto py-1">
                        {filteredLocations.length > 0 ? (
                            filteredLocations.map((loc, idx) => (
                                <li
                                    key={idx}
                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer transition-colors"
                                    onClick={() => handleSelect(loc)}
                                >
                                    {loc}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-2 text-sm text-gray-500 italic text-center">
                                No locations found
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ReferLocationFilter;
