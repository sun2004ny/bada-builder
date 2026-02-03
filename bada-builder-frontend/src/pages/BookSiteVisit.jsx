import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to handle map events
const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

// Helper component to handle external map control (like flyTo)
// Helper component to handle external map control (like flyTo)
const MapController = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [center, map]);

  // Handle resize when modal opens (run only once on mount)
  useEffect(() => {
    // Invalidate size after a short delay to ensure modal transition is complete
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

const BookSiteVisit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const property = location.state?.property;

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    people: 1,
    person1: '',
    person2: '',
    person3: '',
    paymentMethod: 'postvisit',
  });

  const [locationData, setLocationData] = useState({
    address: '',
    houseNo: '',
    building: '',
    area: '',
    city: '',
    pincode: '',
    locationFromMap: '',
    latitude: null,
    longitude: null
  });

  // Function to combine individual address fields into a single string (optimized with useCallback)
  const updateCombinedAddress = useCallback((newLocationData) => {
    const { houseNo, building, area, city, pincode } = newLocationData;
    const addressParts = [
      houseNo?.trim(),
      building?.trim(),
      area?.trim(),
      city?.trim(),
      pincode?.trim()
    ].filter(part => part && part.length > 0);

    const combinedAddress = addressParts.join(', ');

    setLocationData({
      ...newLocationData,
      address: combinedAddress
    });
  }, []);

  // Optimized field handlers
  const handleHouseNoChange = useCallback((e) => {
    const newLocationData = { ...locationData, houseNo: e.target.value };
    updateCombinedAddress(newLocationData);
  }, [locationData, updateCombinedAddress]);

  const handleBuildingChange = useCallback((e) => {
    const newLocationData = { ...locationData, building: e.target.value };
    updateCombinedAddress(newLocationData);
  }, [locationData, updateCombinedAddress]);

  const handleAreaChange = useCallback((e) => {
    const newLocationData = { ...locationData, area: e.target.value };
    updateCombinedAddress(newLocationData);
  }, [locationData, updateCombinedAddress]);

  const handleCityChange = useCallback((e) => {
    const newLocationData = { ...locationData, city: e.target.value };
    updateCombinedAddress(newLocationData);
  }, [locationData, updateCombinedAddress]);

  const handlePincodeChange = useCallback((e) => {
    const newLocationData = { ...locationData, pincode: e.target.value };
    updateCombinedAddress(newLocationData);
  }, [locationData, updateCombinedAddress]);

  const handleLocationFromMapChange = useCallback((e) => {
    setLocationData({ ...locationData, locationFromMap: e.target.value });
  }, [locationData]);

  const clearMapLocation = useCallback(() => {
    setLocationData(prevData => ({
      ...prevData,
      locationFromMap: '',
      latitude: null,
      longitude: null
    }));
  }, []);

  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Map states
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Delhi
  const [markerPosition, setMarkerPosition] = useState([28.6139, 77.2090]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchTimeoutRef = useRef(null);


  // Set date restrictions (today to 30 days from now, excluding Sundays)
  useEffect(() => {
    const today = new Date();
    const maxBookingDate = new Date();
    maxBookingDate.setDate(today.getDate() + 30);

    setMinDate(today.toISOString().split('T')[0]);
    setMaxDate(maxBookingDate.toISOString().split('T')[0]);
  }, []);

  // Removed Google Maps API loading logic

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          console.log('✅ Razorpay script loaded successfully');
          resolve(true);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Razorpay script');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  // Authentication protection - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('🔒 User not authenticated, redirecting to login...');
      // Save current location and property data to return after login
      const returnPath = location.pathname + location.search;
      const returnState = {
        property,
        returnTo: returnPath,
        message: 'Please login to book a site visit'
      };

      navigate('/login', {
        state: returnState,
        replace: true
      });
    }
  }, [authLoading, isAuthenticated, navigate, location, property]);





  // Check if selected date is a Sunday
  const isSunday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if selected date is Sunday
    if (name === 'date' && isSunday(value)) {
      alert('Site visits are not available on Sundays. Please select another date.');
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handlePaymentMethodChange = (e) => {
    setFormData({ ...formData, paymentMethod: e.target.value });
  };

  // Nominatim Search Implementation
  const handleSearch = async (query) => {
    if (!query || query.length < 3) return;

    try {
      // Use local backend proxy to avoid CORS and set headers
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
      const response = await fetch(`${baseUrl}/api/proxy/nominatim/search?q=${encodeURIComponent(query)}`);
      // const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`);

      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 500);
  };

  const selectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const pos = [lat, lng];

    setMarkerPosition(pos);
    setMapCenter(pos);
    setSelectedLocation({
      lat,
      lng,
      address: result.display_name
    });
    setSearchQuery(result.display_name);
    setShowSearchResults(false);
  };

  const reverseGeocode = async (lat, lng) => {
    setAddressLoading(true);
    try {
      // Use local backend proxy
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
      const response = await fetch(`${baseUrl}/api/proxy/nominatim/reverse?lat=${lat}&lon=${lng}`);
      // const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);

      if (!response.ok) throw new Error('Reverse geocode failed');

      const data = await response.json();

      if (data && data.address) {
        // Extract granular address details
        const addr = data.address;
        const details = {
          houseNo: addr.house_number || '',
          building: addr.road || addr.building || '',
          area: addr.suburb || addr.neighbourhood || addr.residential || '',
          city: addr.city || addr.town || addr.village || '',
          pincode: addr.postcode || '',
          fullAddress: data.display_name
        };

        setSelectedLocation({
          lat,
          lng,
          address: data.display_name,
          details: details // Store details for auto-fill
        });
        setSearchQuery(data.display_name);
      } else {
        setSelectedLocation({
          lat,
          lng,
          address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          details: null
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setSelectedLocation({
        lat,
        lng,
        address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        details: null
      });
    } finally {
      setAddressLoading(false);
    }
  };

  // Get user's current location (optimized with useCallback)
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setCurrentLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const pos = [lat, lng];

        setMarkerPosition(pos);
        setMapCenter(pos);
        reverseGeocode(lat, lng);
        setCurrentLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please allow location access.');
        setCurrentLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Open map modal
  const openMapModal = () => {
    setShowMapModal(true);
    setSearchQuery('');
    // Removed getCurrentLocation() to prevent auto-fetching
    // Set default center if no location selected
    if (!selectedLocation && !locationData.latitude) {
      setMapCenter([28.6139, 77.2090]); // Default to Delhi or a central location
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showMapModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMapModal]);

  const handleMapClick = (latlng) => {
    const pos = [latlng.lat, latlng.lng];
    setMarkerPosition(pos);
    reverseGeocode(latlng.lat, latlng.lng);
  };

  const handleMarkerDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    const pos = [lat, lng];
    setMarkerPosition(pos);
    reverseGeocode(lat, lng);
  };

  // Confirm selected location
  const confirmLocation = () => {
    if (selectedLocation) {
      const newData = {
        ...locationData,
        locationFromMap: selectedLocation.address,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      };

      // Auto-fill manual fields if details are available
      if (selectedLocation.details) {
        if (selectedLocation.details.houseNo) newData.houseNo = selectedLocation.details.houseNo;
        if (selectedLocation.details.building) newData.building = selectedLocation.details.building;
        if (selectedLocation.details.area) newData.area = selectedLocation.details.area;
        if (selectedLocation.details.city) newData.city = selectedLocation.details.city;
        if (selectedLocation.details.pincode) newData.pincode = selectedLocation.details.pincode;
      }

      // Update combined address immediately
      const addressParts = [
        newData.houseNo?.trim(),
        newData.building?.trim(),
        newData.area?.trim(),
        newData.city?.trim(),
        newData.pincode?.trim()
      ].filter(part => part && part.length > 0);

      newData.address = addressParts.join(', ');

      setLocationData(newData);
      setShowMapModal(false);
    }
  };

  // Cancel location selection
  const cancelLocationSelection = () => {
    setShowMapModal(false);
    setSelectedLocation(null);
  };

  // Razorpay payment handler
  const handleRazorpayPayment = async (bookingData) => {
    if (!window.Razorpay) {
      alert('Payment gateway is loading. Please try again in a moment.');
      return false;
    }

    const amount = 300; // ₹300 for 1 hour visit
    const currency = 'INR';

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100, // Amount in paise
      currency: currency,
      name: 'Bada Builder',
      description: `Site Visit Booking - ${bookingData.property_title}`,
      image: '/logo.png', // Your company logo
      order_id: '', // Will be generated from backend if needed
      handler: async function (response) {
        console.log('✅ Payment successful:', response);

        // Save payment details
        const paymentData = {
          ...bookingData,
          payment_status: 'completed',
          payment_method: 'razorpay_previsit',
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id || '',
          razorpay_signature: response.razorpay_signature || '',
          payment_amount: amount,
          payment_currency: currency,
          payment_timestamp: new Date().toISOString()
        };

        try {
          // Save booking with payment details to backend API
          const response = await bookingsAPI.verifyPayment(paymentData);
          paymentData.booking_id = response.booking?.id || response.id;
          paymentData.property_location = property?.location || 'N/A';

          // Show success and redirect
          setBookingSuccess(true);
          setTimeout(() => {
            navigate('/');
          }, 3000);

        } catch (error) {
          console.error('Error saving booking after payment:', error);
          alert('Payment successful but booking save failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
        }
      },
      prefill: {
        name: bookingData.person1_name,
        email: bookingData.user_email,
        contact: currentUser?.phoneNumber || ''
      },
      notes: {
        property_id: bookingData.property_id,
        property_title: bookingData.property_title,
        visit_date: bookingData.visit_date,
        visit_time: bookingData.visit_time,
        booking_type: 'site_visit'
      },
      theme: {
        color: '#58335e'
      },
      modal: {
        ondismiss: function () {
          console.log('Payment cancelled by user');
          setPaymentLoading(false);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (loading || paymentLoading) {
      e.stopPropagation();
      return;
    }

    if (!isAuthenticated) {
      alert('Please login to book a site visit');
      navigate('/login');
      return;
    }

    // Light address validation - warn but don't block
    if (locationData.address.length < 15) {
      const proceed = window.confirm(
        'Your address seems incomplete. For better service, please include:\n' +
        '• House/Flat number\n' +
        '• Building/Street name\n' +
        '• Area/Locality\n' +
        '• City\n\n' +
        'Do you want to continue anyway?'
      );
      if (!proceed) {
        return;
      }
    }

    // Prepare booking data
    const bookingData = {
      property_id: property?.id || null,
      property_title: property?.title || 'General Site Visit',
      user_id: currentUser.id || currentUser.uid,
      user_email: currentUser.email,
      visit_date: formData.date,
      visit_time: formData.time,
      number_of_people: formData.people,
      person1_name: formData.person1,
      person2_name: formData.person2 || null,
      person3_name: formData.person3 || null,
      pickup_address: locationData.address,
      location_from_map: locationData.locationFromMap || null,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      payment_method: formData.paymentMethod,
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    // Handle different payment methods
    if (formData.paymentMethod === 'previsit') {
      // For previsit, initiate Razorpay payment
      setPaymentLoading(true);
      const paymentSuccess = await handleRazorpayPayment(bookingData);
      if (!paymentSuccess) {
        setPaymentLoading(false);
      }
      // Note: Booking will be saved after successful payment in handleRazorpayPayment
    } else {
      // For postvisit, save booking directly
      setLoading(true);

      // Create a timeout promise to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 15000);
      });

      try {
        // Save booking to backend API with timeout race
        bookingData.payment_status = 'pending';

        // Race between API call and timeout
        const response = await Promise.race([
          bookingsAPI.create(bookingData),
          timeoutPromise
        ]);

        // Add booking ID to data
        bookingData.booking_id = response.booking?.id || response.id;
        bookingData.property_location = property?.location || 'N/A';


        // Show success state and auto-redirect
        setBookingSuccess(true);
        console.log('✅ Booking successful! Redirecting to home...');

        // Automatic redirect after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Error booking site visit:', error);
        alert(error.message === 'Request timed out'
          ? 'Booking request timed out. Please check your connection or try again.'
          : 'Failed to book site visit. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="book-visit-container">
        <div className="form-section ui-bg" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #9e4efb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Portal Modal Component
  const MapModal = () => {
    if (!showMapModal) return null;

    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="bg-[#1a1a2e] w-full max-w-4xl max-h-[95dvh] rounded-2xl shadow-2xl flex flex-col border border-purple-500/30 overflow-hidden relative animate-scaleIn">

          {/* Header */}
          <div className="flex justify-between items-center p-2 border-b border-gray-700 bg-[#1a1a2e] shrink-0 z-20">
            <h3 className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              📍 Select Pickup Location
            </h3>
            <button
              onClick={cancelLocationSelection}
              type="button"
              className="!w-8 !h-8 !flex !items-center !justify-center !rounded-full !bg-transparent hover:!bg-white/10 !p-0 !border-0 focus:!outline-none transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="!w-5 !h-5 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content Wrapper - Changed to allow scrolling if content overflows */}
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">

            {/* Controls Section */}
            <div className="px-3 pt-3 pb-1 md:px-4 md:pt-4 md:pb-2 bg-[#232338] border-b border-gray-700 shrink-0 z-10 w-full">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={currentLocationLoading}
                  className="md:w-auto w-full px-4 py-2 !bg-green-600 hover:!bg-green-700 disabled:!bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg shadow-green-900/20 text-sm flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  {currentLocationLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full custom-spin" />
                      <span>Locating...</span>
                    </>
                  ) : (
                    <>
                      <span>📍</span> Use My Location
                    </>
                  )}
                </button>

                <div className="relative flex-1 group">
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    className="w-full pl-4 pr-10 py-2 bg-[#1a1a2e] border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => searchQuery.length >= 3 && setShowSearchResults(true)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500">
                    🔍
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#2a2a3e] border border-gray-600 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {searchResults.map((result, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-3 hover:bg-purple-600/20 cursor-pointer text-gray-200 hover:text-white border-b border-gray-700/50 last:border-0 transition-colors flex items-start gap-3"
                          onClick={() => selectSearchResult(result)}
                        >
                          <span className="mt-1">📍</span>
                          <span className="text-sm">{result.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-400 flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/50 shrink-0 mt-0.5">i</span>
                <p>Click on map, drag marker, or search to set location</p>
              </div>
            </div>

            {/* Map Container - Reduced min-height for mobile to prevent overflow */}
            <div className="flex-1 relative bg-gray-900 min-h-[250px] md:min-h-[300px]">
              {/* Map Overlay Loading */}
              <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] z-[1000] flex flex-col items-center justify-center transition-opacity duration-300 ${addressLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
              >
                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full custom-spin mb-3"></div>
                <p className="text-white font-medium">Fetching address...</p>
              </div>

              {/* Force Leaflet CSS override directly in component to ensure it applies */}
              <style>{`
                .leaflet-pane img, .leaflet-tile, .leaflet-marker-icon, .leaflet-marker-shadow {
                    max-width: none !important;
                    max-height: none !important;
                }
                .leaflet-container {
                    z-index: 0;
                }
              `}</style>

              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ width: '100%', height: '100%', minHeight: '350px', zIndex: 0 }}
                scrollWheelZoom={true}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={markerPosition}
                  draggable={true}
                  eventHandlers={{
                    dragend: handleMarkerDragEnd,
                  }}
                />
                <MapEvents onMapClick={handleMapClick} />
                <MapController center={mapCenter} />
              </MapContainer>

              {/* Floating Tooltip */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-black/70 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10 shadow-lg pointer-events-none">
                📍 Drag marker to adjust
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#1a1a2e] border-t border-gray-700 shrink-0 z-20">
              {selectedLocation ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2 mb-1 text-green-400 font-semibold">
                    <span className="text-lg">✅</span> Location Selected
                  </div>
                  <p className="text-gray-300 text-sm leading-tight">{selectedLocation.address}</p>
                  <div className="mt-1 text-xs text-gray-500 font-mono bg-black/20 inline-block px-2 py-0.5 rounded">
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </div>
                </div>
              ) : (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-4 text-orange-300 text-sm flex items-center gap-2">
                  <span>👆</span> Please select a pickup location on the map
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 py-3 px-4 !bg-gray-700 hover:!bg-gray-600 text-white rounded-xl font-semibold transition-colors"
                  onClick={cancelLocationSelection}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 py-3 px-4 !bg-purple-600 hover:!bg-purple-700 disabled:!bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg shadow-purple-900/20 transition-all transform active:scale-95"
                  onClick={confirmLocation}
                  disabled={!selectedLocation}
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="min-h-screen bg-[#080918] p-4 md:p-6 lg:p-8 font-sans text-gray-100 flex justify-center md:justify-end">
      {/* Loading Overlay */}
      {(loading || paymentLoading) && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1a1a2e] p-8 rounded-2xl border border-purple-500/50 shadow-2xl flex flex-col items-center animate-scaleIn">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full custom-spin mb-4"></div>
            <p className="text-lg font-medium text-white">{paymentLoading ? 'Processing Payment...' : 'Creating Booking...'}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:mr-20">

        {/* Main Form Section - Takes 8 cols on desktop */}
        <div className="lg:col-span-8 bg-[#1a1a2e] border-2 border-[#474545] rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-8 pb-4 border-b border-purple-500/30">
              Book a Site Visit
            </h2>

            {/* Property Information */}
            {property ? (
              <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-xl p-6 mb-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                  <span>📍</span> Property Details
                </h3>
                <div className="bg-purple-500/10 border-l-4 border-purple-500 rounded-r-lg p-4 space-y-2">
                  <h4 className="text-white font-bold text-lg">{property.title}</h4>
                  <p className="text-green-400 flex items-center gap-2"><span className="text-sm">📍</span> {property.location}</p>
                  <p className="text-blue-400 flex items-center gap-2"><span className="text-sm">🏠</span> {property.type}</p>
                  {property.price && <p className="text-yellow-400 font-bold flex items-center gap-2"><span className="text-sm">💰</span> {property.price}</p>}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 mb-8">
                <div className="border-l-4 border-gray-500 pl-4">
                  <h4 className="text-white font-bold text-lg mb-2">🏠 General Site Visit</h4>
                  <p className="text-gray-400">You can specify the property details during the visit or contact us for assistance.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Date & Time Section */}
              <div className="bg-[#1a1a2e] p-6 rounded-xl border-2 border-[#d1c4e9] space-y-6 relative overflow-visible">
                <h4 className="text-purple-400 font-semibold text-lg flex items-center gap-2 mb-2">
                  <span>📅</span> Select Date & Time
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-white font-medium">Visit Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={minDate}
                      max={maxDate}
                      required
                      className="w-full bg-[#2a2a3e] border-2 border-[#444] text-white rounded-lg p-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder-gray-500"
                    />
                    <small className="text-gray-500 text-xs italic block mt-1">Available Monday to Saturday</small>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-white font-medium">Visit Time</label>
                    <div className="relative">
                      <select
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#2a2a3e] border-2 border-[#444] text-white rounded-lg p-3 pr-10 appearance-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all cursor-pointer"
                      >
                        <option value="" disabled>Select a time slot</option>
                        <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                        <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                        <option value="12:00 PM - 1:00 PM">12:00 PM - 1:00 PM</option>
                        <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
                        <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                        <option value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</option>
                        <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                    </div>
                    <small className="text-gray-500 text-xs italic block mt-1">10:00 AM - 5:00 PM</small>
                  </div>
                </div>
              </div>

              {/* People Section */}
              <div className="space-y-2">
                <label className="block text-white font-medium">Number of People (Max 3)</label>
                <div className="relative">
                  <select
                    name="people"
                    value={formData.people}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#232323] border border-gray-600 text-white rounded-lg p-3 pr-10 appearance-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>

              {/* Visitor Details */}
              <div className="bg-[#1a1a2e] p-6 rounded-xl border-2 border-[#d1c4e9] space-y-4">
                <h4 className="text-purple-400 font-semibold text-lg flex items-center gap-2 mb-2">
                  <span>👥</span> Visitor Details
                </h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-white text-sm">1st Person Name *</label>
                    <input
                      type="text"
                      name="person1"
                      value={formData.person1}
                      onChange={handleChange}
                      placeholder="Enter name"
                      required
                      className="w-full bg-[#2a2a3e] border border-gray-600 text-white rounded-lg p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                  </div>

                  {formData.people >= 2 && (
                    <div className="space-y-2 animate-fadeIn">
                      <label className="block text-white text-sm">2nd Person Name *</label>
                      <input
                        type="text"
                        name="person2"
                        value={formData.person2}
                        onChange={handleChange}
                        placeholder="Enter name"
                        required={parseInt(formData.people) >= 2}
                        className="w-full bg-[#2a2a3e] border border-gray-600 text-white rounded-lg p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                      />
                    </div>
                  )}

                  {formData.people == 3 && (
                    <div className="space-y-2 animate-fadeIn">
                      <label className="block text-white text-sm">3rd Person Name *</label>
                      <input
                        type="text"
                        name="person3"
                        value={formData.person3}
                        onChange={handleChange}
                        placeholder="Enter name"
                        required
                        className="w-full bg-[#2a2a3e] border border-gray-600 text-white rounded-lg p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Pickup Location */}
              <div className="bg-[#1a1a2e] p-6 rounded-xl border-2 border-[#d1c4e9] space-y-6">
                <h4 className="text-purple-400 font-semibold text-lg flex items-center gap-2 mb-2">
                  <span>📍</span> Pickup Location
                </h4>

                <div className="space-y-4">
                  {/* Address Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="houseNo"
                      value={locationData.houseNo || ''}
                      onChange={handleHouseNoChange}
                      placeholder="House / Flat No"
                      required
                      className="w-full bg-[#2a2a3e] border-2 border-[#444] text-white rounded-lg p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                    <input
                      type="text"
                      name="building"
                      value={locationData.building || ''}
                      onChange={handleBuildingChange}
                      placeholder="Building / Street"
                      required
                      className="w-full bg-[#2a2a3e] border-2 border-[#444] text-white rounded-lg p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                    <input
                      type="text"
                      name="area"
                      value={locationData.area || ''}
                      onChange={handleAreaChange}
                      placeholder="Area / Locality"
                      required
                      className="w-full bg-[#2a2a3e] border-2 border-[#444] text-white rounded-lg p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                    <input
                      type="text"
                      name="city"
                      value={locationData.city || ''}
                      onChange={handleCityChange}
                      placeholder="City"
                      required
                      className="w-full bg-[#2a2a3e] border-2 border-[#444] text-white rounded-lg p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="pincode"
                      value={locationData.pincode || ''}
                      onChange={handlePincodeChange}
                      placeholder="Pincode"
                      pattern="[0-9]{6}"
                      maxLength="6"
                      required
                      className="w-full bg-[#2a2a3e] border-2 border-[#444] text-white rounded-lg p-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={openMapModal}
                      className="w-full !bg-purple-600 hover:!bg-purple-700 text-white font-semibold rounded-lg p-3 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/30 active:scale-[0.98]"
                    >
                      <span>📍</span> Select on Map
                    </button>
                  </div>

                  {/* Map Location Readonly Display */}
                  <div className="relative pt-4 border-t border-gray-700 mt-2">
                    <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wide font-semibold">Location from Map (Optional)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={locationData.locationFromMap || ''}
                        readOnly
                        placeholder="No location selected from map"
                        className="w-full bg-[#1a1a2e] border-2 border-dashed border-[#444] text-gray-400 rounded-lg p-3 italic cursor-not-allowed focus:outline-none"
                      />
                      {locationData.locationFromMap && (
                        <button
                          type="button"
                          onClick={clearMapLocation}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-500 p-2 transition-colors !bg-transparent"
                          title="Clear location"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {locationData.address && locationData.address.length > 0 && locationData.address.length < 15 && (
                      <p className="text-yellow-500 text-sm mt-1 animate-pulse">⚠️ Please provide more address details</p>
                    )}
                  </div>
                </div>

                <input type="hidden" name="address" value={locationData.address} required />
              </div>

              {/* Charges Info */}
              <div className="bg-[#242424] p-4 rounded-xl border border-purple-500/30 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <strong className="block text-purple-400 mb-1">Hours of Visit & Charges:</strong>
                  <div className="text-white font-mono text-lg">1 Hour - ₹300</div>
                  <div className="text-gray-500 text-xs">Additional charges: ₹5 per minute</div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <strong className="block text-white text-lg">Payment Method:</strong>
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-gray-700">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'previsit' ? 'border-purple-500' : 'border-gray-500'}`}>
                      {formData.paymentMethod === 'previsit' && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />}
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="previsit"
                      checked={formData.paymentMethod === 'previsit'}
                      onChange={handlePaymentMethodChange}
                      className="hidden"
                    />
                    <span className="text-white group-hover:text-purple-300 transition-colors">Previsit (Online)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-gray-700">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'postvisit' ? 'border-purple-500' : 'border-gray-500'}`}>
                      {formData.paymentMethod === 'postvisit' && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />}
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="postvisit"
                      checked={formData.paymentMethod === 'postvisit'}
                      onChange={handlePaymentMethodChange}
                      className="hidden"
                    />
                    <span className="text-white group-hover:text-purple-300 transition-colors">Postvisit (Cash)</span>
                  </label>
                </div>
              </div>

              {/* Previsit Payment Details */}
              {formData.paymentMethod === 'previsit' && (
                <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 rounded-xl border-2 border-[#58335e] shadow-lg animate-fadeIn">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <span>💳</span> Pre-Visit Payment
                  </h4>
                  <div className="space-y-3 bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex justify-between text-gray-300 pb-3 border-b border-white/10">
                      <span>Site Visit (1 Hour)</span>
                      <span className="font-mono">₹300</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg pt-1">
                      <span>Total Amount</span>
                      <span className="text-green-400 font-mono">₹300</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 text-sm space-y-2">
                    <p className="text-gray-400 flex items-center gap-2">💡 <strong>Note:</strong> If you purchase the property, this amount will be refunded.</p>
                    <p className="text-gray-400 flex items-center gap-2">🔒 Secure payment powered by Razorpay</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                {formData.paymentMethod === 'previsit' ? (
                  <button
                    type="submit"
                    disabled={loading || paymentLoading || !razorpayLoaded}
                    className="flex-1 !bg-green-600 hover:!bg-green-700 disabled:!bg-gray-700 disabled:cursor-not-allowed text-white text-lg font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-green-900/40 hover:shadow-green-900/60 transform active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {!razorpayLoaded ? (
                      'Loading Gateway...'
                    ) : paymentLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full custom-spin" />
                        Processing...
                      </>
                    ) : (
                      <>💳 Pay ₹300 & Book Visit</>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 !bg-green-600 hover:!bg-green-700 disabled:!bg-gray-700 disabled:cursor-not-allowed text-white text-lg font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-green-900/60 transform active:scale-[0.98]"
                  >
                    {loading ? 'Booking...' : '📅 Book Site Visit'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => alert('Reschedule functionality coming soon!')}
                  className="flex-1 !bg-gray-700 hover:!bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Reschedule
                </button>

                <button
                  type="button"
                  className="flex-1 !bg-red-600 hover:!bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-red-900/40"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Info Section - Now on the right on desktop (Takes 4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 bg-[#080918] border border-[#474545] p-6 rounded-xl shadow-lg h-fit">
          <h3 className="text-purple-400 font-bold mb-3 border-b border-gray-800 pb-2">Note:</h3>
          <ul className="space-y-2 text-gray-400 text-sm list-disc pl-5">
            <li>After booking a site visit, a car will pick you up from your address, take you to the site, and drop you back at your address.</li>
            <li>If you decide to purchase the property, the visit charges will be refunded.</li>
          </ul>
        </div>

      </div>

      {/* Render Portal Modal */}
      <MapModal />

      {/* Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm mx-4 animate-scaleIn">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h3>
            <p className="text-gray-600 mb-6">
              Your site visit has been booked. You will receive a confirmation shortly.
            </p>
            <div className="flex items-center justify-center text-blue-600 font-medium bg-blue-50 py-2 px-4 rounded-full mx-auto w-max">
              <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full custom-spin mr-2"></div>
              Redirecting...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSiteVisit;