import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaBuilding, FaHome, FaBed, FaHotel, FaTree, FaCampground, FaLeaf, FaUserGraduate } from 'react-icons/fa';
import './ShortStayCard.css';

const categories = [
    { id: 'apartment', name: 'Flats / Apartments', icon: <FaBuilding /> },
    { id: 'house', name: 'Villa / Bunglow', icon: <FaHome /> },
    { id: 'dormitory', name: 'Dormitory', icon: <FaBed /> },
    { id: 'hotel', name: 'Hotels', icon: <FaHotel /> },
    { id: 'cottage', name: 'Cottages', icon: <FaHome /> },
    { id: 'tree_house', name: 'Tree House', icon: <FaTree /> },
    { id: 'tent', name: 'Tents', icon: <FaCampground /> },
    { id: 'farmhouse', name: 'Farmhouse', icon: <FaLeaf /> },
    { id: 'hostel', name: 'Hostel', icon: <FaUserGraduate /> }
];

const ShortStayCard = ({ listing, index = 0, favorites, onToggleFavorite }) => {
    const navigate = useNavigate();

    return (
        <Motion.div
            className="short-stay-property-card horizontal-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => navigate(`/short-stay/${listing.id}`)}
            whileHover={{ y: -5 }}
        >
            <div className="short-stay-property-image">
                <img
                    src={listing.cover_image || (listing.images && listing.images[0]) || '/placeholder-property.jpg'}
                    alt={listing.title}
                />
                <button
                    className={`favorite-btn ${favorites.has(listing.id) ? 'active' : ''}`}
                    onClick={(e) => onToggleFavorite(e, listing.id)}
                >
                    {favorites.has(listing.id) ? (
                        <FaHeart className="heart-icon-filled" color="#FF385C" size={18} />
                    ) : (
                        <FaRegHeart className="heart-icon-outline" color="white" size={18} />
                    )}
                </button>
            </div>

            <div className="short-stay-property-info">
                <div className="short-stay-property-header">
                    <h3 className="truncate-title">{listing.title}</h3>
                    <div className="short-stay-property-rating">
                        ⭐ <span>{Number(listing.average_rating) > 0 ? Number(listing.average_rating).toFixed(1) : (listing.rating || 'New')}</span>
                        {Number(listing.review_count) > 0 && <span className="review-count-small">({listing.review_count})</span>}
                    </div>
                </div>

                <p className="short-stay-property-location">
                    <span>
                        {listing.specific_details?.bhk
                            ? `${listing.specific_details.bhk} BHK`
                            : (categories.find(c => c.id === listing.category)?.name || listing.category || 'Stay')}
                    </span>
                    {(() => {
                        const sd = listing.specific_details || {};
                        let maxGuests = sd.maxGuests;
                        
                        if (!maxGuests && sd.roomTypes?.length > 0) {
                            maxGuests = Math.max(...sd.roomTypes.map(r => parseInt(r.guestCapacity) || 0));
                        }
                        
                        if (maxGuests > 0) {
                            return <span className="guest-capacity-tag"> • {maxGuests} guests</span>;
                        }
                        return null;
                    })()}
                </p>

                <div className="short-stay-property-footer">
                    <div className="short-stay-property-price">
                        {(() => {
                            // Base price from DB (Listing or Guest Pricing)
                            let basePerNight = listing.guest_pricing?.perNight || listing.pricing?.perNight || 0;
                            
                            // Apply 5% Bada Builder Fee
                            let finalPerNight = basePerNight * 1.05;

                            let priceDisplay = `₹${Math.round(finalPerNight).toLocaleString()}`;
                            
                            if (listing.category === 'hotel' && listing.specific_details?.roomTypes?.length > 0) {
                                const today = new Date();
                                const day = today.getDay();
                                const isWeekend = day === 0 || day === 6; // Sunday (0) or Saturday (6)

                                const prices = listing.specific_details.roomTypes.map(room => {
                                    const roomBase = Number(room.price) || 0;
                                    const roomWeekend = Number(room.weeklyPrice) || 0;
                                    // Use weeklyPrice for weekends if available
                                    const applicableBase = (isWeekend && roomWeekend > 0) ? roomWeekend : roomBase;
                                    
                                    // Apply 5% Fee to range
                                    return applicableBase * 1.05;
                                }).filter(p => p > 0);

                                if (prices.length > 0) {
                                    const min = Math.round(Math.min(...prices));
                                    const max = Math.round(Math.max(...prices));
                                    priceDisplay = min === max 
                                        ? `₹${min.toLocaleString()}` 
                                        : `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
                                }
                            }
                            
                            return (
                                <>
                                    <span className="short-stay-price-amount">{priceDisplay}</span>
                                    <span className="short-stay-price-unit">/ night</span>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </Motion.div>
    );
};

export default ShortStayCard;
