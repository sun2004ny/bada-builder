import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaUser, FaCheck, FaTimes, FaHeart, FaShare } from 'react-icons/fa';
import { shortStayAPI } from '../../services/shortStayApi';
import { createOrGetChat } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import './ShortStayDetails.css';

const ShortStayDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser: user } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                const data = await shortStayAPI.getById(id);
                setProperty(data.property);
                setIsFavorite(data.property.is_favorite);
            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPropertyDetails();
    }, [id]);

    const handleToggleFavorite = async () => {
        if (!user) {
            alert('Please login to save favorites');
            return;
        }
        try {
            const result = await shortStayAPI.toggleFavorite(id);
            setIsFavorite(result.isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleContactHost = async () => {
        if (!user) {
            // alert('Please login to contact the host'); // Removed for smoother UX
            navigate('/login', { state: { from: `/short-stay/${id}` } }); // Allow redirect back after login
            return;
        }

        try {
            // We use a separate loading state or just browser loading for now, 
            // but ensuring we don't double click could be good.
            const chatResponse = await createOrGetChat({
                propertyId: id,
                ownerId: property.user_id || property.owner_id
            });

            if (chatResponse && chatResponse.chatId) {
                navigate('/messages');
            }
        } catch (error) {
            console.error('Error contacting host:', error);
            alert('Failed to start chat. Please try again.');
        }
    };

    if (loading) return <div className="short-stay-page loading">Loading...</div>;
    if (!property) return <div className="short-stay-page error">Property not found</div>;

    const getJoinedText = (dateString) => {
        if (!dateString) return 'Joined recently';
        // Ensure date string handling is robust
        const joined = new Date(dateString);
        if (isNaN(joined.getTime())) return 'Joined recently';

        const now = new Date();
        const diffTime = Math.abs(now - joined);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        // Logic: 
        // < 30 days: Joined recently
        // < 365 days: Joined X months ago
        // >= 365 days: Joined X years ago
        
        if (diffDays < 30) {
            return 'Joined recently';
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `Joined ${months} ${months === 1 ? 'month' : 'months'} ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `Joined ${years} ${years === 1 ? 'year' : 'years'} ago`;
        }
    };

    const {
        title, description, location, pricing, 
        rules, policies, amenities, specific_details,
        images, host_name, host_photo, rating, host_joined_at
    } = property;

    return (
        <div className="short-stay-page details-page">
            <div className="details-container">
                {/* Image Gallery */}
                <div className="gallery-section">
                    <div className="main-image">
                        <img src={images && images[activeImage] ? images[activeImage] : '/placeholder-property.jpg'} alt={title} />
                        <button className={`details-fav-btn ${isFavorite ? 'active' : ''}`} onClick={handleToggleFavorite}>
                            <FaHeart />
                        </button>
                    </div>
                    <div className="thumbnail-list">
                        {images && images.map((img, idx) => (
                            <div 
                                key={idx} 
                                className={`thumbnail ${idx === activeImage ? 'active' : ''}`}
                                onClick={() => setActiveImage(idx)}
                            >
                                <img src={img} alt={`View ${idx + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="details-content-grid">
                    {/* Left Column: Info */}
                    <div className="details-main-info">
                        <div className="details-header">
                            <h1>{title}</h1>
                            <div className="location-row">
                                <FaMapMarkerAlt />
                                <span>{location?.address}, {location?.city}, {location?.state}</span>
                            </div>
                            <div className="rating-row">
                                <FaStar className="star-icon" />
                                <span>{rating || 'New'} (0 reviews)</span>
                            </div>
                        </div>

                        <div className="details-divider" />

                        <div className="host-info">
                            <img src={host_photo || '/default-user.png'} alt={host_name} className="host-avatar" />
                            <div style={{flex: 1}}>
                                <h3>Hosted by {host_name || 'User'}</h3>
                                <p>{getJoinedText(host_joined_at)}</p>
                            </div>
                        {/* Only show Contact Host if not owner */}
                        {user && String(user.uid) === String(property.user_id) ? (
                             <button 
                                disabled
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#f0f0f0',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'not-allowed',
                                    fontWeight: '600',
                                    color: '#999'
                                }}
                            >
                                You own this property
                            </button>
                        ) : (
                            <button 
                                onClick={handleContactHost}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #000',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#f7f7f7'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
                            >
                                Contact Host
                            </button>
                        )}
                        </div>

                        <div className="details-divider" />

                        <div className="description-section">
                            <h2>About this place</h2>
                            <p>{description}</p>
                        </div>

                        <div className="details-divider" />

                        <div className="amenities-section">
                            <h2>What this place offers</h2>
                            <div className="amenities-list">
                                {amenities && amenities.map((item, i) => (
                                    <div key={i} className="amenity-tag">
                                        <FaCheck className="check-icon" /> {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="details-divider" />

                        {/* Specific Details */}
                        <div className="specifics-section">
                            <h2>Property Details</h2>
                            
                            {/* Hotel Room Types Table */}
                            {specific_details?.roomTypes && Array.isArray(specific_details.roomTypes) && specific_details.roomTypes.length > 0 && (
                                <div className="room-types-display" style={{marginBottom: '24px'}}>
                                    <h3 style={{fontSize: '16px', color: '#e2e8f0', marginBottom: '12px'}}>Room Options</h3>
                                    <div style={{overflowX: 'auto'}}>
                                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#cbd5e1'}}>
                                            <thead>
                                                <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                                                    <th style={{textAlign: 'left', padding: '12px 0 12px 8px', color: '#94a3b8'}}>Type</th>
                                                    <th style={{textAlign: 'center', padding: '12px 0', color: '#94a3b8'}}>Available</th>
                                                    <th style={{textAlign: 'right', padding: '12px 8px 12px 0', color: '#94a3b8'}}>Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {specific_details.roomTypes.map((room, idx) => (
                                                    <tr key={idx} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                                                        <td style={{padding: '12px 0 12px 8px', fontWeight: 500}}>{room.type}</td>
                                                        <td style={{textAlign: 'center', padding: '12px 0'}}>{room.count}</td>
                                                        <td style={{textAlign: 'right', padding: '12px 8px 12px 0', color: '#10b981', fontWeight: 600}}>₹{room.price}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="specifics-grid">
                                {specific_details && Object.entries(specific_details)
                                    .filter(([key]) => key !== 'roomTypes') // Filter out roomTypes from generic list
                                    .map(([key, value]) => (
                                    <div key={key} className="specific-item">
                                        <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> 
                                        {typeof value === 'boolean' ? (
                                            value ? <span style={{color: '#10b981', marginLeft: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px'}}>Yes <FaCheck size={12}/></span> : <span style={{color: '#ef4444', marginLeft: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px'}}>No <FaTimes size={12}/></span>
                                        ) : (
                                            <span style={{marginLeft: '6px'}}>{value.toString()}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking Card */}
                    <div className="details-sidebar">
                        <div className="booking-card">
                            <div className="booking-price-header">
                                <span className="price">₹{pricing?.perNight}</span>
                                <span className="period">/ night</span>
                            </div>
                            
                            <div className="booking-inputs">
                                <div className="date-inputs">
                                    <div className="input-box">
                                        <label>CHECK-IN</label>
                                        <input type="date" />
                                    </div>
                                    <div className="input-box">
                                        <label>CHECK-OUT</label>
                                        <input type="date" />
                                    </div>
                                </div>
                                <div className="guest-input">
                                    <label>GUESTS</label>
                                    <select>
                                        <option value="1">1 Guest</option>
                                        <option value="2">2 Guests</option>
                                    </select>
                                </div>
                            </div>

                            <button className="reserve-btn">Reserve</button>
                            
                            <p className="no-charge-text">You won't be charged yet</p>
                            
                            <div className="price-breakdown">
                                <div className="price-row">
                                    <span>₹{pricing?.perNight} x 5 nights</span>
                                    <span>₹{pricing?.perNight * 5}</span>
                                </div>
                                <div className="price-row">
                                    <span>Cleaning fee</span>
                                    <span>₹{pricing?.cleaning || 0}</span>
                                </div>
                                <div className="price-row total">
                                    <span>Total before taxes</span>
                                    <span>₹{(pricing?.perNight * 5) + (Number(pricing?.cleaning) || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
                <div className="details-divider" />
                
                <div className="policies-section">
                    <h2>Things to know</h2>
                    <div className="policies-grid">
                        <div className="policy-block">
                            <h3>House Rules</h3>
                            <p>Check-in: {rules?.checkIn}</p>
                            <p>Check-out: {rules?.checkOut}</p>
                            <p>{policies?.houseRules}</p>
                        </div>
                        <div className="policy-block">
                            <h3>Cancellation Policy</h3>
                            <p className="capitalize">{policies?.cancellation}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShortStayDetails;
