import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { shortStayAPI } from '../../services/shortStayApi';
import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaRupeeSign, FaSuitcaseRolling, FaChevronRight } from 'react-icons/fa';
import './ShortStayTrips.css';

const ShortStayTrips = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await shortStayAPI.getTravelerReservations();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeDate = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  const todayStr = normalizeDate(new Date());

  const upcomingTrips = reservations.filter(r => normalizeDate(r.check_out) >= todayStr);
  const pastTrips = reservations.filter(r => normalizeDate(r.check_out) < todayStr);
  const displayTrips = activeTab === 'upcoming' ? upcomingTrips : pastTrips;

  const formatDateRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="trips-page-container">
      <div className="trips-header-section">
        <h1>Trips</h1>
        <div className="trips-tabs-container">
            <div className="trips-tabs">
                <button 
                    className={`trip-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming
                </button>
                <button 
                    className={`trip-tab ${activeTab === 'past' ? 'active' : ''}`}
                    onClick={() => setActiveTab('past')}
                >
                    Past
                </button>
            </div>
        </div>
      </div>

      <div className="trips-content-wrapper">
        {loading ? (
          <div className="trips-loading">
            <div className="trip-spinner"></div>
            <p>Loading your adventures...</p>
          </div>
        ) : displayTrips.length === 0 ? (
          <Motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="no-trips-state"
          >
            <div className="no-trips-icon">
                <FaSuitcaseRolling />
            </div>
            <h2>No {activeTab} trips found</h2>
            <p>Time to dust off your bags and start planning your next adventure.</p>
            <button className="start-exploring-btn" onClick={() => navigate('/short-stay')}>
              Start Exploring
            </button>
          </Motion.div>
        ) : (
          <div className="trips-grid">
            <AnimatePresence mode='popLayout'>
              {displayTrips.map((trip) => (
                <Motion.div
                  layout
                  key={trip.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="trip-card"
                  onClick={() => navigate(`/short-stay/${trip.property_id}`)}
                >
                  <div className="trip-image-container">
                    <img 
                        src={trip.images && trip.images[0] ? trip.images[0] : 'https://via.placeholder.com/400x300'} 
                        alt={trip.property_title} 
                        className="trip-image"
                    />
                    <div className="trip-status-badge">
                        {activeTab === 'upcoming' ? 'Confirmed' : 'Completed'}
                    </div>
                  </div>
                  
                  <div className="trip-details">
                    <div className="trip-location">
                        {trip.property_address ? trip.property_address.city : 'Location'}
                    </div>
                    <h3 className="trip-title">{trip.property_title}</h3>
                    
                    <div className="trip-info-row">
                      <div className="trip-info-item">
                        <FaCalendarAlt className="trip-icon" />
                        <span>{formatDateRange(trip.check_in, trip.check_out)}</span>
                      </div>
                    </div>

                    <div className="trip-info-row">
                        <div className="trip-info-item">
                            <FaMapMarkerAlt className="trip-icon" />
                            <span className="truncate-text">{trip.property_address ? `${trip.property_address.street}, ${trip.property_address.city}` : 'View details for address'}</span>
                        </div>
                    </div>
                    
                    <div className="trip-divider"></div>

                    <div className="trip-host-preview">
                        <img 
                            src={trip.host_photo || 'https://via.placeholder.com/40'} 
                            alt={trip.host_name} 
                            className="host-avatar-small"
                        />
                        <div className="host-info-small">
                            <span className="hosted-by">Hosted by</span>
                            <span className="host-name">{trip.host_name || 'Host'}</span>
                        </div>
                        <button className="view-trip-btn">
                            <FaChevronRight />
                        </button>
                    </div>
                  </div>
                </Motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortStayTrips;
