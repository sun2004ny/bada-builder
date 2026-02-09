import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion'; 
import { useAuth } from '../../context/AuthContext';
import { shortStayAPI } from '../../services/shortStayApi';
import HostingMessages from './HostingMessages';
import HostingRevenue from './HostingRevenue';
import { FaTimes } from 'react-icons/fa';
import './HostingDashboard.css';
import ShortStayLoader from '../../components/ShortStay/ShortStayLoader';

const HostingDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const [todayFilter, setTodayFilter] = useState('today');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
        fetchReservations();
    }
  }, [isAuthenticated]);

  const fetchReservations = async () => {
    try {
        const response = await shortStayAPI.getHostReservations();
        setReservations(response.reservations || []);
    } catch (error) {
        console.error("Failed to fetch host reservations", error);
    } finally {
        setLoading(false);
    }
  };

  // Helper to normalize date to YYYY-MM-DD string for comparison
  const normalizeDate = (dateInput) => {
      const d = new Date(dateInput);
      return d.toISOString().split('T')[0];
  };

  const todayStr = normalizeDate(new Date());

  const upcomingReservations = reservations.filter(r => {
     // Check-in date is in future
     return normalizeDate(r.check_in) > todayStr;
  });

  const todayReservations = reservations.filter(r => {
      const start = normalizeDate(r.check_in);
      const end = normalizeDate(r.check_out);
      // "Today" means the stay covers today (Start <= Today <= End)
      return start <= todayStr && end >= todayStr;
  });

  const displayList = todayFilter === 'today' ? todayReservations : upcomingReservations;

  const handleSwitchToTravelling = () => {
    navigate('/short-stay');
  };

  const handleMessagesClick = () => {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      navigate('/login');
    } else {
      setActiveTab('messages');
    }
  };

  const handleCalendarClick = () => {
      setActiveTab('calendar');
      setCalendarLoading(true);
      setTimeout(() => {
          setCalendarLoading(false);
      }, 800);
  };

  if (loading) {
      return <ShortStayLoader />;
  }

  return (
    <div className="hosting-dashboard">
      {/* ... header ... */}
      <header className="hosting-header">
        <div className="hosting-header-left">
          <div className="hosting-logo" onClick={() => navigate('/')}>
             {/* Logo removed as per request */}
          </div>
        </div>
        
        <nav className="hosting-nav">
            <button 
                className={`nav-item ${activeTab === 'today' ? 'active' : ''}`}
                onClick={() => setActiveTab('today')}
            >
                Today
            </button>
            <button 
                className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
                onClick={handleCalendarClick}
            >
                Calendar
            </button>
            <button 
                className={`nav-item ${activeTab === 'listings' ? 'active' : ''}`}
                onClick={() => navigate('/my-properties')} // Reusing existing my-properties for listings
            >
                Listings
            </button>
            <button 
                className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
                onClick={() => setActiveTab('revenue')}
            >
                Revenue
            </button>
            <button 
                className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={handleMessagesClick}
            >
                Messages
            </button>
        </nav>

        <div className="hosting-header-right">
            <button className="switch-btn" onClick={handleSwitchToTravelling}>
                Switch to travelling
            </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="hosting-content">
        {activeTab === 'today' && (
            <div className="today-view">
                <div className="today-filter-tabs">
                    <button 
                        className={`filter-tab ${todayFilter === 'today' ? 'active' : ''}`}
                        onClick={() => setTodayFilter('today')}
                    >
                        Today
                    </button>
                    <button 
                        className={`filter-tab ${todayFilter === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setTodayFilter('upcoming')}
                    >
                        Upcoming
                    </button>
                </div>

                <div className="reservations-list">
                    {loading ? (
                        <p style={{padding: '24px', textAlign: 'center'}}>Loading reservations...</p>
                    ) : displayList.length === 0 ? (
                        <div className="empty-reservations-state">
                            <AnimatePresence mode="wait">
                                <Motion.div
                                    key={todayFilter}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                >
                                    <div className="illustration-container">
                                        <span style={{ fontSize: '80px', display: 'block', marginBottom: '10px' }}>📖</span> 
                                    </div>
                                    <h2>
                                        {todayFilter === 'today' 
                                            ? "You don't have any reservations today" 
                                            : "You don’t have any upcoming reservations"}
                                    </h2>
                                    <p>To get booked, you’ll need to complete and publish your listing.</p>
                                    <button className="complete-listing-btn-subtle" onClick={() => navigate('/short-stay/list-property')}>
                                        Complete your listing
                                    </button>
                                </Motion.div>
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="reservation-cards-grid">
                            {displayList.map(res => (
                                <div key={res.id} className="reservation-card-item">
                                    <div className="res-card-header">
                                        <span className={`status-badge ${res.status}`}>{res.status}</span>
                                        <span className="res-price">₹{Number(res.total_price).toLocaleString()}</span>
                                    </div>
                                    <div className="res-card-body">
                                        <h4>{res.guest_name}</h4>
                                        <p className="res-property">{res.property_title}</p>
                                        <div className="res-dates">
                                            <span>{new Date(res.check_in).toLocaleDateString()}</span>
                                            <span>→</span>
                                            <span>{new Date(res.check_out).toLocaleDateString()}</span>
                                        </div>
                                        <div className="res-guests">
                                            Guests: {res.guests?.adults + (res.guests?.children || 0)}
                                        </div>
                                        <div className="res-card-footer">
                                            <button 
                                                className="view-details-btn"
                                                onClick={() => setSelectedReservation(res)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reservation Details Modal */}
                {selectedReservation && (
                    <div className="host-modal-overlay" onClick={() => setSelectedReservation(null)}>
                        <div className="host-modal-content" onClick={e => e.stopPropagation()}>
                            <div className="host-modal-header">
                                <h2>Reservation Details</h2>
                                <button className="host-close-btn" onClick={() => setSelectedReservation(null)}>
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="host-modal-body">
                                <div className="modal-section">
                                    <h3>Property & Dates</h3>
                                    <div className="modal-info-grid">
                                        <div className="info-item">
                                            <label>Property</label>
                                            <span>{selectedReservation.property_title}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Status</label>
                                            <span className={`status-text ${selectedReservation.status}`}>{selectedReservation.status}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Check-in</label>
                                            <span>{new Date(selectedReservation.check_in).toLocaleDateString()}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Checkout</label>
                                            <span>{new Date(selectedReservation.check_out).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-section">
                                    <h3>Primary Guest</h3>
                                    <div className="modal-info-grid">
                                        <div className="info-item">
                                            <label>Name</label>
                                            <span>{selectedReservation.guest_name}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Phone</label>
                                            <span>{selectedReservation.guest_phone || 'N/A'}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Email</label>
                                            <span>{selectedReservation.guest_email || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedReservation.guest_details && selectedReservation.guest_details.length > 0 && (
                                    <div className="modal-section">
                                        <h3>All Guest Details ({selectedReservation.guest_details.length})</h3>
                                        <div className="guest-table-container">
                                            <table className="guest-table">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Contact</th>
                                                        <th>Location</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedReservation.guest_details.map((guest, idx) => (
                                                        <tr key={idx}>
                                                            <td data-label="Name">{guest.name}</td>
                                                            <td data-label="Contact">{guest.phone}<br/>{guest.email}</td>
                                                            <td data-label="Location">{guest.state}, {guest.country}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <div className="modal-section">
                                    <h3>Payment Summary</h3>
                                    <div className="payment-summary">
                                        <div className="payment-row total">
                                            <span>Total Paid</span>
                                            <span>₹{Number(selectedReservation.total_price).toLocaleString()}</span>
                                        </div>
                                        <div className="payment-row">
                                            <span>Payment ID</span>
                                            <span style={{fontSize: '12px', color: '#717171'}}>{selectedReservation.payment_id}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Section */}
                                <div className="modal-section verification-section">
                                    <h3>Booking Verification</h3>
                                    {selectedReservation.is_host_verified ? (
                                        <div className="verified-badge">
                                            <span>✓ Verified</span>
                                            <p>Revenue for this booking is now visible.</p>
                                        </div>
                                    ) : (
                                        <div className="verification-input-group">
                                            <p style={{fontSize: '13px', color: '#717171', marginBottom: '8px'}}>Enter the Booking ID provided by the guest to verify this reservation.</p>
                                            <div style={{display: 'flex', gap: '10px'}}>
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter Booking ID (e.g. RES-XXXXXX)" 
                                                    id="verify-input"
                                                    style={{
                                                        flex: 1, 
                                                        padding: '10px', 
                                                        border: '1px solid #ddd', 
                                                        borderRadius: '8px',
                                                        fontSize: '14px'
                                                    }}
                                                />
                                                <button 
                                                    className="verify-btn"
                                                    onClick={async () => {
                                                        const input = document.getElementById('verify-input');
                                                        if (!input.value) return;
                                                        
                                                        try {
                                                            await shortStayAPI.verifyBooking(selectedReservation.id, input.value.trim());
                                                            // Update local state
                                                            const updated = { ...selectedReservation, is_host_verified: true };
                                                            setSelectedReservation(updated);
                                                            // Update list
                                                            setReservations(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                            alert('Booking Verified Successfully!');
                                                        } catch {
                                                            alert('Invalid Booking ID. Please check and try again.');
                                                        }
                                                    }}
                                                    style={{
                                                        backgroundColor: '#000',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '0 20px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    Verify
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                

            </div>
        )}
        
        {activeTab === 'calendar' && (
             <div className="calendar-view">
                {calendarLoading ? <ShortStayLoader /> : (
                    <>
                        <h2>Calendar</h2>
                        <div className="empty-state">
                            <p>Calendar view coming soon.</p>
                        </div>
                    </>
                )}
            </div>
        )}


        {activeTab === 'revenue' && (
             <HostingRevenue />
        )}

        {activeTab === 'messages' && (
             <HostingMessages />
        )}
      </main>
    </div>
  );
};

export default HostingDashboard;
