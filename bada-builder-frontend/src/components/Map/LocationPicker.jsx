import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const LocationMarker = ({ setPosition, setAddress }) => {
  const map = useMap();

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      // Auto-fetch address on click
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        setAddress(data.display_name);
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    },
  });

  return null;
};

// Component to update map view when position changes
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
};

const LocationPicker = ({ onLocationSelect, initialLat, initialLng, initialAddress }) => {
  const [position, setPosition] = useState(initialLat && initialLng ? [initialLat, initialLng] : [20.5937, 78.9629]); // Default to India center
  const [address, setAddress] = useState(initialAddress || '');

  // Notify parent of changes
  useEffect(() => {
    if (position && position[0] && position[1]) {
      onLocationSelect({
        latitude: position[0],
        longitude: position[1],
        map_address: address
      });
    }
  }, [position, address]);

  // Get User's Current Location on Mount
  useEffect(() => {
    if (!initialLat || !initialLng) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            setPosition([latitude, longitude]);

            // Fetch address for current location
            try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await response.json();
              setAddress(data.display_name);
            } catch (error) {
              console.error('Error fetching address:', error);
            }
          },
          (error) => {
            console.warn('Geolocation error:', error);
            // Keep default (India) if geolocation fails or is denied
          }
        );
      }
    }
  }, [initialLat, initialLng]);

  return (
    <div className="location-picker-container" style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #ddd',
      backgroundColor: '#fff'
    }}>

      <MapContainer
        center={position}
        zoom={initialLat ? 15 : 5}
        style={{ flex: 1, width: '100%', minHeight: '200px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker setPosition={setPosition} setAddress={setAddress} />
        <ChangeView center={position} />
        <Marker position={position} />
      </MapContainer>

      {/* Selected Address Display */}
      <div style={{
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #ddd',
        fontSize: '0.9rem',
        color: '#333'
      }}>
        <strong>Selected Location:</strong> {address || "Click on map to select precise location"}
      </div>
    </div>
  );
};

export default LocationPicker;
