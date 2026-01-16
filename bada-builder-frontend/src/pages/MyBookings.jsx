// src/pages/MyBookings.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import './MyBookings.css';

const MyBookings = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [allBookingsCount, setAllBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 Auth state:', { isAuthenticated, userId: currentUser?.id });

    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    if (currentUser?.id) {
      console.log('✅ User authenticated, fetching bookings');
      fetchBookings();
    }
  }, [currentUser, isAuthenticated, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching bookings for user:', currentUser.id);

      // Fetch bookings from API
      const response = await bookingsAPI.getMyBookings();
      const allBookings = response.bookings || response || [];
      console.log('📊 Found bookings:', allBookings.length);

      // Sort manually by created_at (newest first)
      allBookings.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA;
      });

      console.log('✅ All bookings loaded:', allBookings.length);
      setBookings(allBookings);
      setAllBookingsCount(allBookings.length);
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      console.error('Error details:', error.message);
      alert('Error loading bookings. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateString) => {
    return formatDate(dateString);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getPaymentStatusBadge = (paymentStatus, paymentMethod) => {
    if (paymentStatus === 'completed') {
      return <span className="payment-badge paid">✓ Paid</span>;
    }
    if (paymentMethod === 'previsit') {
      return <span className="payment-badge paid">✓ Pre-Paid</span>;
    }
    return <span className="payment-badge pending">⏳ Pay After Visit</span>;
  };

  if (loading) {
    return (
      <div className="my-bookings-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>📅 My Booked Site Visits</h1>
            <p>View all your scheduled property site visits</p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Active Bookings</span>
            <span className="stat-value">
              {bookings.filter(b => {
                if (!b.visit_date) return true;
                const visitDate = new Date(b.visit_date);
                const today = new Date();
                visitDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                return visitDate >= today;
              }).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Past Bookings</span>
            <span className="stat-value">
              {bookings.filter(b => {
                if (!b.visit_date) return false;
                const visitDate = new Date(b.visit_date);
                const today = new Date();
                visitDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                return visitDate < today;
              }).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Today's Bookings</span>
            <span className="stat-value">
              {bookings.filter(b => {
                if (!b.visit_date) return false;
                const visitDate = new Date(b.visit_date);
                const today = new Date();
                visitDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                return visitDate.getTime() === today.getTime();
              }).length}
            </span>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No Bookings Yet</h3>
            <p>You haven't booked any site visits yet. Start exploring properties!</p>
            <button
              className="explore-btn"
              onClick={() => navigate('/exhibition')}
            >
              Explore Properties
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                {/* Property Info */}
                <div className="booking-header">
                  <div className="property-info">
                    <h3>{booking.property_title || 'Property Visit'}</h3>
                    {booking.property_location && (
                      <p className="location">📍 {booking.property_location}</p>
                    )}
                  </div>
                  <div className="status-badges">
                    {getPaymentStatusBadge(booking.payment_status, booking.payment_method)}
                  </div>
                </div>

                {/* Visit Details */}
                <div className="booking-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <div className="detail-content">
                        <span className="detail-label">Visit Date</span>
                        <span className="detail-value">{formatDate(booking.visit_date)}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🕐</span>
                      <div className="detail-content">
                        <span className="detail-label">Visit Time</span>
                        <span className="detail-value">{booking.visit_time || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-icon">👥</span>
                      <div className="detail-content">
                        <span className="detail-label">Number of Visitors</span>
                        <span className="detail-value">{booking.number_of_people || 1} Person(s)</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">💳</span>
                      <div className="detail-content">
                        <span className="detail-label">Payment Type</span>
                        <span className="detail-value">
                          {booking.payment_method === 'previsit' ? 'Pre-Visit' : 'Post-Visit'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visitors Names */}
                  <div className="visitors-section">
                    <span className="section-title">👤 Visitor Names:</span>
                    <div className="visitors-list">
                      {booking.person1_name && (
                        <span className="visitor-name">1. {booking.person1_name}</span>
                      )}
                      {booking.person2_name && (
                        <span className="visitor-name">2. {booking.person2_name}</span>
                      )}
                      {booking.person3_name && (
                        <span className="visitor-name">3. {booking.person3_name}</span>
                      )}
                    </div>
                  </div>

                  {/* Pickup Address */}
                  <div className="pickup-section">
                    <span className="section-title">📍 Pickup Address:</span>
                    <p className="pickup-address">{booking.pickup_address || 'N/A'}</p>
                  </div>

                  {/* Booking Info */}
                  <div className="booking-footer">
                    <span className="booking-id">Booking ID: {booking.id}</span>
                    <span className="booking-date">
                      Booked on: {formatDateDisplay(booking.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
