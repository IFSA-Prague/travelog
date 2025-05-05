import styled, { keyframes } from 'styled-components';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from './assets/default-avatar.jpg';
import searchIllustration from './assets/search-illustration.svg';

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

const Search = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef();
  const USERS_PER_PAGE = 5;
  const MAX_VISIBLE_HEIGHT = 6; // Number of users visible at once
  const [trips, setTrips] = useState([]);
  const [following, setFollowing] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchType, setSearchType] = useState('users');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      const parsed = stored ? JSON.parse(stored) : null;
      setCurrentUser(parsed);
      const savedSearches = JSON.parse(localStorage.getItem("recentSearches") || '[]');
      setRecentSearches(savedSearches);
    } catch (e) {
      console.error("Error parsing user from localStorage");
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchUsers = async () => {
      try {
        const [usersRes, followingRes] = await Promise.all([
          axios.get('/users'),
          axios.get(`/users/${currentUser.id}/following`)
        ]);
        const validUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
        setUsers(validUsers);
        setFilteredUsers(validUsers);
        setFollowing(Array.isArray(followingRes.data) ? followingRes.data : []);
      } catch (error) {
        console.error("Error loading users/following", error);
      }
    };
    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    if (query) {
      if (searchType === 'users') {
        const lower = query.toLowerCase();
        const filtered = users.filter(
          (u) => u.id !== currentUser?.id && u.username.toLowerCase().includes(lower)
        );
        setFilteredUsers(filtered);
        
        const initialUsers = filtered.slice(0, USERS_PER_PAGE);
        setDisplayedUsers(initialUsers);
        
        setHasMore(filtered.length > USERS_PER_PAGE);
        setPage(1);
      } else {
          const searchCities = async () => {
            try {
              const response = await axios.get(`/cities/search?q=${encodeURIComponent(query)}`);
              setCities(response.data);
            } catch (error) {
              console.error("Error searching cities:", error);
              setCities([]);
            }
          };
          searchCities();
      }
    } else {
      setFilteredUsers([]);
      setDisplayedUsers([]);
      setPage(1);
      setHasMore(false);
    }
  }, [query, users, currentUser, searchType]);

  const loadMoreUsers = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * USERS_PER_PAGE;
      const endIndex = startIndex + USERS_PER_PAGE;
      const nextUsers = filteredUsers.slice(startIndex, endIndex);
      
      setDisplayedUsers(prev => [...prev, ...nextUsers]);
      setPage(nextPage);
      setHasMore(endIndex < filteredUsers.length);
      setIsLoading(false);
    }, 300);
  }, [page, filteredUsers, hasMore, isLoading]);

  const lastUserElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreUsers();
      }
    }, {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    });
    
    if (node) observer.current.observe(node);
  }, [hasMore, isLoading, loadMoreUsers]);

  const isFollowing = (userId) => following.some((u) => u.id === userId);
  const toggleFollow = async (targetId) => {
    try {
      const action = isFollowing(targetId) ? 'unfollow' : 'follow';
      await axios.post(`/users/${currentUser.id}/${action}`, { target_user_id: targetId });
      const updated = await axios.get(`/users/${currentUser.id}/following`);
      setFollowing(Array.isArray(updated.data) ? updated.data : []);
    } catch (err) {
      console.error("Failed to follow/unfollow", err);
    }
  };

  const handleTripClick = (trip) => {
    setSelectedTrip(trip);
  };

  const handleUserClick = (username) => {
    setRecentSearches((prev) => {
      const updated = [username, ...prev.filter((u) => u !== username)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
    navigate(`/user/${username}`);
  };

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const getAvatarUrl = (userId) => `${BACKEND_URL}/uploads/user_${userId}.png`;

  return (
    <PageContainer>
      <Card>  
        <Heading>Search</Heading>
        <SearchTypeSelector>
          <SearchTypeButton 
            $active={searchType === 'users'} 
            onClick={() => setSearchType('users')}
          >
            Users
          </SearchTypeButton>
          <SearchTypeButton 
            $active={searchType === 'cities'} 
            onClick={() => setSearchType('cities')}
          >
            Cities
          </SearchTypeButton>
        </SearchTypeSelector>
        <SearchRow>
          <SearchInput
            type="text"
            placeholder={searchType === 'users' ? "Search for a user (e.g., alice123)" : "Search for a city (e.g., Prague)"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchRow>
        
        {searchType === 'users' ? (
          <>
            {!query && (
              <PlaceholderContainer>
                <PlaceholderImage src={searchIllustration} alt="Search for users" />
                <PlaceholderText>Start typing to search for users</PlaceholderText>
              </PlaceholderContainer>
            )}
            {query && filteredUsers.length === 0 && (
              <NoResults>No users found.</NoResults>
            )}
            {query && displayedUsers.length > 0 && (
              <ScrollContainer>
                <UserList>
                  {displayedUsers.map((user, index) => (
                    <UserCard 
                      key={user.id}
                      ref={index === displayedUsers.length - 1 ? lastUserElementRef : null}
                    >
                      <UserInfo onClick={() => handleUserClick(user.username)} style={{ cursor: 'pointer' }}>
                        <Avatar
                          src={getAvatarUrl(user.id)}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultAvatar;
                          }}
                        />
                        <Username>{user.username}</Username>
                      </UserInfo>
                      <FollowButton
                        $following={isFollowing(user.id)}
                        onClick={() => toggleFollow(user.id)}
                      >
                        {isFollowing(user.id) ? 'Unfollow' : 'Follow'}
                      </FollowButton>
                    </UserCard>
                  ))}
                  {hasMore && (
                    <LoadingIndicator>
                      {isLoading ? 'Loading more users...' : 'Scroll to load more'}
                    </LoadingIndicator>
                  )}
                </UserList>
              </ScrollContainer>
            )}
          </>
        ) : (
          <>
            {query && trips.length === 0 && (
              <NoResults>No trips found in this city.</NoResults>
            )}
            {cities.length > 0 && (
              <TripsList>
                {cities.map(city => (
                  <TripCard key={city.city_id} onClick={() => navigate(`/city/${city.city_id}`)}>
                    <TripImage $hasImage={false}>
                      <MapIcon>📍</MapIcon>
                    </TripImage>
                    <TripInfo>
                      <TripLocation>
                        <City>{city.city}</City>
                        <Country>{city.country}</Country>
                      </TripLocation>
                    </TripInfo>
                  </TripCard>
                ))}
              </TripsList>
            )}
            {selectedTrip && (
              <TripModal onClose={() => setSelectedTrip(null)}>
                <ModalContent>
                  <ModalHeader>
                    <ModalTitle>{selectedTrip.city}, {selectedTrip.country}</ModalTitle>
                    <CloseButton onClick={() => setSelectedTrip(null)}>&times;</CloseButton>
                  </ModalHeader>
                  <ModalBody>
                    {selectedTrip.photos && selectedTrip.photos.length > 0 && (
                      <PhotoGrid>
                        {selectedTrip.photos.map((photo, index) => (
                          <Photo key={index} src={photo.url} alt={`Photo ${index + 1}`} />
                        ))}
                      </PhotoGrid>
                    )}
                    <TripDetails>
                      <DetailSection>
                        <DetailTitle>Accommodation</DetailTitle>
                        <DetailText>{selectedTrip.accommodation || 'Not specified'}</DetailText>
                      </DetailSection>
                      <DetailSection>
                        <DetailTitle>Favorite Restaurants</DetailTitle>
                        <DetailText>{selectedTrip.favorite_restaurants || 'Not specified'}</DetailText>
                      </DetailSection>
                      <DetailSection>
                        <DetailTitle>Favorite Attractions</DetailTitle>
                        <DetailText>{selectedTrip.favorite_attractions || 'Not specified'}</DetailText>
                      </DetailSection>
                      <DetailSection>
                        <DetailTitle>Other Notes</DetailTitle>
                        <DetailText>{selectedTrip.other_notes || 'Not specified'}</DetailText>
                      </DetailSection>
                    </TripDetails>
                  </ModalBody>
                </ModalContent>
              </TripModal>
            )}
          </>
        )}

        {recentSearches.length > 0 && !query && (
          <RecentBox>
            <h4>Recent Searches</h4>
            {recentSearches.map((u, i) => (
              <RecentItem key={i} onClick={() => setQuery(u)}>{u}</RecentItem>
            ))}
          </RecentBox>
        )}
      </Card>
    </PageContainer>
  );
};

export default Search;

const PageContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 64px);
  margin-top: 64px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  animation: ${fadeIn} 0.5s ease-out;
  display: flex;
  justify-content: center;
