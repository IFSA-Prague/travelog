import styled, { keyframes } from 'styled-components';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const [following, setFollowing] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();

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

        console.log('usersRes.data:', usersRes.data); // ADD THIS LINE
        console.log('followingRes.data:', followingRes.data);
        
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
    const lower = query.toLowerCase();
    const filtered = users.filter(
      (u) => u.id !== currentUser?.id && u.username.toLowerCase().includes(lower)
    );
    setFilteredUsers(filtered);
  }, [query, users, currentUser]);

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

  const handleUserClick = (username) => {
    setRecentSearches((prev) => {
      const updated = [username, ...prev.filter((u) => u !== username)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
    navigate('/profile');
  };

  return (
    <PageContainer>
      <Card>
        <Heading>Search Users</Heading>
        <SearchRow>
          <SearchInput
            type="text"
            placeholder="Search for a user (e.g., alice123)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchRow>

        {query && filteredUsers.length === 0 && (
          <NoResults>No users found.</NoResults>
        )}

        {filteredUsers.length > 0 && (
          <UserList>
            {filteredUsers.map((user) => (
              <UserCard key={user.id}>
                <UserInfo onClick={() => handleUserClick(user.username)} style={{ cursor: 'pointer' }}>
                  <Avatar src={`/uploads/user_${user.id}.png`} onError={(e) => e.target.src='/default-avatar.png'} />
                  <Username>{user.username}</Username>
                </UserInfo>
                <FollowButton
                  following={isFollowing(user.id)}
                  onClick={() => toggleFollow(user.id)}
                >
                  {isFollowing(user.id) ? 'Unfollow' : 'Follow'}
                </FollowButton>
              </UserCard>
            ))}
          </UserList>
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

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const UserCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
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
  background-color: ${({ following }) => (following ? '#ccc' : '#3b5bdb')};
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
