import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';
import emailjs from '@emailjs/browser';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './BookSiteVisit.css';

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
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16);
    }
  }, [center, map]);

  // Handle resize when modal opens
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
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
    address: ''
  });

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
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`);
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

  // Reverse geocoding to get address from coordinates using Nominatim
  const reverseGeocode = async (lat, lng) => {
    setAddressLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();

      if (data && data.display_name) {
        setSelectedLocation({
          lat,
          lng,
          address: data.display_name
        });
        setSearchQuery(data.display_name);
      } else {
        setSelectedLocation({
          lat,
          lng,
          address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setSelectedLocation({
        lat,
        lng,
        address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      });
    } finally {
      setAddressLoading(false);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
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
  };

  // Open map modal
  const openMapModal = () => {
    setShowMapModal(true);
    setSelectedLocation(null);
    setSearchQuery('');
  };

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
      setLocationData({ address: selectedLocation.address });
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

          // Send email notification
          await sendAdminEmail(paymentData);

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

  // EmailJS function to send admin notification
  const sendAdminEmail = async (bookingData) => {
    try {
      // Create visitor list with all names
      const visitors = [];
      if (bookingData.person1_name) visitors.push(`1. ${bookingData.person1_name}`);
      if (bookingData.person2_name) visitors.push(`2. ${bookingData.person2_name}`);
      if (bookingData.person3_name) visitors.push(`3. ${bookingData.person3_name}`);
      const allVisitors = visitors.join('\n');

      const templateParams = {
        person1: bookingData.person1_name,
        all_visitors: allVisitors,
        number_of_people: bookingData.number_of_people,
        user_email: bookingData.user_email,
        visit_date: bookingData.visit_date,
        visit_time: bookingData.visit_time,
        pickup_address: bookingData.pickup_address,
        property_title: bookingData.property_title,
        property_location: bookingData.property_location || 'N/A',
        payment_method: bookingData.payment_method,
        booking_id: bookingData.booking_id
      };

      // Initialize EmailJS with public key
      emailjs.init('3Ibld63W4s4CR6YEE');

      const result = await emailjs.send(
        'service_qmttnco',    // Your service ID
        'template_r4jy5h6',   // Your template ID
        templateParams
      );

      console.log('✅ Admin email sent successfully:', result.text);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send admin email:', error);
      // Don't fail the booking if email fails
      return { success: false, error: error.text || error.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please login to book a site visit');
      navigate('/login');
      return;
    }

    // Prepare booking data
    const bookingData = {
      property_id: property?.id || 'unknown',
      property_title: property?.title || 'Unknown Property',
      user_id: currentUser.id || currentUser.uid,
      user_email: currentUser.email,
      visit_date: formData.date,
      visit_time: formData.time,
      number_of_people: formData.people,
      person1_name: formData.person1,
      person2_name: formData.person2 || null,
      person3_name: formData.person3 || null,
      pickup_address: locationData.address,
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
      try {
        // Save booking to backend API
        bookingData.payment_status = 'pending';
        const response = await bookingsAPI.create(bookingData);

        // Add booking ID to data
        bookingData.booking_id = response.booking?.id || response.id;
        bookingData.property_location = property?.location || 'N/A';

        // Send notifications in background (non-blocking)
        Promise.allSettled([
          // EmailJS notification
          sendAdminEmail(bookingData),
          // Backend API notification (if available)
          fetch('http://localhost:3002/api/notify-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
          }).then(res => res.json()).catch(() => ({ success: false }))
        ]).then(results => {
          const [emailResult, apiResult] = results;

          if (emailResult.status === 'fulfilled' && emailResult.value.success) {
            console.log('✅ Email notification sent successfully');
          } else {
            console.warn('⚠️ Email notification failed:', emailResult.reason);
          }

          if (apiResult.status === 'fulfilled' && apiResult.value.success) {
            console.log('✅ API notification sent successfully');
          } else {
            console.warn('⚠️ API notification failed');
          }
        });

        // Show success state and auto-redirect
        setBookingSuccess(true);
        console.log('✅ Booking successful! Redirecting to home...');

        // Automatic redirect after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Error booking site visit:', error);
        alert('Failed to book site visit. Please try again.');
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

  return (
    <div className="book-visit-container">
      <div className="form-section ui-bg">
        <h2>Book a Site Visit</h2>

        {/* Property Information */}
        {property ? (
          <div className="property-info-section">
            <h3>📍 Property Details</h3>
            <div className="selected-property">
              <h4>{property.title}</h4>
              <p className="property-location">📍 {property.location}</p>
              <p className="property-type">🏠 {property.type}</p>
              {property.price && <p className="property-price">💰 {property.price}</p>}
            </div>
          </div>
        ) : (
          <div className="property-info-section">
            <div className="generic-booking">
              <h4>🏠 General Site Visit</h4>
              <p>You can specify the property details during the visit or contact us for assistance.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="date-time-section">
            <h4>📅 Select Date & Time</h4>
            <label>
              Visit Date:
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
                required
                className="enhanced-date-input"
              />
              <small className="date-help">Available Monday to Saturday (No Sundays)</small>
            </label>
            <label>
              Visit Time:
              <select name="time" value={formData.time} onChange={handleChange} required className="time-select">
                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                <option value="12:00 PM - 1:00 PM">12:00 PM - 1:00 PM</option>
                <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
                <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                <option value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</option>
                <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
              </select>
              <small className="time-help">Available slots: 10:00 AM - 5:00 PM</small>
            </label>
          </div>
          <label>
            Number of People (Max 3):
            <select name="people" value={formData.people} onChange={handleChange} required>
              <option value="1">1 Person</option>
              <option value="2">2 People</option>
              <option value="3">3 People</option>
            </select>
          </label>

          <div className="people-details">
            <h4>👥 Visitor Details</h4>
            <label>
              1st Person Name: *
              <input
                type="text"
                name="person1"
                value={formData.person1}
                onChange={handleChange}
                placeholder="Enter first person's name"
                required
              />
            </label>
            {formData.people >= 2 && (
              <label className="additional-person">
                2nd Person Name: {parseInt(formData.people) >= 2 ? '*' : ''}
                <input
                  type="text"
                  name="person2"
                  value={formData.person2}
                  onChange={handleChange}
                  placeholder="Enter second person's name"
                  required={parseInt(formData.people) >= 2}
                />
              </label>
            )}
            {formData.people == 3 && (
              <label className="additional-person">
                3rd Person Name: *
                <input
                  type="text"
                  name="person3"
                  value={formData.person3}
                  onChange={handleChange}
                  placeholder="Enter third person's name"
                  required
                />
              </label>
            )}
          </div>
          <div className="pickup-section">
            <h4>📍 Pickup Location</h4>

            {/* Address Input with Maps Integration */}
            <div className="address-input-container">
              <label>
                Pickup Address:
                <div className="address-input-wrapper">
                  <input
                    type="text"
                    name="address"
                    value={locationData.address}
                    onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                    placeholder="Enter your complete pickup address..."
                    required
                    className="address-input-with-maps"
                  />
                  <button
                    type="button"
                    className="maps-button"
                    onClick={openMapModal}
                    title="Select location on map"
                  >
                    📍
                  </button>
                </div>
                <small className="address-help">
                  Type your address or click the map icon to select location on Google Maps
                </small>
              </label>
            </div>
          </div>


          <div className="visit-duration">
            <strong>Hours of Visit & Charges:</strong>
            <div className="duration-box">
              1 Hour - ₹300
            </div>
            <p>Additional charges: ₹5 per minute</p>
          </div>
          <div className="payment-method">
            <strong>Payment Method:</strong>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="previsit"
                checked={formData.paymentMethod === 'previsit'}
                onChange={handlePaymentMethodChange}
              />
              Previsit
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="postvisit"
                checked={formData.paymentMethod === 'postvisit'}
                onChange={handlePaymentMethodChange}
              />
              Postvisit
            </label>
          </div>
          {formData.paymentMethod === 'previsit' && (
            <div className="razorpay-section">
              <div className="payment-info">
                <h4>💳 Pre-Visit Payment</h4>
                <div className="payment-details">
                  <div className="amount-breakdown">
                    <div className="amount-row">
                      <span>Site Visit (1 Hour):</span>
                      <span className="amount">₹300</span>
                    </div>
                    <div className="amount-row total">
                      <span><strong>Total Amount:</strong></span>
                      <span className="amount"><strong>₹300</strong></span>
                    </div>
                  </div>
                  <div className="payment-note">
                    <p>💡 <strong>Note:</strong> If you purchase the property, this amount will be refunded.</p>
                    <p>🔒 Secure payment powered by Razorpay</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="form-actions">
            {formData.paymentMethod === 'previsit' ? (
              <button
                type="submit"
                disabled={loading || paymentLoading || !razorpayLoaded}
                className="pay-button"
              >
                {paymentLoading ? (
                  <>
                    <div className="payment-spinner"></div>
                    Processing Payment...
                  </>
                ) : !razorpayLoaded ? (
                  'Loading Payment Gateway...'
                ) : (
                  <>
                    💳 Pay ₹300 & Book Visit
                  </>
                )}
              </button>
            ) : (
              <button type="submit" disabled={loading}>
                {loading ? 'Booking...' : '📅 Book Site Visit'}
              </button>
            )}
            <button type="button" onClick={() => alert('Reschedule functionality coming soon!')}>Reschedule</button>
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
      <div className="info-section ui-bg">
        <h3>Note:</h3>
        <p>
          After booking a site visit, a car will pick you up from your address, take you to the site, and drop you back at your address.
        </p>
        <p>
          If you decide to purchase the property, the visit charges will be refunded.
        </p>
      </div>

      {/* Google Maps Modal */}
      {showMapModal && (
        <div className="map-modal-overlay">
          <div className="map-modal-content">
            <div className="map-modal-header">
              <h3>📍 Select Pickup Location</h3>
              <button
                className="map-modal-close"
                onClick={cancelLocationSelection}
                type="button"
              >
                ×
              </button>
            </div>

            {/* Map Controls */}
            <div className="map-controls">
              <div className="location-options">
                <button
                  type="button"
                  className="current-location-btn"
                  onClick={getCurrentLocation}
                  disabled={currentLocationLoading}
                >
                  {currentLocationLoading ? (
                    <>
                      <div className="location-spinner"></div>
                      Getting Location...
                    </>
                  ) : (
                    <>
                      📍 Use My Location
                    </>
                  )}
                </button>

                <div className="search-location" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    className="map-search-input"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => searchQuery.length >= 3 && setShowSearchResults(true)}
                  />
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="pac-container" style={{ display: 'block', top: '100%', width: '100%' }}>
                      {searchResults.map((result, idx) => (
                        <div
                          key={idx}
                          className="pac-item"
                          onClick={() => selectSearchResult(result)}
                        >
                          <span className="pac-icon pac-icon-marker"></span>
                          <span className="pac-item-query">{result.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="location-help">
                <small>
                  <strong>How to select:</strong> Click on the map, drag the red marker, use your current location, or search for a place above.
                </small>
              </div>
            </div>

            {/* Map Container - Leaflet */}
            <div className="map-container" style={{ position: 'relative' }}>
              <div className="map-overlay-tooltip">
                <div className="tooltip-text">
                  📍 Click anywhere to set pickup location
                </div>
              </div>

              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ width: '100%', height: '450px' }}
                scrollWheelZoom={true}
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
            </div>

            {/* Map Footer */}
            <div className="map-modal-footer">
              {selectedLocation ? (
                <div className="selected-location-info">
                  <div className="location-success-header">
                    <span className="success-icon">✅</span>
                    <strong>Location Selected</strong>
                  </div>
                  <div className="selected-address">
                    <strong>📍 Selected Address:</strong>
                    <p>{selectedLocation.address}</p>
                    <span className="coordinates-info">
                      Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="location-instructions">
                  <p>📍 Please select your pickup location:</p>
                  <ul>
                    <li>🖱️ Click anywhere on the map</li>
                    <li>🔍 Search for a location above</li>
                    <li>📱 Use "My Location" button</li>
                    <li>🎯 Drag the red marker to adjust</li>
                  </ul>
                </div>
              )}

              <div className="map-modal-actions">
                <button
                  type="button"
                  className="cancel-location-btn"
                  onClick={cancelLocationSelection}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="confirm-location-btn"
                  onClick={confirmLocation}
                  disabled={!selectedLocation}
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Overlay - No manual OK click needed */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-4">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Successful!</h3>
            <p className="text-gray-600 mb-4">
              Your site visit has been booked successfully. You will receive a confirmation shortly.
            </p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-sm text-gray-500">Redirecting to home...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSiteVisit;