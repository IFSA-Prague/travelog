import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FaMapMarkerAlt, FaUsers, FaPlane } from 'react-icons/fa';
import defaultAvatar from './assets/default-avatar.jpg';

const CityDetail = () => {
  const { cityId } = useParams();
  const [city, setCity] = useState(null);
  const [trips, setTrips] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [cityRes, tripsRes, usersRes] = await Promise.all([
          axios.get(`/cities/${cityId}`),
          axios.get(`/cities/${cityId}/trips`),
          axios.get(`/cities/${cityId}/users`)
        ]);
        
        setCity(cityRes.data);
        setTrips(tripsRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Error fetching city data:', error);
        setError('Failed to load city data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCityData();
  }, [cityId]);

  if (loading) {
    return (
      <Container>
        <Loading>Loading city information...</Loading>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Error>{error}</Error>
      </Container>
    );
  }

  if (!city) {
    return (
      <Container>
        <Error>City not found</Error>
      </Container>
    );
  }

  return (
    <Container>
      <CityHeader>
        <CityIcon>
          <FaMapMarkerAlt />
        </CityIcon>
        <CityInfo>
          <CityName>{city.name}</CityName>
          <CityCountry>{city.country}</CityCountry>
        </CityInfo>
      </CityHeader>

      <StatsContainer>
        <Stat>
          <FaPlane />
          <StatValue>{trips.length}</StatValue>
          <StatLabel>Trips</StatLabel>
        </Stat>
        <Stat>
          <FaUsers />
          <StatValue>{users.length}</StatValue>
          <StatLabel>Travelers</StatLabel>
        </Stat>
      </StatsContainer>

      <Section>
        <SectionTitle>Recent Trips</SectionTitle>
        {trips.length === 0 ? (
          <EmptyState>No trips found for this city yet.</EmptyState>
        ) : (
          <TripsGrid>
            {trips.map(trip => (
              <TripCard key={trip.id}>
                <TripImage src={trip.photos?.[0]?.url || defaultAvatar} alt={trip.city} />
                <TripInfo>
                  <TripUser>{trip.user?.username || 'Unknown User'}</TripUser>
                  <TripDate>
                    {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                  </TripDate>
                </TripInfo>
              </TripCard>
            ))}
          </TripsGrid>
        )}
      </Section>

      <Section>
        <SectionTitle>Travelers</SectionTitle>
        {users.length === 0 ? (
          <EmptyState>No travelers found for this city yet.</EmptyState>
        ) : (
          <UsersGrid>
            {users.map(user => (
              <UserCard key={user.id}>
                <UserAvatar 
                  src={user.avatar_url || defaultAvatar} 
                  alt={user.username}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                />
                <UserName>{user.username}</UserName>
              </UserCard>
            ))}
          </UsersGrid>
        )}
      </Section>
    </Container>
  );
};

export default CityDetail;

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const CityHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CityIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #f0f4ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b5bdb;
  font-size: 2rem;
`;

const CityInfo = styled.div`
  flex: 1;
`;

const CityName = styled.h1`
  font-size: 2rem;
  margin: 0;
  color: #1a1a1a;
`;

const CityCountry = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin: 0.5rem 0 0;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
`;

const Section = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
`;

const TripsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const TripCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const TripImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const TripInfo = styled.div`
  padding: 1rem;
`;

const TripUser = styled.div`
  font-weight: 500;
  color: #1a1a1a;
`;

const TripDate = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
`;

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
`;

const UserCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const UserAvatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserName = styled.div`
  font-weight: 500;
  color: #1a1a1a;
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
`;

const Error = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #dc3545;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
`; 