import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const TripDetail = ({ trip, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:5050/trips/${trip.id}`);
      onDelete(trip.id);
      onClose();
    } catch (error) {
      console.error("Error deleting trip:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <TripTitle>{trip.city}, {trip.country}</TripTitle>
          <ButtonGroup>
            <DeleteButton 
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Trip'}
            </DeleteButton>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </ButtonGroup>
        </ModalHeader>

        {showConfirm && (
          <ConfirmDialog>
            <ConfirmText>Are you sure you want to delete this trip?</ConfirmText>
            <ConfirmButtons>
              <ConfirmButton onClick={handleDelete} disabled={isDeleting}>
                Yes, Delete
              </ConfirmButton>
              <CancelButton onClick={() => setShowConfirm(false)}>
                Cancel
              </CancelButton>
            </ConfirmButtons>
          </ConfirmDialog>
        )}

        <Content>
          {trip.photos && trip.photos.length > 0 && (
            <Section>
              <SectionTitle>Photos</SectionTitle>
              <PhotoGrid>
                {trip.photos.map((photo, index) => (
                  <PhotoItem key={index}>
                    <img src={photo.url} alt={`Photo ${index + 1}`} />
                  </PhotoItem>
                ))}
              </PhotoGrid>
            </Section>
          )}

          <Section>
            <SectionTitle>Trip Dates</SectionTitle>
            <SectionContent>
              {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
            </SectionContent>
          </Section>

          {trip.accommodation && (
            <Section>
              <SectionTitle>Accommodation</SectionTitle>
              <SectionContent>{trip.accommodation}</SectionContent>
            </Section>
          )}

          {trip.favorite_restaurants && (
            <Section>
              <SectionTitle>Favorite Restaurants</SectionTitle>
              <SectionContent>{trip.favorite_restaurants}</SectionContent>
            </Section>
          )}

          {trip.favorite_attractions && (
            <Section>
              <SectionTitle>Favorite Scenic Visits / Attractions</SectionTitle>
              <SectionContent>{trip.favorite_attractions}</SectionContent>
            </Section>
          )}

          {trip.other_notes && (
            <Section>
              <SectionTitle>Other Notes</SectionTitle>
              <SectionContent>{trip.other_notes}</SectionContent>
            </Section>
          )}
        </Content>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TripTitle = styled.h2`
  font-size: 2rem;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  line-height: 1;

  &:hover {
    color: #333;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
`;

const SectionContent = styled.div`
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const PhotoItem = styled.div`
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const DeleteButton = styled.button`
  background: #ff4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: #cc0000;
  }

  &:disabled {
    background: #ff9999;
    cursor: not-allowed;
  }
`;

const ConfirmDialog = styled.div`
  background: #fff3f3;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ConfirmText = styled.p`
  color: #333;
  margin-bottom: 15px;
  font-size: 16px;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ConfirmButton = styled.button`
  background: #ff4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #cc0000;
  }

  &:disabled {
    background: #ff9999;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: #666;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #444;
  }
`;

export default TripDetail;
