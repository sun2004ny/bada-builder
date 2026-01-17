import React, { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './WishlistModal.css';

const WishlistModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || name.length > 50) return;

        setLoading(true);
        try {
            await onCreate(name.trim());
            setName('');
            onClose();
        } catch (error) {
            console.error('Error in wishlist creation:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="wishlist-modal-overlay" onClick={onClose}>
                <motion.div
                    className="wishlist-modal-content"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    <div className="wishlist-modal-header">
                        <button className="wishlist-close-btn" onClick={onClose}>
                            <FiX size={24} />
                        </button>
                        <h2>Create wishlist</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="wishlist-modal-form">
                        <div className="wishlist-input-container">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Name"
                                maxLength={50}
                                autoFocus
                            />
                            <span className="wishlist-char-count">{name.length}/50 characters</span>
                        </div>

                        <div className="wishlist-modal-footer">
                            <button
                                type="button"
                                className="wishlist-cancel-btn"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="wishlist-create-btn"
                                disabled={!name.trim() || name.length > 50 || loading}
                            >
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default WishlistModal;
