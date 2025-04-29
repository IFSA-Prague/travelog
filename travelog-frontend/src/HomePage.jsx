import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser } from 'react-icons/fa';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const HomePage = () => {
  const [feedTrips, setFeedTrips] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    async function fetchFeed() {
      try {
        if (!user?.id) return;
        const res = await axios.get(`http://localhost:5050/feed/${user.id}`);
        setFeedTrips(res.data);
      } catch (error) {
        console.error('Error fetching feed trips', error);
      }
    }
    fetchFeed();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <PageContainer>
      <GreetingCard>
        <Greeting>Hi, {user?.username}!</Greeting>
        <SubHeading>Welcome back to your travel feed 🌍</SubHeading>
      </GreetingCard>

      <SectionCard>
        <SectionTitle>Following Feed</SectionTitle>
        {feedTrips.length === 0 ? (
          <SectionContent>No posts from people you follow yet.</SectionContent>
        ) : (
          <TripsGrid>
            {feedTrips.map((trip) => (
              <TripCard key={trip.id}>
                <TripImage $hasImage={trip.photos && trip.photos.length > 0}>
                  {trip.photos && trip.photos.length > 0 ? (
                    <img src={trip.photos[0].url} alt={`${trip.city} trip`} />
                  ) : (
                    <MapIcon><FaMapMarkerAlt /></MapIcon>
                  )}
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
                      <FaUser /><span>by {trip.username}</span>
                    </UserInfo>
                  </TripInfo>
                </TripContent>
              </TripCard>
            ))}
          </TripsGrid>
        )}
      </SectionCard>

      <SectionCard>
        <SectionTitle>Bookmarked Cities</SectionTitle>
        <SectionContent>Coming soon...</SectionContent>
      </SectionCard>
    </PageContainer>
  );
};

// Styled components (reusing from your other files!)
const PageContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 64px);
  margin-top: 64px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  animation: ${fadeIn} 0.5s ease-out;
`;

const GreetingCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 32px;
  text-align: center;
`;

const Greeting = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const SubHeading = styled.p`
  font-size: 16px;
  color: #666;
`;

const SectionCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
`;

const SectionContent = styled.p`
  font-size: 16px;
  color: #555;
`;

const TripsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const TripCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const TripImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.$hasImage ? 'none' : '#f0f0f0'};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const MapIcon = styled.div`
  font-size: 48px;
  color: #4263eb;
  opacity: 0.8;
`;

const TripContent = styled.div`
  padding: 20px;
`;

const TripLocation = styled.div`
  margin-bottom: 8px;
`;

const City = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const Country = styled.h4`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const TripInfo = styled.div`
  margin-top: 12px;
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

export default HomePage;
