import styled, { keyframes } from 'styled-components';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import defaultAvatar from './assets/user-no-set-photo.jpg';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const UserProfile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [avatarSrc, setAvatarSrc] = useState(defaultAvatar);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const allUsers = await axios.get('/users');
        const targetUser = allUsers.data.find(u => u.username === username);
        if (!targetUser) {
          navigate(-1);
          return;
        }
        setUserData(targetUser);

        const [followersRes, followingRes] = await Promise.all([
          axios.get(`/users/${targetUser.id}/followers`),
          axios.get(`/users/${targetUser.id}/following`)
        ]);
        setFollowers(followersRes.data || []);
        setFollowing(followingRes.data || []);

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
        setAvatarSrc(`${BACKEND_URL}/uploads/user_${targetUser.id}.png?v=${Date.now()}`);
      } catch (err) {
        console.error('Failed to fetch user profile', err);
      }
    };

    fetchUserData();
  }, [username, navigate]);

  if (!userData) return <div>Loading profile...</div>;

  return (
    <PageContainer>
      <ProfileCard>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </BackButton>
          <Title>{userData.username}'s Profile</Title>
          <Spacer />
        </Header>

        <ProfileContent>
          <Avatar
            src={avatarSrc}
            onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
            alt="User Avatar"
          />

          <UserInfo>
            <Info><strong>Username:</strong> {userData.username}</Info>
            <Info><strong>Email:</strong> {userData.email}</Info>
          </UserInfo>

          <Stats>
            <Stat>
              <Number>{followers.length}</Number>
              <Label>Followers</Label>
            </Stat>
            <Stat>
              <Number>{following.length}</Number>
              <Label>Following</Label>
            </Stat>
          </Stats>
        </ProfileContent>
      </ProfileCard>
    </PageContainer>
  );
};

export default UserProfile;

// Styled components
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

const ProfileCard = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
`;

const Spacer = styled.div`
  width: 24px;
  height: 24px;
`;

const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #3b5bdb;
  object-fit: cover;
`;

const UserInfo = styled.div`
  text-align: center;
`;

const Info = styled.p`
  font-size: 16px;
  color: #333;
`;

const Stats = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 12px;
`;

const Stat = styled.div`
  text-align: center;
`;

const Number = styled.div`
  font-size: 22px;
  font-weight: bold;
`;

const Label = styled.div`
  font-size: 14px;
  color: #666;
`;