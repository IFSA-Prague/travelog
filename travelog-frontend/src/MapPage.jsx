import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons not showing up
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPage = () => {
  useEffect(() => {
    document.title = 'Travelog Map';
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 64px)', width: '100%', marginTop: '64px' }}>
        <MapContainer
            center={[48.8566, 2.3522]}
            zoom={4}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[48.8566, 2.3522]}>
            <Popup>
                Hello from Paris! 🇫🇷
            </Popup>
            </Marker>
        </MapContainer>
    </div>

  );
};

export default MapPage;
