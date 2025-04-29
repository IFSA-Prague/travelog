import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

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

const HomePage = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const username = user?.username;

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get('http://localhost:5050/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    }
    fetchUsers();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <PageContainer>
      <GreetingCard>
        <Greeting>Hi, {username}!</Greeting>
        <SubHeading>Welcome back to your travel feed 🌍</SubHeading>
      </GreetingCard>

      <SectionCard>
        <SectionTitle>Following Feed</SectionTitle>
        <SectionContent>Coming soon...</SectionContent>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Bookmarked Cities</SectionTitle>
        <SectionContent>Coming soon...</SectionContent>
      </SectionCard>
    </PageContainer>
  );
};

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

export default HomePage;
