// TripDetail.jsx (modal style)
import React from 'react';
import styled from 'styled-components';
import defaultAvatar from './assets/default-avatar.jpg';

const BACKEND_URL = 'http://localhost:5050';

const TripDetail = ({ trip, onClose }) => {
  if (!trip) return null;

  return (
    <Overlay>
      <Modal>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {trip.photos?.[0]?.url && (
          <Image src={trip.photos[0].url} alt={trip.city} />
        )}
        <Info>
          <h2>{trip.city}, {trip.country}</h2>
          <UserRow>
            <Avatar
              src={`${BACKEND_URL}/uploads/user_${trip.user_id}.png`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
            />
            <Username href={`/user/${trip.username}`}>{trip.username}</Username>
          </UserRow>
          <p><strong>Dates:</strong> {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</p>
          <p><strong>Accommodation:</strong> {trip.accommodation}</p>
          <p><strong>Restaurants:</strong> {trip.favorite_restaurants}</p>
          <p><strong>Attractions:</strong> {trip.favorite_attractions}</p>
          <p><strong>Notes:</strong> {trip.other_notes}</p>
        </Info>
      </Modal>
    </Overlay>
  );
};

export default TripDetail;

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Modal = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;

  &:hover {
    color: #333;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const Info = styled.div`
  font-family: 'Segoe UI', sans-serif;
  font-size: 15px;
  color: #333;
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  margin: 12px 0;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
`;

const Username = styled.a`
  font-weight: 600;
  text-decoration: none;
  color: #4263eb;

  &:hover {
    text-decoration: underline;
  }
`;
