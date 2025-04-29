import styled, { keyframes } from 'styled-components';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from './assets/user-no-set-photo.jpg';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalFadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const Profile = () => {
  const navigate = useNavigate();
  const [storedUser, setStoredUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [photoVersion, setPhotoVersion] = useState(Date.now());
  const [avatarSrc, setAvatarSrc] = useState(defaultAvatar);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('followers');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) navigate('/login');
    else setStoredUser(user);
  }, [navigate]);

  useEffect(() => {
    if (!storedUser) return;
    const fetchProfileData = async () => {
      try {
        const [userRes, followersRes, followingRes] = await Promise.all([
          axios.get(`/users/${storedUser.id}`),
          axios.get(`/users/${storedUser.id}/followers`),
          axios.get(`/users/${storedUser.id}/following`)
        ]);
        setUserData(userRes.data);
        setFollowers(followersRes.data || []);
        setFollowing(followingRes.data || []);
        setPhotoVersion(Date.now());
      } catch (err) {
        console.error("Failed to load profile data", err);
      }
    };
    fetchProfileData();
  }, [storedUser]);

  useEffect(() => {
    if (storedUser) {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      setAvatarSrc(`${BACKEND_URL}/uploads/user_${storedUser.id}.png?v=${photoVersion}`);
    }
  }, [storedUser, photoVersion]);

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
      setPhotoVersion(Date.now());
    } catch (err) {
      console.error("Photo upload failed", err);
    }
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewPhoto(null);
    setPreviewUrl(null);
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleUserClick = (username) => {
    closeModal();
    navigate(`/user/${username}`);
  };

  if (!userData) return <div>Loading profile...</div>;

  const listToShow = modalType === 'followers' ? followers : following;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
          <Avatar
            src={previewUrl || avatarSrc}
            onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
            alt="Profile Avatar"
          />
          {isEditing && <PhotoInput type="file" accept="image/*" onChange={handlePhotoChange} />}

          <UserInfo>
            <Info><strong>Username:</strong> {userData.username}</Info>
            <Info><strong>Email:</strong> {userData.email}</Info>
          </UserInfo>

          <Stats>
            <Stat onClick={() => openModal('followers')}>
              <Number>{followers.length}</Number>
              <Label>Followers</Label>
            </Stat>
            <Stat onClick={() => openModal('following')}>
              <Number>{following.length}</Number>
              <Label>Following</Label>
            </Stat>
          </Stats>
        </ProfileContent>
      </ProfileCard>

      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <h2>{modalType === 'followers' ? 'Followers' : 'Following'}</h2>
            {listToShow.length === 0 ? (
              <p>No {modalType} yet.</p>
            ) : (
              <UserList>
                {listToShow.map((user) => (
                  <UserItem key={user.id} onClick={() => handleUserClick(user.username)} style={{ cursor: 'pointer' }}>
                    <UserAvatar
                      src={`${BACKEND_URL}/uploads/user_${user.id}.png`}
                      onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                      alt="User Avatar"
                    />
                    {user.username}
                  </UserItem>
                ))}
              </UserList>
            )}
            <CloseButton onClick={closeModal}>Close</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Profile;

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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 300px;
  text-align: center;
  animation: ${modalFadeIn} 0.3s ease-out;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-bottom: 1px solid #eee;
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3b5bdb;
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
  cursor: pointer;
`;

const Number = styled.div`  
  font-size: 22px;
  font-weight: bold;
`;
const Label = styled.div`
  font-size: 14px;
  color: #666;
`;

const UserList = styled.div`
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CloseButton = styled.button`
  margin-top: 16px;
  background-color: #e53935;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;