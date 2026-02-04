import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion'; // Used for animations
import { useAuth } from '../../context/AuthContext';
import HostingMessages from './HostingMessages';
import './HostingDashboard.css';

const HostingDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const [todayFilter, setTodayFilter] = useState('today');

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
                                    ? "You don't have any reservations" 
                                    : "You don’t have any upcoming reservations"}
                            </h2>
                            <p>To get booked, you’ll need to complete and publish your listing.</p>
                            <button className="complete-listing-btn-subtle" onClick={() => navigate('/short-stay/list-property')}>
                                Complete your listing
                            </button>
                        </Motion.div>
                    </AnimatePresence>
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

        {activeTab === 'messages' && (
             <HostingMessages />
        )}
      </main>
    </div>
  );
};

export default HostingDashboard;
