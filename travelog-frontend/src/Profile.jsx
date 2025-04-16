import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Profile = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Navigate to the LandingPage after sign out
    navigate('/');  // Redirect to the LandingPage
  };

  return (
    <Container>
      <Heading>Profile Page</Heading>
      <p>This is your profile.</p>

      {/* Sign Out Button */}
      <SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>
    </Container>
  );
};

// Styled components for page content
const Container = styled.div`
  margin-left: 50px;
  padding-top: 100px;
`;

const Heading = styled.h1`
  font-size: 36px;
`;

const SignOutButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 18px;
  margin-top: 20px;
  border-radius: 5px;

  &:hover {
    background-color: #d32f2f;
  }
`;

export default Profile;
