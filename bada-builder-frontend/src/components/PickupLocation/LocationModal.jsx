import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapPicker from './MapPicker';
import './PickupLocation.css';

const LocationModal = ({ isOpen, onClose, onConfirm, currentAddress }) => {
    const [selectedAddress, setSelectedAddress] = React.useState(currentAddress);
    const [tempCoords, setTempCoords] = React.useState(null);

    const handleLocationSelect = (address, coords) => {
        setSelectedAddress(address);
        setTempCoords(coords);
    };

    const handleConfirm = () => {
        onConfirm(selectedAddress);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay">
                    <motion.div
                        className="modal-content"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">Select Pickup Location</h2>
                            <button className="close-btn" onClick={onClose}>✕</button>
                        </div>

                        <div className="modal-scrollable-content">
                        <MapPicker
                            onLocationSelect={handleLocationSelect}
                            initialLocation={null} // Can be extended to use current location
                        />

                        <div style={{ padding: '0 20px 20px' }}>
                            <button
                                className="confirm-btn"
                                style={{ width: '100%' }}
                                onClick={handleConfirm}
                                disabled={!selectedAddress}
                            >
                                Confirm Selection
                            </button>
                        </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LocationModal;
