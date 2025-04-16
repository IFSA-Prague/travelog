// src/MyLog.jsx
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import AddTripModal from './components/AddTripModal';
import TripDetail from './components/TripDetail';
import axios from 'axios';
import { FaPlus, FaMapMarkerAlt, FaCalendarAlt, FaUser } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MyLog = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchTrips = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`http://localhost:5050/trips/${user.id}`);
      setTrips(res.data);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleAddTrip = async (formData) => {
    try {
      const res = await axios.post('http://localhost:5050/trips', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log("Trip created:", res.data);
      fetchTrips();
    } catch (err) {
      console.error("Trip creation failed:", err);
    }
  };

  const handleTripClick = (trip) => setSelectedTrip(trip);

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <Title>My Travel Log</Title>
          <Subtitle>Keep track of your adventures around the world</Subtitle>
        </HeaderContent>
        <AddButton onClick={() => setIsModalOpen(true)}>
          <FaPlus />
          <span>Add Trip</span>
        </AddButton>
      </Header>

      {trips.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>✈️</EmptyStateIcon>
          <EmptyStateTitle>No trips yet</EmptyStateTitle>
          <EmptyStateText>Start your travel journey by adding your first trip!</EmptyStateText>
        </EmptyState>
      ) : (
        <TripsGrid>
          {trips.map((trip) => (
            <TripCard key={trip.id} onClick={() => handleTripClick(trip)}>
              <TripImage>
                <MapIcon><FaMapMarkerAlt /></MapIcon>
              </TripImage>
              <TripContent>
                <TripLocation>
                  <City>{trip.city}</City>
                  <Country>{trip.country}</Country>
                </TripLocation>
                <TripInfo>
                  <DateRange>
                    <FaCalendarAlt />
                    <span>{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</span>
                  </DateRange>
                  <UserInfo>
                    <FaUser /><span>{user.username}</span>
                  </UserInfo>
                </TripInfo>
              </TripContent>
            </TripCard>
          ))}
        </TripsGrid>
      )}

      <AddTripModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTrip}
      />

      {selectedTrip && (
        <TripDetail
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
        />
      )}
    </PageContainer>
  );
};

// Styled components (same as before)
const PageContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 64px);
  margin-top: 64px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  background: linear-gradient(135deg, #4263eb 0%, #364fc7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #4263eb 0%, #364fc7 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(66, 99, 235, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(66, 99, 235, 0.3);
  }

  svg {
    font-size: 18px;
  }
`;

const TripsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  width: 100%;
`;

const TripCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const TripImage = styled.div`
  height: 160px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MapIcon = styled.div`
  font-size: 48px;
  color: #4263eb;
  opacity: 0.8;
`;

const TripContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TripLocation = styled.div`
  margin-bottom: 4px;
`;

const City = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
`;

const Country = styled.h3`
  font-size: 16px;
  color: #666;
  margin: 0;
  font-weight: 400;
`;

const TripInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
`;

const DateRange = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;

  svg {
    color: #4263eb;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;

  svg {
    color: #4263eb;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  background: white;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
`;

const EmptyStateTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0 0 24px 0;
  max-width: 400px;
`;

export default MyLog;
