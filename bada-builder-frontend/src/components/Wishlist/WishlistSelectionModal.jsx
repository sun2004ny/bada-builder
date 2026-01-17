import React, { useState, useEffect } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { wishlistAPI } from '../../services/wishlistAPI';
import './WishlistSelectionModal.css';

const WishlistSelectionModal = ({ isOpen, onClose, propertyId, onPropertyAdded, wishlists, onCreateNew }) => {
    const [loading, setLoading] = useState(false);
    const [selectedWishlists, setSelectedWishlists] = useState([]);

    const handleToggleWishlist = async (wishlistId) => {
        setLoading(true);
        try {
            await wishlistAPI.addPropertyToWishlist(wishlistId, propertyId);
            onPropertyAdded();
            onClose();
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            // Show some error toast if available
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="wishlist-modal-overlay" onClick={onClose}>
                <motion.div
                    className="wishlist-modal-content selection-modal"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    <div className="wishlist-modal-header">
                        <button className="wishlist-close-btn" onClick={onClose}>
                            <FiX size={24} />
                        </button>
                        <h2>Save to wishlist</h2>
                    </div>

                    <div className="wishlist-selection-body">
                        {wishlists.length > 0 ? (
                            <div className="wishlist-items-list">
                                {wishlists.map((wishlist) => (
                                    <button
                                        key={wishlist.id}
                                        className="wishlist-selection-item"
                                        onClick={() => handleToggleWishlist(wishlist.id)}
                                        disabled={loading}
                                    >
                                        <div className="wishlist-item-info">
                                            <span className="wishlist-item-name">{wishlist.name}</span>
                                            <span className="wishlist-item-count">{wishlist.property_count || 0} properties</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="no-wishlists-prompt">
                                <p>You haven't created any wishlists yet.</p>
                            </div>
                        )}

                        <button
                            className="create-new-wishlist-inline-btn"
                            onClick={() => {
                                onClose();
                                onCreateNew();
                            }}
                        >
                            <div className="plus-icon-container">
                                <FiPlus size={20} />
                            </div>
                            <span>Create new wishlist</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default WishlistSelectionModal;
