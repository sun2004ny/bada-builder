import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ variant = 'default' }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bhkType, setBhkType] = useState('');
  const [location, setLocation] = useState('');

  // Check if BHK type should be shown
  const showBhkType = ['flat', 'house', 'villa'].includes(propertyType);

  // Handle property type change
  const handlePropertyTypeChange = (e) => {
    const newType = e.target.value;
    setPropertyType(newType);
    // Reset BHK if property type doesn't support it
    if (!['flat', 'house', 'villa'].includes(newType)) {
      setBhkType('');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Build search query parameters
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (propertyType) params.append('type', propertyType);
    // Only add BHK if it's applicable for the property type
    if (bhkType && showBhkType) params.append('bhk', bhkType);
    if (location) params.append('location', location);

    // Navigate to search results page
    navigate(`/search?${params.toString()}`);
  };

  // Compact version for header
  if (variant === 'compact') {
    return (
      <form onSubmit={handleSearch} className="search-bar-compact">
        <div className="search-input-wrapper">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-compact"
          />
          <button type="submit" className="search-btn-compact">
            Search
          </button>
        </div>
      </form>
    );
  }

  // Full version for hero section and pages
  return (
    <form onSubmit={handleSearch} className="search-bar-full">
      <div className="search-bar-container">
        <div className="search-field">
          <label htmlFor="search-query">
            <svg className="field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </label>
          <input
            id="search-query"
            type="text"
            placeholder="Search by property name, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="search-field">
          <label htmlFor="property-type">
            <svg className="field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </label>
          <select
            id="property-type"
            value={propertyType}
            onChange={handlePropertyTypeChange}
            className="search-select"
          >
            <option value="">Property Type</option>
            <option value="flat">Flat/Apartment</option>
            <option value="house">Independent House</option>
            <option value="villa">Villa</option>
            <option value="land">Land/Plot</option>
            <option value="commercial">Commercial</option>
            <option value="shop">Shop</option>
            <option value="office">Office</option>
          </select>
        </div>

        {/* BHK Type - Only show for flat, house, villa */}
        {showBhkType && (
          <div className="search-field">
            <label htmlFor="bhk-type">
              <svg className="field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </label>
            <select
              id="bhk-type"
              value={bhkType}
              onChange={(e) => setBhkType(e.target.value)}
              className="search-select"
            >
              <option value="">BHK Type</option>
              <option value="1RK">1 RK</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4 BHK</option>
              <option value="5BHK">5 BHK</option>
              <option value="6BHK">6+ BHK</option>
            </select>
          </div>
        )}

        <div className="search-field">
          <label htmlFor="location">
            <svg className="field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </label>
          <input
            id="location"
            type="text"
            placeholder="Enter or Select Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="search-input"
            list="location-list"
          />
          <datalist id="location-list">
            <option value="PAN India" />
            <option value="Mumbai" />
            <option value="Delhi" />
            <option value="Bangalore" />
            <option value="Hyderabad" />
            <option value="Ahmedabad" />
            <option value="Chennai" />
            <option value="Kolkata" />
            <option value="Pune" />
            <option value="Vadodara" />
            <option value="Surat" />
            <option value="Rajkot" />
            <option value="Gandhinagar" />
            <option value="Bhavnagar" />
            <option value="Jamnagar" />
            <option value="Anand" />
            <option value="Navi Mumbai" />
            <option value="Thane" />
            <option value="Nagpur" />
            <option value="Nashik" />
            <option value="Aurangabad" />
            <option value="Mysore" />
            <option value="Mangalore" />
            <option value="Hubli" />
            <option value="Coimbatore" />
            <option value="Madurai" />
            <option value="Tiruchirappalli" />
            <option value="Warangal" />
            <option value="Nizamabad" />
            <option value="Visakhapatnam" />
            <option value="Vijayawada" />
            <option value="Guntur" />
            <option value="Kochi" />
            <option value="Thiruvananthapuram" />
            <option value="Kozhikode" />
            <option value="Howrah" />
            <option value="Durgapur" />
            <option value="Siliguri" />
            <option value="Jaipur" />
            <option value="Jodhpur" />
            <option value="Udaipur" />
            <option value="Kota" />
            <option value="Indore" />
            <option value="Bhopal" />
            <option value="Jabalpur" />
            <option value="Gwalior" />
            <option value="Noida" />
            <option value="Ghaziabad" />
            <option value="Lucknow" />
            <option value="Kanpur" />
            <option value="Agra" />
            <option value="Varanasi" />
            <option value="Chandigarh" />
            <option value="Ludhiana" />
            <option value="Amritsar" />
            <option value="Jalandhar" />
            <option value="Gurgaon" />
            <option value="Faridabad" />
            <option value="Panipat" />
            <option value="Patna" />
            <option value="Gaya" />
            <option value="Bhubaneswar" />
            <option value="Cuttack" />
            <option value="Ranchi" />
            <option value="Jamshedpur" />
            <option value="Raipur" />
            <option value="Bhilai" />
            <option value="Dehradun" />
            <option value="Haridwar" />
            <option value="Panaji" />
            <option value="Margao" />
          </datalist>
        </div>

        <button type="submit" className="search-btn-full">
          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
