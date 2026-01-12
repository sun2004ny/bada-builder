// src/pages/BookSiteVisit.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import emailjs from '@emailjs/browser';
import './BookSiteVisit.css';

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

  // Google Maps states
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const searchInputRef = useRef(null);


  // Set date restrictions (today to 30 days from now, excluding Sundays)
  useEffect(() => {
    const today = new Date();
    const maxBookingDate = new Date();
    maxBookingDate.setDate(today.getDate() + 30);

    setMinDate(today.toISOString().split('T')[0]);
    setMaxDate(maxBookingDate.toISOString().split('T')[0]);
  }, []);

  // Load Google Maps API and suppress error popups
  useEffect(() => {
    // Suppress Google Maps authentication error popup
    window.gm_authFailure = () => {
      console.log('Google Maps authentication failed - suppressed popup');
    };

    // Remove any existing error dialogs
    const removeErrorDialogs = () => {
      const errorDialogs = document.querySelectorAll('[role="dialog"]');
      errorDialogs.forEach(dialog => {
        if (dialog.textContent && dialog.textContent.includes("Google Maps")) {
          dialog.remove();
        }
      });
    };

    // Create MutationObserver to remove error dialogs as they appear
    const observer = new MutationObserver(() => {
      removeErrorDialogs();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
        console.log('✅ Google Maps API loaded successfully');
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

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

  // Initialize Google Maps in modal
  const initializeMap = () => {
    if (!window.google || !mapRef.current) return;

    const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // Delhi coordinates
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    // Create draggable marker
    const marker = new window.google.maps.Marker({
      position: defaultCenter,
      map: map,
      draggable: true,
      title: "Drag to select your location"
    });

    markerRef.current = marker;

    // Handle marker drag
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        reverseGeocode(lat, lng);
      }
    });

    // Handle map click
    map.addListener('click', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      marker.setPosition({ lat, lng });
      reverseGeocode(lat, lng);
    });

    // Initialize Places Autocomplete for search
    if (searchInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['place_id', 'geometry', 'name', 'formatted_address']
      });

      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          map.setCenter({ lat, lng });
          map.setZoom(16);
          marker.setPosition({ lat, lng });
          
          setSelectedLocation({
            lat,
            lng,
            address: place.formatted_address || place.name
          });
        }
      });
    }

    return map;
  };

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = (lat, lng) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setSelectedLocation({
          lat,
          lng,
          address: results[0].formatted_address
        });
      } else {
        setSelectedLocation({
          lat,
          lng,
          address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      }
    });
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

        if (mapRef.current && markerRef.current) {
          const map = mapRef.current;
          const marker = markerRef.current;
          
          map.setCenter({ lat, lng });
          map.setZoom(16);
          marker.setPosition({ lat, lng });
          
          reverseGeocode(lat, lng);
        }
        
        setCurrentLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to get your location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        
        alert(errorMessage);
        setCurrentLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Open map modal
  const openMapModal = () => {
    if (!mapLoaded) {
      alert('Google Maps is still loading. Please wait a moment and try again.');
      return;
    }
    setShowMapModal(true);
    setSelectedLocation(null);
    
    // Initialize map after modal opens
    setTimeout(() => {
      initializeMap();
    }, 100);
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
          // Save booking with payment details to Firebase
          const docRef = await addDoc(collection(db, 'bookings'), paymentData);
          paymentData.booking_id = docRef.id;
          paymentData.property_location = property?.location || 'N/A';

          // Send email notification
          await sendAdminEmail(paymentData);

          // Show success and redirect
          setBookingSuccess(true);
          setTimeout(() => {
            navigate('/', { 
              state: { 
                successMessage: 'Your site visit has been booked and payment completed successfully! You will receive a confirmation shortly.' 
              }
            });
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
        ondismiss: function() {
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
      user_id: currentUser.uid,
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
        // Save booking to Firestore
        bookingData.payment_status = 'pending';
        const docRef = await addDoc(collection(db, 'bookings'), bookingData);

        // Add booking ID to data
        bookingData.booking_id = docRef.id;
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
          navigate('/', { 
            state: { 
              successMessage: 'Your site visit has been booked successfully! You will receive a confirmation shortly.' 
            }
          });
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
                
                <div className="search-location">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for a location..."
                    className="map-search-input"
                  />
                </div>
              </div>
              
              <div className="location-help">
                <small>
                  <strong>How to select:</strong> Click on the map, drag the red marker, use your current location, or search for a place above.
                </small>
              </div>
            </div>

            {/* Map Container */}
            <div className="map-container">
              <div className="map-overlay-tooltip">
                <div className="tooltip-text">
                  📍 Click anywhere to set pickup location
                </div>
              </div>
              <div
                ref={mapRef}
                className="google-map"
                style={{ width: '100%', height: '450px' }}
              ></div>
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