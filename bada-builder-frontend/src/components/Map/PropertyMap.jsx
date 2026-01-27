import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PropertyMap = ({ latitude, longitude, address, title }) => {
  if (!latitude || !longitude) return null;

  const position = [latitude, longitude];

  return (
    <div className="property-map-container" style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginTop: '20px' }}>
      <div style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '8px 16px', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
      }}>
          <MapPin size={16} className="text-blue-600" />
          <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 500 }}>
            {address || 'Approximate Location'}
          </span>
      </div>
      <MapContainer 
        center={position} 
        zoom={15} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {title || "Property Location"} <br /> {address}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
