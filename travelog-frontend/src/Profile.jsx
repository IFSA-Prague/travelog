import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

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

const Profile = () => {
  const navigate = useNavigate();
  const [storedUser, setStoredUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate('/login');
    } else {
      setStoredUser(user);
    }
  }, [navigate]);

  useEffect(() => {
    if (!storedUser) return;

    const fetchProfileData = async () => {
      try {
        const [userRes, followersRes, followingRes, usersRes] = await Promise.all([
          axios.get(`/users/${storedUser.id}`),
          axios.get(`/users/${storedUser.id}/followers`),
          axios.get(`/users/${storedUser.id}/following`),
          axios.get('/users')
        ]);
        setUserData(userRes.data);
        setFollowers(followersRes.data || []);
        setFollowing(followingRes.data || []);
        setAllUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      } catch (err) {
        console.error("Failed to load profile data", err);
      }
    };

    fetchProfileData();
  }, [storedUser]);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!newPhoto || !storedUser) return;
    const formData = new FormData();
    formData.append('photo', newPhoto);

    try {
      await axios.post(`/users/${storedUser.id}/upload_photo`, formData);
      setIsEditing(false);
      setNewPhoto(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Photo upload failed", err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewPhoto(null);
    setPreviewUrl(null);
  };

  if (!userData) return <div>Loading profile...</div>;

  const avatarUrl = previewUrl || `/uploads/user_${storedUser.id}.png`;

  return (
    <PageContainer>
      <ProfileCard>
        <Header>
          <Title>My Profile</Title>
          <ActionButtons>
            {isEditing ? (
              <>
                <CancelButton onClick={handleCancelEdit}>Cancel</CancelButton>
                <SaveButton onClick={handleSaveProfile}>Save Profile</SaveButton>
              </>
            ) : (
              <EditButton onClick={() => setIsEditing(true)}>Edit Profile</EditButton>
            )}
            <SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>
          </ActionButtons>
        </Header>

        <ProfileContent>
          <Avatar src={avatarUrl} onError={(e) => e.target.src = '/default-avatar.png'} alt="Profile Avatar" />
          {isEditing && <PhotoInput type="file" accept="image/*" onChange={handlePhotoChange} />}

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

export default Profile;

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
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const EditButton = styled.button`
  background-color: #f5a623;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
`;

const SaveButton = styled.button`
  background-color: #3b5bdb;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
`;

const CancelButton = styled.button`
  background-color: #ccc;
  color: #333;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
`;

const SignOutButton = styled.button`
  background-color: #e53935;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
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

const PhotoInput = styled.input`
  margin-top: 12px;
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
