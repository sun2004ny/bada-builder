import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaUser, FaCheck, FaShare, FaHeart, FaTimes, FaCopy, FaEnvelope, FaWhatsapp, FaComment, FaFacebookMessenger, FaFacebook, FaTwitter, FaCode, FaEllipsisH } from 'react-icons/fa'; // Added icons
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
    const [showShareModal, setShowShareModal] = useState(false);
    
    // Booking state (placeholder for now)
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);

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
            navigate('/login', { state: { from: `/short-stay/${id}` } });
            return;
        }

        try {
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

    // Share Handlers
    const shareUrl = window.location.href;
    const shareText = property ? `Check out this place: ${property.title}` : 'Check out this property!';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        setShowShareModal(false);
    };

    const handleEmailShare = () => {
        const subject = `Check out this place on Bada Builder: ${property.title}`;
        const body = `I found this amazing place and thought you'd love it!\n\n${property.title}\n${shareUrl}\n\n${property.images?.[0] || ''}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        setShowShareModal(false);
    };

    const handleWhatsappShare = () => {
        const text = `${shareText} - ${shareUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        setShowShareModal(false);
    };

    const handleSMSShare = () => {
        const text = `${shareText} - ${shareUrl}`;
        window.open(`sms:?body=${encodeURIComponent(text)}`);
        setShowShareModal(false);
    };

    const handleMessengerShare = () => {
        // Facebook Messenger 'send' dialog for web, or custom URL scheme for mobile
        // Using generic FB sharing as messenger integration often requires SDK
        // For simple link sharing:
        window.open(`http://www.facebook.com/dialog/send?app_id=123456789&link=${encodeURIComponent(shareUrl)}&redirect_uri=${encodeURIComponent(shareUrl)}`, '_blank');
        setShowShareModal(false);
    };

    const handleFacebookShare = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        setShowShareModal(false);
    };

    const handleTwitterShare = () => {
        const text = `${shareText}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        setShowShareModal(false);
    };

    const getJoinedText = (dateString) => {
        if (!dateString) return 'Joined recently';
        const joined = new Date(dateString);
        if (isNaN(joined.getTime())) return 'Joined recently';

        const now = new Date();
        const diffTime = Math.abs(now - joined);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays < 30) return 'Joined recently';
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `Joined ${months} ${months === 1 ? 'month' : 'months'} ago`;
        }
        const years = Math.floor(diffDays / 365);
        return `Joined ${years} ${years === 1 ? 'year' : 'years'} ago`;
    };

    if (loading) return <div className="short-stay-page loading">Loading...</div>;
    if (!property) return <div className="short-stay-page error">Property not found</div>;

    const {
        title, description, location, pricing, 
        rules, policies, amenities, specific_details,
        images, host_name, host_photo, rating, host_joined_at
    } = property;

    // Fill images array to at least 5 for grid
    const displayImages = (images && Array.isArray(images)) ? [...images] : [];
    while (displayImages.length < 5) {
        displayImages.push('/placeholder-property.jpg');
    }

    return (
        <div className="short-stay-page details-page">
            <div className="details-container">
                {/* Header (Title + Meta) */}
                <div className="details-header">
                    <h1>{title}</h1>
                    <div className="header-meta">
                        <div className="meta-left">
                            <span className="rating-badge" style={{fontWeight: 600}}>
                                <FaStar size={14} /> {rating || 'New'}
                            </span>
                            <span>·</span>
                            <span style={{textDecoration: 'underline', fontWeight: 600}}>0 reviews</span>
                            <span>·</span>
                            <span style={{textDecoration: 'underline', fontWeight: 600}}>
                                {location?.city}, {location?.state}, India
                            </span>
                        </div>
                        <div className="meta-right">
                            <button className="action-btn" onClick={() => setShowShareModal(true)}>
                                <FaShare /> Share
                            </button>
                            <button className="action-btn" onClick={handleToggleFavorite}>
                                <FaHeart color={isFavorite ? '#FF385C' : '#222'} /> {isFavorite ? 'Saved' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Image Gallery Grid */}
                <div className="gallery-section">
                    {displayImages.slice(0, 5).map((img, i) => (
                        <div key={i} className={`gallery-item ${i === 0 ? 'main' : ''}`}>
                            <img src={img} alt={`View ${i + 1}`} />
                        </div>
                    ))}
                    <button className="show-all-photos">
                        Show all photos
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="details-content-grid">
                    
                    {/* LEFT COLUMN */}
                    <div className="details-main-info">
                        
                        {/* Host Header */}
                        <div className="host-header">
                            <div>
                                <h2>Entire home hosted by {host_name || 'Host'}</h2>
                                <p>2 guests · 1 bedroom · 1 bed · 1 bath</p>
                            </div>
                            <img src={host_photo || '/default-user.png'} alt={host_name} className="host-avatar-large" />
                        </div>

                        {/* Property Highlights */}
                        <div className="highlight-item">
                            <FaUser />
                            <div className="highlight-text">
                                <h3>{host_name || 'Host'} is a Superhost</h3>
                                <p>Superhosts are experienced, highly rated hosts.</p>
                            </div>
                        </div>
                        <div className="highlight-item">
                            <FaCheck />
                            <div className="highlight-text">
                                <h3>Great check-in experience</h3>
                                <p>100% of recent guests gave the check-in process a 5-star rating.</p>
                            </div>
                        </div>

                        <div className="section-divider" />

                        {/* Description */}
                        <div className="description-section">
                            <p>{description}</p>
                            <button className="show-more-btn">Show more &gt;</button>
                        </div>

                        <div className="section-divider" />

                        {/* Amenities */}
                        <div className="amenities-section">
                            <h2>What this place offers</h2>
                            <div className="amenities-preview">
                                {amenities && Array.isArray(amenities) && amenities.slice(0, 10).map((item, i) => (
                                    <div key={i} className="amenity-item">
                                        <FaCheck size={14} /> {item}
                                    </div>
                                ))}
                            </div>
                            <button className="show-all-amenities">
                                Show all {amenities?.length || 0} amenities
                            </button>
                        </div>

                        <div className="section-divider" />

                        {/* Specific Details */}
                        <div className="specifics-section">
                            <h2>Property Details</h2>
                            <div className="specifics-grid">
                                {specific_details && Object.entries(specific_details)
                                    .filter(([key]) => key !== 'roomTypes')
                                    .map(([key, value]) => (
                                    <div key={key} className="specific-item">
                                        <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> 
                                        {typeof value === 'boolean' ? (
                                            value ? <span style={{color: '#10b981', marginLeft: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px'}}>Yes <FaCheck size={12}/></span> : <span style={{color: '#ef4444', marginLeft: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px'}}>No <FaTimes size={12}/></span>
                                        ) : (
                                            <span style={{marginLeft: '6px'}}>{String(value)}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="section-divider" />

                        {/* Policies */}
                        <div className="policies-section">
                            <h2>Things to know</h2>
                            <div className="policies-grid">
                                <div className="policy-block">
                                    <h3>House Rules</h3>
                                    <p>Check-in: {rules?.checkIn || '10:00 AM'}</p>
                                    <p>Check-out: {rules?.checkOut || '11:00 AM'}</p>
                                    <p>{policies?.houseRules || 'No smoking, no parties.'}</p>
                                </div>
                                <div className="policy-block">
                                    <h3>Cancellation Policy</h3>
                                    <p className="capitalize">{policies?.cancellation || 'Flexible'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="section-divider" />

                        {/* Host Details (Additional) */}
                        <div className="host-details-section">
                            <h2>Hosted by {host_name}</h2>
                            <p style={{color: '#717171', marginBottom: '24px'}}>
                                {getJoinedText(host_joined_at)} · Superhost
                            </p>
                            
                            {/* Contact Host Button */}
                            {user && String(user.uid) === String(property.user_id) ? (
                                <button className="show-all-amenities" disabled style={{opacity: 0.5, cursor: 'not-allowed'}}>
                                    Contact Host (You)
                                </button>
                            ) : (
                                <button className="show-all-amenities" onClick={handleContactHost}>
                                    Contact Host
                                </button>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN (Sticky Sidebar) */}
                    <div className="details-sidebar">
                        <div className="booking-widget">
                            <div className="widget-header">
                                <div>
                                    <span className="price-large">₹{pricing?.perNight}</span>
                                    <span className="night-label"> night</span>
                                </div>
                                <div className="rating-badge">
                                    <FaStar size={12} /> {rating || 'New'}
                                </div>
                            </div>

                            <div className="booking-form">
                                <div className="date-row">
                                    <div className="date-field">
                                        <label className="field-label">Check-in</label>
                                        <input 
                                            type="date" 
                                            className="field-input" 
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                        />
                                    </div>
                                    <div className="date-field">
                                        <label className="field-label">Checkout</label>
                                        <input 
                                            type="date" 
                                            className="field-input" 
                                            value={checkOut}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="guest-field">
                                    <div style={{width: '100%'}}>
                                        <label className="field-label">Guests</label>
                                        <select 
                                            value={guests} 
                                            onChange={(e) => setGuests(parseInt(e.target.value))}
                                            style={{border: 'none', width: '100%', outline: 'none', background: 'transparent', fontSize: '14px', marginTop: '2px'}}
                                        >
                                            <option value={1}>1 guest</option>
                                            <option value={2}>2 guests</option>
                                            <option value={3}>3 guests</option>
                                            <option value={4}>4 guests</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button className="reserve-btn">Reserve</button>

                            <p className="no-charge-msg">You won't be charged yet</p>

                            <div className="price-summary">
                                <div className="summary-row">
                                    <span>₹{pricing?.perNight} x 5 nights</span>
                                    <span>₹{pricing?.perNight * 5}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Cleaning fee</span>
                                    <span>₹{pricing?.cleaning || 0}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total before taxes</span>
                                    <span>₹{(pricing?.perNight * 5) + Number(pricing?.cleaning || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SHARE MODAL */}
            {showShareModal && (
                <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="share-modal-header">
                            <button className="close-btn" onClick={() => setShowShareModal(false)}>
                                <FaTimes />
                            </button>
                            <h3>Share this place</h3>
                            <div className="placeholder"></div> {/* For spacing */}
                        </div>
                        
                        <div className="share-property-preview">
                            <img src={images?.[0] || '/placeholder-property.jpg'} alt="Preview" />
                            <div>
                                <h4>{title}</h4>
                                <p>{location?.city} · ★{rating || 'New'} · 1 bedroom · 2 beds · 1 bath</p>
                            </div>
                        </div>

                        <div className="share-options-grid">
                            <button className="share-option-card" onClick={handleCopyLink}>
                                <div className="icon-wrapper"><FaCopy /></div>
                                <span>Copy Link</span>
                            </button>
                            <button className="share-option-card" onClick={handleEmailShare}>
                                <div className="icon-wrapper"><FaEnvelope /></div>
                                <span>Email</span>
                            </button>
                            <button className="share-option-card" onClick={handleSMSShare}>
                                <div className="icon-wrapper"><FaComment /></div>
                                <span>Messages</span>
                            </button>
                            <button className="share-option-card" onClick={handleWhatsappShare}>
                                <div className="icon-wrapper"><FaWhatsapp /></div> {/* Green color handled in CSS or ignored for clean look */}
                                <span>WhatsApp</span>
                            </button>
                            <button className="share-option-card" onClick={handleMessengerShare}>
                                <div className="icon-wrapper"><FaFacebookMessenger /></div>
                                <span>Messenger</span>
                            </button>
                            <button className="share-option-card" onClick={handleFacebookShare}>
                                <div className="icon-wrapper"><FaFacebook /></div>
                                <span>Facebook</span>
                            </button>
                            <button className="share-option-card" onClick={handleTwitterShare}>
                                <div className="icon-wrapper"><FaTwitter /></div>
                                <span>Twitter</span>
                            </button>
                            <button className="share-option-card" onClick={() => {navigator.clipboard.writeText(`<iframe src="${window.location.href}"></iframe>`); alert('Embed code copied!');}}>
                                <div className="icon-wrapper"><FaCode /></div>
                                <span>Embed</span>
                            </button>
                             <button className="share-option-card" onClick={() => {if(navigator.share){navigator.share({title, url: window.location.href})} else {alert('Native sharing not supported');}}}>
                                <div className="icon-wrapper"><FaEllipsisH /></div>
                                <span>More options</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShortStayDetails;
