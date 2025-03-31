import React, { useState } from 'react';
import styled from 'styled-components';
import AddTripModal from './components/AddTripModal';
import TripDetail from './components/TripDetail';

const MyLog = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const handleAddTrip = (tripData) => {
    setTrips(prevTrips => [...prevTrips, { ...tripData, id: Date.now() }]);
  };

  const handleTripClick = (trip) => {
    setSelectedTrip(trip);
  };

  return (
    <Container>
      <Header>
        <Heading>My Travel Log</Heading>
        <AddButton onClick={() => setIsModalOpen(true)}>Add New Trip</AddButton>
      </Header>

      <TripsGrid>
        {trips.map(trip => (
          <TripCard key={trip.id} onClick={() => handleTripClick(trip)}>
            <TripHeader>
              <TripCity>{trip.city}</TripCity>
              <TripCountry>{trip.country}</TripCountry>
            </TripHeader>
            <TripDates>
              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
            </TripDates>
            {trip.accommodation && (
              <TripDetailContainer>
                <DetailLabel>Accommodation:</DetailLabel>
                <DetailValue>{trip.accommodation}</DetailValue>
              </TripDetailContainer>
            )}
          </TripCard>
        ))}
      </TripsGrid>

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
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Heading = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin: 0;
`;

const AddButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const TripsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const TripCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const TripHeader = styled.div`
  margin-bottom: 0.5rem;
`;

const TripCity = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
`;

const TripCountry = styled.h3`
  font-size: 1.1rem;
  color: #666;
  margin: 0.25rem 0;
`;

const TripDates = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const TripDetailContainer = styled.div`
  margin-top: 0.5rem;
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: #666;
  margin-right: 0.5rem;
`;

const DetailValue = styled.span`
  color: #333;
`;

export default MyLog;
