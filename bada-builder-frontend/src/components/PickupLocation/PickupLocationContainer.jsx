import React, { useState } from 'react';
import LocationModal from './LocationModal';
import './PickupLocation.css';

const PickupLocationContainer = () => {
    const [pickupAddress, setPickupAddress] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleConfirmLocation = (address) => {
        setPickupAddress(address);
    };

    return (
        <div className="pickup-location-container">
            <div className="pickup-section">
                <div className="pickup-label">
                    <span>📍</span>
                    <span>Pickup Location</span>
                </div>

                <div className="input-wrapper">
                    <input
                        type="text"
                        className="pickup-input"
                        placeholder="Enter your complete pickup address..."
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                    />
                    <button
                        className="location-btn"
                        title="Select on Map"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span>📍</span>
                    </button>
                </div>

                <p className="helper-text">
                    Type your address or click the map icon to select location on Google Maps
                </p>
            </div>

            <LocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmLocation}
                currentAddress={pickupAddress}
            />
        </div>
    );
};

export default PickupLocationContainer;
export { PickupLocationContainer as PickupLocationSelector };
