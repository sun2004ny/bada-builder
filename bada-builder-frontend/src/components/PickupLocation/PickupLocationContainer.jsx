import React, { useState } from 'react';
import LocationModal from './LocationModal';
import './PickupLocation.css';

const PickupLocationContainer = () => {
    const [pickupData, setPickupData] = useState({
        address: '',
        houseNo: '',
        building: '',
        area: '',
        city: '',
        pincode: '',
        locationFromMap: '',
        latitude: null,
        longitude: null
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to combine individual address fields into a single string
    const updateCombinedAddress = (newPickupData) => {
        const { houseNo, building, area, city, pincode } = newPickupData;
        const addressParts = [
            houseNo?.trim(),
            building?.trim(),
            area?.trim(),
            city?.trim(),
            pincode?.trim()
        ].filter(part => part && part.length > 0);
        
        const combinedAddress = addressParts.join(', ');
        
        setPickupData({
            ...newPickupData,
            address: combinedAddress
        });
    };

    const handleConfirmLocation = (address) => {
        // Only fill the "Location from Map" field, don't auto-populate manual fields
        setPickupData(prevData => ({
            ...prevData,
            locationFromMap: address,
            // Note: In a real implementation, you'd also get lat/lng from the map
            latitude: null, // Would come from map selection
            longitude: null // Would come from map selection
        }));
    };

    return (
        <div className="pickup-location-container">
            <div className="pickup-section">
                <div className="pickup-label">
                    <span>📍</span>
                    <span>Pickup Location</span>
                </div>

                <div className="structured-address-inputs">
                    <div className="address-row">
                        <input
                            type="text"
                            className="address-field house-field"
                            placeholder="House / Flat No"
                            value={pickupData.houseNo}
                            onChange={(e) => {
                                const newPickupData = { ...pickupData, houseNo: e.target.value };
                                updateCombinedAddress(newPickupData);
                            }}
                            required
                        />
                        <input
                            type="text"
                            className="address-field building-field"
                            placeholder="Building / Street"
                            value={pickupData.building}
                            onChange={(e) => {
                                const newPickupData = { ...pickupData, building: e.target.value };
                                updateCombinedAddress(newPickupData);
                            }}
                            required
                        />
                    </div>
                    <div className="address-row">
                        <input
                            type="text"
                            className="address-field area-field"
                            placeholder="Area / Locality"
                            value={pickupData.area}
                            onChange={(e) => {
                                const newPickupData = { ...pickupData, area: e.target.value };
                                updateCombinedAddress(newPickupData);
                            }}
                            required
                        />
                        <input
                            type="text"
                            className="address-field city-field"
                            placeholder="City"
                            value={pickupData.city}
                            onChange={(e) => {
                                const newPickupData = { ...pickupData, city: e.target.value };
                                updateCombinedAddress(newPickupData);
                            }}
                            required
                        />
                    </div>
                    <div className="address-row">
                        <input
                            type="text"
                            className="address-field pincode-field"
                            placeholder="Pincode"
                            value={pickupData.pincode}
                            onChange={(e) => {
                                const newPickupData = { ...pickupData, pincode: e.target.value };
                                updateCombinedAddress(newPickupData);
                            }}
                            pattern="[0-9]{6}"
                            maxLength="6"
                            required
                        />
                        <button
                            className="location-btn-inline"
                            title="Select location on map"
                            onClick={() => setIsModalOpen(true)}
                        >
                            📍 Select on Map
                        </button>
                    </div>
                    
                    {/* Location from Map field */}
                    <div className="address-row map-location-row">
                        <input
                            type="text"
                            className="address-field map-location-field"
                            placeholder="Location from Map (Optional)"
                            value={pickupData.locationFromMap}
                            readOnly
                        />
                        {pickupData.locationFromMap && (
                            <button
                                className="clear-map-location"
                                onClick={() => {
                                    setPickupData(prevData => ({
                                        ...prevData,
                                        locationFromMap: '',
                                        latitude: null,
                                        longitude: null
                                    }));
                                }}
                                title="Clear map location"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <p className="helper-text">
                    Fill in your complete address details manually. Use map selection for location reference only.
                    {pickupData.address && pickupData.address.length < 15 && (
                        <span style={{ color: '#fbbf24', display: 'block', marginTop: '0.25rem' }}>
                            ⚠️ Please provide more address details for better service
                        </span>
                    )}
                </p>
            </div>

            <LocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmLocation}
                currentAddress={pickupData.address}
            />
        </div>
    );
};

export default PickupLocationContainer;
export { PickupLocationContainer as PickupLocationSelector };
