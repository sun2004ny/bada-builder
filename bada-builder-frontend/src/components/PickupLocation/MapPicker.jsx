import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PickupLocation.css';

// Fix for default marker icon issue in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to handle map events
const MapEvents = ({ onMapClick }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
};

// Helper component to handle external map control
const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15);
        }
    }, [center, map]);

    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }, [map]);

    return null;
};

const MapPicker = ({ onLocationSelect, initialLocation }) => {
    const defaultPos = initialLocation || { lat: 28.6139, lng: 77.2090 };
    const [markerPosition, setMarkerPosition] = useState([defaultPos.lat, defaultPos.lng]);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const reverseGeocode = useCallback(async (lat, lng) => {
        setLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                setAddress(data.display_name);
                onLocationSelect(data.display_name, { lat, lng });
            } else {
                setAddress('Address not found');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            setAddress('Error fetching address');
        } finally {
            setLoading(false);
        }
    }, [onLocationSelect]);

    useEffect(() => {
        reverseGeocode(markerPosition[0], markerPosition[1]);
    }, [markerPosition, reverseGeocode]);

    const handleMapClick = (latlng) => {
        setMarkerPosition([latlng.lat, latlng.lng]);
    };

    const handleMarkerDragEnd = (e) => {
        const { lat, lng } = e.target.getLatLng();
        setMarkerPosition([lat, lng]);
    };

    return (
        <div className="map-picker-wrapper">
            <div className="map-container" style={{ height: '450px', position: 'relative' }}>
                <MapContainer
                    center={markerPosition}
                    zoom={15}
                    style={{ width: '100%', height: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                        position={markerPosition}
                        draggable={true}
                        eventHandlers={{
                            dragend: handleMarkerDragEnd,
                        }}
                    />
                    <MapEvents onMapClick={handleMapClick} />
                    <MapController center={markerPosition} />
                </MapContainer>
            </div>
            <div className="modal-footer">
                <div className="address-preview">
                    {loading ? (
                        <div className="loading-spinner"></div>
                    ) : (
                        address || 'Click on the map to select a pickup location'
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapPicker;
