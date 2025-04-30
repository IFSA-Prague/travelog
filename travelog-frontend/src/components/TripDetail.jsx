import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaTrash, FaHeart, FaRegHeart } from 'react-icons/fa';

const TripDetail = ({ trip, onClose, onDelete, onCommentDelete, onCommentAdd }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwner = trip.user_id === currentUser.id;
  const [likes, setLikes] = useState(trip.likes || []);

  const handleToggleLike = async () => {
    try {
      const endpoint = likes.includes(currentUser.id)
        ? `/trips/${trip.id}/unlike`
        : `/trips/${trip.id}/like`;
      await axios.post(`http://localhost:5050${endpoint}`, {
        user_id: currentUser.id
      });
      setLikes((prev) =>
        prev.includes(currentUser.id)
          ? prev.filter((id) => id !== currentUser.id)
          : [...prev, currentUser.id]
      );
    } catch (err) {
      console.error('Error toggling like', err);
    }
  };

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

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:5050/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      if (onCommentDelete) {
        onCommentDelete(commentId, trip.id);
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:5050/trips/${trip.id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [trip.id]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`http://localhost:5050/trips/${trip.id}/comment`, {
        user_id: currentUser.id,
        content: newComment
      });

      // Optional: fetch comments again to update detail view
      fetchComments();

      // Tell HomePage to update the comment on the card
      onCommentAdd?.(trip.id, {
        id: res.data.id,
        user_id: currentUser.id,
        username: currentUser.username,
        content: newComment,
        created_at: new Date().toISOString()
      });

      setNewComment('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <TripTitle>{trip.city}, {trip.country}</TripTitle>
          <ButtonGroup>
            {isOwner && (
              <DeleteButton 
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Trip'}
              </DeleteButton>
            )}
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
          <Section>
            <SectionTitle>Comments</SectionTitle>
            <CommentsList>
              {comments.map((comment) => (
                <CommentItem key={comment.id}>
                  <CommentText>
                    <div><strong>{comment.username}:</strong> {comment.content}</div>
                    <Timestamp>{new Date(comment.created_at).toLocaleString()}</Timestamp>
                  </CommentText>
                  {comment.user_id === currentUser.id && (
                    <TrashButton onClick={() => handleDeleteComment(comment.id)} title="Delete">
                      <FaTrash />
                    </TrashButton>
                  )}
                </CommentItem>
              ))}
            </CommentsList>
            <CommentInputRow>
              <CommentInput
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
              />
              <CommentButton onClick={submitComment}>Post</CommentButton>
            </CommentInputRow>
        </Section>
        <Section>
          <SectionTitle>
            {likes.includes(currentUser.id) ? (
              <FaHeart color="red" style={{ marginRight: '8px' }} />
            ) : (
              <FaRegHeart style={{ marginRight: '8px' }} />
            )}
            Likes ({likes.length})
          </SectionTitle>
        </Section>
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

const CommentInputRow = styled.div`
  display: flex;
  gap: 8px;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
`;

const CommentButton = styled.button`
  background: #4263eb;
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CommentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 14px;
  color: #333;
`;

const CommentText = styled.div`
  display: flex;
  flex-direction: column;
`;

const Timestamp = styled.span`
  font-size: 12px;
  color: #888;
  margin-top: 2px;
  padding-left: 2px;
`;

const TrashButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  margin-left: 12px;

  &:hover {
    color: #c0392b;
  }
`;

const LikeRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;


export default TripDetail;
