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
                        ⭐ <span>{listing.rating || 'New'}</span>
                    </div>
                </div>

                <p className="short-stay-property-location">
                    {listing.specific_details?.bhk
                        ? `${listing.specific_details.bhk} BHK`
                        : (categories.find(c => c.id === listing.category)?.name || listing.category || 'Stay')}
                </p>

                <div className="short-stay-property-footer">
                    <div className="short-stay-property-price">
                        <span className="short-stay-price-amount">₹{(listing.guest_pricing?.perNight || listing.pricing?.perNight || 0).toLocaleString()}</span>
                        <span className="short-stay-price-unit">/ night</span>
                    </div>
                </div>
            </div>
        </Motion.div>
    );
};

export default ShortStayCard;
