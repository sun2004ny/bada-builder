import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion'; // Used for animations
import { useAuth } from '../../context/AuthContext';
import { shortStayAPI } from '../../services/shortStayApi';
import HostingMessages from './HostingMessages';
import HostingRevenue from './HostingRevenue';
import './HostingDashboard.css';

const HostingDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const [todayFilter, setTodayFilter] = useState('today');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

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
                onClick={() => setActiveTab('calendar')}
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                

            </div>
        )}
        
        {activeTab === 'calendar' && (
             <div className="calendar-view">
                <h2>Calendar</h2>
                <div className="empty-state">
                    <p>Calendar view coming soon.</p>
                </div>
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