`;
const Card = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;
const Heading = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 24px;
  text-align: center;
`;
const SearchRow = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid #d8d8d8;
  border-radius: 999px;
  padding: 12px 20px;
  margin-bottom: 24px;
`;
const SearchInput = styled.input`
  flex: 1;
  border: none;
  font-size: 18px;
  outline: none;
  padding: 6px;
  &::placeholder {
    color: #b4b4b4;
  }
`;
const ScrollContainer = styled.div`
  max-height: ${props => props.theme.userCardHeight || '440px'}; // Approximately 6 users (each 73px) + some padding
  overflow-y: auto;
  margin: 0 -32px;  // Negative margin to extend to card edges
  padding: 0 32px;  // Padding to maintain content alignment
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c5c5c5;
    border-radius: 4px;
    
    &:hover {
      background: #a8a8a8;
    }
  }

  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #c5c5c5 #f1f1f1;
`;
const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0;  // Small padding to prevent edge clipping
`;
const UserCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  background: white;
  height: 73px; // Fixed height for consistent sizing
`;
const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3b5bdb;
`;
const Username = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const FollowButton = styled.button`
  background-color: ${({ $following }) => ($following ? '#ccc' : '#3b5bdb')};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
`;
const NoResults = styled.div`
  text-align: center;
  color: #999;
  font-size: 16px;
  margin-top: 24px;
`;
const RecentBox = styled.div`
  margin-top: 24px;
`;
const RecentItem = styled.div`
  color: #3b5bdb;
  cursor: pointer;
  padding: 6px 0;
  &:hover {
    text-decoration: underline;
  }
`;

const SearchTypeSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const SearchTypeButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: 2px solid ${props => props.$active ? '#3b5bdb' : '#ddd'};
  background-color: ${props => props.$active ? '#3b5bdb' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3b5bdb;
  }
`;

const TripsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const TripCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const TripImage = styled.div`
  position: relative;
  width: 100%;
  height: 150px;
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
  font-size: 32px;
  color: #4263eb;
  opacity: 0.8;
`;

const TripInfo = styled.div`
  padding: 16px;
`;

const TripLocation = styled.div`
  margin-bottom: 8px;
`;

const City = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const Country = styled.p`
  font-size: 14px;
  color: #666;
  margin: 4px 0 0 0;
`;

const TripDates = styled.p`
  font-size: 14px;
  color: #666;
  margin: 8px 0 0 0;
`;

const TripUser = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  cursor: pointer;
  color: #3b5bdb;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const UserIcon = styled.span`
  font-size: 16px;
`;

const TripModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const Photo = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
`;

const TripDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DetailSection = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const DetailTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const DetailText = styled.p`
  font-size: 16px;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const PlaceholderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
`;

const PlaceholderImage = styled.img`
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
  opacity: 0.8;
`;

const PlaceholderText = styled.p`
  font-size: 18px;
  color: #666;
  margin-top: 16px;
`;

const LoadingIndicator = styled.div`
  text-align: center;
  color: #666;
  padding: 16px;
  font-size: 14px;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 8px 0;
`;