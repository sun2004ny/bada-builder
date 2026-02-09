import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FaStar, FaUser, FaCheck, FaShare, FaHeart, FaRegHeart, FaTimes, FaCopy, 
    FaEnvelope, FaWhatsapp, FaComment, FaFacebookMessenger, FaFacebook, 
    FaTwitter, FaCode, FaEllipsisH, FaWifi, FaCar, FaUtensils, 
    FaSnowflake, FaTv, FaTshirt, FaPaw, FaSwimmingPool, FaShieldAlt, FaSmokingBan,
    FaChevronLeft, FaChevronRight, FaKeyboard, FaChevronUp, FaChevronDown, FaTh
} from 'react-icons/fa';
import { FiPlus, FiMinus, FiX } from 'react-icons/fi';
import { shortStayAPI } from '../../services/shortStayApi';
import { createOrGetChat } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './ShortStayDetails.css';
import ShortStayLoader from '../../components/ShortStay/ShortStayLoader';

const CalendarModal = ({ 
    isOpen, onClose, checkIn, checkOut, onSelectDates, bookedDates = [],
    adults, setAdults, children, setChildren, infants, setInfants, pets, setPets,
    minStay = 1, maxStay
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedStart, setSelectedStart] = useState(checkIn ? new Date(checkIn) : null);
    const [selectedEnd, setSelectedEnd] = useState(checkOut ? new Date(checkOut) : null);
    const [selecting, setSelecting] = useState('checkIn');

    // Guest limits
    const MAX_GUESTS = 16;
    
    // ... guest update logic ... 
    const updateGuests = (type, action) => {
        if (type === 'adults') {
            if (action === 'increment' && adults + children < MAX_GUESTS) setAdults(prev => prev + 1);
            if (action === 'decrement' && adults > 1) setAdults(prev => prev - 1);
        }
        if (type === 'children') {
            if (action === 'increment' && adults + children < MAX_GUESTS) setChildren(prev => prev + 1);
            if (action === 'decrement' && children > 0) setChildren(prev => prev - 1);
        }
        if (type === 'infants') {
            if (action === 'increment' && infants < 5) setInfants(prev => prev + 1);
            if (action === 'decrement' && infants > 0) setInfants(prev => prev - 1);
        }
        if (type === 'pets') {
            if (action === 'increment' && pets < 5) setPets(prev => prev + 1);
            if (action === 'decrement' && pets > 0) setPets(prev => prev - 1);
        }
    };

    useEffect(() => {
        if (checkIn) setSelectedStart(new Date(checkIn));
        if (checkOut) setSelectedEnd(new Date(checkOut));
    }, [checkIn, checkOut]);

    const isDateBooked = (date) => {
        return bookedDates.some(booking => {
            const start = new Date(booking.check_in);
            const end = new Date(booking.check_out);
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            return d >= s && d < e; 
        });
    };

    const handleDateClick = (date) => {
        if (selecting === 'checkIn') {
            setSelectedStart(date);
            setSelectedEnd(null);
            setSelecting('checkOut');
        } else {
            if (selectedStart && date < selectedStart) {
                setSelectedStart(date);
                setSelectedEnd(null);
            } else {
                let hasBookedInBetween = false;
                let d = new Date(selectedStart);
                d.setDate(d.getDate() + 1);
                while (d <= date) {
                     if (isDateBooked(d)) {
                         hasBookedInBetween = true;
                         break;
                     }
                     d.setDate(d.getDate() + 1);
                }

                if (hasBookedInBetween) {
                    alert("Selected range includes booked dates. Please select available dates.");
                    return;
                }

                // Check Min/Max Stay logic
                const diffTime = Math.abs(date - selectedStart);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                if (minStay && diffDays < minStay) {
                    alert(`Minimum stay is ${minStay} nights.`);
                    return;
                }
                if (maxStay && diffDays > maxStay) {
                    alert(`Maximum stay is ${maxStay} nights.`);
                    return;
                }

                setSelectedEnd(date);
                setSelecting('checkIn');
            }
        }
    };

    const handleSave = () => {
        if (selectedStart && selectedEnd) {
             const formatLocalYYYYMMDD = (d) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            onSelectDates(
                formatLocalYYYYMMDD(selectedStart), 
                formatLocalYYYYMMDD(selectedEnd)
            );
        }
        onClose();
    };

    const isSelected = (date) => {
        return (selectedStart && date.toDateString() === selectedStart.toDateString()) ||
               (selectedEnd && date.toDateString() === selectedEnd.toDateString());
    };

    const isInRange = (date) => {
        return selectedStart && selectedEnd && date > selectedStart && date < selectedEnd;
    };

    const renderMonth = (month) => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const firstDay = new Date(year, monthIndex, 1).getDay();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="empty-cell" />);
        
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, monthIndex, d);
            const isBooked = isDateBooked(date);
            const isDisabled = date < new Date().setHours(0,0,0,0) || isBooked;
            
            days.push(
                <div 
                    key={d} 
                    className={`day-cell ${isSelected(date) ? 'selected' : ''} ${isInRange(date) ? 'in-range' : ''} ${isDisabled ? 'disabled' : ''} ${isBooked ? 'booked' : ''}`}
                    onClick={() => !isDisabled && handleDateClick(date)}
                    title={isBooked ? 'Unavailable' : ''}
                >
                    {d}
                </div>
            );
        }

        return (
            <div className="calendar-month">
                <div className="month-header">
                    {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <div className="calendar-days-grid">
                    {['S','M','T','W','T','F','S'].map(d => <div key={d} className="day-name">{d}</div>)}
                    {days}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);

    return (
        <div className="calendar-modal-overlay" onClick={onClose}>
            <div className="calendar-modal" onClick={e => e.stopPropagation()}>
                <div className="calendar-modal-header">
                    <button className="close-btn-left" onClick={onClose}><FaTimes /></button>
                    <div className="calendar-title-area"> 
                        {/* Simplified title for mobile */}
                    </div>
                </div>

                <div className="calendar-modal-body-scroll">
                    <div className="calendar-inputs-row">
                        <div className={`calendar-input-box ${selecting === 'checkIn' ? 'active' : ''}`} onClick={() => setSelecting('checkIn')}>
                            <span className="field-label-small">CHECK-IN</span>
                            <div className="input-placeholder-text">
                                {selectedStart ? selectedStart.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : (selecting === 'checkIn' ? 'DD/MM/YYYY' : 'Add date')}
                            </div>
                        </div>
                        <div className="calendar-input-divider" />
                        <div className={`calendar-input-box ${selecting === 'checkOut' ? 'active' : ''}`} onClick={() => setSelecting('checkOut')}>
                            <span className="field-label-small">CHECKOUT</span>
                            <div className="input-placeholder-text">
                                {selectedEnd ? selectedEnd.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : (selecting === 'checkOut' ? 'DD/MM/YYYY' : 'Add date')}
                            </div>
                        </div>
                    </div>

                    <div className="calendar-grid-container">
                        <div className="calendar-nav-row">
                            <button className="calendar-nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                                <FaChevronLeft />
                            </button>
                            <button className="calendar-nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                                <FaChevronRight />
                            </button>
                        </div>
                        <div className="calendar-months-row">
                            {renderMonth(currentMonth)}
                            <div className="desktop-only-month">
                                {renderMonth(nextMonth)}
                            </div>
                        </div>
                    </div>

                    {/* Guest Section inside Modal */}
                    <div className="modal-guest-section">
                        <h3>Guests</h3>
                        <div className="guest-picker-row">
                            <div className="guest-type">
                                <span className="type-name">Adults</span>
                                <span className="type-desc">Age 13+</span>
                            </div>
                            <div className="guest-controls">
                                <button className="picker-btn" onClick={() => updateGuests('adults', 'decrement')} disabled={adults <= 1}><FiMinus /></button>
                                <span className="picker-count">{adults}</span>
                                <button className="picker-btn" onClick={() => updateGuests('adults', 'increment')} disabled={adults + children >= MAX_GUESTS}><FiPlus /></button>
                            </div>
                        </div>
                         <div className="guest-picker-row">
                            <div className="guest-type">
                                <span className="type-name">Children</span>
                                <span className="type-desc">Ages 2–12</span>
                            </div>
                            <div className="guest-controls">
                                <button className="picker-btn" onClick={() => updateGuests('children', 'decrement')} disabled={children <= 0}><FiMinus /></button>
                                <span className="picker-count">{children}</span>
                                <button className="picker-btn" onClick={() => updateGuests('children', 'increment')} disabled={adults + children >= MAX_GUESTS}><FiPlus /></button>
                            </div>
                        </div>
                         <div className="guest-picker-row">
                            <div className="guest-type">
                                <span className="type-name">Infants</span>
                                <span className="type-desc">Under 2</span>
                            </div>
                            <div className="guest-controls">
                                <button className="picker-btn" onClick={() => updateGuests('infants', 'decrement')} disabled={infants <= 0}><FiMinus /></button>
                                <span className="picker-count">{infants}</span>
                                <button className="picker-btn" onClick={() => updateGuests('infants', 'increment')} disabled={infants >= 5}><FiPlus /></button>
                            </div>
                        </div>
                         <div className="guest-picker-row">
                            <div className="guest-type">
                                <span className="type-name">Pets</span>
                                <span className="type-desc">Service animals</span>
                            </div>
                            <div className="guest-controls">
                                <button className="picker-btn" onClick={() => updateGuests('pets', 'decrement')} disabled={pets <= 0}><FiMinus /></button>
                                <span className="picker-count">{pets}</span>
                                <button className="picker-btn" onClick={() => updateGuests('pets', 'increment')} disabled={pets >= 5}><FiPlus /></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="calendar-footer-sticky">
                    <div className="footer-left-links">
                       <button className="clear-dates-btn" onClick={() => { setSelectedStart(null); setSelectedEnd(null); setSelecting('checkIn'); }}>Clear dates</button>
                    </div>
                    <button className="close-btn-black" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconShadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PhotoTourModal = ({ isOpen, onClose, images, title, onShare, onSave, isSaved }) => {
    if (!isOpen) return null;

    return (
        <div className="photo-tour-modal">
            <div className="photo-tour-header">
                <button className="nav-btn-back circle-btn" onClick={onClose}>
                    <FaChevronLeft size={16} />
                </button>
                <div className="header-actions">
                    <button className="action-btn" onClick={onShare}>
                        <FaShare size={14} /> Share
                    </button>
                    <button className="action-btn" onClick={onSave}>
                        {isSaved ? <FaHeart color="#FF385C" size={14} /> : <FaRegHeart color="#222" size={14} />} {isSaved ? 'Saved' : 'Save'}
                    </button>
                </div>
            </div>
            <div className="photo-tour-content">
                <div className="photo-tour-container">
                    <h2>Photo tour</h2>
                    <div className="tour-grid">
                        <div className="tour-section">
                            <div className="tour-images-grid">
                                {images?.map((img, index) => (
                                    <div key={index} className="tour-image-wrapper">
                                        <img src={img} alt={`${title} - Photo ${index + 1}`} loading="lazy" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShortStayDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser: user } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
    
    // New state for handling room type selection flow
    const [pendingRoomType, setPendingRoomType] = useState(null);



    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showPhotoTour, setShowPhotoTour] = useState(false);
    const [bookedDates, setBookedDates] = useState([]);
    
    // Booking state
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [pets, setPets] = useState(0);

    // Effect to handle auto-navigation after dates are selected for a specific room type
    useEffect(() => {
        if (pendingRoomType && checkIn && checkOut && property) {
            // Dates have been selected, proceed to reserve
            const totalGuests = adults + children;
            // Clear pending state to prevent infinite loop or unwanted re-triggers
            setPendingRoomType(null);
            
            const displayPricing = property.guest_pricing || property.pricing;

            navigate(`/short-stay/reserve/${id}`, {
                state: { 
                    checkIn, 
                    checkOut, 
                    guests: totalGuests, 
                    adults, 
                    children, 
                    infants, 
                    pets,
                    // Construct pricing object for the specific room type
                    pricing: {
                        currency: 'INR', // Assuming INR based on context
                         // Copy other necessary structure if needed, but perNight is the critical override
                        ...displayPricing, 
                        perNight: pendingRoomType.price // Ensure this overrides
                    },
                    hostPricing: property.pricing, 
                    propertyTitle: property.title, 
                    propertyImage: property.images?.[0],
                    policies: property.policies,
                    roomType: pendingRoomType.type, // Optional: pass room type name for display
                    hostId: property.user_id || property.owner_id
                }
            });
        }
    }, [checkIn, checkOut, pendingRoomType, adults, children, infants, pets, property, id, navigate]);

    const getAmenityIcon = (amenity) => {
        const text = amenity.toLowerCase();
        if (text.includes('wifi')) return <FaWifi />;
        if (text.includes('parking')) return <FaCar />;
        if (text.includes('kitchen')) return <FaUtensils />;
        if (text.includes('ac') || text.includes('air conditioning')) return <FaSnowflake />;
        if (text.includes('tv')) return <FaTv />;
        if (text.includes('washer') || text.includes('laundry')) return <FaTshirt />;
        if (text.includes('pool')) return <FaSwimmingPool />;
        if (text.includes('pet')) return <FaPaw />;
        if (text.includes('smoke') || text.includes('smoking')) return <FaSmokingBan />;
        if (text.includes('safety') || text.includes('secure')) return <FaShieldAlt />;
        return <FaCheck size={14} />;
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return 'Add date';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [data, favorites, availability] = await Promise.all([
                    shortStayAPI.getById(id),
                    user ? shortStayAPI.getUserFavorites() : Promise.resolve({ favorites: [] }),
                    shortStayAPI.getAvailability(id)
                ]);
                
                const propertyData = data.property || data;
                setProperty(propertyData);
                setBookedDates(availability.bookedDates || []);
                
                if (user && favorites?.favorites) {
                    const isFav = favorites.favorites.some(fav => String(fav.id) === String(id));
                    setIsFavorite(isFav);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching property:', err);
                setLoading(false);
            }
        };
        if (id) fetchData();

        const handleClickOutside = (event) => {
            if (showGuestDropdown && !event.target.closest('.booking-form-container')) {
                setShowGuestDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [id, user, showGuestDropdown]);

    const handleToggleFavorite = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/short-stay/${id}` } });
            return;
        }
        try {
            await shortStayAPI.toggleFavorite(id);
            setIsFavorite(!isFavorite);
        } catch (err) {
            console.error('Error toggling favorite:', err);
        }
    };

    const handleContactHost = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/short-stay/${id}` } });
            return;
        }
        try {
            const chat = await createOrGetChat({
                propertyId: id,
                ownerId: property.user_id || property.owner_id
            });
            if (chat && chat.chatId) {
                navigate('/messages');
            }
        } catch (err) {
            console.error('Error creating chat:', err);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
        setShowShareModal(false);
    };

    const handleEmailShare = () => {
        const subject = `Check out this place on Bada Builder: ${property.title}`;
        const body = `I found this amazing place!\n\n${property.title}\n${window.location.href}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        setShowShareModal(false);
    };

    const handleWhatsappShare = () => {
        const text = `Check out this place: ${property.title} - ${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        setShowShareModal(false);
    };

    const handleSMSShare = () => {
        const text = `Check out this place: ${property.title} - ${window.location.href}`;
        window.open(`sms:?body=${encodeURIComponent(text)}`);
        setShowShareModal(false);
    };

    const handleFacebookShare = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
        setShowShareModal(false);
    };

    const handleTwitterShare = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(property.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
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

    if (loading) return <ShortStayLoader />;
    if (!property) return <div className="short-stay-page error">Property not found</div>;

    const {
        title, description, location, pricing, guest_pricing,
        rules, policies, amenities,
        images, host_name, host_photo, rating, host_joined_at,
        specific_details, category
    } = property;

    const displayPricing = guest_pricing || pricing;
    const displayImages = (images && Array.isArray(images)) ? [...images] : [];
    while (displayImages.length < 5) displayImages.push('/placeholder-property.jpg');

    const isOwner = user && property && (String(user.uid) === String(property.user_id || property.owner_id));

    return (
        <div className="short-stay-page details-page">
            <div className="details-container">
                <div className="details-header">
                    <h1>{title}</h1>
                    <div className="header-actions">
                        <button className="action-btn" onClick={() => setShowShareModal(true)}>
                            <FaShare size={14} /> Share
                        </button>
                        <button className="action-btn" onClick={handleToggleFavorite}>
                            {isFavorite ? <FaHeart color="#FF385C" size={14} /> : <FaRegHeart color="#222" size={14} />} {isFavorite ? 'Saved' : 'Save'}
                        </button>
                    </div>
                </div>

                <div className="gallery-section">
                    {displayImages.map((img, i) => (
                        <div key={i} className={`gallery-item ${i === 0 ? 'main' : ''}`} onClick={() => setShowPhotoTour(true)} style={{cursor: 'pointer'}}>
                            <img src={img} alt={`View ${i + 1}`} />
                        </div>
                    ))}
                    <button className="show-all-photos" onClick={() => setShowPhotoTour(true)}>
                        <FaTh size={14} /> Show all photos
                    </button>
                </div>

                <PhotoTourModal 
                    isOpen={showPhotoTour} 
                    onClose={() => setShowPhotoTour(false)} 
                    images={displayImages} 
                    title={title}
                    onShare={() => setShowShareModal(true)}
                    onSave={handleToggleFavorite}
                    isSaved={isFavorite}
                />

                <div className="details-content-grid">
                    <div className="details-main-info">
                        <div className="host-header">
                            <div className="host-header-text">
                                <h2>{category ? category.replaceAll('_', ' ').charAt(0).toUpperCase() + category.replaceAll('_', ' ').slice(1) : 'Stay'} in {location?.city || 'India'}{location?.state ? `, ${location.state}` : ''}</h2>
                                <p>
                                    {specific_details?.maxGuests && `${specific_details.maxGuests} guests · `}
                                    {specific_details?.bhk && `${specific_details.bhk} BHK · `}
                                    {specific_details?.totalBeds && `${specific_details.totalBeds} beds · `}
                                    {specific_details?.washrooms && `${specific_details.washrooms} baths · `}
                                    {specific_details?.sharing && `${specific_details.sharing} sharing · `}
                                    {specific_details?.roomTypes && `${specific_details.roomTypes.length} room types`}
                                </p>
                                <p className="rating-row-main">
                                    <FaStar size={14} /> {rating || '0.0'} · <span className="underline">{property.review_count || 0} reviews</span>
                                </p>
                            </div>
                        </div>

                        {(property.is_superhost || host_name) && (
                            <>
                                <div className="section-divider" />
                                <div className="host-info-summary">
                                    <div className="host-avatar-container">
                                        {host_photo ? (
                                            <img 
                                                src={host_photo} 
                                                alt={host_name} 
                                                className="host-avatar-medium" 
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div 
                                            className="host-avatar-placeholder" 
                                            style={{ display: host_photo ? 'none' : 'flex' }}
                                        >
                                            <FaUser />
                                        </div>
                                        {property.is_superhost && <div className="superhost-badge-small"><FaStar /></div>}
                                    </div>
                                    <div className="host-info-text">
                                        <h3>Hosted by {host_name || 'Host'}</h3>
                                        {property.host_bio && (
                                            <p className="host-bio">"{property.host_bio}"</p>
                                        )}
                                        <p className="joined-text">{getJoinedText(host_joined_at)}{property.is_superhost ? ' · Superhost' : ''}</p>
                                    </div>
                                </div>
                                <div className="section-divider" />
                                <div className="property-highlights">
                                    <div className="highlight-item">
                                        <div className="highlight-icon"><FaCheck /></div>
                                        <div className="highlight-text">
                                            <h3>Verified Property</h3>
                                            <p>This property has been verified for quality and safety.</p>
                                        </div>
                                    </div>
                                    {specific_details && Object.entries(specific_details)
                                        .filter(([key, value]) => value === true && !['idRequired', 'smoking', 'pets', 'events'].includes(key))
                                        .slice(0, 3)
                                        .map(([key]) => (
                                        <div className="highlight-item" key={key}>
                                            <div className="highlight-icon"><FaCheck /></div>
                                            <div className="highlight-text">
                                                <h3>{key.split(/(?=[A-Z])/).join(' ').charAt(0).toUpperCase() + key.split(/(?=[A-Z])/).join(' ').slice(1)}</h3>
                                                <p>Available at this {category?.replaceAll('_', ' ') || 'property'}.</p>
                                            </div>
                                        </div>
                                    ))}
                                    {property.is_superhost && (
                                        <div className="highlight-item">
                                            <div className="highlight-icon"><FaStar /></div>
                                            <div className="highlight-text">
                                                <h3>{host_name} is a Superhost</h3>
                                                <p>Superhosts are experienced, highly rated hosts.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {specific_details && (
                            <div className="specific-details-section">
                                <div className="section-divider" />
                                <h2>Property Details</h2>
                                <div className="details-tags-grid">
                                    {Object.entries(specific_details).map(([key, value]) => {
                                        if (typeof value === 'boolean' || !value || key === 'roomTypes') return null;
                                        // Skip fields already shown in header
                                        if (['maxGuests', 'bhk', 'totalBeds', 'washrooms', 'sharing'].includes(key)) return null;

                                        let displayValue = value;
                                        if (key.toLowerCase().includes('area')) displayValue += ' sq ft';
                                        if (key.toLowerCase().includes('height')) displayValue += ' ft';

                                        return (
                                            <div className="detail-tag" key={key}>
                                                <span className="tag-label">{key.split(/(?=[A-Z])/).join(' ').charAt(0).toUpperCase() + key.split(/(?=[A-Z])/).join(' ').slice(1)}:</span>
                                                <span className="tag-value">{displayValue}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {category === 'hotel' && specific_details.roomTypes && (
                                    <div className="hotel-rooms-table">
                                        <div className="inventory-header">
                                            <div style={{display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap'}}>
                                                <h3>Room Inventory</h3>
                                                {rules && (rules.checkIn || rules.checkOut) && (
                                                    <span style={{fontSize:'13px', color:'#64748b', background:'#f1f5f9', padding:'4px 8px', borderRadius:'4px'}}>
                                                        Check-in: {rules.checkIn} • Checkout: {rules.checkOut}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="fee-note">*Prices include 5% platform fee</span>
                                        </div>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Type</th>
                                                    <th>Max Guests</th>
                                                    <th>Price / Night</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {specific_details.roomTypes.map((room, idx) => {
                                                    const calculatedPrice = Math.ceil(Number(room.price) * 1.05);
                                                    return (
                                                        <tr 
                                                            key={idx} 
                                                            className="room-inventory-row"
                                                            onClick={() => {
                                                                const roomData = { ...room, price: calculatedPrice };
                                                                
                                                                if (!checkIn || !checkOut) {
                                                                    setPendingRoomType(roomData);
                                                                    setShowCalendarModal(true);
                                                                } else {
                                                                    // Navigate immediately if dates are set
                                                                    const totalGuests = adults + children;
                                                                    navigate(`/short-stay/reserve/${id}`, {
                                                                        state: { 
                                                                            checkIn, 
                                                                            checkOut, 
                                                                            guests: totalGuests, 
                                                                            adults, 
                                                                            children, 
                                                                            infants, 
                                                                            pets,
                                                                            pricing: {
                                                                                ...displayPricing,
                                                                                perNight: calculatedPrice
                                                                            },
                                                                            hostPricing: pricing, 
                                                                            propertyTitle: title, 
                                                                            propertyImage: images?.[0],
                                                                            policies: policies,
                                                                            roomType: room.type,
                                                                            hostId: property.user_id || property.owner_id
                                                                        }
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <td>{room.type}</td>
                                                            <td>{room.guestCapacity || '-'}</td>
                                                            <td>₹{calculatedPrice.toLocaleString()}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="section-divider" />

                        {description && (
                            <>
                                <div className="description-section">
                                    <p>{description.length > 250 ? `${description.substring(0, 250)}...` : description}</p>
                                    <button className="show-more-btn" onClick={() => setShowDescriptionModal(true)}>Show more</button>
                                </div>
                            </>
                        )}

                        {amenities && Array.isArray(amenities) && amenities.length > 0 && (
                            <div className="amenities-section">
                                <div className="section-divider" />
                                <h2>What this place offers</h2>
                                <div className="amenities-preview">
                                    {amenities.slice(0, 10).map((item, i) => (
                                        <div key={i} className="amenity-item">
                                            <div className="amenity-icon">{getAmenityIcon(item)}</div>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                                {amenities.length > 0 && (
                                    <button className="show-all-amenities" onClick={() => setShowAmenitiesModal(true)}>
                                        Show all {amenities.length} amenities
                                    </button>
                                )}
                            </div>
                        )}

                        {(rules || policies) && (
                            <div className="policies-section">
                                <div className="section-divider" />
                                <h2>Things to know</h2>
                                <div className="things-to-know-grid">
                                    {rules && (
                                        <div className="things-to-know-col">
                                            <h3>House rules</h3>
                                            {rules.checkIn && <p>Check-in: {rules.checkIn}</p>}
                                            {rules.checkOut && <p>Checkout: {rules.checkOut}</p>}
                                            {rules.minStay && <p>Min. stay: {rules.minStay} night{rules.minStay > 1 ? 's' : ''}</p>}
                                            {policies?.houseRules && <p>{policies.houseRules}</p>}
                                        </div>
                                    )}
                                    {policies && (
                                        <div className="things-to-know-col">
                                            <h3>Safety & property</h3>
                                            {policies.smoking !== undefined && <p>{policies.smoking ? 'Smoking allowed' : 'No smoking'}</p>}
                                            {policies.pets !== undefined && <p>{policies.pets ? 'Pets allowed' : 'No pets'}</p>}
                                            {policies.events !== undefined && <p>{policies.events ? 'Events allowed' : 'No parties or events'}</p>}
                                            {policies.idRequired && <p>Government-issued ID required</p>}
                                        </div>
                                    )}
                                    {policies?.cancellation && (
                                        <div className="things-to-know-col">
                                            <h3>Cancellation policy</h3>
                                            <p className="policy-type">{policies.cancellation.charAt(0).toUpperCase() + policies.cancellation.slice(1)}</p>
                                            <p className="policy-subtext">Review the Host's full cancellation policy.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="section-divider" />

                        {(location?.lat && location?.lng) && (
                            <div className="location-map-section">
                                <div className="section-divider" />
                                <h2>Where you'll be</h2>
                                <p className="location-address-text">
                                    {location?.city}{location?.state ? `, ${location.state}` : ''}{location?.country ? `, ${location.country}` : ''}
                                </p>
                                <div className="map-wrapper">
                                    <MapContainer 
                                        center={[location.lat, location.lng]} 
                                        zoom={14} 
                                        scrollWheelZoom={false}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker position={[location.lat, location.lng]} />
                                    </MapContainer>
                                </div>
                            </div>
                        )}

                        <div className="host-details-section">
                            <h2>Meet your Host</h2>
                            <div className="host-profile-large">
                                <div className="host-avatar-container large">
                                    {host_photo ? (
                                        <img 
                                            src={host_photo} 
                                            alt={host_name} 
                                            className="host-avatar-lg" 
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className="host-avatar-placeholder large" 
                                        style={{ display: host_photo ? 'none' : 'flex' }}
                                    >
                                        <FaUser />
                                    </div>
                                    {property.is_superhost && <div className="superhost-badge-small"><FaStar /></div>}
                                </div>
                                <div className="host-profile-info">
                                    <h3>{host_name}</h3>
                                    <p>{getJoinedText(host_joined_at)}</p>
                                </div>
                            </div>
                            
                            {user && String(user.uid) === String(property.user_id) ? (
                                <button className="contact-host-btn disabled" disabled>Contact Host (You)</button>
                            ) : (
                                <button className="contact-host-btn" onClick={handleContactHost}>Contact Host</button>
                            )}

                            <div className="payment-protection-note">
                                <div className="protection-divider" />
                                <div className="protection-content">
                                    <FaShieldAlt className="protection-icon" />
                                    <p>To help protect your payment, always use Bada Builder to send money and communicate with hosts.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                        <div className="details-sidebar">
                            <div className="booking-widget">
                                <div className="widget-header">
                                    {(!checkIn || !checkOut) ? (
                                        <h2 className="add-dates-header">Add dates for prices</h2>
                                    ) : (
                                        <div>
                                            <span className="price-large">₹{displayPricing?.perNight?.toLocaleString()}</span>
                                            <span className="night-label"> / night</span>
                                        </div>
                                    )}
                                </div>
                                {(() => {
                                    const totalGuests = adults + children;
                                    const guestLabel = `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}${infants > 0 ? `, ${infants} infant${infants > 1 ? 's' : ''}` : ''}${pets > 0 ? `, ${pets} pet${pets > 1 ? 's' : ''}` : ''}`;
                                    const maxPerProperty = specific_details?.maxGuests || 10;
                                    const petsAllowed = policies?.pets;

                                    return (
                                        <div className="booking-form-container">
                                            <div className="booking-form" onClick={() => setShowCalendarModal(true)}>
                                                <div className="date-row">
                                                    <div className="date-field">
                                                        <span className="field-label">CHECK-IN</span>
                                                        <div className={`field-value ${checkIn ? 'selected' : ''}`}>
                                                            {checkIn ? formatDateDisplay(checkIn) : 'Add date'}
                                                        </div>
                                                    </div>
                                                    <div className="date-field">
                                                        <span className="field-label">CHECKOUT</span>
                                                        <div className={`field-value ${checkOut ? 'selected' : ''}`}>
                                                            {checkOut ? formatDateDisplay(checkOut) : 'Add date'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div 
                                                    className={`guest-field ${showGuestDropdown ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowGuestDropdown(!showGuestDropdown);
                                                    }}
                                                >
                                                    <div className="guest-field-content">
                                                        <span className="field-label">GUESTS</span>
                                                        <span className="guest-summary">{guestLabel}</span>
                                                    </div>
                                                    {showGuestDropdown ? <FaChevronUp className="guest-arrow" /> : <FaChevronDown className="guest-arrow" />}
                                                </div>
                                            </div>

                                            {showGuestDropdown && (
                                                <div className="guest-dropdown" onClick={(e) => e.stopPropagation()}>
                                                    <div className="guest-picker-row">
                                                        <div className="guest-type">
                                                            <span className="type-name">Adults</span>
                                                            <span className="type-desc">Age 13+</span>
                                                        </div>
                                                        <div className="guest-controls">
                                                            <button className="picker-btn" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1}><FiMinus /></button>
                                                            <span className="picker-count">{adults}</span>
                                                            <button className="picker-btn" onClick={() => setAdults(adults + 1)} disabled={totalGuests >= maxPerProperty}><FiPlus /></button>
                                                        </div>
                                                    </div>
                                                    <div className="guest-picker-row">
                                                        <div className="guest-type">
                                                            <span className="type-name">Children</span>
                                                            <span className="type-desc">Ages 2–12</span>
                                                        </div>
                                                        <div className="guest-controls">
                                                            <button className="picker-btn" onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0}><FiMinus /></button>
                                                            <span className="picker-count">{children}</span>
                                                            <button className="picker-btn" onClick={() => setChildren(children + 1)} disabled={totalGuests >= maxPerProperty}><FiPlus /></button>
                                                        </div>
                                                    </div>
                                                    <div className="guest-picker-row">
                                                        <div className="guest-type">
                                                            <span className="type-name">Infants</span>
                                                            <span className="type-desc">Under 2</span>
                                                        </div>
                                                        <div className="guest-controls">
                                                            <button className="picker-btn" onClick={() => setInfants(Math.max(0, infants - 1))} disabled={infants <= 0}><FiMinus /></button>
                                                            <span className="picker-count">{infants}</span>
                                                            <button className="picker-btn" onClick={() => setInfants(infants + 1)} disabled={infants >= 5}><FiPlus /></button>
                                                        </div>
                                                    </div>
                                                    <div className="guest-picker-row">
                                                        <div className="guest-type">
                                                            <span className="type-name">Pets</span>
                                                            <span className="type-desc">{petsAllowed ? 'Bringing a service animal?' : 'No pets allowed'}</span>
                                                        </div>
                                                        <div className="guest-controls">
                                                            <button className="picker-btn" onClick={() => setPets(Math.max(0, pets - 1))} disabled={pets <= 0 || !petsAllowed}><FiMinus /></button>
                                                            <span className="picker-count">{pets}</span>
                                                            <button className="picker-btn" onClick={() => setPets(pets + 1)} disabled={pets >= 5 || !petsAllowed}><FiPlus /></button>
                                                        </div>
                                                    </div>
                                                    <div className="guest-footer">
                                                        <p className="max-guests-note">
                                                            This place has a maximum of {maxPerProperty} guests, not including infants. {petsAllowed ? '' : "Pets aren't allowed."}
                                                        </p>
                                                        <button className="guest-close-btn" onClick={() => setShowGuestDropdown(false)}>Close</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                <button 
                                    className="reserve-btn" 
                                    disabled={isOwner}
                                    style={isOwner ? { background: '#ccc', cursor: 'not-allowed' } : {}}
                                    onClick={() => {
                                        if (isOwner) return;
                                        if (!checkIn || !checkOut) {
                                            setShowCalendarModal(true);
                                            return;
                                        }
                                        const totalGuests = adults + children;
                                        navigate(`/short-stay/reserve/${id}`, {
                                            state: { 
                                                checkIn, 
                                                checkOut, 
                                                guests: totalGuests, 
                                                adults, 
                                                children, 
                                                infants, 
                                                pets,
                                                pricing: displayPricing,
                                                hostPricing: pricing, // Pass original host pricing 
                                                propertyTitle: title, 
                                                propertyImage: images?.[0],
                                                policies: policies, // Pass policies for display 
                                                hostId: property.user_id || property.owner_id,
                                                // Host Details
                                                hostName: host_name,
                                                hostBio: property.host_bio,
                                                hostPhoto: host_photo,
                                                hostJoinedAt: host_joined_at,
                                                isSuperhost: property.is_superhost
                                            }
                                        });
                                    }}
                                >
                                    {isOwner ? 'You manage this listing' : ((!checkIn || !checkOut) ? 'Check availability' : 'Reserve')}
                                </button>
                                {((!checkIn || !checkOut) && !loading) ? null : (
                                    <div className="booking-info-footer">
                                        <p className="no-charge-msg">You won't be charged yet</p>
                                        {(checkIn && checkOut && displayPricing) && (
                                            <div className="pricing-breakdown">
                                                <div className="price-row">
                                                    <span>₹{displayPricing?.perNight?.toLocaleString()} x {Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} nights</span>
                                                    <span>₹{(displayPricing?.perNight * Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))).toLocaleString()}</span>
                                                </div>
                                                <div className="price-row">
                                                    <span>GST</span>
                                                    <span>₹{Math.round(displayPricing?.perNight * Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) * 0.18).toLocaleString()}</span>
                                                </div>
                                                <div className="section-divider" />
                                                <div className="price-total">
                                                    <span>Total</span>
                                                    <span>₹{(Math.round(displayPricing?.perNight * Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) * 1.18)).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}
                                        {(() => {
                                             if (!checkIn) return null;
                                             const startDate = new Date(checkIn);
                                             const policy = policies?.cancellation || 'flexible';
                                             let refundText = '';
                                             
                                             // Calculate 5 days before check-in for moderate/flexible
                                             const refundDate = new Date(startDate);
                                             const now = new Date();
                                             
                                             if (policy.toLowerCase().includes('strict')) {
                                                refundText = 'Non-refundable';
                                             } else if (policy.toLowerCase().includes('moderate')) {
                                                refundDate.setDate(refundDate.getDate() - 5);
                                                if (refundDate < now) {
                                                    refundText = 'Non-refundable';
                                                } else {
                                                    const d = refundDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                                    refundText = `Partial refund before ${d}`;
                                                }
                                             } else {
                                                // Flexible - 24 hours before
                                                refundDate.setDate(refundDate.getDate() - 1);
                                                if (refundDate < now) {
                                                    refundText = 'Non-refundable';
                                                } else {
                                                    const d = refundDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
                                                    refundText = `Free cancellation before ${d}`;
                                                }
                                             }
                                             
                                             return (
                                                 <div className="cancellation-preview">
                                                     <span>{refundText}</span>
                                                 </div>
                                             );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                </div>
            </div>

            {showShareModal && (
                <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn-share" onClick={() => setShowShareModal(false)}><FiX size={16} /></button>
                        <h3 className="share-header-title">Share this place</h3>
                        
                        <div className="share-property-preview">
                            <img src={images?.[0] || '/placeholder-property.jpg'} alt="Preview" />
                            <div className="share-preview-info">
                                <h4>{title}</h4>
                                <p>
                                    {category ? category.replace('_', ' ') : 'Property'} in {location?.city} • ★{rating || '0'} 
                                </p>
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
                                <div className="icon-wrapper"><FaWhatsapp /></div>
                                <span>WhatsApp</span>
                            </button>
                            <button className="share-option-card" onClick={handleFacebookShare}>
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
                            <button className="share-option-card" onClick={() => { navigator.clipboard.writeText(`<iframe src="${window.location.href}" />`); alert('Embed code copied!'); }}>
                                <div className="icon-wrapper"><FaCode /></div>
                                <span>Embed</span>
                            </button>
                        </div>
                        
                        <button className="more-options-btn">
                            <FaEllipsisH /> <span>More options</span>
                        </button>
                    </div>
                </div>
            )}

            {showDescriptionModal && (
                <div className="modal-overlay" onClick={() => setShowDescriptionModal(false)}>
                    <div className="description-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <button className="close-btn-left" onClick={() => setShowDescriptionModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <section className="modal-section">
                                <h2 className="modal-title">About this space</h2>
                                <div className="modal-description-text">
                                    {description.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {showAmenitiesModal && (
                <div className="modal-overlay" onClick={() => setShowAmenitiesModal(false)}>
                    <div className="description-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <button className="close-btn-left" onClick={() => setShowAmenitiesModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <section className="modal-section">
                                <h2 className="modal-title">What this place offers</h2>
                                <div className="amenities-full-list">
                                    {amenities && Array.isArray(amenities) && amenities.map((item, i) => (
                                        <div key={i} className="amenity-list-row">
                                            <div className="amenity-icon">{getAmenityIcon(item)}</div>
                                            <div className="amenity-list-text">
                                                <span>{item}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Reserve Bar for Mobile */}
            <div className="sticky-reserve-bar">
                <div className="sticky-bar-info">
                    <div className="sticky-price">
                        ₹{displayPricing?.perNight?.toLocaleString()} <span> /night</span>
                    </div>
                    <div className="sticky-dates">
                        {checkIn && checkOut ? `${new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'Add dates'}
                    </div>
                </div>
                <button 
                    className="sticky-reserve-btn"
                    style={isOwner ? { opacity: 0.5, cursor: 'not-allowed', background: '#ccc' } : {}}
                    onClick={() => {
                         if (isOwner) {
                             alert("You cannot reserve your own property");
                             return;
                         }
                         if (!checkIn || !checkOut) {
                             setShowCalendarModal(true);
                             return;
                         }
                         const totalGuests = adults + children;
                         navigate(`/short-stay/reserve/${id}`, {
                             state: { 
                                 checkIn, 
                                 checkOut, 
                                 guests: totalGuests, 
                                 adults, 
                                 children, 
                                 infants, 
                                 pets,
                                 pricing: displayPricing,
                                 hostPricing: pricing, 
                                 propertyTitle: title, 
                                 propertyImage: images?.[0],
                                 policies: policies,
                                 hostId: property.user_id || property.owner_id 
                             }
                         });
                    }}
                >
                    {(!checkIn || !checkOut) ? 'Check availability' : 'Reserve'}
                </button>
            </div>

            <CalendarModal 
                isOpen={showCalendarModal} 
                onClose={() => setShowCalendarModal(false)} 
                checkIn={checkIn}
                checkOut={checkOut}
                onSelectDates={(start, end) => {
                    setCheckIn(start);
                    setCheckOut(end);
                }}
                bookedDates={bookedDates}
                adults={adults} setAdults={setAdults}
                children={children} setChildren={setChildren}
                infants={infants} setInfants={setInfants}
                pets={pets} setPets={setPets}
                minStay={rules?.minStay}
                maxStay={rules?.maxStay}
            />
        </div>
    );
};

export default ShortStayDetails;
