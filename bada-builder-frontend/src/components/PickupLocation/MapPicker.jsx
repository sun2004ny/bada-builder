import React, { useState, useEffect, useCallback, useRef } from 'react';
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

    const timeoutRef = useRef(null);

    const reverseGeocode = useCallback((lat, lng) => {
        // Clear existing timeout to debounce requests
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout (500ms delay)
        timeoutRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                // Add strict header for OSM compliance
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                    headers: {
                        'User-Agent': 'BadaBuilder/1.0'
                    }
                });

                // Safe check for JSON content type
                const contentType = response.headers.get('content-type');
                let data;

                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    // Fallback for non-JSON
                    data = null;
                }

                if (data && data.display_name) {
                    setAddress(data.display_name);
                    onLocationSelect(data.display_name, { lat, lng });
                } else {
                    setAddress('Address not found');
                }
            } catch (error) {
                console.error('Geocoding error:', error);
                setAddress('Location lookup failed');
            } finally {
                setLoading(false);
            }
        }, 500);
    }, [onLocationSelect]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

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
            <div className="map-container" style={{ height: '500px', position: 'relative' }}>
                <MapContainer
                    center={markerPosition}
                    zoom={15}
                    style={{ width: '100%', height: '100%', minHeight: '500px', zIndex: 1 }}
                    scrollWheelZoom={true}
                    zoomControl={true}
                    doubleClickZoom={true}
                    touchZoom={true}
                    dragging={true}
                    className="leaflet-map-container"
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
