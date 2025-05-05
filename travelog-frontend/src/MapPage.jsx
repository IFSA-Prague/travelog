import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styled from 'styled-components';
import TripDetail from './TripDetail'; // Adjust path if needed
// import { useNavigate } from 'react-router-dom';



// Custom blue and green markers
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


const MapPage = () => {

  useEffect(() => {
    // This prevents "Map container is already initialized" errors
    const mapContainer = document.querySelector('.leaflet-container');
    if (mapContainer) {
      mapContainer._leaflet_id = null;
    }
  }, []);

  // const navigate = useNavigate();
  const [selectedTrip, setSelectedTrip] = useState(null);

  



  const [tripMarkers, setTripMarkers] = useState([]);


  const [mapReady, setMapReady] = useState(false);


  useEffect(() => {
    document.title = 'Travelog Map';
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    if (!userId) return;

    const myTripsRes = await fetch(`http://localhost:5050/trips/${userId}`);
    const feedRes = await fetch(`http://localhost:5050/feed/${userId}`);
    const myTrips = await myTripsRes.json();
    const feedTrips = await feedRes.json();

    const markers = [];

    // Geocode and add your own trips
    for (const trip of myTrips) {
      const coords = await geocodeCity(trip.city);
      if (coords) {
        markers.push({
          position: coords,
          icon: blueIcon,
          popup: (
            <PopupContent>
              <strong>{trip.city}, {trip.country}</strong><br />
              by <a href={`/user/${trip.username}`}>{'You'}</a>
            </PopupContent>
            
          )
          
        });
      }
    }

    // Geocode and add followed users' trips
    for (const trip of feedTrips) {
      const coords = await geocodeCity(trip.city);
      if (coords) {
        markers.push({
          position: coords,
          icon: greenIcon,
          popup: (
            <PopupContent>
              <strong>{trip.city}, {trip.country}</strong><br />
              <UserRow>
              <span>by <a href={`/user/${trip.username}`}>{trip.username}</a></span>
              <ViewPostButton onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedTrip(trip);
              }}>View Post</ViewPostButton>
              </UserRow>
            </PopupContent>
          )
        });
      }
    }

    setTripMarkers(markers);
    setMapReady(true);
  };

  const geocodeCity = async (city) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json`);
      const data = await response.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
    return null;
  };

  
  

  return (
    
    <MapWrapper>
  {mapReady && (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {tripMarkers.map((marker, idx) => (
        <Marker key={idx} position={marker.position} icon={marker.icon}>
          <Popup>{marker.popup}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )}

  {selectedTrip && (
    <TripDetail trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
  )}
</MapWrapper>

   
  );
};

export default MapPage;

const PopupContent = styled.div`
  font-family: 'Segoe UI', sans-serif;
  font-size: 14px;
  color: #1a1a1a;

  a {
    color: #4263eb;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }

  strong {
    font-size: 16px;
    font-weight: 600;
  }
`;

const MapWrapper = styled.div`
  height: calc(100vh - 64px);
  width: 100%;
  margin-top: 64px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const UserRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-top: 4px;
`;



const ViewPostButton = styled.button`
  margin-top: 8px;
  padding: 6px 10px;
  font-size: 13px;
  background-color: #4263eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2f4cd0;
  }
`;

