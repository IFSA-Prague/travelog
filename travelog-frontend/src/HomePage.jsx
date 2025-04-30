import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import TripDetail from './components/TripDetail';
import defaultAvatar from './assets/default-avatar.jpg';
import {
  FaCalendarAlt,
  FaUser,
  FaHeart,
  FaRegHeart,
  FaCommentDots
} from 'react-icons/fa';

const BACKEND_URL = 'http://localhost:5050';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const HomePage = () => {
  const [feed, setFeed] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [commentMap, setCommentMap] = useState({});
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const username = user?.username;
  const userId = user?.id;

  useEffect(() => {
    const fetchFeed = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${BACKEND_URL}/feed/${userId}`);
        setFeed(res.data);
      } catch (err) {
        console.error('Failed to fetch feed', err);
      }
    };
    fetchFeed();
  }, [userId]);

  const toggleLike = async (tripId) => {
    try {
      await axios.post(`${BACKEND_URL}/trips/${tripId}/like`, { user_id: userId });
      setFeed((prev) =>
        prev.map((t) =>
          t.id === tripId
            ? {
                ...t,
                likes: t.likes.includes(userId)
                  ? t.likes.filter((id) => id !== userId)
                  : [...t.likes, userId]
              }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to like/unlike', err);
    }
  };

  const submitComment = async (tripId) => {
    const comment = commentMap[tripId]?.trim();
    if (!comment) return;

    try {
      await axios.post(`${BACKEND_URL}/trips/${tripId}/comment`, {
        user_id: userId,
        content: comment
      });

      setFeed((prev) =>
        prev.map((t) =>
          t.id === tripId
            ? {
                ...t,
                comments: [
                  ...t.comments,
                  {
                    id: Math.random(),
                    user_id: userId,
                    username,
                    content: comment
                  }
                ]
              }
            : t
        )
      );
      setCommentMap((prev) => ({ ...prev, [tripId]: '' }));
    } catch (err) {
      console.error('Failed to comment', err);
    }
  };

  const handleCommentAdd = (tripId, comment) => {
    setFeed((prevFeed) =>
      prevFeed.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              comments: [...trip.comments, comment]
            }
          : trip
      )
    );
  };

  return (
    <PageContainer>
      <GreetingCard>
        <Greeting>Hi, {username}!</Greeting>
        <SubHeading>Welcome back to your travel feed 🌍</SubHeading>
      </GreetingCard>

      <SectionCard>
        <SectionTitle>Following Feed</SectionTitle>
        {feed.length === 0 ? (
          <SectionContent>No trips to show yet.</SectionContent>
        ) : (
          <FeedGrid>
            {feed.map((trip) => (
              <FeedCard key={trip.id} onClick={() => setSelectedTrip(trip)}>
                {trip.photos?.[0]?.url && (
                  <FeedImage
                    src={trip.photos[0].url}
                    alt={trip.city}
                  />
                )}
                <FeedInfo onClick={(e) => e.stopPropagation()}>
                  <FeedMeta>
                    <ProfileLink to={`/profile/${trip.username}`}>
                      <Avatar
                        src={`${BACKEND_URL}/uploads/user_${trip.user_id}.png`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultAvatar;
                        }}
                        alt="user avatar"
                      />
                      <span>{trip.username}</span>
                    </ProfileLink>
                    <div>
                      <FaCalendarAlt />{' '}
                      {new Date(trip.start_date).toLocaleDateString()} -{' '}
                      {new Date(trip.end_date).toLocaleDateString()}
                    </div>
                  </FeedMeta>
                  <FeedLocation>
                    <h3>{trip.city}</h3>
                    <p>{trip.country}</p>
                  </FeedLocation>
                    <CommentSection>
                      <CommentInputRow>
                        <CommentInput
                          value={commentMap[trip.id] || ''}
                          onChange={(e) =>
                            setCommentMap((prev) => ({
                              ...prev,
                              [trip.id]: e.target.value
                            }))
                          }
                          placeholder="Write a comment..."
                        />
                        <LikeButton onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(trip.id);
                        }}>
                          {trip.likes?.includes(userId) ? <FaHeart color="red" /> : <FaRegHeart />}
                          <span>{trip.likes?.length || 0}</span>
                        </LikeButton>
                        <SubmitComment onClick={(e) => {
                          e.stopPropagation();
                          submitComment(trip.id);
                        }}>
                          <FaCommentDots />
                        </SubmitComment>
                      </CommentInputRow>
                      {trip.comments?.map((comment) => (
                        <Comment key={comment.id}>
                          <strong>{comment.username}:</strong> {comment.content}
                        </Comment>
                      ))}
                  </CommentSection>
                </FeedInfo>
              </FeedCard>
            ))}
          </FeedGrid>
        )}
      </SectionCard>

      <SectionCard>
        <SectionTitle>Bookmarked Cities</SectionTitle>
        <SectionContent>Coming soon...</SectionContent>
      </SectionCard>

      {selectedTrip && (
        <TripDetail
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onDelete={() => {}}
          onCommentDelete={(deletedCommentId, tripId) => {
            setFeed((prevFeed) =>
              prevFeed.map((t) =>
                t.id === tripId
                  ? {
                      ...t,
                      comments: t.comments.filter((c) => c.id !== deletedCommentId)
                    }
                  : t
              )
            );
          }}
          onCommentAdd={handleCommentAdd}
        />
      )}
    </PageContainer>
  );
};

export default HomePage;

// Styled Components
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

const FeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const FeedCard = styled.div`
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const FeedImage = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
  cursor: pointer;
`;

const FeedInfo = styled.div`
  padding: 16px;
`;

const FeedLocation = styled.div`
  margin-top: 12px;
  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
  p {
    margin: 4px 0 12px 0;
    color: #666;
  }
`;

const FeedMeta = styled.div`
  font-size: 14px;
  color: #555;
  display: flex;
  flex-direction: column;
  gap: 6px;
  div {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const LikeCommentRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 8px;
`;

const CommentSection = styled.div`
  margin-top: 16px;
`;

const Comment = styled.div`
  font-size: 14px;
  margin-bottom: 4px;
  color: #333;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ddd;
  background-color: #f0f0f0;
  transition: opacity 0.2s ease-in-out;
`;

const ProfileLink = styled(Link)`
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #1a1a1a;
  text-decoration: none;
  margin-bottom: 4px;
  gap: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

const CommentInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  cursor: pointer;
`;

const SubmitComment = styled.button`
  background: #4263eb;
  border: none;
  color: white;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;
